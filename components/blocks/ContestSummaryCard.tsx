'use client';

import React from 'react';
import { ContestSummary } from '@/types/contest';
import { GiftIcon, LinkIcon } from '@heroicons/react/24/outline';
import { TicketIcon } from '@heroicons/react/24/outline'; // Need to define or use a similar icon
import Link from 'next/link';

interface ContestSummaryCardProps {
  summary: ContestSummary;
  onRulesClick?: () => void;
}

export default function ContestSummaryCard({
  summary,
  onRulesClick
}: ContestSummaryCardProps) {

  // Instead of counting down here, we just display the stats as in the screenshot.
  // The design has one big card with the info, two small cards for stats, and one small card for status.

  return (
    <div className="flex flex-col gap-3 relative z-10 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* Main Info Card */}
      <div className="bg-[#1C1C1E]/80 backdrop-blur-md rounded-[20px] p-6 border border-white/5 shadow-lg flex flex-col items-center text-center">
        <div className="w-14 h-14 bg-gradient-to-br from-[#F55128] to-[#FF6B3D] rounded-[16px] flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(245,81,40,0.3)]">
          <GiftIcon className="w-7 h-7 text-white" />
        </div>

        <h1 className="text-[22px] font-bold text-white leading-tight mb-3">
          Гранд-Розыгрыш 2026!
        </h1>

        <p className="text-white/70 text-[14px] leading-relaxed mb-4">
          Разыгрываем 10 крутых призов: iPhone 17 Pro, Galaxy Watch Ultra, AirPods 4, Яндекс Станции и другие призы.
        </p>

        <p className="text-white/70 text-[14px] leading-relaxed mb-5">
          Приглашайте друзей, получайте билеты и повышайте свои шансы на победу.
        </p>

        <button onClick={onRulesClick} className="flex items-center gap-2 text-[#FF6B3D] hover:text-[#FF8A65] transition-colors text-sm font-medium">
          Подробные условия <LinkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {/* Tickets Card */}
        <div className="bg-[#1C1C1E]/80 backdrop-blur-md rounded-[16px] p-5 border border-white/5 shadow-lg flex flex-col justify-center">
          <div className="text-[32px] font-bold text-white leading-none mb-2">
            {summary.tickets_total}
          </div>
          <div className="text-white/50 text-[13px] font-medium leading-tight">
            Получено билетов
          </div>
        </div>

        {/* Friends Card */}
        <div className="bg-[#1C1C1E]/80 backdrop-blur-md rounded-[16px] p-5 border border-white/5 shadow-lg flex flex-col justify-center">
          <div className="text-[32px] font-bold text-white leading-none mb-2">
            {summary.invited_total}
          </div>
          <div className="text-white/50 text-[13px] font-medium leading-tight">
            Приглашено друзей
          </div>
        </div>
      </div>

      {/* Winners List Card */}
      <div className="bg-[#1C1C1E]/80 backdrop-blur-md rounded-[16px] p-5 border border-white/5 shadow-lg flex flex-col w-full">
        <div className="text-[18px] font-bold text-white mb-4 text-center">Победители розыгрыша</div>
        <div className="flex flex-col gap-2">
          {(() => {
            const winners = [
              { place: 1, id: '1972786546', prize: 'iPhone 17 Pro' },
              { place: 2, id: '1140209535', prize: 'Galaxy Watch Ultra' },
              { place: 3, id: '5855099175', prize: 'AirPods 4' },
              { place: 4, id: '978855516', prize: 'Яндекс станция Миди' },
              { place: 5, id: '1140209535', prize: 'Яндекс станция Стрит' },
              { place: 6, id: '8356242348', prize: 'Premium (1 год)' },
              { place: 7, id: '7350769107', prize: 'Premium (1 год)' },
              { place: 8, id: '1841173436', prize: 'Premium (1 год)' },
              { place: 9, id: '6472091918', prize: 'Premium (1 год)' },
              { place: 10, id: '667279246', prize: 'Premium (1 год)' },
            ];

            return winners.map((winner) => (
              <div
                key={winner.place}
                className={`flex items-center justify-between p-3 rounded-[12px] ${winner.place === 1 ? 'bg-gradient-to-r from-[#FFD700]/20 to-transparent border border-[#FFD700]/30' :
                  winner.place === 2 ? 'bg-gradient-to-r from-[#C0C0C0]/20 to-transparent border border-[#C0C0C0]/30' :
                    winner.place === 3 ? 'bg-gradient-to-r from-[#CD7F32]/20 to-transparent border border-[#CD7F32]/30' :
                      'bg-white/5'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${winner.place === 1 ? 'bg-[#FFD700] text-black shadow-[0_0_10px_rgba(255,215,0,0.5)]' :
                    winner.place === 2 ? 'bg-[#C0C0C0] text-black' :
                      winner.place === 3 ? 'bg-[#CD7F32] text-white' :
                        'bg-white/10 text-white/70'
                    }`}>
                    {winner.place}
                  </div>
                  <div className="text-white font-medium">#{winner.id}</div>
                </div>
                {/* Optional prize label if we want to visually map place to prize */}
                {/* <div className="text-white/50 text-xs">{winner.prize}</div> */}
              </div>
            ));
          })()}
        </div>
      </div>

    </div>
  );
};