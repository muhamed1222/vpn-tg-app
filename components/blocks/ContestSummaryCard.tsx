'use client';

import React from 'react';
import { ContestSummary } from '@/types/contest';
import CountdownTimer from './CountdownTimer';

interface ContestSummaryCardProps {
  summary: ContestSummary;
}

/**
 * Компонент для отображения сводки по конкурсу
 * Показывает количество билетов и статистику
 */
export default function ContestSummaryCard({ 
  summary
}: ContestSummaryCardProps) {

  return (
    <div className="bg-gradient-to-br from-[#F55128] via-[#FF6B3D] to-[#FF8A65] rounded-[10px] p-3.5 mb-6 border border-white/20 backdrop-blur-[12px] relative z-10 shadow-2xl">
      {/* Заголовок с таймером */}
      <div className="mb-[14px]">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h1 className="text-xl font-medium text-white leading-tight mb-2">
              Розыгрыш
            </h1>
          </div>
        </div>
        {/* Обратный отсчет до окончания конкурса */}
        <div className="flex justify-center">
          <CountdownTimer targetDate={summary.contest.ends_at} label="До окончания" />
        </div>
      </div>

      {/* Основные метрики */}
      <div className="bg-white/15 rounded-[10px] p-3.5 mb-0 border-2 border-white/30 shadow-lg backdrop-blur-sm">
        <div className="grid grid-cols-2 gap-4 text-center">
          {/* Билеты - главный акцент */}
          <div className="col-span-1">
            <div className={`${summary.tickets_total === 0 ? 'text-3xl' : 'text-4xl'} font-medium text-white mb-1 drop-shadow-lg`}>
              {summary.tickets_total}
            </div>
            <div className="text-white/90 text-sm font-medium">Билетов</div>
            <div className="text-white/60 text-xs mt-1">
              {summary.tickets_total > 0 ? 'В рейтинге' : '—'}
            </div>
          </div>
          
          {/* Друзья */}
          <div className="col-span-1 border-l border-white/20 pl-4">
            <div className="text-3xl font-bold text-white mb-1">
              {summary.invited_total}
            </div>
            <div className="text-white/90 text-sm font-semibold">Друзей</div>
            <div className="text-white/60 text-xs mt-1">
              Приглашено
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};