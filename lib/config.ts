/**
 * Конфигурация приложения
 * 
 * Разделение на серверный и клиентский конфиг:
 * - Серверные переменные (NEXT_PUBLIC_*) доступны на клиенте
 * - Остальные доступны только на сервере
 */

function getServerEnvVar(key: string, defaultValue?: string): string {
  // Только на сервере
  if (typeof window !== 'undefined') {
    return defaultValue || '';
  }
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue || '';
}

function getClientEnvVar(key: string, defaultValue: string): string {
  // NEXT_PUBLIC_ переменные доступны на клиенте
  const value = process.env[key];
  return value || defaultValue;
}

// Серверный конфиг (доступен только в API routes)
export const serverConfig = {
  telegram: {
    // Получаем токен из переменной окружения
    // Если не указан, используем пустую строку (валидация будет на бэкенде)
    botToken: getServerEnvVar('TELEGRAM_BOT_TOKEN', ''),
  },
  env: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    nodeEnv: process.env.NODE_ENV || 'development',
  },
} as const;

// Клиентский конфиг (доступен везде)
export const config = {
  api: {
    // Используем относительный путь для проксирования через Next.js API роуты
    // Это избегает проблем с CORS и позволяет валидировать запросы на сервере
    baseUrl: typeof window !== 'undefined' ? '' : getClientEnvVar('NEXT_PUBLIC_API_BASE_URL', 'https://api.outlivion.space'),
  },
  payment: {
    // URL для редиректа deep link (если используется)
    // Если не используется, можно оставить пустым или использовать прямой subscriptionBaseUrl
    redirectUrl: getClientEnvVar('NEXT_PUBLIC_PAYMENT_REDIRECT_URL', ''),
    // Базовый URL сервера подписок (Marzban)
    // Подписки проксируются через /api/sub/:token
    subscriptionBaseUrl: getClientEnvVar('NEXT_PUBLIC_SUBSCRIPTION_BASE_URL', 'https://vpn.outlivion.space'),
  },
  support: {
    telegramUrl: getClientEnvVar('NEXT_PUBLIC_SUPPORT_TELEGRAM_URL', 'https://t.me/outlivion_supportbot'),
    helpBaseUrl: getClientEnvVar('NEXT_PUBLIC_HELP_BASE_URL', 'https://help.outlivion.space'),
  },
  bot: {
    username: getClientEnvVar('NEXT_PUBLIC_BOT_USERNAME', 'outlivion_bot'),
  },
  deepLink: {
    defaultProtocol: 'happ://add/',
    iosProtocol: 'v2raytun://import/',
    vpnName: 'OutlivionVPN',
  },
} as const;

