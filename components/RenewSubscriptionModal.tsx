import React, { useState, useEffect } from 'react';
import { PLANS } from '../constants';
import { Check, X } from 'lucide-react';
import { apiService } from '../services/apiService';
import { isTelegramWebApp } from '../utils/telegram';
import { usePayment } from '../hooks/usePayment';

interface RenewSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RenewSubscriptionModal: React.FC<RenewSubscriptionModalProps> = ({ isOpen, onClose }) => {
  const [selectedPlanId, setSelectedPlanId] = useState(PLANS[1].id);
  const { loading, error, setError, handlePay } = usePayment({ onPaid: onClose });

  // Загрузка тарифов из API при монтировании
  useEffect(() => {
    const loadTariffs = async () => {
      try {
        await apiService.getTariffs();
      } catch (error) {
        console.error('Ошибка при загрузке тарифов:', error);
      }
    };

    if (isOpen && isTelegramWebApp()) {
      loadTariffs();
    }
  }, [isOpen]);

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
    if (!isTelegramWebApp()) {
      setError('Оплата доступна только через Telegram WebApp.');
      return;
    }

    handlePay(selectedPlanId).catch(() => {
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
        className="bg-white rounded-2xl shadow-2xl max-w-[500px] w-full max-h-[90vh] overflow-y-auto animate-scale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
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
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* Plans */}
          <div className="space-y-3">
            {PLANS.map((plan) => (
              <div 
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                  selectedPlanId === plan.id 
                    ? 'border-[#CE3000] bg-[#CE3000]/[0.02]' 
                    : 'border-border hover:border-[#CE3000]/50 hover:bg-bg-2'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedPlanId === plan.id ? 'border-[#CE3000] bg-[#CE3000]' : 'border-border'
                  }`}>
                    {selectedPlanId === plan.id && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-fg-4">{plan.name}</div>
                    <div className="text-xs text-fg-2 font-medium">{plan.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-fg-4">{plan.price} ₽</div>
                  {plan.savings && (
                    <div className="text-[10px] font-black text-[#CE3000] uppercase tracking-wider">Экономия {plan.savings}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="space-y-2 pt-2">
            <FeatureItem text="Безлимитный высокоскоростной трафик" />
            <FeatureItem text="До 5 одновременных устройств" />
            <FeatureItem text="Без логов, абсолютная приватность" />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#FAFAFA] border-t border-border p-6 rounded-b-2xl space-y-4">
          <button
            onClick={onPay}
            disabled={loading}
            className="w-full bg-[#CE3000] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#B82A00] active:scale-[0.98] transition-all shadow-lg shadow-[#CE3000]/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
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
    <div className="w-4 h-4 rounded-full bg-[#CE3000]/10 flex items-center justify-center shrink-0">
      <Check size={10} className="text-[#CE3000]" strokeWidth={4} />
    </div>
    <span className="text-xs font-bold text-fg-2">{text}</span>
  </div>
);
