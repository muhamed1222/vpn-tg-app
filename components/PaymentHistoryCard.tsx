import React, { useState, useEffect } from 'react';
import { apiService, PaymentHistoryItem } from '../services/apiService';
import { AlertCircle, CheckCircle2, XCircle, Clock, Receipt, ExternalLink } from 'lucide-react';

// Моковые данные истории платежей
const MOCK_PAYMENT_HISTORY: PaymentHistoryItem[] = [
  {
    id: 'pay_1',
    orderId: 'order_12345',
    amount: 899,
    date: Date.now() - 15 * 24 * 60 * 60 * 1000,
    status: 'success',
    planName: '12 Месяцев',
    planId: 'plan_365',
  },
  {
    id: 'pay_2',
    orderId: 'order_12344',
    amount: 260,
    date: Date.now() - 120 * 24 * 60 * 60 * 1000,
    status: 'success',
    planName: '3 Месяца',
    planId: 'plan_90',
  },
  {
    id: 'pay_3',
    orderId: 'order_12343',
    amount: 99,
    date: Date.now() - 180 * 24 * 60 * 60 * 1000,
    status: 'fail',
    planName: '1 Месяц',
    planId: 'plan_30',
  },
];

export const PaymentHistoryCard: React.FC = () => {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Загрузка истории платежей
  useEffect(() => {
    const loadPaymentHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      
      try {
        if ((window as any).Telegram?.WebApp) {
          try {
            const history = await apiService.getPaymentHistory();
            setPaymentHistory(history);
          } catch (err: any) {
            console.error('Ошибка при загрузке истории платежей:', err);
            setPaymentHistory(MOCK_PAYMENT_HISTORY);
            setHistoryError('Не удалось загрузить историю. Показаны примерные данные.');
          }
        } else {
          await new Promise(resolve => setTimeout(resolve, 300));
          setPaymentHistory(MOCK_PAYMENT_HISTORY);
        }
      } catch (err: any) {
        console.error('Ошибка при загрузке истории платежей:', err);
        setHistoryError('Не удалось загрузить историю платежей.');
        setPaymentHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadPaymentHistory();
  }, []);

  return (
    <div className="card-ref p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-medium text-fg-4 mb-1">История платежей</h3>
          <p className="text-sm text-fg-2">Все ваши транзакции и операции</p>
        </div>
      </div>

      {historyError && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2" role="alert">
          <AlertCircle size={16} className="text-yellow-600 mt-0.5 shrink-0" />
          <p className="text-xs text-yellow-800">{historyError}</p>
        </div>
      )}

      {historyLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-bg-2 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : paymentHistory.length === 0 ? (
        <div className="py-12 text-center">
          <Receipt size={48} className="mx-auto text-fg-1 mb-4" />
          <p className="text-sm text-fg-2 font-medium mb-1">История платежей пуста</p>
          <p className="text-xs text-fg-1">Здесь будут отображаться все ваши транзакции</p>
        </div>
      ) : (
        <div className="space-y-2">
          {paymentHistory.map((payment) => (
            <PaymentItem key={payment.id} payment={payment} />
          ))}
        </div>
      )}
    </div>
  );
};

const PaymentItem: React.FC<{ payment: PaymentHistoryItem }> = ({ payment }) => {
  const getStatusIcon = () => {
    switch (payment.status) {
      case 'success':
        return <CheckCircle2 size={16} className="text-green-600" />;
      case 'fail':
        return <XCircle size={16} className="text-red-600" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'cancelled':
        return <XCircle size={16} className="text-fg-2" />;
      default:
        return <Clock size={16} className="text-fg-2" />;
    }
  };

  const getStatusText = () => {
    switch (payment.status) {
      case 'success':
        return 'Успешно';
      case 'fail':
        return 'Ошибка';
      case 'pending':
        return 'Ожидание';
      case 'cancelled':
        return 'Отменено';
      default:
        return 'Неизвестно';
    }
  };

  const getStatusColor = () => {
    switch (payment.status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'fail':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'cancelled':
        return 'bg-bg-2 border-border text-fg-2';
      default:
        return 'bg-bg-2 border-border text-fg-2';
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Сегодня';
    } else if (diffDays === 1) {
      return 'Вчера';
    } else if (diffDays < 7) {
      return `${diffDays} дней назад`;
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'short', 
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
      });
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-bg-2 border border-border hover:bg-bg-3 transition-all group">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`p-2 rounded-lg ${getStatusColor()} shrink-0`}>
          {getStatusIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-fg-4">{payment.planName}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-fg-2">
            <span>{formatDate(payment.date)}</span>
            <span>•</span>
            <span>ID: {payment.orderId.slice(-8)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <div className="text-sm font-bold text-fg-4">{payment.amount} ₽</div>
          {payment.invoiceLink && (
            <a
              href={payment.invoiceLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-fg-2 hover:text-[#CE3000] transition-colors flex items-center gap-1 mt-0.5"
              aria-label="Открыть счет"
            >
              Счет <ExternalLink size={10} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

