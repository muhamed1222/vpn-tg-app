/**
 * Кэширование API запросов с дедупликацией
 * Предотвращает множественные одновременные запросы к одному endpoint
 */

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

// Кэш для хранения результатов запросов
const requestCache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

// Дедупликация: храним активные запросы, чтобы не делать дубликаты
const pendingRequests = new Map<string, PendingRequest<unknown>>();

const DEFAULT_TTL = 5 * 60 * 1000; // 5 минут по умолчанию

/**
 * Получает кэшированный результат или выполняет запрос
 * Поддерживает дедупликацию - если запрос уже выполняется, возвращает тот же Promise
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  // Проверяем кэш
  const cached = requestCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data as T;
  }

  // Проверяем, не выполняется ли уже этот запрос
  const pending = pendingRequests.get(key);
  if (pending) {
    // Если запрос выполняется менее 30 секунд назад, возвращаем его
    if (Date.now() - pending.timestamp < 30000) {
      return pending.promise as Promise<T>;
    }
    // Иначе удаляем устаревший pending запрос
    pendingRequests.delete(key);
  }

  // Создаем новый запрос
  const promise = fetcher().then(
    (data) => {
      // Сохраняем в кэш
      requestCache.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
      });
      // Удаляем из pending
      pendingRequests.delete(key);
      return data;
    },
    (error) => {
      // Удаляем из pending при ошибке
      pendingRequests.delete(key);
      throw error;
    }
  );

  // Сохраняем в pending для дедупликации
  pendingRequests.set(key, {
    promise,
    timestamp: Date.now(),
  });

  return promise;
}

/**
 * Очищает кэш для конкретного ключа
 */
export function clearCacheKey(key: string): void {
  requestCache.delete(key);
  pendingRequests.delete(key);
}

/**
 * Очищает весь кэш
 */
export function clearAllCache(): void {
  requestCache.clear();
  pendingRequests.clear();
}

/**
 * Очищает устаревшие записи из кэша
 */
export function cleanupExpiredCache(): void {
  const now = Date.now();
  for (const [key, entry] of requestCache.entries()) {
    if (now - entry.timestamp >= entry.ttl) {
      requestCache.delete(key);
    }
  }

  // Очищаем старые pending запросы (старше 1 минуты)
  for (const [key, pending] of pendingRequests.entries()) {
    if (now - pending.timestamp > 60000) {
      pendingRequests.delete(key);
    }
  }
}

// Периодическая очистка кэша (каждые 5 минут)
if (typeof window !== 'undefined') {
  setInterval(cleanupExpiredCache, 5 * 60 * 1000);
}
