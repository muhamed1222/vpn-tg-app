import { useState, useEffect } from 'react';

export interface TelegramAuthUser {
  tgId: number;
  username?: string;
  firstName?: string;
}

export type TelegramAuthState = 'loading' | 'authenticated' | 'not_in_telegram' | 'error';

interface UseTelegramAuthResult {
  state: TelegramAuthState;
  user: TelegramAuthUser | null;
  error: string | null;
}

const API_BASE_URL = 'https://api.outlivion.space';

/**
 * Хук для авторизации через Telegram WebApp
 */
export function useTelegramAuth(): UseTelegramAuthResult {
  const [state, setState] = useState<TelegramAuthState>('loading');
  const [user, setUser] = useState<TelegramAuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authenticate = async () => {
      // Проверяем наличие Telegram WebApp
      if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
        setState('not_in_telegram');
        return;
      }

      const tg = window.Telegram.WebApp;
      
      try {
        // Инициализируем Telegram WebApp
        tg.ready();

        // Получаем initData
        const initData = tg.initData;

        if (!initData || typeof initData !== 'string' || initData.length === 0) {
          setState('not_in_telegram');
          return;
        }

        // Отправляем запрос на авторизацию
        const response = await fetch(`${API_BASE_URL}/v1/auth/telegram`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // withCredentials: true
          body: JSON.stringify({ initData }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || errorData.message || 'Authentication failed');
        }

        const data = await response.json();
        
        if (data.ok && data.user) {
          setUser({
            tgId: data.user.tgId,
            username: data.user.username,
            firstName: data.user.firstName,
          });
          setState('authenticated');
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err) {
        console.error('Telegram auth error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setState('error');
      }
    };

    authenticate();
  }, []);

  return { state, user, error };
}

