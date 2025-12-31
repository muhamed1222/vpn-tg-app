/**
 * Сервис для работы с API VPN бота
 */
import { logger } from '../utils/logger';

// API URL для нового outlivion-api
const getApiBaseUrl = () => {
  // Проверяем переменную окружения
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // В development режиме можно использовать localhost (если нужно)
  if (import.meta.env.DEV && import.meta.env.VITE_USE_LOCAL_API === 'true') {
    return 'http://localhost:3001';
  }
  
  // В production используем продакшн URL
  return 'https://api.outlivion.space';
};

const API_BASE_URL = getApiBaseUrl();

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface ApiUser {
  id: number;
  firstName: string;
  subscription: {
    isActive: boolean;
    expiresAt: number | null;
    vlessKey: string | null;
  };
}

export interface Tariff {
  id: string;
  name: string;
  days: number;
  price_stars: number;
}

export interface CreatePaymentResponse {
  order_id: string;
  invoice_link?: string; // Для Telegram Stars
  confirmation_url?: string; // Для ЮKassa
  payment_url?: string; // Альтернативное название для URL оплаты
}

export interface PaymentStatusResponse {
  status: 'completed' | 'pending';
  vless_key?: string;
  expires_at?: number;
  message?: string;
}

export interface BillingHistoryItem {
  timestamp: number;
  bytes: number;
}

export interface BillingStatsResponse {
  usedBytes: number;
  limitBytes: number | null;
  averagePerDayBytes: number;
  usageHistory: BillingHistoryItem[];
  planId?: string | null;
  planName?: string | null;
  period?: {
    start: number | null;
    end: number | null;
  };
  updatedAt?: number;
}

class ApiService {
  /**
   * Запрос без авторизации (для публичных эндпоинтов, например оплата на сайте)
   */
  private async requestWithoutAuth<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const maxRetries = 2;
    const timeoutMs = 10000;
    let attempt = 0;

    const shouldRetry = (status: number) => status === 429 || status >= 500;
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    while (true) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          signal: controller.signal,
          credentials: 'include', // withCredentials: true
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: 'Unknown error' }));
          if (attempt < maxRetries && shouldRetry(response.status)) {
            attempt += 1;
            await delay(250 * Math.pow(2, attempt));
            continue;
          }
          throw new Error(error.error || `HTTP error! status: ${response.status}`);
        }

        return response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        const errorName = error instanceof Error ? error.name : '';
        const isAbort = errorName === 'AbortError';
        const isNetworkError = error instanceof TypeError;

        if (attempt < maxRetries && (isAbort || isNetworkError)) {
          attempt += 1;
          await delay(250 * Math.pow(2, attempt));
          continue;
        }

        throw error;
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Авторизация теперь через cookie (установленная при авторизации через /v1/auth/telegram)
    const maxRetries = 2;
    const timeoutMs = 10000;
    let attempt = 0;

    const shouldRetry = (status: number) => status === 429 || status >= 500;
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    while (true) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          signal: controller.signal,
          credentials: 'include', // withCredentials: true (для отправки cookie)
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: 'Unknown error' }));
          if (attempt < maxRetries && shouldRetry(response.status)) {
            attempt += 1;
            await delay(250 * Math.pow(2, attempt));
            continue;
          }
          throw new Error(error.error || `HTTP error! status: ${response.status}`);
        }

        return response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        const errorName = error instanceof Error ? error.name : '';
        const isAbort = errorName === 'AbortError';
        const isNetworkError = error instanceof TypeError;

        if (attempt < maxRetries && (isAbort || isNetworkError)) {
          attempt += 1;
          await delay(250 * Math.pow(2, attempt));
          continue;
        }

        throw error;
      }
    }
  }

  /**
   * Получить данные текущего пользователя
   */
  async getMe(): Promise<ApiUser> {
    return this.request<ApiUser>('/api/me');
  }

  /**
   * Получить список тарифов
   */
  async getTariffs(): Promise<Tariff[]> {
    return this.request<Tariff[]>('/api/tariffs');
  }

  /**
   * Создать заказ на оплату
   * Для сайта (не в Telegram) работает без initData
   * Для YooKassa использует новый API (api.outlivion.space)
   * @param tariffId - ID плана (planId)
   * @param provider - Провайдер оплаты
   * @param userRef - Опциональный идентификатор пользователя
   */
  async createPayment(tariffId: string, provider?: 'telegram' | 'yookassa' | 'heleket', userRef?: string): Promise<CreatePaymentResponse> {
    const selectedProvider = provider || 'yookassa';
    
    // Используем новый API (api.outlivion.space) для создания заказа
    try {
      const response = await fetch(`${API_BASE_URL}/v1/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // withCredentials: true (для отправки cookie с JWT)
        body: JSON.stringify({
          planId: tariffId,
          // userRef теперь берется из cookie (авторизованный пользователь)
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || error.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Преобразуем ответ нового API в формат, ожидаемый фронтендом
      // ВАЖНО: order_id сохраняется в localStorage перед редиректом на оплату
      return {
        order_id: data.orderId, // Используется для сохранения в localStorage
        payment_url: data.paymentUrl,
        confirmation_url: data.paymentUrl,
      };
    } catch (error) {
      logger.error('Ошибка при создании заказа через новый API:', error);
      throw error;
    }
  }

  /**
   * Проверить статус оплаты заказа
   */
  async checkPaymentStatus(orderId: string): Promise<PaymentStatusResponse> {
    return this.request<PaymentStatusResponse>('/api/payment/success', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    });
  }

  /**
   * Получить биллинг и трафик пользователя
   */
  async getBillingStats(): Promise<BillingStatsResponse> {
    return this.request<BillingStatsResponse>('/api/billing');
  }

  /**
   * Получить историю платежей пользователя
   */
  async getPaymentHistory(): Promise<PaymentHistoryItem[]> {
    return this.request<PaymentHistoryItem[]>('/api/payments/history');
  }
}

export interface PaymentHistoryItem {
  id: string;
  orderId: string;
  amount: number;
  currency: 'XTR' | 'RUB';
  date: number; // timestamp
  status: 'success' | 'fail' | 'pending' | 'cancelled';
  planName: string;
  planId?: string;
  invoiceLink?: string;
}

export const apiService = new ApiService();
