import { Plan } from './types';

export const PLANS: Plan[] = [
  { 
    id: '1m', 
    name: '1 Месяц', 
    durationMonths: 1, 
    price: 99, 
    description: 'Базовая защита на месяц' 
  },
  { 
    id: '3m', 
    name: '3 Месяца', 
    durationMonths: 3, 
    price: 269, 
    description: 'Оптимально для старта', 
    savings: '10%' 
  },
  { 
    id: '6m', 
    name: '6 Месяцев', 
    durationMonths: 6, 
    price: 499, 
    description: 'Популярный выбор', 
    savings: '15%' 
  },
  { 
    id: '12m', 
    name: '1 Год', 
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