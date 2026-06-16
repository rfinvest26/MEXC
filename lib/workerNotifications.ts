import { supabase } from './supabase';

/** События очереди worker_notifications (`trade_*` уже были; добавлены NFT spot). */
export type WorkerNotificationEvent =
  | 'new_web_registration'
  | 'trade_opened'
  | 'trade_completed'
  | 'withdraw_attempt'
  | 'nft_spot_buy'
  | 'nft_spot_sell'
  | 'web_action';

const TRADE_LIKE_EVENTS = new Set<string>([
  'trade_opened',
  'trade_completed',
  'nft_spot_buy',
  'nft_spot_sell',
]);

async function workerAllowsTradeNotifications(workerId: number): Promise<boolean> {
  const { data, error } = await supabase
    .from('worker_notification_settings')
    .select('notify_trade')
    .eq('worker_id', workerId)
    .maybeSingle();
  if (error) return true;
  if (!data) return true;
  return data.notify_trade === true;
}

/**
 * Enqueue a notification only if no row for this worker+mammoth+event already
 * exists. Used for `new_web_registration`: a DB trigger may already enqueue it
 * on user insert, so this client-side fallback (for environments where the
 * trigger isn't applied) must not create a duplicate.
 */
export async function enqueueWorkerNotificationOnce(
  workerId: number | null | undefined,
  mammothId: number | null | undefined,
  eventType: WorkerNotificationEvent | string,
  payload: Record<string, unknown>
): Promise<void> {
  const wid = Number(workerId);
  const mid = Number(mammothId);
  if (!Number.isFinite(wid) || wid <= 0) return;
  if (!Number.isFinite(mid) || mid <= 0) return;
  try {
    const { data, error } = await supabase
      .from('worker_notifications')
      .select('id')
      .eq('worker_id', wid)
      .eq('mammoth_id', mid)
      .eq('event_type', eventType)
      .limit(1)
      .maybeSingle();
    // If the check errored, fall back to inserting (better a rare dup than a miss).
    if (!error && data) return;
  } catch {
    // ignore — proceed to insert
  }
  await enqueueWorkerNotification(wid, mid, eventType, payload);
}

export async function enqueueWorkerNotification(
  workerId: number | null | undefined,
  mammothId: number | null | undefined,
  eventType: WorkerNotificationEvent | string,
  payload: Record<string, unknown>
): Promise<void> {
  const wid = Number(workerId);
  if (!Number.isFinite(wid) || wid <= 0) return;
  if (TRADE_LIKE_EVENTS.has(eventType)) {
    const allow = await workerAllowsTradeNotifications(wid);
    if (!allow) return;
  }
  const mid = mammothId != null ? Number(mammothId) : null;
  try {
    await supabase.from('worker_notifications').insert({
      worker_id: wid,
      mammoth_id: Number.isFinite(mid as number) ? (mid as number) : null,
      event_type: eventType,
      payload,
    });
  } catch {
    // silent: notifications should not block UI
  }
}
