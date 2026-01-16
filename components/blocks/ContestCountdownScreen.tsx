'use client';

import React from 'react';
import CountdownTimer from './CountdownTimer';

interface ContestCountdownScreenProps {
  contestTitle: string;
  startsAt: string;
}

/**
 * Экран ожидания до начала конкурса
 */
export default function ContestCountdownScreen({ 
  contestTitle, 
  startsAt 
}: ContestCountdownScreenProps) {
  return (
    <div className="w-full text-white pt-[calc(100px+env(safe-area-inset-top))] pl-4 pr-4 font-sans select-none flex flex-col items-center justify-center min-h-screen pb-[calc(40px+env(safe-area-inset-bottom))]">
      <div className="flex flex-col items-center justify-center text-center max-w-[400px]">
        {/* Иконка */}
        <div className="text-7xl mb-6 animate-bounce">
          🎁
        </div>
        
        {/* Заголовок */}
        <h1 className="text-3xl font-bold text-white mb-4">
          Розыгрыш скоро начнется!
        </h1>
        
        {/* Описание */}
        <p className="text-white/70 text-base mb-8 leading-relaxed">
          {contestTitle}
        </p>
        
        {/* Таймер обратного отсчета */}
        <div className="bg-gradient-to-br from-[#F55128] via-[#FF6B3D] to-[#FF8A65] rounded-[16px] p-8 mb-6 border border-white/20 backdrop-blur-[12px] shadow-2xl w-full">
          <CountdownTimer 
            targetDate={startsAt} 
            label="До начала осталось"
          />
        </div>
        
        {/* Дополнительная информация */}
        <div className="bg-white/5 rounded-[10px] p-4 border border-white/10 w-full">
          <p className="text-white/60 text-sm">
            Подготовьтесь к участию! Приглашайте друзей и получайте билеты на призы.
          </p>
        </div>
      </div>
    </div>
  );
}
