import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';

export const Result: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { refreshSubscription } = useAuth();
  const status = searchParams.get('status');
  const [internalStatus, setInternalStatus] = useState(status || 'pending');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (internalStatus === 'pending') {
      const timer = setInterval(() => {
        setAttempts(prev => {
          if (prev >= 10) { // Имитация завершения проверки
            clearInterval(timer);
            setInternalStatus('success');
            refreshSubscription();
            return prev;
          }
          return prev + 1;
        });
      }, 2000);
      return () => clearInterval(timer);
    }
  }, [internalStatus]);

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
                 onClick={() => window.location.reload()}
                 className="btn-secondary w-full py-3.5 text-[13px]"
                >
                 Проверить снова
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