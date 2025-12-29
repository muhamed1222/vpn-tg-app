import React, { useState, useEffect, createContext, useContext } from 'react';
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
import { apiService } from './services/apiService';

interface AuthContextType {
  user: User | null;
  subscription: Subscription;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Проверка, запущено ли приложение в Telegram WebApp
const isTelegramWebApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  const tg = (window as any).Telegram?.WebApp;
  if (!tg) return false;
  
  // Проверяем, что это реальный Telegram WebApp
  // В реальном Telegram есть initData или хотя бы платформа определена
  // Если скрипт просто загружен в обычном браузере, платформа будет undefined или 'unknown'
  const hasInitData = tg.initData && typeof tg.initData === 'string' && tg.initData.length > 0;
  const hasInitDataUnsafe = tg.initDataUnsafe && tg.initDataUnsafe.user;
  const platform = tg.platform;
  
  // Реальный Telegram имеет одну из платформ: tdesktop, android, ios, web
  // Или имеет initData/initDataUnsafe
  const isRealTelegram = platform && platform !== 'unknown' && platform !== '';
  const hasRealData = hasInitData || hasInitDataUnsafe;
  
  return !!(isRealTelegram || hasRealData);
};

// Инициализация Telegram WebApp
const initTelegramWebApp = () => {
  if (isTelegramWebApp()) {
    const tg = (window as any).Telegram.WebApp;
    tg.ready();
    tg.expand();
    return tg;
  }
  return null;
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
        const tg = (window as any).Telegram?.WebApp;
        if (tg?.initDataUnsafe?.user?.photo_url) {
          userData.avatar = tg.initDataUnsafe.user.photo_url;
        }

        setUser(userData);

        // Преобразуем данные подписки
        const subscriptionData: Subscription = {
          status: apiUser.subscription.isActive 
            ? SubscriptionStatus.ACTIVE 
            : apiUser.subscription.expiresAt && apiUser.subscription.expiresAt > Date.now()
            ? SubscriptionStatus.EXPIRED
            : SubscriptionStatus.NONE,
          activeUntil: apiUser.subscription.expiresAt 
            ? new Date(apiUser.subscription.expiresAt).toLocaleDateString('ru-RU')
            : undefined,
          planId: undefined // План определяется по expiresAt
        };

        setSubscription(subscriptionData);
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
    console.log('[Login] Начало авторизации');
    const isInTelegram = isTelegramWebApp();
    console.log('[Login] isTelegramWebApp:', isInTelegram);
    
    // В Telegram WebApp авторизация происходит автоматически
    if (isInTelegram) {
      // Даем время Telegram WebApp инициализироваться
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        console.log('[Login] Загрузка данных из API...');
        // Пытаемся загрузить данные пользователя из API
        const apiUser = await apiService.getMe();
        console.log('[Login] Данные получены:', apiUser);
        
        const userData: User = {
          id: `usr_${apiUser.id}`,
          telegramId: apiUser.id,
          username: apiUser.firstName,
          avatar: undefined
        };

        const tg = (window as any).Telegram?.WebApp;
        if (tg?.initDataUnsafe?.user?.photo_url) {
          userData.avatar = tg.initDataUnsafe.user.photo_url;
        }

        console.log('[Login] Установка пользователя:', userData);
        setUser(userData);

        const subscriptionData: Subscription = {
          status: apiUser.subscription.isActive 
            ? SubscriptionStatus.ACTIVE 
            : apiUser.subscription.expiresAt && apiUser.subscription.expiresAt > Date.now()
            ? SubscriptionStatus.EXPIRED
            : SubscriptionStatus.NONE,
          activeUntil: apiUser.subscription.expiresAt 
            ? new Date(apiUser.subscription.expiresAt).toLocaleDateString('ru-RU')
            : undefined,
          planId: undefined
        };

        setSubscription(subscriptionData);
        console.log('[Login] Авторизация завершена успешно');
        return;
      } catch (error: any) {
        console.error('[Login] Ошибка при авторизации через Telegram:', error);
        
        // Если initData недоступен, используем данные из initDataUnsafe для моковой авторизации
        const tg = (window as any).Telegram?.WebApp;
        if (tg?.initDataUnsafe?.user) {
          console.log('[Login] Использование initDataUnsafe для моковой авторизации');
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
        console.warn('[Login] Ошибка API, переключаемся на режим разработки');
      }
    }

    // Для разработки - моковый пользователь
    console.log('[Login] Режим разработки - создание мокового пользователя');
    try {
      const mockUser: User = {
        id: 'usr_1',
        telegramId: 12345678,
        username: 'Muhamed Chalemat',
        avatar: 'https://cdn.visitors.now/users/e2ccd994-4e15-425d-81b4-ad614a9d46dc/avatars/vVBAtzhu4sxfKkQ5_Y7_3.png'
      };
      
      console.log('[Login] Установка мокового пользователя:', mockUser);
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      // Устанавливаем моковую подписку
      const mockSubscription = {
        status: SubscriptionStatus.ACTIVE,
        activeUntil: '24.12.2025',
        planId: 'plan_365'
      };
      setSubscription(mockSubscription);
      console.log('[Login] Моковая авторизация завершена');
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
      const subscriptionData: Subscription = {
        status: apiUser.subscription.isActive 
          ? SubscriptionStatus.ACTIVE 
          : apiUser.subscription.expiresAt && apiUser.subscription.expiresAt > Date.now()
          ? SubscriptionStatus.EXPIRED
          : SubscriptionStatus.NONE,
        activeUntil: apiUser.subscription.expiresAt 
          ? new Date(apiUser.subscription.expiresAt).toLocaleDateString('ru-RU')
          : undefined,
        planId: undefined
      };
      setSubscription(subscriptionData);
    } catch (error) {
      console.error('Ошибка при обновлении подписки:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#CE3000] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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