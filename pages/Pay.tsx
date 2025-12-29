import React, { useState, useEffect } from 'react';
import { PLANS } from '../constants';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { apiService } from '../services/apiService';

export const Pay: React.FC = () => {
  const [selectedPlanId, setSelectedPlanId] = useState(PLANS[1].id); // По умолчанию 1 месяц
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const navigate = useNavigate();

  // Загрузка тарифов из API при монтировании
  useEffect(() => {
    const loadTariffs = async () => {
      try {
        const tariffs = await apiService.getTariffs();
        // Можно синхронизировать тарифы с API если нужно
        console.log('Загружены тарифы:', tariffs);
      } catch (error) {
        console.error('Ошибка при загрузке тарифов:', error);
        // В режиме разработки продолжаем работу с локальными планами
      }
    };

    // Загружаем только если в Telegram WebApp
    if ((window as any).Telegram?.WebApp) {
      loadTariffs();
    }
  }, []);

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      // Создаем заказ через API бота
      const payment = await apiService.createPayment(selectedPlanId);
      
      // Открываем ссылку на оплату
      if (payment.invoice_link) {
        // В Telegram WebApp открываем через Telegram
        if ((window as any).Telegram?.WebApp) {
          (window as any).Telegram.WebApp.openInvoice(payment.invoice_link, (status: string) => {
            if (status === 'paid') {
              // После успешной оплаты переходим на страницу результата
              navigate(`/result?order_id=${payment.order_id}&status=pending`);
            } else {
              setError('Оплата отменена');
              setLoading(false);
            }
          });
        } else {
          // В браузере открываем в новой вкладке
          window.open(payment.invoice_link, '_blank');
          navigate(`/result?order_id=${payment.order_id}&status=pending`);
        }
      } else {
        throw new Error('Не получена ссылка на оплату');
      }
    } catch (error: any) {
      console.error('Ошибка при создании заказа:', error);
      setError(error.message || 'Не удалось создать заказ. Попробуйте позже.');
      setLoading(false);
    }
  };

  const currentPlan = PLANS.find(p => p.id === selectedPlanId);
  
  // Filtering plans based on toggle if needed, or just showing all
  const displayPlans = billingCycle === 'annually' 
    ? PLANS.filter(p => p.durationMonths >= 6) 
    : PLANS.filter(p => p.durationMonths < 6);

  return (
    <div className="max-w-[440px] mx-auto space-y-8 animate-fade">
      <div className="text-center">
        <span className="text-[11px] font-black text-[#CE3000] uppercase tracking-[0.2em] bg-[#CE3000]/10 px-3 py-1.5 rounded-full mb-4 inline-block">
          Обновление
        </span>
        <h1 className="text-4xl font-black tracking-tighter text-[#0A0A0A] mt-2">Обновите ваш тариф</h1>
      </div>

      <div className="card-ref shadow-xl shadow-black/[0.03]">
        <div className="p-8">
          {/* Toggle Monthly/Annually (Ref Image 3 style) */}
          <div className="flex bg-[#F5F5F5] p-1 rounded-xl mb-10">
             <button 
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${billingCycle === 'monthly' ? 'bg-white shadow-sm text-[#0A0A0A]' : 'text-[rgba(0,0,0,0.3)] hover:text-[rgba(0,0,0,0.5)]'}`}
             >
               Ежемесячно
             </button>
             <button 
              onClick={() => setBillingCycle('annually')}
              className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${billingCycle === 'annually' ? 'bg-white shadow-sm text-[#0A0A0A]' : 'text-[rgba(0,0,0,0.3)] hover:text-[rgba(0,0,0,0.5)]'}`}
             >
               Ежегодно
             </button>
          </div>

          <div className="text-center mb-10">
             <p className="text-[11px] text-[rgba(0,0,0,0.3)] font-black uppercase tracking-widest mb-1">В месяц</p>
             <h2 className="text-6xl font-black tracking-tighter text-[#0A0A0A]">
               {currentPlan ? Math.round(currentPlan.price / currentPlan.durationMonths) : 0} ₽
             </h2>
             <p className="text-[14px] text-[rgba(0,0,0,0.4)] mt-3 font-medium">Списание {currentPlan?.price} ₽ каждые {currentPlan?.durationMonths} мес.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-3">
             {PLANS.filter(p => {
               // Фильтруем планы по циклу оплаты
               if (billingCycle === 'monthly') {
                 return p.durationMonths <= 3; // До 3 месяцев включительно
               } else {
                 return p.durationMonths >= 6; // От 6 месяцев
               }
             }).map((plan) => (
               <div 
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 group ${
                  selectedPlanId === plan.id 
                    ? 'border-[#CE3000] bg-[#CE3000]/[0.02]' 
                    : 'border-[rgba(0,0,0,0.06)] hover:border-[rgba(0,0,0,0.15)] hover:bg-[#FAFAFA]'
                }`}
               >
                 <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedPlanId === plan.id ? 'border-[#CE3000] bg-[#CE3000]' : 'border-[rgba(0,0,0,0.15)] group-hover:border-[rgba(0,0,0,0.3)]'
                    }`}>
                       {selectedPlanId === plan.id && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-[#0A0A0A]">{plan.name}</div>
                      <div className="text-[12px] text-[rgba(0,0,0,0.4)] font-medium">{plan.description}</div>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-[14px] font-black text-[#0A0A0A]">{plan.price} ₽</div>
                    {plan.savings && (
                      <div className="text-[10px] font-black text-[#CE3000] uppercase tracking-wider">Экономия {plan.savings}</div>
                    )}
                 </div>
               </div>
             ))}
          </div>
        </div>

        <div className="card-footer bg-[#FAFAFA] flex flex-col gap-6 p-8">
           <div className="space-y-3">
              <FeatureItem text="Безлимитный высокоскоростной трафик" />
              <FeatureItem text="До 5 одновременных устройств" />
              <FeatureItem text="Без логов, абсолютная приватность" />
           </div>
           
           <button
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-[#CE3000] text-white py-4 rounded-xl font-black text-[15px] hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-[#CE3000]/20 flex items-center justify-center gap-3 disabled:opacity-50"
           >
             {loading ? (
               <>
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 Создание заказа...
               </>
             ) : 'Оплатить сейчас'}
           </button>
           
           <p className="text-[11px] text-[rgba(0,0,0,0.3)] font-medium text-center leading-relaxed">
             Нажимая "Обновить сейчас", вы соглашаетесь с нашими Условиями использования. <br />
             Платежи защищены и зашифрованы.
           </p>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2.5">
    <div className="w-4 h-4 rounded-full bg-[#CE3000]/10 flex items-center justify-center">
      <Check size={10} className="text-[#CE3000]" strokeWidth={4} />
    </div>
    <span className="text-[13px] font-bold text-[rgba(0,0,0,0.6)]">{text}</span>
  </div>
);