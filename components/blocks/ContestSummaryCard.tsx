'use client';

import React, { useMemo } from 'react';
import { ContestSummary } from '@/types/contest';
import { GiftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface ContestProgress {
  daysRemaining: number;
  daysTotal: number;
  percent: number;
}

interface ContestSummaryCardProps {
  summary: ContestSummary;
  progress?: ContestProgress;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

/**
 * Компонент для отображения сводки по конкурсу
 * Показывает количество билетов и статистику
 */
export const ContestSummaryCard: React.FC<ContestSummaryCardProps> = ({ 
  summary, 
  progress,
  onRefresh,
  isRefreshing = false 
}) => {
  const formatDate = useMemo(() => {
    return (dateString: string) => {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleDateString('ru-RU', { month: 'long' });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    };
  }, []);

  const endDate = formatDate(summary.contest.ends_at);

  return (
    <div className="bg-gradient-to-r from-[#F55128] to-[#FF6B3D] rounded-[16px] p-6 mb-6 border border-white/10 backdrop-blur-[12px] relative z-10 shadow-2xl">
      {/* Заголовок */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-3 bg-white/20 rounded-xl">
            <GiftIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white leading-tight">{summary.contest.title}</h1>
            <p className="text-white/80 text-sm mt-1">До {endDate}</p>
          </div>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 bg-white/20 hover:bg-white/30 active:scale-95 transition-all rounded-lg disabled:opacity-50"
            aria-label="Обновить данные"
          >
            <ArrowPathIcon className={`w-5 h-5 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Прогресс-бар времени конкурса */}
      {progress && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-xs font-medium">
              {progress.daysRemaining > 0 ? `Осталось ${progress.daysRemaining} дней` : 'Конкурс завершен'}
            </span>
            <span className="text-white/60 text-xs">
              {Math.round(progress.percent)}% прошло
            </span>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white/40 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress.percent))}%` }}
            />
          </div>
        </div>
      )}

      {/* Билеты - главный акцент */}
      <div className="bg-white/15 rounded-[12px] p-5 mb-4 border-2 border-white/30 shadow-lg">
        <div className="text-center">
          <div className="text-5xl font-bold text-white mb-2 drop-shadow-lg">
            {summary.tickets_total}
          </div>
          <div className="text-white/90 text-base font-semibold mb-2">Билетов</div>
          <p className="text-white/70 text-xs leading-relaxed max-w-[240px] mx-auto">
            Чем больше билетов — тем выше шанс выиграть
          </p>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/10 rounded-[10px] p-3 text-center border border-white/20">
          <div className="text-2xl font-bold text-white mb-1">
            {summary.invited_total}
          </div>
          <div className="text-white/70 text-xs font-medium">Приглашено</div>
        </div>
        <div className="bg-white/10 rounded-[10px] p-3 text-center border border-white/20">
          <div className="text-2xl font-bold text-white mb-1">
            {summary.qualified_total}
          </div>
          <div className="text-white/70 text-xs font-medium">Купили</div>
        </div>
        <div className="bg-white/10 rounded-[10px] p-3 text-center border border-white/20">
          <div className="text-2xl font-bold text-white mb-1">
            {summary.pending_total}
          </div>
          <div className="text-white/70 text-xs font-medium">Ожидают</div>
        </div>
      </div>
    </div>
  );
};