export interface TelegramWebAppUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export interface TelegramWebAppInitDataUnsafe {
  user?: TelegramWebAppUser;
}

export interface TelegramWebApp {
  initData?: string;
  initDataUnsafe?: TelegramWebAppInitDataUnsafe;
  platform?: string;
  version?: string;
  ready: () => void;
  expand: () => void;
  openInvoice?: (invoice: string, callback: (status: string) => void) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

interface TelegramWindow extends Window {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
}

export const getTelegramWebApp = (): TelegramWebApp | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  return (window as TelegramWindow).Telegram?.WebApp;
};

export const isTelegramWebApp = (): boolean => {
  const tg = getTelegramWebApp();
  if (!tg) return false;

  const hasInitData = typeof tg.initData === 'string' && tg.initData.length > 0;
  const hasInitDataUnsafe = !!tg.initDataUnsafe?.user;
  const platform = tg.platform;

  const isRealTelegram = !!(platform && platform !== 'unknown' && platform !== '');
  return isRealTelegram || hasInitData || hasInitDataUnsafe;
};
