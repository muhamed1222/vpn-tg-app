'use client';

import React, { useEffect, useState, lazy, Suspense, useMemo, useCallback, startTransition } from 'react';
import { BoltIcon as Plug, Cog6ToothIcon as Settings, UserIcon as User, ChatBubbleLeftRightIcon as MessageSquare, GiftIcon as Gift } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { triggerHaptic } from '@/lib/telegram';
import { useSubscriptionStore } from '@/store/subscription.store';
import { LogoIcon } from '@/components/ui/LogoIcon';
import { isOnline, subscribeToOnlineStatus } from '@/lib/telegram-fallback';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { formatExpirationDate } from '@/lib/utils/date';
import { usePlatform } from '@/hooks/usePlatform';
import { useMinPrice } from '@/hooks/useMinPrice';

// Lazy loading для тяжелых компонентов с анимациями
const AnimatedBackground = lazy(() =>
  import('@/components/ui/AnimatedBackground').then(module => ({
    default: module.AnimatedBackground
  }))
);
const BackgroundCircles = lazy(() =>
  import('@/components/ui/BackgroundCircles').then(module => ({
    default: module.BackgroundCircles
  }))
);

// Lazy loading для модалок - загружаются только когда нужны
const SupportModal = lazy(() =>
  import('@/components/blocks/SupportModal').then(module => ({
    default: module.SupportModal
  }))
);

export default function Home() {
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isOnlineStatus, setIsOnlineStatus] = useState(true);

  // Используем оптимизированные хуки вместо локальных useEffect
  const platform = usePlatform();
  const { minPrice, isLoading: isPriceLoading } = useMinPrice();
  const { subscription, loading: subscriptionLoading } = useSubscriptionStore();

  // Мемоизируем форматированную дату для избежания пересчета
  const formattedExpirationDate = useMemo(() => {
    return formatExpirationDate(subscription?.expiresAt);
  }, [subscription?.expiresAt]);

  // Мемоизируем вычисление статуса VPN для избежания пересчета
  const vpnStatus = useMemo(() => {
    if (!isOnlineStatus) {
      return { text: 'offline (нет сети)', color: 'text-yellow-500', ariaLabel: 'нет подключения к интернету' };
    }
    if (subscription?.status === 'active') {
      return { text: 'online', color: 'text-[#F55128]', ariaLabel: 'онлайн' };
    }
    return { text: 'offline', color: 'text-[#F55128]/60', ariaLabel: 'офлайн' };
  }, [isOnlineStatus, subscription?.status]);

  // Мемоизируем обработчик открытия поддержки
  const handleSupportOpen = useCallback(() => {
    triggerHaptic('medium');
    setIsSupportOpen(true);
  }, []);

  // Оптимизированная подписка на онлайн статус
  useEffect(() => {
    // Устанавливаем начальный статус
    startTransition(() => {
      setIsOnlineStatus(isOnline());
    });

    // Подписываемся на изменения
    const unsubscribe = subscribeToOnlineStatus((status) => {
      startTransition(() => {
        setIsOnlineStatus(status);
      });
    });

    return unsubscribe;
  }, []);

  return (
    <main
      className="relative min-h-[var(--tg-viewport-height,100vh)] overflow-hidden font-sans select-none flex flex-col items-center bg-main-gradient safe-area-padding justify-start"
      role="main"
      aria-label="Главная страница vpn-web"
    >
      <Suspense fallback={null}>
        <AnimatedBackground />
      </Suspense>

      {/* Logo Section */}
      <div className="relative w-full h-fit flex items-center justify-center z-10">
        {/* Background Circles - lazy loaded компонент */}
        <Suspense fallback={
          <div className="relative w-32 h-32 flex items-center justify-center">
            <LogoIcon className="w-full h-full" />
          </div>
        }>
          <BackgroundCircles>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <LogoIcon className="w-full h-full" />
            </div>
          </BackgroundCircles>
        </Suspense>
      </div>

      {/* Розыгрыш Баннер */}
      <div className="relative mx-auto mb-0 z-10 mt-[100px] max-w-[450px] w-full pl-4 pr-4">
        <div className="bg-gradient-to-r from-[#F55128] to-[#FF6B3D] rounded-[16px] px-1.5 py-1.5 shadow-lg border border-white/10 backdrop-blur-[12px]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center flex-1" style={{ gap: '5px' }}>
              <div className="p-2 bg-white/20 rounded-xl">
                <Gift className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white">Розыгрыш</h2>
              </div>
            </div>
            <Link
              href="/contest"
              onClick={() => triggerHaptic('light')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 active:scale-95 transition-all rounded-[10px] text-white text-sm font-medium border border-white/30"
              aria-label="Подробнее о розыгрыше"
            >
              Подробнее
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Main Card */}
      <div className="absolute bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[450px] bg-[#121212]/80 rounded-[16px] px-[14px] py-[14px] shadow-2xl border border-white/5 backdrop-blur-[12px] z-10">
        {/* 
          Header Info - Информационный блок с основными статусами
          
          Содержит три ключевых элемента:
          1. Статус подключения VPN (offline/online)
          2. Дата истечения подписки
          3. Статус подписки (активна/истекла/нет подписки)
        */}
        <div className="flex justify-between items-start mb-8 px-[10px] py-[6px]">
          <div>
            <h1 className="text-2xl font-medium text-white tracking-tight">Outlivion</h1>

            {/* 
              Статус подключения VPN (offline/online)
              
              Назначение: 
              - Отображает текущее состояние VPN-подключения пользователя
              - Визуально информирует о доступности VPN-сервиса
              
              Логика работы:
              - "online" (оранжево-красный цвет #F55128) - отображается когда subscription.status === 'active'
                Это означает, что подписка активна и VPN можно использовать
              - "offline" (приглушенный оранжево-красный #F55128/60) - отображается во всех остальных случаях:
                * subscription.status === 'expired' - подписка истекла
                * subscription.status === 'none' - подписка отсутствует
                * subscription.status === 'loading' - данные загружаются
                * subscription === null - данные не получены
              
              Источник данных: 
              - Получается из useSubscriptionStore
              - Загружается через API при авторизации (lib/auth.ts -> api.auth())
              - Статус 'active' означает, что пользователь имеет активную подписку и может подключиться к VPN
              
              Визуальное оформление:
              - Цвет текста: text-[#F55128]/60 (приглушенный оранжево-красный для offline)
              - Размер: text-base font-medium
            */}
            <p
              className={`text-base font-medium ${vpnStatus.color}`}
              aria-live="polite"
              aria-label={`Статус VPN: ${vpnStatus.ariaLabel}`}
            >
              {vpnStatus.text}
            </p>
          </div>

          <div className="text-right">
            {/* 
              Дата истечения подписки
              
              Назначение:
              - Показывает до какой даты действительна подписка пользователя
              - Помогает пользователю отслеживать срок действия услуги
              
              Логика работы:
              - Если subscription.expiresAt существует, отображается отформатированная дата
              - Форматирование происходит через функцию formatExpirationDate()
                Преобразует ISO формат (2025-12-05) в читаемый вид ("5 декабря 2025")
              - Если даты нет или подписка отсутствует, отображается "—"
              
              Источник данных:
              - subscription.expiresAt из useSubscriptionStore
              - Формат данных: строка в формате ISO (YYYY-MM-DD)
              - Загружается с бэкенда через API при авторизации
              
              Визуальное оформление:
              - Префикс "до": мелкий серый текст (text-white/40 text-xs)
              - Дата: белый текст среднего размера (text-white/80 text-base)
              - Выравнивание: text-right (по правому краю)
            */}
            {subscriptionLoading ? (
              <div className="flex flex-col items-end gap-2">
                <div className="h-5 w-24 bg-white/10 rounded animate-pulse" aria-hidden="true" />
                <div className="h-4 w-20 bg-white/10 rounded animate-pulse" aria-hidden="true" />
              </div>
            ) : (
              <>
                <p className="text-white/80 text-base">
                  <span className="text-white/40 text-xs align-middle mr-1">до</span>
                  {formattedExpirationDate}
                </p>

                {/* 
                  Статус подписки (активна/истекла/нет подписки)
                  
                  Назначение:
                  - Информирует пользователя о текущем состоянии его подписки
                  - Помогает понять, нужно ли продлевать подписку
                  
                  Логика работы:
                  - Определяется на основе subscription.status из useSubscriptionStore
                  - Возможные значения:
                    * "активна" - когда status === 'active' (подписка действует)
                    * "подписка истекла" - когда status === 'expired' (срок действия истек)
                    * "нет подписки" - когда status === 'none' (подписка никогда не была оформлена)
                    * "загрузка..." - когда status === 'loading' (данные загружаются)
                  
                  Цветовая индикация:
                  - text-[#F55128] (оранжево-красный) - для статуса "активна"
                  - text-[#D9A14E] (золотистый) - для статуса "подписка истекла" (текущий вариант)
                  - text-white/60 (серый) - для статуса "нет подписки"
                  - text-white/40 (бледно-серый) - для статуса "загрузка..."
                  
                  Источник данных:
                  - subscription.status из useSubscriptionStore
                  - Тип: SubscriptionStatus ('active' | 'expired' | 'none' | 'loading')
                  - Обновляется через API при авторизации и изменениях подписки
                  
                  Визуальное оформление:
                  - Цвет текста: text-[#D9A14E] (золотистый для истекшей подписки)
                  - Размер: text-xs font-medium
                  - Позиция: под датой истечения, выравнивание по правому краю
                */}
                <p className={`text-xs font-medium ${subscription?.status === 'active'
                  ? 'text-[#F55128]'
                  : subscription?.status === 'expired'
                    ? 'text-[#D9A14E]'
                    : subscription?.status === 'none'
                      ? 'text-white/60'
                      : 'text-white/40'
                  }`}>
                  {subscription?.status === 'active'
                    ? 'активна'
                    : subscription?.status === 'expired'
                      ? 'подписка истекла'
                      : subscription?.status === 'none'
                        ? 'нет подписки'
                        : 'загрузка...'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Buttons Section */}
        <div className="space-y-3">
          {/* 
            Кнопка "Купить подписку" 
            Назначение: Основная CTA кнопка для перехода к выбору и покупке тарифа.
            Функционал: 
            - Переход на страницу выбора планов (/purchase)
            - Отображение минимальной стоимости ("от 99 ₽")
          */}
          <Link
            href="/purchase"
            onClick={() => triggerHaptic('light')}
            className="w-full h-fit bg-[#F55128] hover:bg-[#d43d1f] active:scale-[0.98] transition-all rounded-[10px] flex items-center px-[14px] py-[14px] justify-between text-white group"
            aria-label="Купить подписку VPN, начиная от 99 рублей"
          >
            <div className="flex items-center gap-[10px]">
              <div className="p-0 rounded-xl" aria-hidden="true">
                <Plug className="w-6 h-6 rotate-45" aria-hidden="true" />
              </div>
              <span className="text-base font-medium">Купить подписку</span>
            </div>
            {isPriceLoading ? (
              <SkeletonLoader variant="text" width="80px" height="1.25rem" className="inline-block" />
            ) : (
              <span className="text-base font-medium opacity-80 group-hover:opacity-100 transition-opacity" aria-label={`Цена от ${minPrice} рублей`}>
                от {minPrice} ₽
              </span>
            )}
          </Link>

          {/* 
            Кнопка "Установка и настройка" 
            Назначение: Запуск пошагового онбординга для подключения VPN.
            Функционал: 
            - Автоматическое определение платформы пользователя (iOS/Android/macOS)
            - Переход к инструкции по настройке (/setup)
          */}
          <Link
            href="/setup"
            onClick={() => triggerHaptic('light')}
            className="w-full h-fit bg-transparent border border-white/10 hover:bg-white/5 active:scale-[0.98] transition-all rounded-[10px] flex items-center px-[14px] py-[14px] justify-between text-white group mb-[10px]"
            aria-label={`Установка и настройка VPN для ${platform}`}
            suppressHydrationWarning
          >
            <div className="flex items-center gap-[10px]">
              <div className="p-0 rounded-xl" aria-hidden="true">
                <Settings className="w-6 h-6" aria-hidden="true" />
              </div>
              <span className="text-base font-medium">Установка и настройка</span>
            </div>
            <span 
              className="text-[#F55128] text-base font-medium opacity-80 group-hover:opacity-100 transition-opacity" 
              aria-label={`Платформа: ${platform}`}
              suppressHydrationWarning
            >
              {platform}
            </span>
          </Link>

          {/* Grid Buttons */}
          <div className="grid grid-cols-2 gap-[10px]">
            {/* 
            Кнопка "Профиль" 
            Назначение: Переход в личный кабинет пользователя.
            Функционал: 
            - Отображение текущей подписки
            - Управление способами оплаты
            - Просмотр истории транзакций
            - Реферальная программа
            - Копирование ID пользователя
          */}
            <Link
              href="/profile"
              className="h-fit bg-transparent border border-white/10 hover:bg-white/5 active:scale-[0.98] transition-all rounded-[10px] flex items-center px-[14px] py-[14px] gap-[10px] text-white"
              aria-label="Перейти в профиль пользователя"
            >
              <div className="p-0 rounded-xl" aria-hidden="true">
                <User className="w-6 h-6" aria-hidden="true" />
              </div>
              <span className="text-base font-medium">Профиль</span>
            </Link>
            {/* 
              Кнопка "Поддержка" 
              Назначение: Вызов FAQ и прямой связи с саппортом.
              Функционал: 
              - Открытие модального окна с ответами на частые вопросы
              - Кнопка быстрого перехода в Telegram-чат поддержки
            */}
            <button
              onClick={handleSupportOpen}
              className="h-fit bg-transparent border border-white/10 hover:bg-white/5 active:scale-[0.98] transition-all rounded-[10px] flex items-center px-[14px] py-[14px] gap-[10px] text-white"
              aria-label="Открыть окно поддержки"
              aria-haspopup="dialog"
            >
              <div className="p-0 rounded-xl" aria-hidden="true">
                <MessageSquare className="w-6 h-6" aria-hidden="true" />
              </div>
              <span className="text-base font-medium">Поддержка</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lazy loaded modal with Suspense */}
      <Suspense fallback={null}>
        <SupportModal
          isOpen={isSupportOpen}
          onClose={() => setIsSupportOpen(false)}
        />
      </Suspense>
    </main>
  );
}
