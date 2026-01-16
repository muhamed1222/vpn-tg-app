'use client';

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string; // ISO datetime
  label?: string;
}

/**
 * Компонент обратного отсчета до указанной даты
 */
export default function CountdownTimer({ targetDate, label = 'До окончания' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Вычисляем сразу
    calculateTimeLeft();

    // Обновляем каждую секунду
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  // Если время истекло, не показываем
  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-white/60 text-xs uppercase tracking-wide mb-3">
        {label}
      </div>
      <div className="flex items-center gap-2">
        {timeLeft.days > 0 && (
          <>
            <div className="flex flex-col items-center bg-white/10 rounded-lg p-3 min-w-[60px]">
              <div className="text-3xl font-bold text-white">{String(timeLeft.days).padStart(2, '0')}</div>
              <div className="text-xs text-white/70 uppercase mt-1">дн</div>
            </div>
            <span className="text-white/40 text-xl">:</span>
          </>
        )}
        <div className="flex flex-col items-center bg-white/10 rounded-lg p-3 min-w-[60px]">
          <div className="text-3xl font-bold text-white">{String(timeLeft.hours).padStart(2, '0')}</div>
          <div className="text-xs text-white/70 uppercase mt-1">ч</div>
        </div>
        <span className="text-white/40 text-xl">:</span>
        <div className="flex flex-col items-center bg-white/10 rounded-lg p-3 min-w-[60px]">
          <div className="text-3xl font-bold text-white">{String(timeLeft.minutes).padStart(2, '0')}</div>
          <div className="text-xs text-white/70 uppercase mt-1">м</div>
        </div>
        <span className="text-white/40 text-xl">:</span>
        <div className="flex flex-col items-center bg-white/10 rounded-lg p-3 min-w-[60px]">
          <div className="text-3xl font-bold text-white">{String(timeLeft.seconds).padStart(2, '0')}</div>
          <div className="text-xs text-white/70 uppercase mt-1">с</div>
        </div>
      </div>
    </div>
  );
}
