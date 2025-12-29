
export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  NONE = 'NONE',
}

export interface User {
  id: string;
  telegramId: number;
  username: string;
  avatar?: string;
}

export interface Subscription {
  status: SubscriptionStatus;
  activeUntil?: string;
  planId?: string;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  status: 'success' | 'fail' | 'pending';
  planName: string;
}

export interface Plan {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
  description: string;
  savings?: string;
}

export interface VpnKey {
  value: string;
  isVisible: boolean;
}
