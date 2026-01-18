/**
 * Схемы валидации для API ответов
 * Использует Zod для runtime-валидации данных
 */

import { z } from 'zod';

// Базовые схемы
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    ok: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
  });

// Схемы для пользователя
export const UserStatusSchema = z.object({
  status: z.enum(['active', 'expired', 'none']),
  expiresAt: z.number().nullable(),
  usedTraffic: z.number().nonnegative(),
  dataLimit: z.number().nonnegative(),
});

export const UserConfigSchema = z.object({
  ok: z.boolean(),
  config: z.string().nullable(),
});

export const BillingDataSchema = z.object({
  usedBytes: z.number().nonnegative(),
  limitBytes: z.number().nullable(),
  averagePerDayBytes: z.number().nonnegative(),
  planId: z.string().nullable(),
  planName: z.string().nullable(),
  period: z.object({
    start: z.number().nullable(),
    end: z.number().nullable(),
  }),
});

export const UserStatusResponseSchema = z.object({
  ok: z.boolean(),
  status: z.enum(['active', 'expired', 'none']),
  expiresAt: z.number().nullable(),
  usedTraffic: z.number().nonnegative(),
  dataLimit: z.number().nonnegative(),
});

// Схемы для тарифов
export const TariffSchema = z.object({
  id: z.string(),
  name: z.string(),
  days: z.number().positive(),
  price_stars: z.number().nonnegative(),
  price_rub: z.number().nonnegative().optional(),
});

export const TariffsResponseSchema = z.array(TariffSchema);

// Схемы для платежей и заказов
export const TransactionSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  amount: z.number().nonnegative(),
  currency: z.string(),
  date: z.number().positive(),
  status: z.enum(['success', 'pending', 'fail', 'paid']),
  planId: z.string(),
  planName: z.string(),
});

export const TransactionsResponseSchema = z.array(TransactionSchema);

export const OrderResponseSchema = z.object({
  orderId: z.string(),
  status: z.enum(['pending']),
  paymentUrl: z.string().url(),
});

export const PaymentSuccessResponseSchema = z.object({
  status: z.enum(['completed', 'pending']),
  vless_key: z.string().optional(),
  expires_at: z.number().optional(),
  message: z.string().optional(),
});

// Схемы для рефералов
export const ReferralStatsSchema = z.object({
  totalCount: z.number().nonnegative(),
  trialCount: z.number().nonnegative(),
  premiumCount: z.number().nonnegative(),
  referralCode: z.string(),
});

export const ReferralHistoryItemSchema = z.object({
  id: z.string(),
  amount: z.number().nonnegative(),
  currency: z.string(),
  date: z.number().positive(),
  referralId: z.string(),
  status: z.enum(['pending', 'completed', 'cancelled']),
});

export const ReferralHistoryResponseSchema = z.array(ReferralHistoryItemSchema);

// Схемы для автопродления
export const AutorenewalSchema = z.object({
  enabled: z.boolean(),
});

export const AutorenewalResponseSchema = z.object({
  enabled: z.boolean(),
});

// Схемы для конкурсов
export const ContestSchema = z.object({
  id: z.string(),
  title: z.string(),
  starts_at: z.string(), // ISO datetime
  ends_at: z.string(), // ISO datetime
  attribution_window_days: z.number().nonnegative(),
  rules_version: z.string(),
  is_active: z.boolean(),
});

export const ActiveContestResponseSchema = z.object({
  ok: z.boolean(),
  contest: ContestSchema.nullable(),
});

export const ContestSummarySchema = z.object({
  contest: ContestSchema,
  ref_link: z.string().url(),
  tickets_total: z.number().nonnegative(),
  invited_total: z.number().nonnegative(),
  qualified_total: z.number().nonnegative(),
  pending_total: z.number().nonnegative(),
});

export const ContestSummaryResponseSchema = z.object({
  ok: z.boolean(),
  summary: ContestSummarySchema,
});

export const ReferralFriendSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  tg_username: z.string().nullable(),
  status: z.enum(['bound', 'qualified', 'blocked', 'not_qualified']),
  status_reason: z.string().nullable(),
  tickets_from_friend_total: z.number().nonnegative(),
  bound_at: z.string(), // ISO datetime
});

export const ContestFriendsResponseSchema = z.object({
  ok: z.boolean(),
  friends: z.array(ReferralFriendSchema),
});

export const TicketHistoryEntrySchema = z.object({
  id: z.string(),
  created_at: z.string(), // ISO datetime
  delta: z.number().int(),
  label: z.string(),
  invitee_name: z.string().nullable(),
});

export const ContestTicketsResponseSchema = z.object({
  ok: z.boolean(),
  tickets: z.array(TicketHistoryEntrySchema),
});

// Типы на основе схем
export type UserStatus = z.infer<typeof UserStatusSchema>;
export type UserConfig = z.infer<typeof UserConfigSchema>;
export type BillingData = z.infer<typeof BillingDataSchema>;
export type UserStatusResponse = z.infer<typeof UserStatusResponseSchema>;
export type Tariff = z.infer<typeof TariffSchema>;
export type TariffsResponse = z.infer<typeof TariffsResponseSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type TransactionsResponse = z.infer<typeof TransactionsResponseSchema>;
export type OrderResponse = z.infer<typeof OrderResponseSchema>;
export type PaymentSuccessResponse = z.infer<typeof PaymentSuccessResponseSchema>;
export type ReferralStats = z.infer<typeof ReferralStatsSchema>;
export type ReferralHistoryItem = z.infer<typeof ReferralHistoryItemSchema>;
export type ReferralHistoryResponse = z.infer<typeof ReferralHistoryResponseSchema>;
export type Autorenewal = z.infer<typeof AutorenewalSchema>;
export type AutorenewalResponse = z.infer<typeof AutorenewalResponseSchema>;
export type Contest = z.infer<typeof ContestSchema>;
export type ActiveContestResponse = z.infer<typeof ActiveContestResponseSchema>;
export type ContestSummary = z.infer<typeof ContestSummarySchema>;
export type ContestSummaryResponse = z.infer<typeof ContestSummaryResponseSchema>;
export type ReferralFriend = z.infer<typeof ReferralFriendSchema>;
export type ContestFriendsResponse = z.infer<typeof ContestFriendsResponseSchema>;
export type TicketHistoryEntry = z.infer<typeof TicketHistoryEntrySchema>;
export type ContestTicketsResponse = z.infer<typeof ContestTicketsResponseSchema>;
