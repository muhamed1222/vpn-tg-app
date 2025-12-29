import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { PLANS } from '../constants';

// Форматирование ГБ
const formatGB = (gb: number): string => {
  if (gb >= 1000) return `${(gb / 1000).toFixed(1)} ТБ`;
  if (gb >= 1) return `${gb.toFixed(1)} ГБ`;
  return `${(gb * 1024).toFixed(0)} МБ`;
};

// Получение названия тарифа
const getPlanName = (planId?: string): string => {
  if (!planId) return 'Бесплатный период';
  const plan = PLANS.find(p => p.id === planId);
  return plan ? plan.name : 'Базовый';
};

// Расчет даты окончания пробного периода (30 дней от текущей даты)
const getTrialEndDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const BillingPlanCard: React.FC = () => {
  const { subscription } = useAuth();
  
  // Моковые данные для трафика (в будущем загружать из API)
  const currentUsage = 2; // ГБ
  const totalLimit = Infinity; // Безлимит
  const isUnlimited = totalLimit === Infinity;
  const planName = getPlanName(subscription.planId);
  const isTrial = !subscription.planId || subscription.planId === 'plan_7';

  return (
    <div className="card-ref flex flex-col mb-6">
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-fg-4">Тариф</span>
            {isTrial && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#CE3000]/10 text-[#CE3000] font-medium">
                Пробный период
              </span>
            )}
          </div>
          {!isTrial && (
            <span className="text-[13px] text-fg-2 font-medium">{planName}</span>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-fg-4">Трафик</span>
            <span className="text-fg-2">
              {isUnlimited 
                ? `Использовано: ${formatGB(currentUsage)} / Безлимит`
                : `${formatGB(currentUsage)} / ${formatGB(totalLimit)}`
              }
            </span>
          </div>
          {isUnlimited && (
            <div className="w-full h-2 bg-bg-2 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#998DFF] to-[#CE3000] w-[20%] rounded-full" />
            </div>
          )}
        </div>
      </div>
      
      <div className="px-5 py-3 border-t border-border bg-[#FAFAFA] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-b-xl">
        <div className="flex-1">
          {isTrial ? (
            <span className="text-xs text-fg-2 font-medium">
              Пробный период заканчивается {getTrialEndDate()}
            </span>
          ) : subscription.activeUntil ? (
            <span className="text-xs text-fg-2 font-medium">
              Подписка активна до {subscription.activeUntil}
            </span>
          ) : (
            <span className="text-xs text-fg-2 font-medium">
              Подписка неактивна
            </span>
          )}
        </div>
        <Link 
          to="/pay" 
          className="btn-footer bg-fg-4 text-white hover:bg-fg-4/90 transition-all shadow-sm hover:shadow-md"
        >
          {isTrial ? 'Обновить' : 'Продлить'}
        </Link>
      </div>
    </div>
  );
};

