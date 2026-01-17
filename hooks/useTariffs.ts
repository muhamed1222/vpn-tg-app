'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { logError } from '@/lib/utils/logging';
import { getCache, setCache } from '@/lib/utils/cache';

export interface Tariff {
  id: string;
  name: string;
  days: number;
  price_stars: number;
  price_rub?: number;
}

const CACHE_KEY = 'tariffs';
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

/**
 * Хук для загрузки тарифов с кэшированием
 */
export function useTariffs() {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTariffs = async () => {
      // Проверяем localStorage кэш (персистентный между сессиями)
      // API уже кэширует через cachedFetch в памяти (для дедупликации запросов)
      // localStorage кэш используется для быстрой загрузки при повторном открытии страницы
      const cachedTariffs = getCache<Tariff[]>(CACHE_KEY);
      if (cachedTariffs !== null && cachedTariffs.length > 0) {
        setTariffs(cachedTariffs);
        setLoading(false);
        // Загружаем актуальные данные в фоне (но не блокируем UI)
        api.getTariffs()
          .then(data => {
            setTariffs(data);
            setCache(CACHE_KEY, data, CACHE_TTL);
          })
          .catch(() => {
            // Игнорируем ошибки фоновой загрузки, используем кэш
          });
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // API.getTariffs() уже использует cachedFetch для кэширования в памяти
        const data = await api.getTariffs();
        setTariffs(data);
        // Сохраняем в localStorage для персистентности между сессиями
        setCache(CACHE_KEY, data, CACHE_TTL);
      } catch (err) {
        logError('Failed to load tariffs', err, {
          page: 'useTariffs',
          action: 'loadTariffs'
        });
        setError('Не удалось загрузить тарифы. Попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    loadTariffs();
  }, []);

  return { tariffs, loading, error };
}
