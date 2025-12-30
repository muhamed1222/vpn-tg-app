import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SubscriptionStatus } from '../types';
import { isTelegramWebApp } from '../utils/telegram';
import { PLANS } from '../constants';
import { RenewSubscriptionModal } from './RenewSubscriptionModal';
import { apiService, BillingStatsResponse } from '../services/apiService';

interface BillingSummary {
  currentUsage: number;
  totalLimit: number;
  planId?: string;
  planName?: string;
}

// Форматирование ГБ
const formatGB = (gb: number): string => {
  if (gb >= 1000) return `${(gb / 1000).toFixed(1)} ТБ`;
  if (gb >= 1) return `${gb.toFixed(1)} ГБ`;
  return `${(gb * 1024).toFixed(0)} МБ`;
};

const bytesToGB = (bytes: number): number => bytes / (1024 * 1024 * 1024);

const mapBillingSummary = (data: BillingStatsResponse): BillingSummary => ({
  currentUsage: bytesToGB(data.usedBytes),
  totalLimit: data.limitBytes ? bytesToGB(data.limitBytes) : Infinity,
  planId: data.planId || undefined,
  planName: data.planName || undefined,
});

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState<BillingSummary>({
    currentUsage: 2,
    totalLimit: Infinity,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadBilling = async () => {
      setLoading(true);

      try {
        if (isTelegramWebApp()) {
          const data = await apiService.getBillingStats();
          if (active) setStats(mapBillingSummary(data));
        }
      } catch (error) {
        console.error('Ошибка при загрузке биллинга:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadBilling();
    return () => {
      active = false;
    };
  }, [subscription]);

  const planId = stats.planId || subscription.planId;
  const planName = stats.planName || getPlanName(planId);
  const isUnlimited = stats.totalLimit === Infinity;
  const isActive = subscription.status === SubscriptionStatus.ACTIVE;
  const isTrial = isActive && (!planId || planId === 'plan_7');

  return (
    <div className="card-ref flex flex-col mb-6">
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-fg-4">Тариф</span>
            {isTrial && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] font-medium">
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
            <span className="text-fg-2 flex items-center gap-1.5">
              {isUnlimited 
                ? (
                  <>
                    <span>Использовано: {formatGB(stats.currentUsage)} /</span>
                    <span className="text-[var(--primary)] font-bold text-base">∞</span>
                  </>
                )
                : `${formatGB(stats.currentUsage)} / ${formatGB(stats.totalLimit)}`
              }
            </span>
          </div>
          {!isUnlimited && (
            <>
              <div className="w-full h-2 bg-bg-2 rounded-full overflow-hidden">
                {loading ? (
                  <div className="h-full bg-bg-3 w-1/3 animate-pulse" />
                ) : (
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      (stats.currentUsage / stats.totalLimit) * 100 >= 90 ? 'bg-[var(--danger-text)]' :
                      (stats.currentUsage / stats.totalLimit) * 100 >= 70 ? 'bg-[var(--warning-text)]' :
                      'bg-fg-4'
                    }`}
                    style={{ width: `${Math.min((stats.currentUsage / stats.totalLimit) * 100, 100)}%` }}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="px-3 py-3 bg-bg-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-b-xl">
        <div className="flex-1">
          {isTrial ? (
            <span className="text-xs text-fg-2 font-medium">
              Пробный период заканчивается {getTrialEndDate()}
            </span>
          ) : isActive ? (
            <span className="text-xs text-fg-2 font-medium">
              Подписка активна{subscription.activeUntil ? ` до ${subscription.activeUntil}` : ''}
            </span>
          ) : (
            <span className="text-xs text-fg-2 font-medium">
              Подписка неактивна
            </span>
          )}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--primary-hover)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
        >
          {isTrial ? 'Обновить' : 'Продлить'}
        </button>
      </div>
      
      <RenewSubscriptionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};
