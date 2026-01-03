import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { getTelegramWebApp, isTelegramWebApp } from '../utils/telegram';

export type PaymentProvider = 'telegram' | 'yookassa' | 'heleket';

interface UsePaymentOptions {
  allowBrowserFallback?: boolean;
  onPaid?: () => void;
  userRef?: string;
}

export const usePayment = (options: UsePaymentOptions = {}) => {
  const { onPaid } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePay = useCallback(async (planId: string, provider?: PaymentProvider) => {
    const isInTelegram = isTelegramWebApp();
    
    // В новой системе мы ориентируемся на YooKassa как основной метод
    setLoading(true);
    setError(null);

    try {
      // Создаем заказ через наше API
      const response = await apiService.createOrder(planId);

      if (!response.paymentUrl) {
        throw new Error('Ссылка на оплату не получена');
      }

      // Сохраняем orderId для страницы подтверждения
      localStorage.setItem('lastOrderId', response.orderId);

      // Если мы в Telegram и провайдер Telegram (Stars), используем openInvoice
      // Но сейчас мы фокусируемся на YooKassa через редирект
      if (provider === 'telegram' && isInTelegram) {
        // Логика для Stars если нужно
      }

      // Редирект на оплату
      window.location.href = response.paymentUrl;
      
    } catch (err) {
      console.error('Payment error:', err);
      const message = err instanceof Error ? err.message : 'Не удалось создать заказ. Попробуйте позже.';
      setError(message);
      setLoading(false);
    }
  }, [navigate, onPaid]);

  return {
    loading,
    error,
    setError,
    handlePay,
  };
};
