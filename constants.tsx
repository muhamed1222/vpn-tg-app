import { Plan } from './types';

// Планы синхронизированы с ботом (vpn_bot/src/constants.ts)
export const PLANS: Plan[] = [
  { 
    id: 'plan_7', 
    name: '7 Дней (Тест)', 
    durationMonths: 0.23, // ~7 дней
    price: 10, 
    description: 'Пробный период' 
  },
  { 
    id: 'plan_30', 
    name: '1 Месяц', 
    durationMonths: 1, 
    price: 99, 
    description: 'Базовая защита на месяц' 
  },
  { 
    id: 'plan_90', 
    name: '3 Месяца', 
    durationMonths: 3, 
    price: 260, 
    description: 'Оптимально для старта', 
    savings: '10%' 
  },
  { 
    id: 'plan_180', 
    name: '6 Месяцев', 
    durationMonths: 6, 
    price: 499, 
    description: 'Популярный выбор', 
    savings: '15%' 
  },
  { 
    id: 'plan_365', 
    name: '12 Месяцев', 
    durationMonths: 12, 
    price: 899, 
    description: 'Максимальная выгода', 
    savings: '25%' 
  },
];

export const PLATFORMS = [
  { id: 'ios', name: 'iOS' },
  { id: 'android', name: 'Android' },
  { id: 'windows', name: 'Windows' },
  { id: 'macos', name: 'macOS' },
];