import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { apiService } from '../services/apiService';

export const Result: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { refreshSubscription } = useAuth();
  const status = searchParams.get('status');
  const orderId = searchParams.get('order_id');
  const [internalStatus, setInternalStatus] = useState<'pending' | 'success' | 'fail'>(status === 'success' ? 'success' : status === 'fail' ? 'fail' : 'pending');
  const [attempts, setAttempts] = useState(0);
  const [checking, setChecking] = useState(false);
  const attemptsRef = useRef(0);

  // Проверка статуса оплаты
  useEffect(() => {
    if (internalStatus === 'pending' && !orderId) {
      // Если нет order_id, но статус pending - это ошибка
      setInternalStatus('fail');
      return;
    }

    if (internalStatus !== 'pending' || !orderId) {
      return;
    }

    let cancelled = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;
    attemptsRef.current = 0;
    setAttempts(0);

    const scheduleNext = (delayMs: number) => {
      timerId = setTimeout(runCheck, delayMs);
    };

    const runCheck = async () => {
      if (cancelled) return;

      setChecking(true);
      try {
        const result = await apiService.checkPaymentStatus(orderId);
        if (cancelled) return;

        if (result.status === 'completed') {
          setInternalStatus('success');
          await refreshSubscription();
          return;
        }
      } catch (error) {
        console.error('Ошибка при проверке статуса оплаты:', error);
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }

      attemptsRef.current += 1;
      setAttempts(attemptsRef.current);

      if (attemptsRef.current >= 20) {
        setInternalStatus('fail');
        return;
      }

      const delayMs = Math.min(3000 * Math.pow(2, attemptsRef.current - 1), 15000);
      scheduleNext(delayMs);
    };

    runCheck();

    return () => {
      cancelled = true;
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [internalStatus, orderId, refreshSubscription]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center py-12 px-6">
      <div className="w-full max-w-[440px] animate-fade text-center">
        
        {internalStatus === 'success' && (
          <div className="card-premium p-10 space-y-8">
            <div className="w-16 h-16 bg-[var(--success-bg)] text-[var(--success-text)] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-fg-4 tracking-tight">Готово!</h1>
              <p className="text-fg-2 font-medium mt-3 leading-relaxed">
                Платёж подтверждён. Ваша подписка была успешно обновлена.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/account"
                className="btn-primary w-full py-4 flex items-center justify-center gap-2"
              >
                В кабинет <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        )}

        {internalStatus === 'pending' && (
          <div className="card-premium p-10 space-y-8">
            <div className="w-16 h-16 bg-bg-2 text-fg-1 rounded-full flex items-center justify-center mx-auto">
               <Loader2 size={32} className="animate-spin" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-fg-4 tracking-tight">Обработка...</h1>
              <p className="text-fg-2 font-medium mt-3 leading-relaxed">
                Ожидаем подтверждение от платёжной системы. Это не займёт много времени.
              </p>
            </div>
            <div className="flex flex-col gap-3">
               <button 
                 onClick={async () => {
                   if (orderId) {
                     setChecking(true);
                     try {
                       const result = await apiService.checkPaymentStatus(orderId);
                       if (result.status === 'completed') {
                         setInternalStatus('success');
                         await refreshSubscription();
                       }
                     } catch (error) {
                       console.error('Ошибка при проверке:', error);
                     } finally {
                       setChecking(false);
                     }
                   }
                 }}
                 disabled={checking || !orderId}
                 className="btn-secondary w-full py-3.5 text-[13px] disabled:opacity-50"
                >
                 {checking ? 'Проверка...' : 'Проверить снова'}
               </button>
               <Link to="/account" className="btn-ghost text-[13px] py-2">
                 В кабинет
               </Link>
            </div>
            {attempts > 5 && (
              <p className="text-[11px] text-fg-1 italic">
                Если деньги списались, но статус не меняется — напишите в поддержку.
              </p>
            )}
          </div>
        )}

        {internalStatus === 'fail' && (
          <div className="card-premium p-10 space-y-8">
            <div className="w-16 h-16 bg-[var(--danger-bg)] text-[var(--danger-text)] rounded-full flex items-center justify-center mx-auto">
              <XCircle size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-fg-4 tracking-tight">Ошибка</h1>
              <p className="text-fg-2 font-medium mt-3 leading-relaxed">
                К сожалению, платёж не прошёл. Пожалуйста, попробуйте снова.
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Link
                to="/pay"
                className="btn-primary w-full py-4"
              >
                Попробовать снова
              </Link>
              <Link
                to="/account"
                className="btn-secondary w-full py-3.5 text-[13px]"
              >
                В кабинет
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
