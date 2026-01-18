'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useUserStore } from '@/store/user.store';
import { logError } from '@/lib/utils/logging';

interface ContestDebugInfo {
  contest: {
    id: string;
    title: string;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
  } | null;
  tickets: Array<{
    id: string;
    delta: number;
    reason: string;
    created_at: string;
    order_id?: string;
  }>;
  payments: Array<{
    id: string;
    order_id: string;
    plan_id: string;
    status: string;
    amount: number;
    created_at: string;
  }>;
  userStatus: {
    status: string;
    expiresAt: string | null;
  } | null;
}

export default function ContestDebugPage() {
  const { user } = useUserStore();
  const [data, setData] = useState<ContestDebugInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setError(null);
      setLoading(true);

      // Загружаем данные параллельно
      const [contestData, paymentsData, userStatusData] = await Promise.allSettled([
        api.getActiveContest(),
        api.getPaymentsHistory(),
        api.getUserStatus(),
      ]);

      const contest = contestData.status === 'fulfilled' ? contestData.value.contest : null;
      const payments = paymentsData.status === 'fulfilled' ? paymentsData.value : [];
      const userStatus = userStatusData.status === 'fulfilled' ? userStatusData.value : null;

      // Загружаем билеты конкурса, если конкурс активен
      let tickets: ContestDebugInfo['tickets'] = [];
      if (contest && contest.id) {
        try {
          const ticketsData = await api.getContestTickets(contest.id);
          tickets = ticketsData.tickets || [];
        } catch (ticketsError) {
          logError('Failed to load contest tickets', ticketsError, {
            page: 'debug',
            action: 'loadContestTickets',
            contestId: contest.id,
          });
        }
      }

      setData({
        contest,
        tickets,
        payments,
        userStatus,
      });
    } catch (err) {
      logError('Failed to load debug data', err, {
        page: 'debug',
        action: 'loadData',
      });
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Диагностика конкурса</h1>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Диагностика конкурса</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg disabled:opacity-50"
          >
            {refreshing ? 'Обновление...' : 'Обновить'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-900/30 border border-red-500 rounded-lg">
            <p className="text-red-400">Ошибка: {error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Информация о пользователе */}
          <div className="bg-gray-900 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Пользователь</h2>
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-400">ID:</span> {user?.id || 'Не определен'}</p>
              {userStatus && (
                <>
                  <p><span className="text-gray-400">Статус подписки:</span> {userStatus.status}</p>
                  {userStatus.expiresAt && (
                    <p><span className="text-gray-400">Истекает:</span> {new Date(userStatus.expiresAt).toLocaleString('ru-RU')}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Информация о конкурсе */}
          <div className="bg-gray-900 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Конкурс</h2>
            {data?.contest ? (
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-400">ID:</span> {data.contest.id}</p>
                <p><span className="text-gray-400">Название:</span> {data.contest.title}</p>
                <p><span className="text-gray-400">Начало:</span> {new Date(data.contest.starts_at).toLocaleString('ru-RU')}</p>
                <p><span className="text-gray-400">Окончание:</span> {new Date(data.contest.ends_at).toLocaleString('ru-RU')}</p>
                <p><span className="text-gray-400">Активен:</span> {data.contest.is_active ? '✅ Да' : '❌ Нет'}</p>
                <p className="mt-2">
                  <span className="text-gray-400">Текущее время:</span> {new Date().toLocaleString('ru-RU')}
                </p>
                {data.contest.is_active && (
                  <div className="mt-2 p-2 bg-green-900/30 border border-green-500 rounded">
                    <p className="text-green-400">Конкурс активен</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400">Конкурс не найден</p>
            )}
          </div>

          {/* Билеты */}
          <div className="bg-gray-900 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">
              Билеты ({data?.tickets.length || 0})
            </h2>
            {data?.tickets && data.tickets.length > 0 ? (
              <div className="space-y-2">
                {data.tickets.map((ticket) => (
                  <div key={ticket.id} className="p-2 bg-gray-800 rounded border border-gray-700">
                    <div className="flex justify-between items-start">
                      <div className="text-sm space-y-1">
                        <p><span className="text-gray-400">ID:</span> {ticket.id}</p>
                        <p><span className="text-gray-400">Количество:</span> {ticket.delta > 0 ? '+' : ''}{ticket.delta}</p>
                        <p><span className="text-gray-400">Причина:</span> {ticket.reason}</p>
                        {ticket.order_id && (
                          <p><span className="text-gray-400">Заказ:</span> {ticket.order_id}</p>
                        )}
                        <p><span className="text-gray-400">Создан:</span> {new Date(ticket.created_at).toLocaleString('ru-RU')}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-2 p-2 bg-blue-900/30 border border-blue-500 rounded">
                  <p className="text-blue-400">
                    Всего билетов: {data.tickets.reduce((sum, t) => sum + (t.delta > 0 ? t.delta : 0), 0)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Билеты не найдены</p>
            )}
          </div>

          {/* История платежей */}
          <div className="bg-gray-900 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">
              История платежей ({data?.payments.length || 0})
            </h2>
            {data?.payments && data.payments.length > 0 ? (
              <div className="space-y-2">
                {data.payments.map((payment) => (
                  <div key={payment.id} className="p-2 bg-gray-800 rounded border border-gray-700">
                    <div className="text-sm space-y-1">
                      <p><span className="text-gray-400">Заказ ID:</span> {payment.order_id}</p>
                      <p><span className="text-gray-400">План:</span> {payment.plan_id}</p>
                      <p>
                        <span className="text-gray-400">Статус:</span>{' '}
                        <span className={payment.status === 'success' || payment.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}>
                          {payment.status}
                        </span>
                      </p>
                      <p><span className="text-gray-400">Сумма:</span> {payment.amount}</p>
                      <p><span className="text-gray-400">Создан:</span> {new Date(payment.created_at).toLocaleString('ru-RU')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">Платежи не найдены</p>
            )}
          </div>

          {/* Анализ */}
          <div className="bg-gray-900 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Анализ</h2>
            <div className="space-y-2 text-sm">
              {data && data.contest && data.contest.is_active && (
                <div className="p-2 bg-green-900/30 border border-green-500 rounded">
                  <p className="text-green-400">✅ Конкурс активен - билеты должны начисляться</p>
                </div>
              )}
              {data && data.payments && data.payments.length > 0 && (
                <div className="p-2 bg-blue-900/30 border border-blue-500 rounded">
                  <p className="text-blue-400">
                    ℹ️ Найдено {data.payments.length} платеж(ей)
                  </p>
                  {data.payments.some(p => p.status === 'success' || p.status === 'completed') && (
                    <p className="text-green-400 mt-1">
                      ✅ Есть успешные платежи - билеты должны быть начислены
                    </p>
                  )}
                  {!data.payments.some(p => p.status === 'success' || p.status === 'completed') && (
                    <p className="text-yellow-400 mt-1">
                      ⚠️ Нет успешных платежей - билеты не могут быть начислены
                    </p>
                  )}
                </div>
              )}
              {data && data.tickets && data.tickets.length === 0 && data.contest && data.contest.is_active && (
                <div className="p-2 bg-red-900/30 border border-red-500 rounded">
                  <p className="text-red-400">
                    ❌ Билеты не найдены, хотя конкурс активен и есть платежи
                  </p>
                  <p className="text-gray-400 mt-1 text-xs">
                    Возможные причины: заказ не активирован на бэкенде, проблема с начислением билетов
                  </p>
                </div>
              )}
              {data && data.tickets && data.tickets.length > 0 && (
                <div className="p-2 bg-green-900/30 border border-green-500 rounded">
                  <p className="text-green-400">
                    ✅ Билеты найдены - система работает корректно
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
