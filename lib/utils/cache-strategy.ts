/**
 * Унифицированная стратегия кэширования для API endpoints
 * Определяет TTL и стратегию кэширования для каждого типа данных
 */

export enum CacheStrategy {
  /** Не кэшировать (для критичных данных) */
  NO_CACHE = 'no-cache',
  /** Короткий TTL (1 минута) - для часто меняющихся данных */
  SHORT = 'short',
  /** Средний TTL (2-5 минут) - для относительно стабильных данных */
  MEDIUM = 'medium',
  /** Длинный TTL (10+ минут) - для редко меняющихся данных */
  LONG = 'long',
}

/**
 * Конфигурация кэширования для различных типов данных
 */
export const CACHE_CONFIG: Record<string, { strategy: CacheStrategy; ttl: number }> = {
  // Тарифы - редко меняются, можно кэшировать долго
  tariffs: {
    strategy: CacheStrategy.MEDIUM,
    ttl: 5 * 60 * 1000, // 5 минут
  },
  
  // История платежей - может меняться, но не критично часто
  payments_history: {
    strategy: CacheStrategy.SHORT,
    ttl: 2 * 60 * 1000, // 2 минуты
  },
  
  // Статус пользователя - меняется часто, но можно кэшировать коротко
  user_status: {
    strategy: CacheStrategy.SHORT,
    ttl: 1 * 60 * 1000, // 1 минута
  },
  
  // Конфигурация VPN - редко меняется
  user_config: {
    strategy: CacheStrategy.MEDIUM,
    ttl: 2 * 60 * 1000, // 2 минуты
  },
  
  // Статистика рефералов - меняется не очень часто
  referral_stats: {
    strategy: CacheStrategy.MEDIUM,
    ttl: 2 * 60 * 1000, // 2 минуты
  },
  
  // История рефералов - может меняться, но не критично часто
  referral_history: {
    strategy: CacheStrategy.SHORT,
    ttl: 2 * 60 * 1000, // 2 минуты
  },
  
  // Автопродление - меняется редко
  autorenewal: {
    strategy: CacheStrategy.SHORT,
    ttl: 1 * 60 * 1000, // 1 минута
  },
  
  // Активный конкурс - меняется редко
  active_contest: {
    strategy: CacheStrategy.SHORT,
    ttl: 1 * 60 * 1000, // 1 минута
  },
  
  // Сводка конкурса - может меняться при новых участниках
  contest_summary: {
    strategy: CacheStrategy.SHORT,
    ttl: 1 * 60 * 1000, // 1 минута
  },
  
  // Друзья в конкурсе - может меняться при новых участниках
  contest_friends: {
    strategy: CacheStrategy.SHORT,
    ttl: 1 * 60 * 1000, // 1 минута
  },
  
  // Билеты конкурса - может меняться при новых билетах
  contest_tickets: {
    strategy: CacheStrategy.SHORT,
    ttl: 1 * 60 * 1000, // 1 минута
  },
  
  // Минимальная цена - редко меняется
  min_price: {
    strategy: CacheStrategy.MEDIUM,
    ttl: 5 * 60 * 1000, // 5 минут
  },
  
  // URL подписки - редко меняется
  subscription_url: {
    strategy: CacheStrategy.LONG,
    ttl: 10 * 60 * 1000, // 10 минут
  },
};

/**
 * Получает конфигурацию кэширования для ключа
 */
export function getCacheConfig(key: string): { strategy: CacheStrategy; ttl: number } {
  const config = CACHE_CONFIG[key];
  if (config) {
    return config;
  }
  
  // По умолчанию - средний TTL
  return {
    strategy: CacheStrategy.MEDIUM,
    ttl: 2 * 60 * 1000, // 2 минуты
  };
}

/**
 * Проверяет, нужно ли кэшировать данные
 */
export function shouldCache(key: string): boolean {
  const config = getCacheConfig(key);
  return config.strategy !== CacheStrategy.NO_CACHE;
}

/**
 * Получает TTL для ключа
 */
export function getCacheTTL(key: string): number {
  const config = getCacheConfig(key);
  return config.ttl;
}
