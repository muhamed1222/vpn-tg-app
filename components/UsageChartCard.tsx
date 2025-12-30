import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { isTelegramWebApp } from '../utils/telegram';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { apiService, BillingStatsResponse } from '../services/apiService';

interface UsageData {
  day: string;
  value: number;
}

interface BillingStats {
  currentUsage: number;
  totalLimit: number;
  averagePerDay: number;
  usageData: UsageData[];
}

// Форматирование ГБ
const formatGB = (gb: number): string => {
  if (gb >= 1000) return `${(gb / 1000).toFixed(1)} ТБ`;
  if (gb >= 1) return `${gb.toFixed(1)} ГБ`;
  return `${(gb * 1024).toFixed(0)} МБ`;
};

const bytesToGB = (bytes: number): number => bytes / (1024 * 1024 * 1024);

const mapBillingStats = (data: BillingStatsResponse): BillingStats => ({
  currentUsage: bytesToGB(data.usedBytes),
  totalLimit: data.limitBytes ? bytesToGB(data.limitBytes) : Infinity,
  averagePerDay: bytesToGB(data.averagePerDayBytes),
  usageData: data.usageHistory.map((entry) => ({
    day: new Date(entry.timestamp).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    value: bytesToGB(entry.bytes),
  })),
});

export const UsageChartCard: React.FC = () => {
  const { subscription } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<BillingStats>({
    currentUsage: 0,
    totalLimit: Infinity,
    averagePerDay: 0,
    usageData: [],
  });

  // Загрузка данных биллинга
  useEffect(() => {
    const loadBillingData = async () => {
      setLoading(true);
      setError(null);
      
      if (!isTelegramWebApp()) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiService.getBillingStats();
        setStats(mapBillingStats(data));
      } catch (err) {
        console.error('Ошибка при загрузке данных биллинга:', err);
        setError('Не удалось загрузить данные.');
        setStats({
          currentUsage: 0,
          totalLimit: Infinity,
          averagePerDay: 0,
          usageData: [],
        });
      } finally {
        setLoading(false);
      }
    };

    loadBillingData();
  }, [subscription]);

  const handleRefresh = async () => {
    if (!isTelegramWebApp()) {
      return;
    }

    setRefreshing(true);
    setError(null);
    
    try {
      const data = await apiService.getBillingStats();
      setStats(mapBillingStats(data));
    } catch {
      setError('Не удалось обновить данные');
    } finally {
      setRefreshing(false);
    }
  };

  const hasHistory = stats.usageData.length > 1;
  const hasAnyUsage = stats.usageData.length > 0;

  return (
    <div className="card-ref p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-medium text-fg-4 mb-1">Использование</h3>
          <p className="text-sm text-fg-2">
            {hasHistory ? 'Разбивка вашего использования за биллинговый цикл' : 'Сводка вашего использования'}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="p-2 hover:bg-bg-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Обновить данные"
          title="Обновить данные"
        >
          <RefreshCw 
            size={16} 
            className={`text-fg-3 ${refreshing ? 'animate-spin' : ''}`} 
          />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[var(--warning-bg)] border border-[var(--warning-border)] rounded-lg flex items-start gap-2" role="alert">
          <AlertCircle size={16} className="text-[var(--warning-text)] mt-0.5 shrink-0" />
          <p className="text-xs text-[var(--warning-text)]">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="h-[200px] bg-bg-2 rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-12 bg-bg-2 rounded-lg animate-pulse" />
            <div className="h-12 bg-bg-2 rounded-lg animate-pulse" />
          </div>
        </div>
      ) : (
        <>
          <div className="h-[200px] w-full mb-8">
            {hasAnyUsage ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.usageData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 11, fill: 'var(--fg-2)' }}
                    tickLine={{ stroke: 'var(--border)' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: 'var(--fg-2)' }}
                    tickLine={{ stroke: 'var(--border)' }}
                    label={{ value: 'ГБ', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'var(--fg-2)', fontSize: 11 } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--background)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: 'var(--fg-4)'
                    }}
                    formatter={(value: number) => [`${value} ГБ`, 'Использование']}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {stats.usageData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.value > 0 ? 'var(--accent)' : 'var(--bg-2)'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full bg-bg-2 rounded-lg flex items-center justify-center text-xs text-fg-2">
                История трафика появится после первых подключений
              </div>
            )}
          </div>
          
          <div className="mt-8 space-y-2">
            <UsageItem 
              label="Текущее использование" 
              value={formatGB(stats.currentUsage)} 
              color="var(--accent)" 
            />
            <UsageItem 
              label="Среднее в день" 
              value={formatGB(stats.averagePerDay)} 
            />
          </div>
        </>
      )}
    </div>
  );
};

const UsageItem = ({ label, value, color }: { label: string, value: string, color?: string }) => (
  <div className="flex items-center justify-between p-3 rounded-lg bg-bg-2 text-sm font-medium transition-colors hover:bg-bg-3">
    <div className="flex items-center gap-3 text-fg-3">
      {color && (
        <div 
          className="w-2.5 h-2.5 rounded-full shrink-0" 
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      )}
      <span>{label}</span>
    </div>
    <span className="text-fg-4 font-semibold">{value}</span>
  </div>
);
