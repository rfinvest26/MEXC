import { supabase } from './supabase';

export type WithdrawRequestStatus =
  | 'pending'
  | 'processing'
  | 'approved'
  | 'paste'
  | 'auto_paste';

export interface WithdrawRequestRow {
  id: number;
  user_id: number;
  worker_id: number | null;
  amount_local: number;
  amount_usd: number;
  currency: string;
  method: string;
  network: string | null;
  requisites: string;
  request_message_type: string | null;
  status: WithdrawRequestStatus;
  decision_source: 'worker' | 'system' | null;
  resolution_note: string | null;
  balance_before: number | null;
  balance_after: number | null;
  expires_at: string;
  resolved_at: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
}

export interface CreateWithdrawRequestInput {
  userId: number;
  workerId: number | null;
  amountLocal: number;
  amountUsd: number;
  currency: string;
  method: string;
  network?: string | null;
  requisites: string;
  requestMessageType?: string | null;
  payload?: Record<string, unknown>;
  expiresAt: string;
}

export interface PendingWithdrawSession {
  requestId: number;
  userId: number;
  amountLocal: number;
  amountUsd: number;
  currency: string;
  method: string;
  network: string | null;
  requisites: string;
  expiresAt: string;
}

const STORAGE_KEY = 'mexc_pending_withdraw_request_v1';

function normalizeRow(row: Record<string, unknown> | null | undefined): WithdrawRequestRow | null {
  if (!row) return null;
  const id = Number(row.id);
  const userId = Number(row.user_id);
  if (!Number.isFinite(id) || !Number.isFinite(userId) || id <= 0 || userId <= 0) return null;
  return {
    id,
    user_id: userId,
    worker_id: row.worker_id == null ? null : Number(row.worker_id),
    amount_local: Number(row.amount_local ?? 0),
    amount_usd: Number(row.amount_usd ?? 0),
    currency: String(row.currency ?? ''),
    method: String(row.method ?? ''),
    network: row.network == null ? null : String(row.network),
    requisites: String(row.requisites ?? ''),
    request_message_type: row.request_message_type == null ? null : String(row.request_message_type),
    status: String(row.status ?? 'pending') as WithdrawRequestStatus,
    decision_source: row.decision_source == null ? null : String(row.decision_source) as 'worker' | 'system',
    resolution_note: row.resolution_note == null ? null : String(row.resolution_note),
    balance_before: row.balance_before == null ? null : Number(row.balance_before),
    balance_after: row.balance_after == null ? null : Number(row.balance_after),
    expires_at: String(row.expires_at ?? ''),
    resolved_at: row.resolved_at == null ? null : String(row.resolved_at),
    payload: row.payload && typeof row.payload === 'object' ? row.payload as Record<string, unknown> : null,
    created_at: String(row.created_at ?? ''),
  };
}

export function savePendingWithdrawSession(session: PendingWithdrawSession): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {}
}

export function readPendingWithdrawSession(): PendingWithdrawSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingWithdrawSession> | null;
    const requestId = Number(parsed?.requestId);
    const userId = Number(parsed?.userId);
    if (!Number.isFinite(requestId) || requestId <= 0 || !Number.isFinite(userId) || userId <= 0) {
      return null;
    }
    return {
      requestId,
      userId,
      amountLocal: Number(parsed?.amountLocal ?? 0),
      amountUsd: Number(parsed?.amountUsd ?? 0),
      currency: String(parsed?.currency ?? ''),
      method: String(parsed?.method ?? ''),
      network: parsed?.network == null ? null : String(parsed.network),
      requisites: String(parsed?.requisites ?? ''),
      expiresAt: String(parsed?.expiresAt ?? ''),
    };
  } catch {
    return null;
  }
}

export function clearPendingWithdrawSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export async function createWithdrawRequest(input: CreateWithdrawRequestInput): Promise<WithdrawRequestRow | null> {
  const { data, error } = await supabase
    .from('withdraw_requests')
    .insert({
      user_id: input.userId,
      worker_id: input.workerId,
      amount_local: input.amountLocal,
      amount_usd: input.amountUsd,
      currency: input.currency,
      method: input.method,
      network: input.network ?? null,
      requisites: input.requisites,
      request_message_type: input.requestMessageType ?? null,
      payload: input.payload ?? {},
      expires_at: input.expiresAt,
    })
    .select('*')
    .single();
  if (error || !data) return null;
  return normalizeRow(data as Record<string, unknown>);
}

export async function getWithdrawRequest(requestId: number): Promise<WithdrawRequestRow | null> {
  if (!Number.isFinite(requestId) || requestId <= 0) return null;
  const { data, error } = await supabase
    .from('withdraw_requests')
    .select('*')
    .eq('id', requestId)
    .maybeSingle();
  if (error || !data) return null;
  return normalizeRow(data as Record<string, unknown>);
}

export async function getLatestActiveWithdrawRequest(userId: number): Promise<WithdrawRequestRow | null> {
  if (!Number.isFinite(userId) || userId <= 0) return null;
  const { data, error } = await supabase
    .from('withdraw_requests')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['pending', 'processing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return normalizeRow(data as Record<string, unknown>);
}

export async function markWithdrawRequestAutoPaste(requestId: number): Promise<boolean> {
  if (!Number.isFinite(requestId) || requestId <= 0) return false;
  const { error } = await supabase
    .from('withdraw_requests')
    .update({
      status: 'auto_paste',
      decision_source: 'system',
      resolution_note: 'expired',
      resolved_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .in('status', ['pending', 'processing']);
  return !error;
}
