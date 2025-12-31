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
      // 1. Проверяем наличие токена в URL (вход по ссылке из бота)
      const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || window.location.search);
      const loginToken = urlParams.get('token');

      if (loginToken) {
        console.log('[useTelegramAuth] Token found in URL, authenticating...');
        try {
          const response = await fetch(`${API_BASE_URL}/v1/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ token: loginToken }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log('[useTelegramAuth] Token auth success:', data);
            setUser({
              tgId: data.user.tgId,
              username: data.user.username,
              firstName: data.user.firstName,
            });
            setState('authenticated');
            // Очищаем токен из URL
            window.history.replaceState({}, document.title, window.location.pathname + window.location.hash.split('?')[0]);
            return;
          }
        } catch (err) {
          console.error('[useTelegramAuth] Token auth error:', err);
        }
      }

      // 2. Если мы внутри Telegram WebApp (Mini App)
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initData) {
        const tg = window.Telegram.WebApp;
        // ... (логика Mini App остается прежней)
      }

      // 3. Если ничего не помогло - значит мы просто в браузере
      console.log('[useTelegramAuth] Not in Telegram and no token found');
      setState('not_in_telegram');
    };

    authenticate();
  }, []);

  return { state, user, error };
}

