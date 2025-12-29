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

interface AuthContextType {
  user: User | null;
  subscription: Subscription;
  login: () => void;
  logout: () => void;
  refreshSubscription: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription>({
    status: SubscriptionStatus.NONE
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setSubscription({
        status: SubscriptionStatus.ACTIVE,
        activeUntil: '24.12.2025',
        planId: '12m'
      });
    }
  }, []);

  const login = () => {
    const mockUser: User = {
      id: 'usr_1',
      telegramId: 12345678,
      username: 'Muhamed Chalemat',
      avatar: 'https://cdn.visitors.now/users/e2ccd994-4e15-425d-81b4-ad614a9d46dc/avatars/vVBAtzhu4sxfKkQ5_Y7_3.png'
    };
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const refreshSubscription = () => {
    setSubscription({
      status: SubscriptionStatus.ACTIVE,
      activeUntil: '15.03.2026',
      planId: '3m'
    });
  };

  return (
    <AuthContext.Provider value={{ user, subscription, login, logout, refreshSubscription }}>
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