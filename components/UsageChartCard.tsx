import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { apiService } from '../services/apiService';

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

const MOCK_USAGE_DATA: UsageData[] = [
  { day: 'Dec 14', value: 5 }, { day: 'Dec 15', value: 40 },
  { day: 'Dec 16', value: 100 }, { day: 'Dec 17', value: 10 },
  { day: 'Dec 18', value: 0 }, { day: 'Dec 19', value: 5 },
  { day: 'Dec 20', value: 20 }, { day: 'Dec 21', value: 0 },
  { day: 'Dec 22', value: 0 }, { day: 'Dec 23', value: 0 },
  { day: 'Dec 24', value: 0 }, { day: 'Dec 25', value: 0 },
  { day: 'Dec 26', value: 0 }, { day: 'Dec 27', value: 0 },
  { day: 'Dec 28', value: 0 },
];

// Форматирование ГБ
const formatGB = (gb: number): string => {
  if (gb >= 1000) return `${(gb / 1000).toFixed(1)} ТБ`;
  if (gb >= 1) return `${gb.toFixed(1)} ГБ`;
  return `${(gb * 1024).toFixed(0)} МБ`;
};

export const UsageChartCard: React.FC = () => {
  const { subscription } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<BillingStats>({
    currentUsage: 2,
    totalLimit: Infinity,
    averagePerDay: 0.13,
    usageData: MOCK_USAGE_DATA,
  });

  // Загрузка данных биллинга
  useEffect(() => {
    const loadBillingData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // TODO: Заменить на реальный API endpoint когда будет готов
        await new Promise(resolve => setTimeout(resolve, 500));
        setStats({
          currentUsage: 2,
          totalLimit: Infinity,
          averagePerDay: 0.13,
          usageData: MOCK_USAGE_DATA,
        });
      } catch (err: any) {
        console.error('Ошибка при загрузке данных биллинга:', err);
        setError('Не удалось загрузить данные. Используются примерные значения.');
        setStats({
          currentUsage: 2,
          totalLimit: Infinity,
          averagePerDay: 0.13,
          usageData: MOCK_USAGE_DATA,
        });
      } finally {
        setLoading(false);
      }
    };

    loadBillingData();
  }, [subscription]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setStats({
        currentUsage: 2,
        totalLimit: Infinity,
        averagePerDay: 0.13,
        usageData: MOCK_USAGE_DATA,
      });
    } catch (err: any) {
      setError('Не удалось обновить данные');
    } finally {
      setRefreshing(false);
    }
  };

  const isUnlimited = stats.totalLimit === Infinity;

  return (
    <div className="card-ref p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-medium text-fg-4 mb-1">Использование</h3>
          <p className="text-sm text-fg-2">Разбивка вашего использования за биллинговый цикл</p>
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
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2" role="alert">
          <AlertCircle size={16} className="text-yellow-600 mt-0.5 shrink-0" />
          <p className="text-xs text-yellow-800">{error}</p>
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
                    backgroundColor: 'white', 
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [`${value} ГБ`, 'Использование']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stats.usageData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.value > 0 ? '#998DFF' : '#F0F0F0'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8 space-y-2">
            <UsageItem 
              label="Текущее использование" 
              value={formatGB(stats.currentUsage)} 
              color="#998DFF" 
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

