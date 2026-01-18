import { getTelegramInitData } from './telegram';
import { config } from './config';
import { withRetry, withTimeout } from './api-retry';
import { logWarn } from './utils/logging';
import { handleApiError } from './utils/errorHandler';
import { getHttpStatusMessage } from './utils/user-messages';
import { API_TIMEOUTS } from './constants';
import { validateData } from './validation/validator';
import * as schemas from './validation/schemas';

export interface ApiError {
  error: string;
  status?: number;
}

export class ApiException extends Error {
  constructor(
    public message: string,
    public status: number = 500,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

/**
 * Базовый метод для выполнения API запросов
 * Автоматически добавляет Telegram initData и обрабатывает ошибки
 */
export const apiFetch = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  let initData = getTelegramInitData();

  // В режиме разработки подставляем mock-данные, если приложение запущено не в Telegram
  if (!initData && process.env.NODE_ENV === 'development') {
    initData = 'query_id=STUB&user=%7B%22id%22%3A12345678%2C%22first_name%22%3A%22Developer%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22dev%22%2C%22language_code%22%3A%22ru%22%7D&auth_date=1623822263&hash=7777777777777777777777777777777777777777777777777777777777777777';
    logWarn('[API] Using MOCK Telegram initData for development', {
      action: 'apiFetch',
      environment: 'development'
    });
  }

  if (!initData) {
    throw new ApiException(
      'Telegram WebApp не инициализирован. Пожалуйста, откройте приложение через Telegram.',
      401
    );
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': initData, // Бэкенд всегда ожидает initData
    ...options.headers,
  };

  try {
    // Выполняем запрос с retry и timeout
    // Если baseUrl пустой (клиент), используем Next.js API роуты для проксирования
    // Если baseUrl указан (сервер), делаем запрос напрямую на бэкенд
    const apiUrl = config.api.baseUrl
      ? `${config.api.baseUrl}/api/${endpoint}`
      : `/api/${endpoint}`;

    const response = await withRetry(async () => {
      return await withTimeout(
        fetch(apiUrl, {
          ...options,
          headers,
        })
      );
    });

    // Проверяем Content-Type для правильной обработки ответа
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    // Парсим ответ только если это JSON, иначе пытаемся получить текст
    let data: unknown = {};
    let errorMessage = '';

    if (isJson) {
      try {
        data = await response.json();
      } catch {
        // Если парсинг JSON не удался, оставляем пустой объект
        data = {};
      }
    } else {
      // Если ответ не JSON (например, HTML страница 404), получаем текст
      try {
        const text = await response.text();
        // Если текст начинается с HTML, это значит, что роут не найден
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<!doctype')) {
          errorMessage = 'Сервис временно недоступен. Попробуйте позже.';
        } else {
          // Попытка парсить как JSON на всякий случай
          try {
            data = JSON.parse(text);
          } catch {
            errorMessage = text.substring(0, 200) || 'Неизвестная ошибка';
          }
        }
      } catch {
        // Если не удалось прочитать текст, используем стандартное сообщение
      }
    }

    if (!response.ok) {
      // Формируем понятное сообщение об ошибке
      if (!errorMessage && typeof data === 'object' && data !== null) {
        const errorData = data as { error?: string; message?: string };
        const rawError = errorData.error || errorData.message || '';
        // Преобразуем техническое сообщение в понятное
        const { getUserFriendlyMessage } = await import('@/lib/utils/user-messages');
        errorMessage = getUserFriendlyMessage(rawError);
      }

      if (!errorMessage) {
        // Если нет сообщения в ответе, формируем по статусу
        errorMessage = getHttpStatusMessage(response.status);
      }

      throw new ApiException(
        errorMessage,
        response.status
      );
    }

    return data as T;
  } catch (error) {
    // Если это уже наш ApiException, пробрасываем дальше
    if (error instanceof ApiException) {
      throw error;
    }

    // Обработка сетевых ошибок
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new ApiException(
        'Проблема с подключением к интернету. Проверьте соединение и попробуйте снова.',
        0,
        error
      );
    }

    // Обработка ошибок CORS
    if (error instanceof TypeError && error.message.includes('CORS')) {
      throw new ApiException(
        'Ошибка подключения к серверу. Попробуйте позже.',
        0,
        error
      );
    }

    // Неизвестная ошибка - используем централизованный обработчик для получения сообщения
    // НЕ показываем ошибку пользователю здесь, так как это будет сделано в компоненте
    const userMessage = handleApiError(error, {
      action: 'apiFetch',
      endpoint,
    }, {
      showToUser: false, // Не показываем здесь, компонент сам решит когда показывать
      logError: true,
    });

    throw new ApiException(
      userMessage,
      500,
      error
    );
  }
};

export const api = {
  // Получение данных пользователя и подписки
  auth: async () => {
    try {
      const data = await apiFetch<{
        id: number;
        firstName: string;
        subscription: {
          is_active: boolean;
          expires_at: number | null;
          vless_key?: string;
        };
        discount?: {
          percent: number;
          expiresAt?: number;
        } | null;
      }>('me', { method: 'GET' });

      // Преобразуем формат для совместимости с фронтендом
      return {
        user: {
          id: data.id,
          firstName: data.firstName,
          username: undefined,
        },
        subscription: {
          status: data.subscription.is_active && data.subscription.expires_at && data.subscription.expires_at > Date.now()
            ? 'active' as const
            : data.subscription.expires_at && data.subscription.expires_at <= Date.now()
              ? 'expired' as const
              : 'none' as const,
          expiresAt: data.subscription.expires_at ? new Date(data.subscription.expires_at).toISOString().split('T')[0] : undefined,
        },
        discount: data.discount || null,
      };
    } catch (error) {
      // Используем централизованный обработчик ошибок
      handleApiError(error, {
        action: 'auth',
        endpoint: '/api/me',
      });
      throw error;
    }
  },

  // Получение VPN конфигурации
  getUserConfig: async () => {
    // Используем кэширование для конфигурации (TTL: 2 минуты)
    const { cachedFetch } = await import('@/lib/utils/apiCache');
    const configData = await cachedFetch(
      'user_config',
      async () => {
        const data = await apiFetch<unknown>('user/config', { method: 'GET' });
        return validateData(schemas.UserConfigSchema, data, {
          endpoint: 'user/config',
          action: 'getUserConfig',
        });
      },
      API_TIMEOUTS.GET_USER_CONFIG
    );

    return {
      ok: configData.ok || false,
      config: configData.config || '',
    };
  },

  // Получение статуса пользователя и статистики (с кэшированием на 1 минуту)
  getUserStatus: async () => {
    const { cachedFetch } = await import('@/lib/utils/apiCache');
    return cachedFetch(
      'user_status',
      async () => {
        // Параллельно получаем статус и billing
        const [statusData, billing] = await Promise.all([
          (async () => {
            const data = await apiFetch<unknown>('user/status', { method: 'GET' });
            return validateData(schemas.UserStatusResponseSchema, data, {
              endpoint: 'user/status',
              action: 'getUserStatus',
            });
          })(),
          (async () => {
            try {
              const data = await apiFetch<unknown>('user/billing', { method: 'GET' });
              return validateData(schemas.BillingDataSchema, data, {
                endpoint: 'user/billing',
                action: 'getUserStatus',
              });
            } catch {
              // Если ошибка, возвращаем значения по умолчанию
              return {
                usedBytes: 0,
                limitBytes: null,
                averagePerDayBytes: 0,
                planId: null,
                planName: null,
                period: { start: null, end: null },
              } as schemas.BillingData;
            }
          })(),
        ]);

        const isActive = statusData.status === 'active';

        return {
          ok: isActive,
          status: isActive ? 'active' as const : 'disabled' as const,
          expiresAt: statusData.expiresAt || null,
          usedTraffic: billing.usedBytes || statusData.usedTraffic || 0,
          dataLimit: billing.limitBytes || statusData.dataLimit || 0,
        };
      },
      API_TIMEOUTS.GET_USER_STATUS
    );
  },

  // Получение истории платежей (с кэшированием на 2 минуты)
  getPaymentsHistory: async () => {
    const { cachedFetch } = await import('@/lib/utils/apiCache');
    return cachedFetch(
      'payments_history',
      async () => {
        const data = await apiFetch<unknown>('payments/history', { method: 'GET' });
        return validateData(schemas.TransactionsResponseSchema, data, {
          endpoint: 'payments/history',
          action: 'getPaymentsHistory',
        });
      },
      API_TIMEOUTS.GET_PAYMENTS_HISTORY
    );
  },

  // Получение тарифов (с кэшированием на 5 минут)
  getTariffs: async () => {
    const { cachedFetch } = await import('@/lib/utils/apiCache');
    return cachedFetch(
      'tariffs',
      () => apiFetch<Array<{
        id: string;
        name: string;
        days: number;
        price_stars: number;
        price_rub?: number;
      }>>('tariffs', { method: 'GET' }),
      API_TIMEOUTS.GET_TARIFFS
    );
  },

  getReferralStats: async () => {
    const { cachedFetch } = await import('@/lib/utils/apiCache');
    return cachedFetch(
      'referral_stats',
      async () => {
        const data = await apiFetch<unknown>('user/referrals', { method: 'GET' });
        return validateData(schemas.ReferralStatsSchema, data, {
          endpoint: 'user/referrals',
          action: 'getReferralStats',
        });
      },
      API_TIMEOUTS.GET_REFERRAL_STATS
    );
  },

  // Создание заказа
  createOrder: (planId: string, paymentMethod?: string) => apiFetch<{
    orderId: string;
    status: 'pending';
    paymentUrl: string;
  }>('orders/create', {
    method: 'POST',
    body: JSON.stringify({ planId, paymentMethod })
  }),

  // Проверка статуса оплаты и активация подписки
  checkPaymentSuccess: async (orderId: string) => {
    const data = await apiFetch<unknown>('payment/success', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId })
    });
    return validateData(schemas.PaymentSuccessResponseSchema, data, {
      endpoint: 'payment/success',
      action: 'checkPaymentSuccess',
    });
  },

  // Автопродление (с кэшированием на 1 минуту)
  getAutorenewal: async () => {
    const { cachedFetch } = await import('@/lib/utils/apiCache');
    return cachedFetch(
      'autorenewal',
      async () => {
        const data = await apiFetch<unknown>('user/autorenewal', { method: 'GET' });
        return validateData(schemas.AutorenewalResponseSchema, data, {
          endpoint: 'user/autorenewal',
          action: 'getAutorenewal',
        });
      },
      API_TIMEOUTS.GET_AUTORENEWAL
    );
  },

  updateAutorenewal: async (enabled: boolean) => {
    const data = await apiFetch<unknown>('user/autorenewal', {
      method: 'POST',
      body: JSON.stringify({ enabled })
    });
    return validateData(schemas.AutorenewalResponseSchema, data, {
      endpoint: 'user/autorenewal',
      action: 'updateAutorenewal',
    });
  },

  // История начислений рефералов (с кэшированием на 2 минуты)
  getReferralHistory: async () => {
    const { cachedFetch } = await import('@/lib/utils/apiCache');
    return cachedFetch(
      'referral_history',
      async () => {
        const data = await apiFetch<unknown>('user/referrals/history', { method: 'GET' });
        return validateData(schemas.ReferralHistoryResponseSchema, data, {
          endpoint: 'user/referrals/history',
          action: 'getReferralHistory',
        });
      },
      API_TIMEOUTS.GET_REFERRAL_HISTORY
    );
  },

  // Конкурсы
  getActiveContest: async () => {
    const { cachedFetch } = await import('@/lib/utils/apiCache');
    return cachedFetch(
      'active_contest',
      async () => {
        const data = await apiFetch<unknown>('contest/active', { method: 'GET' });
        return validateData(schemas.ActiveContestResponseSchema, data, {
          endpoint: 'contest/active',
          action: 'getActiveContest',
        });
      },
      API_TIMEOUTS.GET_CONTEST_ACTIVE
    );
  },

  getContestSummary: async (contestId: string) => {
    const { cachedFetch } = await import('@/lib/utils/apiCache');
    return cachedFetch(
      `contest_summary_${contestId}`,
      async () => {
        const data = await apiFetch<unknown>(`referral/summary?contest_id=${contestId}`, { method: 'GET' });
        return validateData(schemas.ContestSummaryResponseSchema, data, {
          endpoint: `referral/summary?contest_id=${contestId}`,
          action: 'getContestSummary',
        });
      },
      API_TIMEOUTS.GET_CONTEST_SUMMARY
    );
  },

  getContestFriends: async (contestId: string, limit: number = 50) => {
    const { cachedFetch } = await import('@/lib/utils/apiCache');
    return cachedFetch(
      `contest_friends_${contestId}_${limit}`,
      async () => {
        const data = await apiFetch<unknown>(`referral/friends?contest_id=${contestId}&limit=${limit}`, { method: 'GET' });
        return validateData(schemas.ContestFriendsResponseSchema, data, {
          endpoint: `referral/friends?contest_id=${contestId}&limit=${limit}`,
          action: 'getContestFriends',
        });
      },
      API_TIMEOUTS.GET_CONTEST_FRIENDS
    );
  },

  getContestTickets: async (contestId: string) => {
    const { cachedFetch } = await import('@/lib/utils/apiCache');
    return cachedFetch(
      `contest_tickets_${contestId}`,
      async () => {
        const data = await apiFetch<unknown>(`referral/tickets?contest_id=${contestId}`, { method: 'GET' });
        return validateData(schemas.ContestTicketsResponseSchema, data, {
          endpoint: `referral/tickets?contest_id=${contestId}`,
          action: 'getContestTickets',
        });
      },
      API_TIMEOUTS.GET_CONTEST_TICKETS
    );
  },
};

