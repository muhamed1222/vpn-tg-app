import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { AccountGeneral } from './pages/AccountGeneral';
import { AccountBilling } from './pages/AccountBilling';
import { Pay } from './pages/Pay';
import { Result } from './pages/Result';
import { Instructions } from './pages/Instructions';
import { Support } from './pages/Support';
import { User, Subscription, SubscriptionStatus } from './types';
import { AuthContext } from './context/AuthContext';
import { apiService } from './services/apiService';
import { logger } from './utils/logger';
import { getTelegramWebApp, isTelegramWebApp } from './utils/telegram';

// Инициализация Telegram WebApp
const initTelegramWebApp = () => {
  if (isTelegramWebApp()) {
    const tg = getTelegramWebApp();
    if (tg) {
      tg.ready();
      tg.expand();
      return tg;
    }
  }
  return null;
};

const mapSubscription = (subscription: {
  isActive: boolean;
  expiresAt: number | null;
}): Subscription => {
  const now = Date.now();
  const expiresAt = subscription.expiresAt;
  const isStillActive = typeof expiresAt === 'number' && expiresAt > now;

  let status = SubscriptionStatus.NONE;
  if (subscription.isActive || isStillActive) {
    status = SubscriptionStatus.ACTIVE;
  } else if (typeof expiresAt === 'number' && expiresAt <= now) {
    status = SubscriptionStatus.EXPIRED;
  }

  return {
    status,
    activeUntil: status === SubscriptionStatus.ACTIVE && typeof expiresAt === 'number'
      ? new Date(expiresAt).toLocaleDateString('ru-RU')
      : undefined,
    planId: undefined,
  };
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription>({
    status: SubscriptionStatus.NONE
  });
  const [loading, setLoading] = useState(true);

  // Инициализация Telegram WebApp
  useEffect(() => {
    initTelegramWebApp();
  }, []);

  // Загрузка данных пользователя при монтировании
  useEffect(() => {
    const loadUserData = async () => {
      // Если не в Telegram WebApp, используем localStorage для разработки
      if (!isTelegramWebApp()) {
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setSubscription({
              status: SubscriptionStatus.ACTIVE,
              activeUntil: '24.12.2025',
              planId: 'plan_365'
            });
          }
        } catch (error) {
          console.error('Ошибка при загрузке пользователя из localStorage:', error);
          localStorage.removeItem('user');
        }
        setLoading(false);
        return;
      }

      // В Telegram WebApp - ждем инициализации и загружаем данные с API
      // Даем время Telegram WebApp инициализироваться
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const apiUser = await apiService.getMe();
        
        // Преобразуем данные API в формат приложения
        const userData: User = {
          id: `usr_${apiUser.id}`,
          telegramId: apiUser.id,
          username: apiUser.firstName,
          avatar: undefined
        };

        // Получаем аватар из Telegram WebApp если доступен
        const tg = getTelegramWebApp();
        if (tg?.initDataUnsafe?.user?.photo_url) {
          userData.avatar = tg.initDataUnsafe.user.photo_url;
        }

        setUser(userData);

        setSubscription(mapSubscription(apiUser.subscription));
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
        // В случае ошибки не блокируем приложение
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const login = async () => {
    logger.debug('[Login] Начало авторизации');
    const isInTelegram = isTelegramWebApp();
    logger.debug('[Login] isTelegramWebApp:', isInTelegram);
    
    // В Telegram WebApp авторизация происходит автоматически
    if (isInTelegram) {
      // Даем время Telegram WebApp инициализироваться
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        logger.debug('[Login] Загрузка данных из API...');
        // Пытаемся загрузить данные пользователя из API
        const apiUser = await apiService.getMe();
        logger.debug('[Login] Данные получены:', apiUser);
        
        const userData: User = {
          id: `usr_${apiUser.id}`,
          telegramId: apiUser.id,
          username: apiUser.firstName,
          avatar: undefined
        };

        const tg = getTelegramWebApp();
        if (tg?.initDataUnsafe?.user?.photo_url) {
          userData.avatar = tg.initDataUnsafe.user.photo_url;
        }

        logger.debug('[Login] Установка пользователя:', userData);
        setUser(userData);

        setSubscription(mapSubscription(apiUser.subscription));
        logger.debug('[Login] Авторизация завершена успешно');
        return;
      } catch (error) {
        console.error('[Login] Ошибка при авторизации через Telegram:', error);
        
        // Если initData недоступен, используем данные из initDataUnsafe для моковой авторизации
        const tg = getTelegramWebApp();
        if (tg?.initDataUnsafe?.user) {
          logger.debug('[Login] Использование initDataUnsafe для моковой авторизации');
          const tgUser = tg.initDataUnsafe.user;
          
          const userData: User = {
            id: `usr_${tgUser.id}`,
            telegramId: tgUser.id,
            username: tgUser.first_name || `user_${tgUser.id}`,
            avatar: tgUser.photo_url
          };
          
          setUser(userData);
          setSubscription({
            status: SubscriptionStatus.NONE,
            activeUntil: undefined,
            planId: undefined
          });
          return;
        }
        
        // Если ошибка и мы не в реальном Telegram, переключаемся на режим разработки
        logger.warn('[Login] Ошибка API, переключаемся на режим разработки');
      }
    }

    // Для разработки - моковый пользователь
    logger.debug('[Login] Режим разработки - создание мокового пользователя');
    try {
      const mockUser: User = {
        id: 'usr_1',
        telegramId: 12345678,
        username: 'Muhamed Chalemat',
        avatar: 'https://cdn.visitors.now/users/e2ccd994-4e15-425d-81b4-ad614a9d46dc/avatars/vVBAtzhu4sxfKkQ5_Y7_3.png'
      };
      
      logger.debug('[Login] Установка мокового пользователя:', mockUser);
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      // Устанавливаем моковую подписку
      const mockSubscription = {
        status: SubscriptionStatus.ACTIVE,
        activeUntil: '24.12.2025',
        planId: 'plan_365'
      };
      setSubscription(mockSubscription);
      logger.debug('[Login] Моковая авторизация завершена');
    } catch (error) {
      console.error('[Login] Ошибка при создании мокового пользователя:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setSubscription({ status: SubscriptionStatus.NONE });
  };

  const refreshSubscription = async () => {
    if (!isTelegramWebApp()) {
      // Для разработки - моковые данные
      setSubscription({
        status: SubscriptionStatus.ACTIVE,
        activeUntil: '15.03.2026',
        planId: 'plan_90'
      });
      return;
    }

    try {
      const apiUser = await apiService.getMe();
      setSubscription(mapSubscription(apiUser.subscription));
    } catch (error) {
      console.error('Ошибка при обновлении подписки:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-fg-2">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, subscription, loading, login, logout, refreshSubscription }}>
      <Router>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/account" /> : <Home />} />
          <Route element={<ProtectedRoute user={user} />}>
            <Route element={<Layout />}>
              <Route path="/account" element={<AccountGeneral />} />
              <Route path="/account/billing" element={<AccountBilling />} />
              <Route path="/pay" element={<Pay />} />
              <Route path="/result" element={<Result />} />
              <Route path="/instructions" element={<Instructions />} />
              <Route path="/support" element={<Support />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
};

const ProtectedRoute: React.FC<{ user: User | null }> = ({ user }) => {
  if (!user) return <Navigate to="/" />;
  return <Outlet />;
};

export default App;
