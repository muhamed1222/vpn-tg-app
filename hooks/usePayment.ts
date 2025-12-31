import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { getTelegramWebApp, isTelegramWebApp } from '../utils/telegram';

export type PaymentProvider = 'telegram' | 'yookassa' | 'heleket';

interface UsePaymentOptions {
  allowBrowserFallback?: boolean;
  onPaid?: () => void;
}

export const usePayment = (options: UsePaymentOptions = {}) => {
  const { allowBrowserFallback = false, onPaid, userRef } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePay = useCallback(async (planId: string, provider?: PaymentProvider) => {
    const isInTelegram = isTelegramWebApp();
    const selectedProvider: PaymentProvider = provider || (isInTelegram ? 'telegram' : 'yookassa');

    if (selectedProvider === 'telegram' && !isInTelegram) {
      setError('Оплата доступна только через Telegram WebApp.');
      return;
    }

    if (selectedProvider !== 'telegram' && !allowBrowserFallback) {
      setError('Оплата через сайт сейчас недоступна.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payment = await apiService.createPayment(planId, selectedProvider, userRef);

      // Обработка Telegram Stars
      if (selectedProvider === 'telegram') {
        if (!payment.invoice_link) {
          throw new Error('Ссылка на оплату не получена');
        }

        if (!isInTelegram) {
          setError('Оплата через Telegram Stars доступна только в Telegram WebApp.');
          setLoading(false);
          return;
        }

        const webApp = getTelegramWebApp();
        if (!webApp?.openInvoice) {
          setError('Не удалось открыть оплату в Telegram.');
          setLoading(false);
          return;
        }

        webApp.openInvoice(payment.invoice_link, (status: string) => {
          if (status === 'paid') {
            onPaid?.();
            navigate(`/result?order_id=${payment.order_id}&status=pending`);
          } else {
            setError('Оплата отменена');
            setLoading(false);
          }
        });
        return;
      }

      // Обработка ЮKassa и других провайдеров
      if (selectedProvider === 'yookassa' || selectedProvider === 'heleket') {
        const paymentUrl = payment.confirmation_url || payment.payment_url || payment.invoice_link;
        
        if (!paymentUrl) {
          throw new Error('Ссылка на оплату не получена');
        }

        // Сохраняем orderId в localStorage для страницы возврата
        // Используем "lastOrderId" как указано в требованиях
        if (payment.order_id) {
          localStorage.setItem('lastOrderId', payment.order_id);
        }

        // Редиректим пользователя на страницу оплаты
        window.location.href = paymentUrl;
        // navigate не вызываем, так как происходит полный редирект
        return;
      }

      setError('Неподдерживаемый провайдер оплаты.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось создать заказ. Попробуйте позже.';
      setError(message);
    }
    setLoading(false);
  }, [allowBrowserFallback, navigate, onPaid]);

  return {
    loading,
    error,
    setError,
    handlePay,
  };
};
