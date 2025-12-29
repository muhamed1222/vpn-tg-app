import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { apiService } from '../services/apiService';

export const Result: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const status = searchParams.get('status');
  const orderId = searchParams.get('order_id');
  const [internalStatus, setInternalStatus] = useState<'pending' | 'success' | 'fail'>(status === 'success' ? 'success' : status === 'fail' ? 'fail' : 'pending');
  const [attempts, setAttempts] = useState(0);
  const [checking, setChecking] = useState(false);

  // Проверка статуса оплаты
  useEffect(() => {
    if (internalStatus === 'pending' && orderId) {
      const checkPaymentStatus = async () => {
        setChecking(true);
        try {
          const result = await apiService.checkPaymentStatus(orderId);
          
          if (result.status === 'completed') {
            setInternalStatus('success');
            await refreshSubscription();
          } else if (result.status === 'pending') {
            // Продолжаем проверку
            setAttempts(prev => prev + 1);
            
            // Если слишком много попыток - показываем ошибку
            if (attempts >= 20) {
              setInternalStatus('fail');
            }
          }
        } catch (error) {
          console.error('Ошибка при проверке статуса оплаты:', error);
          // При ошибке продолжаем проверку
          setAttempts(prev => prev + 1);
          if (attempts >= 20) {
            setInternalStatus('fail');
          }
        } finally {
          setChecking(false);
        }
      };

      // Первая проверка сразу
      checkPaymentStatus();

      // Затем проверяем каждые 3 секунды
      const timer = setInterval(() => {
        if (internalStatus === 'pending' && attempts < 20) {
          checkPaymentStatus();
        } else {
          clearInterval(timer);
        }
      }, 3000);

      return () => clearInterval(timer);
    } else if (internalStatus === 'pending' && !orderId) {
      // Если нет order_id, но статус pending - это ошибка
      setInternalStatus('fail');
    }
  }, [internalStatus, orderId, attempts, refreshSubscription]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center py-12 px-6">
      <div className="w-full max-w-[440px] animate-fade text-center">
        
        {internalStatus === 'success' && (
          <div className="card-premium p-10 space-y-8">
            <div className="w-16 h-16 bg-[var(--success-bg)] text-[var(--success-text)] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#0A0A0A] tracking-tight">Готово!</h1>
              <p className="text-[rgba(10,10,10,0.4)] font-medium mt-3 leading-relaxed">
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
            <div className="w-16 h-16 bg-[rgba(10,10,10,0.03)] text-[rgba(10,10,10,0.2)] rounded-full flex items-center justify-center mx-auto">
               <Loader2 size={32} className="animate-spin" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#0A0A0A] tracking-tight">Обработка...</h1>
              <p className="text-[rgba(10,10,10,0.4)] font-medium mt-3 leading-relaxed">
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
              <p className="text-[11px] text-[rgba(10,10,10,0.3)] italic">
                Если деньги списались, но статус не меняется — напишите в поддержку.
              </p>
            )}
          </div>
        )}

        {internalStatus === 'fail' && (
          <div className="card-premium p-10 space-y-8">
            <div className="w-16 h-16 bg-[rgba(206,48,0,0.08)] text-[#CE3000] rounded-full flex items-center justify-center mx-auto">
              <XCircle size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#0A0A0A] tracking-tight">Ошибка</h1>
              <p className="text-[rgba(10,10,10,0.4)] font-medium mt-3 leading-relaxed">
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