import React, { useState, useEffect } from 'react';
import { PLANS } from '../constants';
import { Check, X } from 'lucide-react';
import { apiService } from '../services/apiService';
import { isTelegramWebApp } from '../utils/telegram';
import { PaymentProvider, usePayment } from '../hooks/usePayment';

interface RenewSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RenewSubscriptionModal: React.FC<RenewSubscriptionModalProps> = ({ isOpen, onClose }) => {
  const [selectedPlanId, setSelectedPlanId] = useState(PLANS[1].id);
  const { loading, error, handlePay } = usePayment({ onPaid: onClose, allowBrowserFallback: true });
  const isInTelegram = isTelegramWebApp();
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>(
    isInTelegram ? 'telegram' : 'yookassa',
  );
  const [hasPurchased, setHasPurchased] = useState<boolean | null>(null);

  // Загрузка тарифов и истории платежей из API при монтировании
  useEffect(() => {
    const loadData = async () => {
      try {
        const history = await apiService.getPaymentHistory();
        
        // Проверяем, были ли успешные платежи
        const hasSuccess = history.some(p => p.status === 'success');
        setHasPurchased(hasSuccess);
      } catch (error) {
        console.error('Ошибка при загрузке данных модального окна:', error);
        // В случае ошибки по умолчанию считаем, что покупка могла быть, чтобы не показывать тест зря
        setHasPurchased(true);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Фильтруем планы: убираем тестовый, если уже была покупка
  const visiblePlans = PLANS.filter(plan => {
    if (plan.id === 'plan_7' && hasPurchased === true) {
      return false;
    }
    return true;
  });

  // Если выбранный план исчез из списка (например, после загрузки истории), выбираем первый доступный
  useEffect(() => {
    if (hasPurchased !== null && !visiblePlans.find(p => p.id === selectedPlanId)) {
      setSelectedPlanId(visiblePlans[0]?.id || PLANS[1].id);
    }
  }, [hasPurchased, visiblePlans, selectedPlanId]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Блокировка скролла при открытом модальном окне
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const onPay = () => {
    handlePay(selectedPlanId, paymentProvider).catch(() => {
      // Ошибка уже записана в hook
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--background)] rounded-2xl max-w-[500px] w-full max-h-[90vh] overflow-y-auto animate-scale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[var(--background)] border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl" style={{ borderBottomColor: 'var(--border)' }}>
          <h2 className="text-xl font-bold text-fg-4">Продление подписки</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-2 rounded-lg transition-colors"
            aria-label="Закрыть"
          >
            <X size={20} className="text-fg-3" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-[var(--danger-bg)] border border-[var(--danger-border)] rounded-lg">
              <p className="text-xs text-[var(--danger-text)]">{error}</p>
            </div>
          )}

          {/* Plans */}
          <div className="space-y-3">
            {visiblePlans.map((plan) => (
              <div 
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                  selectedPlanId === plan.id 
                    ? 'border-[var(--primary)] bg-[var(--primary-soft)]' 
                    : 'border-border hover:border-[var(--primary)] hover:bg-bg-2'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedPlanId === plan.id ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-border'
                  }`}>
                    {selectedPlanId === plan.id && <div className="w-2 h-2 bg-[var(--on-primary)] rounded-full" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-fg-4">{plan.name}</div>
                    <div className="text-xs text-fg-2 font-medium">{plan.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-fg-4">{plan.price} ₽</div>
                  {plan.savings && (
                    <div className="text-[10px] font-black text-[var(--primary)] uppercase tracking-wider">Экономия {plan.savings}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <p className="text-[12px] text-fg-2 font-medium">Способ оплаты</p>
            {isInTelegram ? (
              <div className="px-4 py-3 rounded-xl border border-border bg-bg-2">
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
                        : 'border-border bg-bg-2 hover:border-[var(--primary)]'
                    }`}
                  >
                    <div className="text-[13px] font-bold text-fg-4">{provider.label}</div>
                    <div className="text-[11px] text-fg-2 mt-1">{provider.hint}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Features */}
          <div className="space-y-2 pt-2">
            <FeatureItem text="Безлимитный высокоскоростной трафик" />
            <FeatureItem text="До 5 одновременных устройств" />
            <FeatureItem text="Без логов, абсолютная приватность" />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-bg-2 border-t border-border p-6 rounded-b-2xl space-y-4">
          <button
            onClick={onPay}
            disabled={loading}
            className="w-full bg-[var(--primary)] text-white py-3 rounded-xl font-bold text-sm hover:bg-[var(--primary-hover)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Создание заказа...
              </>
            ) : 'Оплатить сейчас'}
          </button>
          
          <p className="text-[11px] text-fg-1 font-medium text-center leading-relaxed">
            Нажимая "Оплатить сейчас", вы соглашаетесь с нашими Условиями использования. <br />
            Платежи защищены и зашифрованы.
          </p>
        </div>
      </div>
    </div>
  );
};

const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2.5">
    <div className="w-4 h-4 rounded-full bg-[var(--primary-soft)] flex items-center justify-center shrink-0">
      <Check size={10} className="text-[var(--primary)]" strokeWidth={4} />
    </div>
    <span className="text-xs font-bold text-fg-2">{text}</span>
  </div>
);
