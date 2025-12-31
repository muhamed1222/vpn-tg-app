import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle, ArrowRight, Copy } from 'lucide-react';

// API для нового outlivion-api
const API_BASE_URL = 'https://api.outlivion.space';

interface OrderStatus {
  orderId: string;
  status: 'pending' | 'paid' | 'canceled';
  key?: string;
}

export const PayReturn: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Получаем orderId из query параметра или localStorage (см. шаг 3)
  const orderIdFromQuery = searchParams.get('orderId');
  const orderIdFromStorage = localStorage.getItem('lastOrderId'); // Используем "lastOrderId" как в требованиях
  const orderId = orderIdFromQuery || orderIdFromStorage;
  
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [copied, setCopied] = useState(false);

  // Проверка статуса заказа
  const checkOrderStatus = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/orders/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Заказ не найден');
        }
        throw new Error('Ошибка при проверке статуса');
      }
      const data = await response.json();
      return data as OrderStatus;
    } catch (err) {
      throw err;
    }
  };

  // Polling статуса заказа каждые 2-3 секунды
  useEffect(() => {
    if (!orderId) {
      setError('ID заказа не найден');
      setLoading(false);
      return;
    }

    let cancelled = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;
    let attemptCount = 0;
    const maxAttempts = 30; // Максимум 90 секунд (30 * 3 сек)
    const pollInterval = 2500; // 2.5 секунды между запросами

    const poll = async () => {
      if (cancelled) return;

      try {
        const orderData = await checkOrderStatus(orderId);
        setOrder(orderData);
        setAttempts(attemptCount);

        if (orderData.status === 'paid') {
          setLoading(false);
          // Очищаем localStorage
          localStorage.removeItem('lastOrderId');
          return;
        }

        if (orderData.status === 'canceled') {
          setError('Платеж был отменен');
          setLoading(false);
          return;
        }

        // Если все еще pending, продолжаем polling
        attemptCount++;
        
        // Если прошло 60-90 секунд и не paid - показываем сообщение об ожидании
        if (attemptCount >= maxAttempts) {
          setLoading(false);
          // Не устанавливаем error, а показываем сообщение об ожидании
          return;
        }

        // Следующая проверка через 2.5 секунды
        timerId = setTimeout(poll, pollInterval);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Ошибка при проверке статуса';
        setError(message);
        setLoading(false);
      }
    };

    // Первая проверка сразу
    poll();

    return () => {
      cancelled = true;
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [orderId]);

  const handleCopyKey = async () => {
    if (!order?.key) return;
    try {
      await navigator.clipboard.writeText(order.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Ошибка при копировании:', err);
    }
  };

  const handleCheckAgain = async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const orderData = await checkOrderStatus(orderId);
      setOrder(orderData);
      if (orderData.status === 'paid') {
        localStorage.removeItem('lastOrderId');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка при проверке';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Успешная оплата
  if (order?.status === 'paid') {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center py-12 px-6">
        <div className="w-full max-w-[440px] animate-fade text-center">
          <div className="card-premium p-10 space-y-8">
            <div className="w-16 h-16 bg-[var(--success-bg)] text-[var(--success-text)] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-fg-4 tracking-tight">Оплата подтверждена!</h1>
              <p className="text-fg-2 font-medium mt-3 leading-relaxed">
                Ваш VPN ключ готов к использованию.
              </p>
            </div>
            {order.key && (
              <div className="space-y-4">
                <div className="bg-bg-2 rounded-lg p-4 text-left">
                  <label className="text-xs text-fg-1 mb-2 block">Ваш VPN ключ:</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono text-fg-4 break-all">
                      {order.key}
                    </code>
                    <button
                      onClick={handleCopyKey}
                      className="btn-secondary p-2 flex-shrink-0"
                      title="Копировать"
                    >
                      {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-fg-1">
                  Сохраните этот ключ в безопасном месте. Он понадобится для настройки VPN.
                </p>
              </div>
            )}
            <div className="pt-2">
              <Link
                to="/account"
                className="btn-primary w-full py-4 flex items-center justify-center gap-2"
              >
                В кабинет <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Обработка платежа (pending или timeout)
  if (loading || order?.status === 'pending' || (!order && !error)) {
    // Если прошло 60-90 секунд (30 попыток * 2.5 сек = 75 сек)
    const isTimeout = attempts >= 30 && !loading;
    
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center py-12 px-6">
        <div className="w-full max-w-[440px] animate-fade text-center">
          <div className="card-premium p-10 space-y-8">
            <div className="w-16 h-16 bg-bg-2 text-fg-1 rounded-full flex items-center justify-center mx-auto">
              <Loader2 size={32} className="animate-spin" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-fg-4 tracking-tight">
                {isTimeout ? 'Оплата обрабатывается' : 'Проверяем оплату...'}
              </h1>
              <p className="text-fg-2 font-medium mt-3 leading-relaxed">
                {isTimeout 
                  ? 'Оплата ещё обрабатывается. Обновите страницу или попробуйте позже.'
                  : 'Ожидаем подтверждение от платёжной системы. Это не займёт много времени.'
                }
              </p>
              {attempts > 0 && !isTimeout && (
                <p className="text-xs text-fg-1 mt-2">
                  Проверка #{attempts}...
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleCheckAgain}
                disabled={loading}
                className="btn-secondary w-full py-3.5 text-[13px] disabled:opacity-50"
              >
                {loading ? 'Проверка...' : 'Проверить снова'}
              </button>
              {isTimeout && (
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary w-full py-3.5 text-[13px]"
                >
                  Обновить страницу
                </button>
              )}
              <Link to="/account" className="btn-ghost text-[13px] py-2">
                В кабинет
              </Link>
            </div>
            {attempts > 10 && !isTimeout && (
              <p className="text-[11px] text-fg-1 italic">
                Если деньги списались, но статус не меняется — напишите в поддержку.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Ошибка
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center py-12 px-6">
      <div className="w-full max-w-[440px] animate-fade text-center">
        <div className="card-premium p-10 space-y-8">
          <div className="w-16 h-16 bg-[var(--danger-bg)] text-[var(--danger-text)] rounded-full flex items-center justify-center mx-auto">
            <XCircle size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-fg-4 tracking-tight">Ошибка</h1>
            <p className="text-fg-2 font-medium mt-3 leading-relaxed">
              {error || 'К сожалению, не удалось обработать платеж. Пожалуйста, попробуйте снова.'}
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleCheckAgain}
              className="btn-primary w-full py-4"
            >
              Проверить снова
            </button>
            <Link
              to="/pay"
              className="btn-secondary w-full py-3.5 text-[13px]"
            >
              Вернуться к оплате
            </Link>
            <Link
              to="/account"
              className="btn-ghost text-[13px] py-2"
            >
              В кабинет
            </Link>
          </div>
        </div>
      </div>
    );
  };
};

