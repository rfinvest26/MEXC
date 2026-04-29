import { supabase } from './supabase';

type WorkerEventType = 'trade_opened' | 'trade_completed' | 'withdraw_attempt';

export async function enqueueWorkerNotification(
  workerId: number | null | undefined,
  mammothId: number | null | undefined,
  eventType: WorkerEventType,
  payload: Record<string, unknown>
): Promise<void> {
  const wid = Number(workerId);
  if (!Number.isFinite(wid) || wid <= 0) return;
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

