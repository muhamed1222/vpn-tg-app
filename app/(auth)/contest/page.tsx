'use client';

import React, { useState, useEffect, lazy, Suspense, useMemo, useCallback } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { triggerHaptic, getTelegramWebApp, getTelegramInitData } from '@/lib/telegram';
import { logError } from '@/lib/utils/logging';
import { ContestSummary, ReferralFriend, TicketHistoryEntry } from '@/types/contest-v2';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

// Lazy loading для компонентов
const ContestSummaryCard = lazy(() =>
  import('@/components/blocks/ContestSummaryCard')
);
const FriendsList = lazy(() =>
  import('@/components/blocks/FriendsList')
);
const TicketsHistory = lazy(() =>
  import('@/components/blocks/TicketsHistory')
);
const ContestRulesModal = lazy(() =>
  import('@/components/blocks/ContestRulesModal')
);

export default function ContestPage() {
  const [summary, setSummary] = useState<ContestSummary | null>(null);
  const [friends, setFriends] = useState<ReferralFriend[]>([]);
  const [tickets, setTickets] = useState<TicketHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Мемоизируем функцию загрузки данных
  const loadContestData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Получаем Telegram initData для авторизации
      const initData = getTelegramInitData();
      
      // В режиме разработки используем mock данные, если initData нет
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (initData) {
        headers['X-Telegram-Init-Data'] = initData;
        headers['Authorization'] = initData;
      } else if (process.env.NODE_ENV === 'development') {
        // В development режиме используем mock initData
        const mockInitData = 'query_id=STUB&user=%7B%22id%22%3A12345678%2C%22first_name%22%3A%22Developer%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22dev%22%2C%22language_code%22%3A%22ru%22%7D&auth_date=1623822263&hash=7777777777777777777777777777777777777777777777777777777777777777';
        headers['X-Telegram-Init-Data'] = mockInitData;
        headers['Authorization'] = mockInitData;
      }

      // Делаем запросы к API с авторизацией
      const [activeContestResponse, summaryResponse, friendsResponse, ticketsResponse] = await Promise.all([
        // Получаем активный конкурс
        fetch('/api/contest/active', { headers }).catch(() => null),
        // Получаем сводку по рефералам
        fetch('/api/referral/summary?contest_id=550e8400-e29b-41d4-a716-446655440000', { headers }).catch(() => null),
        // Получаем список друзей
        fetch('/api/referral/friends?contest_id=550e8400-e29b-41d4-a716-446655440000&limit=50', { headers }).catch(() => null),
        // Получаем историю билетов
        fetch('/api/referral/tickets?contest_id=550e8400-e29b-41d4-a716-446655440000&limit=20', { headers }).catch(() => null),
      ]);

      // Обрабатываем ответы
      const activeContestData = activeContestResponse?.ok 
        ? await activeContestResponse.json().catch(() => ({ ok: false, contest: null, error: 'Parse error' }))
        : { ok: false, contest: null, error: activeContestResponse ? `HTTP ${activeContestResponse.status}` : 'Network error' };
      
      const summaryData = summaryResponse?.ok
        ? await summaryResponse.json().catch(() => ({ ok: false, summary: null, error: 'Parse error' }))
        : { ok: false, summary: null, error: summaryResponse ? `HTTP ${summaryResponse.status}` : 'Network error' };
      
      const friendsData = friendsResponse?.ok
        ? await friendsResponse.json().catch(() => ({ ok: false, friends: [], error: 'Parse error' }))
        : { ok: false, friends: [], error: friendsResponse ? `HTTP ${friendsResponse.status}` : 'Network error' };
      
      const ticketsData = ticketsResponse?.ok
        ? await ticketsResponse.json().catch(() => ({ ok: false, tickets: [], error: 'Parse error' }))
        : { ok: false, tickets: [], error: ticketsResponse ? `HTTP ${ticketsResponse.status}` : 'Network error' };

      // Проверяем наличие активного конкурса
      if (!activeContestData.ok || !activeContestData.contest) {
        // Если конкурс не найден, это нормально - конкурс может быть не активен
        if (activeContestData.error?.includes('404') || 
            activeContestData.error?.includes('not found') ||
            activeContestData.error?.includes('Contest endpoint not found')) {
          setError('В данный момент нет активного конкурса. Следите за обновлениями!');
        } else if (activeContestData.error?.includes('401') || activeContestData.error?.includes('Missing Telegram')) {
          setError('Ошибка авторизации. Пожалуйста, перезапустите приложение.');
        } else if (activeContestData.error?.includes('500') || activeContestData.error?.includes('Internal Server Error')) {
          setError('Ошибка сервера. Попробуйте позже.');
        } else if (activeContestData.error?.includes('Network error') || activeContestData.error?.includes('Backend unavailable')) {
          setError('Сервер временно недоступен. Попробуйте позже.');
        } else {
          setError('Нет активного конкурса');
        }
        setLoading(false);
        return;
      }

      // Проверяем наличие сводки
      if (!summaryData.ok || !summaryData.summary) {
        // Если сводка не найдена, но конкурс есть, показываем конкурс без данных
        if (summaryData.error?.includes('404') || summaryData.error?.includes('not found')) {
          setError('Данные конкурса временно недоступны. Попробуйте позже.');
        } else {
          setError('Не удалось загрузить данные конкурса');
        }
        setLoading(false);
        return;
      }

      setSummary(summaryData.summary);
      setFriends(friendsData.friends || []);
      setTickets(ticketsData.tickets || []);
    } catch (err) {
      // Логируем только неожиданные ошибки (не связанные с отсутствием эндпоинтов)
      const isExpectedError = err instanceof Error && (
        err.message.includes('404') ||
        err.message.includes('401') ||
        err.message.includes('Missing Telegram initData') ||
        err.message.includes('Failed to fetch')
      );
      
      if (!isExpectedError) {
        logError('Failed to load contest data', err, {
          page: 'contest',
          action: 'loadContestData',
        });
      }
      setError('Не удалось загрузить данные конкурса');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContestData();
  }, [loadContestData]);

  // Мемоизируем расчет прогресса конкурса
  const contestProgress = useMemo(() => {
    if (!summary) return { daysRemaining: 0, daysTotal: 0, percent: 0 };
    
    const now = new Date().getTime();
    const start = new Date(summary.contest.starts_at).getTime();
    const end = new Date(summary.contest.ends_at).getTime();
    
    const total = end - start;
    const remaining = Math.max(0, end - now);
    const percent = total > 0 ? Math.max(0, Math.min(100, ((total - remaining) / total) * 100)) : 0;
    
    const daysTotal = Math.ceil(total / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.ceil(remaining / (1000 * 60 * 60 * 24));
    
    return { daysRemaining, daysTotal, percent };
  }, [summary]);

  const handleShare = useCallback(async () => {
    if (!summary) return;

    try {
      triggerHaptic('medium');
      
      const webApp = getTelegramWebApp();
      
      // Используем Telegram Share API для приглашения друзей
      if (webApp && webApp.openTelegramLink) {
        // Формируем текст для приглашения
        const shareText = `🎁 Розыгрыш Outlivion VPN!\n\nИспользуй мою реферальную ссылку и получи больше билетов для участия:\n${summary.ref_link}`;
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(summary.ref_link)}&text=${encodeURIComponent(shareText)}`;
        
        webApp.openTelegramLink(shareUrl);
      } else if (navigator.share) {
        // Fallback: используем Web Share API
        await navigator.share({
          title: 'Розыгрыш Outlivion VPN',
          text: `Присоединяйся к розыгрышу Outlivion VPN! Используй мою реферальную ссылку: ${summary.ref_link}`,
          url: summary.ref_link,
        });
      } else {
        // Fallback: копируем в буфер обмена
        const { copyToClipboard } = await import('@/lib/utils/clipboard');
        const copied = await copyToClipboard(summary.ref_link);
        
        if (copied) {
          const webApp = getTelegramWebApp();
          if (webApp) {
            webApp.showAlert('✅ Реферальная ссылка скопирована');
          }
        } else {
          logError('Failed to copy referral link', new Error('Clipboard API not available'), {
            page: 'contest',
            action: 'share',
          });
        }
      }
    } catch (err) {
      // Если пользователь отменил share, это не ошибка
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      logError('Failed to share referral link', err, {
        page: 'contest',
        action: 'share',
      });
    }
  }, [summary]);

  if (loading) {
    return (
      <main className="w-full text-white pt-[calc(100px+env(safe-area-inset-top))] px-[calc(1rem+env(safe-area-inset-left))] font-sans select-none flex flex-col min-h-screen">
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60">Загрузка...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !summary) {
    return (
      <main className="w-full text-white pt-[calc(100px+env(safe-area-inset-top))] px-[calc(1rem+env(safe-area-inset-left))] font-sans select-none flex flex-col min-h-screen">
        <div className="sticky top-[calc(100px+env(safe-area-inset-top))] z-50 flex items-center justify-between w-fit mb-4">
          <Link href="/" className="p-2 bg-white/10 rounded-xl border border-white/10 active:scale-95 transition-all hover:bg-white/15" aria-label="Назад на главную">
            <ChevronLeftIcon className="w-6 h-6 text-white" aria-hidden="true" />
          </Link>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center max-w-[300px]">
            <p className="text-white/80 text-lg mb-2">Конкурс недоступен</p>
            <p className="text-white/60 text-sm">{error || 'Нет активного конкурса'}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full text-white pt-[calc(100px+env(safe-area-inset-top))] px-[calc(1rem+env(safe-area-inset-left))] font-sans select-none flex flex-col h-fit pb-[calc(40px+env(safe-area-inset-bottom))] relative">
      <AnimatedBackground />

      {/* Header with Back Button */}
      <div className="sticky top-[calc(100px+env(safe-area-inset-top))] z-50 flex items-center justify-between w-fit mb-4 relative">
        <Link 
          href="/" 
          onClick={() => triggerHaptic('light')}
          className="p-2 bg-white/10 rounded-xl border border-white/10 active:scale-95 transition-all hover:bg-white/15"
          aria-label="Назад на главную"
        >
          <ChevronLeftIcon className="w-6 h-6 text-white" aria-hidden="true" />
        </Link>
      </div>

      {/* Contest Summary */}
      <Suspense fallback={<div className="h-56 bg-white/5 rounded-2xl animate-pulse mb-6 relative z-10" />}>
        <ContestSummaryCard 
          summary={summary} 
          progress={contestProgress}
        />
      </Suspense>

      {/* Invite Section */}
      <div className="mb-6 relative z-10">
        <button
          onClick={handleShare}
          className="w-full bg-gradient-to-r from-[#F55128] to-[#FF6B3D] hover:from-[#d43d1f] hover:to-[#e55a2d] active:scale-[0.98] transition-all duration-200 rounded-[16px] py-5 px-6 text-white font-bold text-lg shadow-xl flex items-center justify-center gap-3 border border-white/20"
        >
          <span className="text-2xl">🎁</span>
          <span>Пригласить друзей</span>
        </button>
        <div className="text-center mt-2">
          <p className="text-white/60 text-xs">
            Чем больше друзей пригласите, тем выше ваши шансы на победу!
          </p>
        </div>
      </div>

      {/* Friends List */}
      <Suspense fallback={<div className="h-64 bg-white/5 rounded-2xl animate-pulse mb-6 relative z-10" />}>
        <FriendsList friends={friends} />
      </Suspense>

      {/* Tickets History */}
      <Suspense fallback={<div className="h-64 bg-white/5 rounded-2xl animate-pulse mb-6 relative z-10" />}>
        <TicketsHistory tickets={tickets} />
      </Suspense>

      {/* Rules Button */}
      <div className="mb-6 relative z-10">
        <button
          onClick={() => {
            triggerHaptic('light');
            setIsRulesOpen(true);
          }}
          className="w-full bg-transparent border border-white/10 hover:bg-white/5 active:scale-[0.98] transition-all rounded-[10px] py-3 px-4 text-white/80 font-medium"
        >
          Правила конкурса
        </button>
      </div>

      {/* Rules Modal */}
      <Suspense fallback={null}>
        <ContestRulesModal
          isOpen={isRulesOpen}
          onClose={() => setIsRulesOpen(false)}
          contest={summary.contest}
        />
      </Suspense>
    </main>
  );
}
