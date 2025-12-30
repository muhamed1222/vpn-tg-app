/**
 * Сервис для работы с API VPN бота
 */
import { logger } from '../utils/logger';
import { getTelegramWebApp } from '../utils/telegram';

// API URL для тестового бота
// В development режиме используем localhost, в production - продакшн URL
const getApiBaseUrl = () => {
  // Проверяем переменную окружения
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // В development режиме используем localhost
  if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
    return 'http://localhost:3000';
  }
  
  // В production используем продакшн URL
  return 'https://vpn.outlivion.space';
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
  invoice_link: string;
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
  private getInitData(): string | null {
    // Получаем initData из Telegram WebApp
    if (typeof window !== 'undefined') {
      const webApp = getTelegramWebApp();
      if (webApp) {
        
        // Проверяем, что WebApp готов
        if (webApp.initData && typeof webApp.initData === 'string' && webApp.initData.length > 0) {
          logger.debug('[ApiService] initData найден, длина:', webApp.initData.length);
          return webApp.initData;
        }
        
        // Если initData пустой, но WebApp существует, возможно он еще загружается
        logger.debug('[ApiService] WebApp существует, но initData пустой или не готов');
        logger.debug('[ApiService] WebApp состояние:', {
          version: webApp.version,
          platform: webApp.platform,
          initData: webApp.initData ? 'есть (пустой)' : 'нет',
          initDataUnsafe: webApp.initDataUnsafe ? 'есть' : 'нет'
        });
      } else {
        logger.debug('[ApiService] Telegram.WebApp не найден');
      }
    }
    return null;
  }
  
  private waitForInitData(maxWait = 3000): Promise<string | null> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkInitData = () => {
        const initData = this.getInitData();
        if (initData && initData.length > 0) {
          logger.debug('[ApiService] initData получен');
          resolve(initData);
          return;
        }
        
        if (Date.now() - startTime >= maxWait) {
          logger.warn('[ApiService] Таймаут ожидания initData');
          resolve(null);
          return;
        }
        
        setTimeout(checkInitData, 100);
      };
      
      checkInitData();
    });
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Ждем инициализации initData (максимум 2 секунды)
    let initData = this.getInitData();
    
    if (!initData) {
      logger.debug('[ApiService] initData не найден, ожидание инициализации...');
      initData = await this.waitForInitData(2000);
    }
    
    if (!initData) {
      throw new Error('Telegram WebApp не инициализирован. Убедитесь, что вы открыли сайт через Telegram бота.');
    }

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
          headers: {
            'Content-Type': 'application/json',
            'Authorization': initData,
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
   */
  async createPayment(tariffId: string): Promise<CreatePaymentResponse> {
    return this.request<CreatePaymentResponse>('/api/payment/create', {
      method: 'POST',
      body: JSON.stringify({ tariff_id: tariffId }),
    });
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
