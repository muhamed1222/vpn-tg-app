import { ContestSummary, ReferralFriend, TicketHistoryEntry, Contest } from '@/types/contest';

/**
 * Моковые данные для конкурса
 */

export const mockContest: Contest = {
  id: 'contest-001',
  title: 'Январский розыгрыш Outlivion',
  starts_at: '2025-01-01T00:00:00Z',
  ends_at: '2026-02-05T23:59:59Z',
  attribution_window_days: 7,
  rules_version: '1.0',
  is_active: true,
};

export const mockContestSummary: ContestSummary = {
  contest: mockContest,
  ref_link: 'https://t.me/outlivion_bot?start=ref_ABC123',
  tickets_total: 24,
  invited_total: 12,
  qualified_total: 8,
  pending_total: 4,
};

export const mockFriends: ReferralFriend[] = [
  {
    id: 'friend-1',
    name: 'Иван Иванов',
    tg_username: 'ivan_ivanov',
    status: 'qualified',
    status_reason: null,
    tickets_from_friend_total: 12,
    bound_at: '2025-01-10T10:00:00Z',
  },
  {
    id: 'friend-2',
    name: 'Мария Петрова',
    tg_username: 'maria_petrova',
    status: 'qualified',
    status_reason: null,
    tickets_from_friend_total: 6,
    bound_at: '2025-01-12T14:30:00Z',
  },
  {
    id: 'friend-3',
    name: 'Алексей Смирнов',
    tg_username: null,
    status: 'bound',
    status_reason: null,
    tickets_from_friend_total: 0,
    bound_at: '2025-01-15T09:15:00Z',
  },
  {
    id: 'friend-4',
    name: 'Елена Козлова',
    tg_username: 'elena_koz',
    status: 'not_qualified',
    status_reason: 'ATTR_WINDOW_EXPIRED',
    tickets_from_friend_total: 0,
    bound_at: '2025-01-05T12:00:00Z',
  },
  {
    id: 'friend-5',
    name: 'Дмитрий Волков',
    tg_username: null,
    status: 'not_qualified',
    status_reason: 'EXISTING_PAYER',
    tickets_from_friend_total: 0,
    bound_at: '2025-01-08T16:45:00Z',
  },
  {
    id: 'friend-6',
    name: 'Анна Соколова',
    tg_username: 'anna_sokol',
    status: 'bound',
    status_reason: null,
    tickets_from_friend_total: 0,
    bound_at: '2025-01-18T11:20:00Z',
  },
];

export const mockTicketsHistory: TicketHistoryEntry[] = [
  {
    id: 'ticket-1',
    created_at: '2025-01-10T10:30:00Z',
    delta: 12,
    label: 'Друг оплатил 12 месяцев',
    invitee_name: 'Иван Иванов',
  },
  {
    id: 'ticket-2',
    created_at: '2025-01-12T15:00:00Z',
    delta: 6,
    label: 'Друг оплатил 6 месяцев',
    invitee_name: 'Мария Петрова',
  },
  {
    id: 'ticket-3',
    created_at: '2025-01-13T09:00:00Z',
    delta: 3,
    label: 'Друг оплатил 3 месяца',
    invitee_name: 'Сергей Новиков',
  },
  {
    id: 'ticket-4',
    created_at: '2025-01-14T12:00:00Z',
    delta: 1,
    label: 'Друг оплатил 1 месяц',
    invitee_name: 'Ольга Морозова',
  },
  {
    id: 'ticket-5',
    created_at: '2025-01-15T10:00:00Z',
    delta: 2,
    label: 'Друг оплатил 2 месяца',
    invitee_name: 'Павел Лебедев',
  },
  {
    id: 'ticket-6',
    created_at: '2025-01-16T14:30:00Z',
    delta: -3,
    label: 'Возврат платежа',
    invitee_name: 'Сергей Новиков',
  },
];