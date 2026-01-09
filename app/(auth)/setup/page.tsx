'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { getTelegramWebApp, getTelegramPlatform, triggerHaptic } from '@/lib/telegram';
import { InfoModal } from '@/components/blocks/InfoModal';
import { config } from '@/lib/config';
import { SUBSCRIPTION_CONFIG, APP_STORE_URLS } from '@/lib/constants';
import { api } from '@/lib/api';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { logError } from '@/lib/utils/logging';
import { analytics } from '@/lib/analytics';
import { handleExternalLink, validateSubscriptionUrl, handleDeepLinkError } from '@/lib/utils/setupHelpers';
import type { StepDirection } from '@/types/setup';

// Dynamic imports for code splitting - only load steps when needed
const Step1Welcome = dynamic(() => import('./steps/Step1Welcome').then(m => ({ default: m.Step1Welcome })), { ssr: false });
const Step2Install = dynamic(() => import('./steps/Step2Install').then(m => ({ default: m.Step2Install })), { ssr: false });
const Step3Subscription = dynamic(() => import('./steps/Step3Subscription').then(m => ({ default: m.Step3Subscription })), { ssr: false });
const Step4Complete = dynamic(() => import('./steps/Step4Complete').then(m => ({ default: m.Step4Complete })), { ssr: false });

/**
 * SetupPage - Экран пошаговой настройки VPN (Onboarding).
 * 
 * Логика работы:
 * 1. Состояние `step` управляет текущим экраном (1-4).
 * 2. Используется `getTelegramPlatform` для адаптации инструкций под ОС пользователя.
 * 3. На каждом шаге визуализируется прогресс с помощью SVG-колец.
 */
export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [subscriptionUrl, setSubscriptionUrl] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string>('Devices');
  const [isLoadingSubscriptionUrl, setIsLoadingSubscriptionUrl] = useState(true);
  const [isAddingSubscription, setIsAddingSubscription] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [isCheckingVpn, setIsCheckingVpn] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'inactive' | 'checking'>('checking');
  const [isDefaultSubscriptionUrl, setIsDefaultSubscriptionUrl] = useState(false);
  const [subscriptionCheckFailed, setSubscriptionCheckFailed] = useState(false);

  // Detect platform after mount to avoid hydration mismatch
  // Note: This setState in useEffect is intentional to avoid SSR/CSR mismatch
  useEffect(() => {
    setPlatform(getTelegramPlatform());
  }, []);

  // Проверка статуса подписки перед началом настройки
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const status = await api.getUserStatus();
        setSubscriptionStatus(status.ok && status.status === 'active' ? 'active' : 'inactive');
      } catch (error) {
        logError('Failed to check subscription status', error, {
          page: 'setup',
          action: 'checkSubscription'
        });
        setSubscriptionStatus('inactive');
      }
    };
    checkSubscription();
  }, []);

  // Загружаем реальную ссылку на подписку пользователя
  useEffect(() => {
    const loadSubscriptionUrl = async () => {
      try {
        const configData = await api.getUserConfig();
        const defaultUrl = `${config.payment.subscriptionBaseUrl}/api/sub/${SUBSCRIPTION_CONFIG.DEFAULT_SUBSCRIPTION_ID}`;
        
        if (configData.ok && configData.config) {
          // Валидация URL перед использованием
          try {
            new URL(configData.config);
            setSubscriptionUrl(configData.config);
            setIsDefaultSubscriptionUrl(false);
          } catch (urlError) {
            logError('Invalid subscription URL format', urlError, {
              page: 'setup',
              action: 'validateSubscriptionUrl',
              url: configData.config
            });
            // Используем дефолтную ссылку при невалидном URL
            setSubscriptionUrl(defaultUrl);
            setIsDefaultSubscriptionUrl(true);
          }
        } else {
          // Если конфиг не получен, используем дефолтную ссылку
          setSubscriptionUrl(defaultUrl);
          setIsDefaultSubscriptionUrl(true);
        }
      } catch (error) {
        logError('Failed to load subscription URL', error, {
          page: 'setup',
          action: 'loadSubscriptionUrl'
        });
        analytics.event('setup_error', {
          step: 1,
          action: 'loadSubscriptionUrl',
          error: error instanceof Error ? error.message : String(error)
        });
        // Используем дефолтную ссылку при ошибке
        const defaultUrl = `${config.payment.subscriptionBaseUrl}/api/sub/${SUBSCRIPTION_CONFIG.DEFAULT_SUBSCRIPTION_ID}`;
        setSubscriptionUrl(defaultUrl);
        setIsDefaultSubscriptionUrl(true);
      } finally {
        setIsLoadingSubscriptionUrl(false);
      }
    };
    loadSubscriptionUrl();
  }, []);

  /* 
    Обработчик для установки на другое устройство.
    Открывает внешнюю ссылку с базой знаний.
  */
  const handleOtherDeviceClick = () => {
    analytics.event('setup_other_device', { step: 1 });
    handleExternalLink(config.support.helpBaseUrl);
  };

  /* 
    Шаг 2: Открытие информационного модального окна перед установкой приложения.
  */
  const handleInstallClick = () => {
    analytics.event('setup_install', { step: 2 });
    
    try {
      setIsInfoModalOpen(true);
    } catch (error) {
      logError('Failed to open install modal', error, {
        page: 'setup',
        action: 'handleInstallClick'
      });
      analytics.event('setup_error', {
        step: 2,
        action: 'handleInstallClick',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };


  /* 
    Шаг 3: Добавление подписки через Deep Link.
    Используется протокол happ://, который поддерживается приложением Hiddify
    для автоматического импорта конфигурации.
    Для iOS используется протокол v2raytun://import/.
  */
  const handleAddSubscription = async () => {
    analytics.event('setup_add_subscription', { step: 3 });
    
    if (isAddingSubscription) return; // Предотвращаем множественные клики
    
    setIsAddingSubscription(true);
    setSubscriptionCheckFailed(false);
    
    try {
      // Используем реальную ссылку на подписку пользователя
      const userSubscriptionUrl = subscriptionUrl || `${config.payment.subscriptionBaseUrl}/api/sub/${SUBSCRIPTION_CONFIG.DEFAULT_SUBSCRIPTION_ID}`;

      // Валидация URL перед использованием
      if (!validateSubscriptionUrl(userSubscriptionUrl)) {
        logError('Invalid subscription URL in handleAddSubscription', undefined, {
          page: 'setup',
          action: 'handleAddSubscription',
          url: userSubscriptionUrl
        });
        analytics.event('setup_error', {
          step: 3,
          action: 'handleAddSubscription',
          error: 'Invalid subscription URL'
        });
        // Показываем сообщение пользователю
        const webApp = getTelegramWebApp();
        if (webApp && webApp.showAlert) {
          webApp.showAlert('Ошибка: неверный формат ссылки на подписку. Попробуйте обновить страницу или скопируйте ссылку и добавьте её вручную в приложении.');
        }
        setIsAddingSubscription(false);
        return;
      }

      // Платформо-зависимый протокол (для iOS используем v2raytun)
      const protocol = platform === 'iOS' ? config.deepLink.iosProtocol : config.deepLink.defaultProtocol;
      const vpnName = config.deepLink.vpnName;

      // Формируем прямую ссылку (deep link) без редиректа
      const subUrl = `${protocol}${userSubscriptionUrl}#${vpnName}`;

      try {
        handleExternalLink(subUrl);
        analytics.event('setup_subscription_deeplink_opened', { step: 3, platform });
        
        // Запускаем проверку успешности добавления подписки
        handleCheckSubscriptionAdded();
      } catch (error) {
        logError('Failed to open deep link for subscription', error, {
          page: 'setup',
          action: 'handleAddSubscription',
          url: subUrl,
          platform
        });
        analytics.event('setup_error', {
          step: 3,
          action: 'handleAddSubscription',
          error: error instanceof Error ? error.message : String(error),
          type: 'deep_link_error'
        });
        
        // Показываем понятное сообщение об ошибке
        const webApp = getTelegramWebApp();
        if (webApp && webApp.showAlert) {
          webApp.showAlert('Не удалось открыть приложение автоматически. Пожалуйста, скопируйте ссылку на подписку и добавьте её вручную в приложении v2RayTun. Нажмите "Как добавить вручную?" для инструкции.');
        }
        
        // Позволяем пользователю продолжить вручную
        setSubscriptionCheckFailed(true);
        setIsAddingSubscription(false);
      }
    } catch (error) {
      logError('Failed to add subscription', error, {
        page: 'setup',
        action: 'handleAddSubscription',
        platform
      });
      analytics.event('setup_error', {
        step: 3,
        action: 'handleAddSubscription',
        error: error instanceof Error ? error.message : String(error),
        type: 'general_error'
      });
      
      // Показываем сообщение об ошибке
      const webApp = getTelegramWebApp();
      if (webApp && webApp.showAlert) {
        webApp.showAlert('Произошла ошибка при добавлении подписки. Попробуйте скопировать ссылку и добавить её вручную в приложении v2RayTun.');
      }
      
      setSubscriptionCheckFailed(true);
      setIsAddingSubscription(false);
    }
  };

  /* 
    Проверка успешности добавления подписки с повторными попытками
  */
  const handleCheckSubscriptionAdded = async () => {
    setIsCheckingSubscription(true);
    setSubscriptionCheckFailed(false);
    analytics.event('setup_check_subscription', { step: 3 });
    
    // Функция для проверки с повторными попытками
    const checkWithRetry = async (attempts = 0, maxAttempts = 3): Promise<boolean> => {
      try {
        // Проверяем конфигурацию пользователя через API
        const configData = await api.getUserConfig();
        
        if (configData.ok && configData.config) {
          // Если конфигурация получена, считаем что подписка добавлена успешно
          return true;
        }
        
        // Если не получили конфигурацию и есть еще попытки, ждем и повторяем
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Ждем 2 секунды между попытками
          return checkWithRetry(attempts + 1, maxAttempts);
        }
        
        return false;
      } catch (error) {
        logError('Failed to check subscription addition', error, {
          page: 'setup',
          action: 'handleCheckSubscriptionAdded',
          attempt: attempts
        });
        
        // Если есть еще попытки, повторяем
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          return checkWithRetry(attempts + 1, maxAttempts);
        }
        
        return false;
      }
    };
    
    try {
      // Ждем 5 секунд перед первой проверкой
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const success = await checkWithRetry();
      
      if (success) {
        analytics.event('setup_subscription_confirmed', { step: 3 });
        const webApp = getTelegramWebApp();
        if (webApp && webApp.showAlert) {
          webApp.showAlert('Подписка успешно добавлена! Переходим к следующему шагу.');
        }
        // Автоматически переходим к следующему шагу через 1 секунду
        setTimeout(() => {
          goToStep(4);
        }, 1000);
      } else {
        // Если проверка не удалась, показываем предупреждение
        setSubscriptionCheckFailed(true);
        const webApp = getTelegramWebApp();
        if (webApp && webApp.showAlert) {
          webApp.showAlert('Не удалось подтвердить добавление подписки. Если вы добавили подписку вручную, нажмите "Проверить снова" или "Далее" для продолжения.');
        }
      }
    } catch (error) {
      logError('Failed to check subscription addition', error, {
        page: 'setup',
        action: 'handleCheckSubscriptionAdded'
      });
      analytics.event('setup_error', {
        step: 3,
        action: 'handleCheckSubscriptionAdded',
        error: error instanceof Error ? error.message : String(error)
      });
      setSubscriptionCheckFailed(true);
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  /* 
    Проверка статуса подписки VPN (не реального подключения)
    Примечание: Эта проверка показывает только статус подписки в API,
    а не реальное VPN подключение на устройстве пользователя.
  */
  const handleCheckVpnStatus = async () => {
    setIsCheckingVpn(true);
    analytics.event('setup_check_vpn', { step: 4 });
    
    try {
      const statusData = await api.getUserStatus();
      
      if (statusData.ok && statusData.status === 'active') {
        const webApp = getTelegramWebApp();
        if (webApp && webApp.showAlert) {
          webApp.showAlert('Подписка VPN активна в системе. Убедитесь, что вы включили VPN в приложении v2RayTun для использования защищенного подключения.');
        }
        analytics.event('setup_vpn_subscription_confirmed', { step: 4 });
      } else {
        const webApp = getTelegramWebApp();
        if (webApp && webApp.showAlert) {
          webApp.showAlert('Подписка VPN не активна в системе. Проверьте, что вы правильно добавили подписку на шаге 3, и что подписка не истекла.');
        }
      }
    } catch (error) {
      logError('Failed to check VPN subscription status', error, {
        page: 'setup',
        action: 'handleCheckVpnStatus'
      });
      analytics.event('setup_error', {
        step: 4,
        action: 'handleCheckVpnStatus',
        error: error instanceof Error ? error.message : String(error)
      });
      const webApp = getTelegramWebApp();
      if (webApp && webApp.showAlert) {
        webApp.showAlert('Не удалось проверить статус подписки. Убедитесь, что вы включили VPN в приложении v2RayTun для использования защищенного подключения.');
      }
    } finally {
      setIsCheckingVpn(false);
    }
  };

  /* 
    Подтверждение установки в InfoModal.
    Динамически выбирает ссылку на магазин в зависимости от платформы.
  */
  const confirmInstallation = () => {
    let url = config.support.helpBaseUrl; // Fallback

    if (platform === 'iOS') {
      url = APP_STORE_URLS.iOS;
    } else if (platform === 'Android') {
      url = APP_STORE_URLS.Android;
    } else if (platform === 'macOS') {
      url = APP_STORE_URLS.macOS;
    } else if (platform === 'Desktop') {
      url = APP_STORE_URLS.Desktop;
    }

    try {
      handleExternalLink(url);
      analytics.event('setup_app_store_opened', { step: 2, platform, url });
    } catch (error) {
      handleDeepLinkError(url, error, 'confirmInstallation');
    }
    setIsInfoModalOpen(false);
  };

  const stepVariants = {
    initial: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    animate: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0
    })
  };

  const [direction, setDirection] = useState<StepDirection>(1);

  const goToStep = (newStep: number) => {
    if (newStep < 1 || newStep > 4) return;
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
    triggerHaptic('light');
    
    // Отслеживаем переходы между шагами
    analytics.event('setup_step_view', {
      step: newStep,
      previousStep: step,
      direction: newStep > step ? 'forward' : 'backward'
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1Welcome
            key="step1"
            direction={direction}
            variants={stepVariants}
            platform={platform}
            onNext={() => goToStep(2)}
            onOtherDevice={handleOtherDeviceClick}
            subscriptionStatus={subscriptionStatus}
          />
        );
      case 2:
        return (
          <Step2Install
            key="step2"
            direction={direction}
            variants={stepVariants}
            onBack={() => goToStep(1)}
            onNext={() => goToStep(3)}
            onInstall={handleInstallClick}
          />
        );
      case 3:
        return (
          <Step3Subscription
            key="step3"
            direction={direction}
            variants={stepVariants}
            step={3}
            subscriptionUrl={subscriptionUrl || undefined}
            isAdding={isAddingSubscription}
            isChecking={isCheckingSubscription}
            isDefaultUrl={isDefaultSubscriptionUrl}
            checkFailed={subscriptionCheckFailed}
            onBack={() => goToStep(2)}
            onNext={() => goToStep(4)}
            onAdd={handleAddSubscription}
            onCheckAgain={handleCheckSubscriptionAdded}
          />
        );
      case 4:
        return (
          <Step4Complete
            key="step4"
            direction={direction}
            variants={stepVariants}
            onBack={() => goToStep(3)}
            onRestart={() => goToStep(1)}
            onCheckVpn={handleCheckVpnStatus}
            isChecking={isCheckingVpn}
          />
        );
      default:
        return null;
    }
  };

  return (
    <main className="w-full bg-black text-white pt-[calc(100px+env(safe-area-inset-top))] px-[calc(1rem+env(safe-area-inset-left))] font-sans select-none flex flex-col min-h-screen">
      <AnimatedBackground />

      <div className="relative flex-1 flex flex-col z-10 overflow-hidden">
        {/* Индикатор прогресса */}
        <div className="w-full max-w-md mx-auto mb-6 mt-4 px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm font-medium">Шаг {step} из 4</span>
            <span className="text-white/40 text-xs">{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#F55128] to-[#FF6B3D] transition-all duration-300 ease-out"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          {renderStep()}
        </AnimatePresence>
      </div>

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        onConfirm={confirmInstallation}
      />
    </main>
  );
}
