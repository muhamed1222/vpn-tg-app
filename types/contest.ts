/**
 * Типы для системы конкурсов и розыгрышей
 */

export interface ContestPrize {
  icon: string; // Эмодзи иконки (🥇, 🥈, 🥉, ✨)
  name: string; // Название приза
  position?: string; // Позиция (например, "6–10 места")
}

export interface Contest {
  id: string;
  title: string;
  starts_at: string; // ISO datetime
  ends_at: string; // ISO datetime
  attribution_window_days: number;
  rules_version: string;
  is_active: boolean;
  prizes?: ContestPrize[]; // Опциональный массив призов (для обратной совместимости)
}

export interface RefEvent {
  id: string;
  contest_id: string;
  referrer_user_id: string;
  invitee_tg_id: string;
  invitee_user_id: string | null;
  bound_at: string; // ISO datetime
  source: 'bot' | 'miniapp';
  status: 'bound' | 'qualified' | 'not_qualified' | 'blocked';
  status_reason: string | null;
  qualified_at: string | null; // ISO datetime
}

export interface TicketLedgerEntry {
  id: string;
  contest_id: string;
  user_id: string;
  invitee_user_id: string;
  payment_id: string;
  delta: number; // +months или -months
  reason: 'INVITEE_PAYMENT' | 'REFUND' | 'MANUAL_ADJUST';
  created_at: string; // ISO datetime
}

export interface UserContestStats {
  contest_id: string;
  user_id: string;
  tickets_total: number;
  invited_total: number;
  qualified_total: number;
  pending_total: number;
  updated_at: string; // ISO datetime
}

export interface ReferralFriend {
  id: string;
  name: string | null;
  tg_username: string | null;
  status: 'bound' | 'qualified' | 'blocked' | 'not_qualified';
  status_reason: string | null;
  tickets_from_friend_total: number;
  bound_at: string; // ISO datetime
}

export interface ContestSummary {
  contest: Contest;
  ref_link: string;
  tickets_total: number;
  invited_total: number;
  qualified_total: number;
  pending_total: number;
}

export interface TicketHistoryEntry {
  id: string;
  created_at: string; // ISO datetime
  delta: number;
  label: string;
  invitee_name: string | null;
}