import { createContext, useContext } from 'react';
import { User, Subscription } from '../types';

export interface AuthContextType {
  user: User | null;
  subscription: Subscription;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  refreshSubscription: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
