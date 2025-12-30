import React, { useMemo, useState, useEffect } from 'react';
import { PLANS } from '../constants';
import { Check } from 'lucide-react';
import { apiService } from '../services/apiService';
import { logger } from '../utils/logger';
import { PaymentProvider, usePayment } from '../hooks/usePayment';
import { isTelegramWebApp } from '../utils/telegram';

export const Pay: React.FC = () => {
  const [selectedPlanId, setSelectedPlanId] = useState(PLANS[1].id); // По умолчанию 1 месяц
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const { loading, error, handlePay } = usePayment({ allowBrowserFallback: true });
  const isInTelegram = isTelegramWebApp();
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>(
    isInTelegram ? 'telegram' : 'yookassa',
  );

  // Загрузка тарифов из API при монтировании
  useEffect(() => {
    const loadTariffs = async () => {
      try {
        const tariffs = await apiService.getTariffs();
        // Можно синхронизировать тарифы с API если нужно
        logger.debug('Загружены тарифы:', tariffs);
      } catch (error) {
        console.error('Ошибка при загрузке тарифов:', error);
        // В режиме разработки продолжаем работу с локальными планами
      }
    };

    // Загружаем только если в Telegram WebApp
    if (isTelegramWebApp()) {
      loadTariffs();
    }
  }, []);

  const currentPlan = useMemo(
    () => PLANS.find(p => p.id === selectedPlanId),
    [selectedPlanId],
  );

  const filteredPlans = useMemo(() => {
    if (billingCycle === 'monthly') {
      return PLANS.filter(p => p.durationMonths <= 3);
    }
    return PLANS.filter(p => p.durationMonths >= 6);
  }, [billingCycle]);
  
  // Filtering plans based on toggle if needed, or just showing all
  return (
    <div className="max-w-[440px] mx-auto space-y-8 animate-fade">
      <div className="text-center">
        <span className="text-[11px] font-black text-[var(--primary)] uppercase tracking-[0.2em] bg-[var(--primary-soft)] px-3 py-1.5 rounded-full mb-4 inline-block">
          Обновление
        </span>
        <h1 className="text-4xl font-black tracking-tighter text-fg-4 mt-2">Обновите ваш тариф</h1>
      </div>

      <div className="card-ref">
        <div className="p-8">
          {/* Toggle Monthly/Annually (Ref Image 3 style) */}
          <div className="flex bg-bg-2 p-1 rounded-xl mb-10">
             <button 
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${billingCycle === 'monthly' ? 'bg-[var(--background)] text-fg-4' : 'text-fg-2 hover:text-fg-4'}`}
             >
               Ежемесячно
             </button>
             <button 
              onClick={() => setBillingCycle('annually')}
              className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${billingCycle === 'annually' ? 'bg-[var(--background)] text-fg-4' : 'text-fg-2 hover:text-fg-4'}`}
             >
               Ежегодно
             </button>
          </div>

          <div className="text-center mb-10">
             <p className="text-[11px] text-fg-2 font-black uppercase tracking-widest mb-1">В месяц</p>
             <h2 className="text-6xl font-black tracking-tighter text-fg-4">
               {currentPlan ? Math.round(currentPlan.price / currentPlan.durationMonths) : 0} ₽
             </h2>
             <p className="text-[14px] text-fg-2 mt-3 font-medium">Списание {currentPlan?.price} ₽ каждые {currentPlan?.durationMonths} мес.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-[var(--danger-bg)] border border-[var(--danger-border)] rounded-lg">
              <p className="text-xs text-[var(--danger-text)]">{error}</p>
            </div>
          )}

          <div className="space-y-3">
             {filteredPlans.map((plan) => (
               <div 
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 group ${
                  selectedPlanId === plan.id 
                    ? 'border-[var(--primary)] bg-[var(--primary-soft)]' 
                    : 'border-border hover:border-[var(--primary)] hover:bg-bg-2'
                }`}
               >
                 <div className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedPlanId === plan.id ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-border group-hover:border-[var(--primary)]'
                    }`}>
                    {selectedPlanId === plan.id && <div className="w-2 h-2 bg-[var(--on-primary)] rounded-full" />}
                  </div>
                    <div>
                      <div className="text-[14px] font-bold text-fg-4">{plan.name}</div>
                      <div className="text-[12px] text-fg-2 font-medium">{plan.description}</div>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-[14px] font-black text-fg-4">{plan.price} ₽</div>
                    {plan.savings && (
                      <div className="text-[10px] font-black text-[var(--primary)] uppercase tracking-wider">Экономия {plan.savings}</div>
                    )}
                 </div>
               </div>
             ))}
          </div>
        </div>

        <div className="card-footer bg-bg-2 flex flex-col gap-6 p-8">
           <div className="space-y-3">
             <p className="text-[12px] text-fg-2 font-medium">Способ оплаты</p>
             {isInTelegram ? (
               <div className="px-4 py-3 rounded-xl border border-border bg-[var(--background)]">
                 <div className="text-[13px] font-bold text-fg-4">Telegram Stars</div>
                 <div className="text-[11px] text-fg-2">Оплата внутри Telegram</div>
               </div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {[
                   { id: 'yookassa', label: 'ЮKassa', hint: 'Карты и СБП' },
                   { id: 'heleket', label: 'Heleket', hint: 'Крипто и карты' },
                 ].map((provider) => (
                   <button
                     key={provider.id}
                     type="button"
                     onClick={() => setPaymentProvider(provider.id as PaymentProvider)}
                     className={`p-4 rounded-xl border text-left transition-all ${
                       paymentProvider === provider.id
                         ? 'border-[var(--primary)] bg-[var(--primary-soft)]'
                         : 'border-border bg-[var(--background)] hover:border-[var(--primary)]'
                     }`}
                   >
                     <div className="text-[13px] font-bold text-fg-4">{provider.label}</div>
                     <div className="text-[11px] text-fg-2 mt-1">{provider.hint}</div>
                   </button>
                 ))}
               </div>
             )}
           </div>
           <div className="space-y-3">
              <FeatureItem text="Безлимитный высокоскоростной трафик" />
              <FeatureItem text="До 5 одновременных устройств" />
              <FeatureItem text="Без логов, абсолютная приватность" />
           </div>
           
           <button
            onClick={() => handlePay(selectedPlanId, paymentProvider)}
            disabled={loading}
            className="w-full bg-[var(--primary)] text-white py-4 rounded-xl font-black text-[15px] hover:bg-[var(--primary-hover)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
           >
             {loading ? (
               <>
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 Создание заказа...
               </>
             ) : 'Оплатить сейчас'}
           </button>
           
           <p className="text-[11px] text-fg-2 font-medium text-center leading-relaxed">
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
    <div className="w-4 h-4 rounded-full bg-[var(--primary-soft)] flex items-center justify-center">
      <Check size={10} className="text-[var(--primary)]" strokeWidth={4} />
    </div>
    <span className="text-[13px] font-bold text-fg-3">{text}</span>
  </div>
);
