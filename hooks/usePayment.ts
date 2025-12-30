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
  const { allowBrowserFallback = false, onPaid } = options;
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

    if (!isInTelegram && selectedProvider !== 'telegram') {
      const orderId = `${selectedProvider}_${Date.now()}`;
      const paymentUrl = `https://example.com/checkout/${selectedProvider}?order_id=${orderId}&plan_id=${planId}`;
      window.open(paymentUrl, '_blank', 'noopener,noreferrer');
      navigate(`/result?order_id=${orderId}&status=success`);
      setLoading(false);
      return;
    }

    try {
      const payment = await apiService.createPayment(planId);

      if (!payment.invoice_link) {
        throw new Error('Ссылка на оплату не получена');
      }

      if (isInTelegram) {
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

      if (allowBrowserFallback) {
        window.open(payment.invoice_link, '_blank');
        navigate(`/result?order_id=${payment.order_id}&status=pending`);
        return;
      }

      setError('Оплата доступна только через Telegram WebApp.');
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
