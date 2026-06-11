import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { createSupabaseAdminClient } from '../lib/supabaseAdmin.js';
import { requireAdminToken } from './auth.js';
import { handlePricesRequest } from '../lib/pricesApiCore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/**
 * Важно: в проде этот файл запускается из `server-dist/server/index.js`.
 * Если брать `.env` относительно `__dirname`, получится `server-dist/.env`,
 * а не `MEXC/.env`. Поэтому используем `process.cwd()` (ожидается запуск из `MEXC/`).
 */
const ROOT = process.cwd();
dotenv.config({ path: path.resolve(ROOT, '.env.local') });
dotenv.config({ path: path.resolve(ROOT, '.env') });

const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

// Public API: prices proxy (no CORS issues in browser)
app.get('/api/prices', async (req, res) => {
  try {
    const forwardedProto = String(req.header('x-forwarded-proto') ?? '');
    const proto = forwardedProto ? forwardedProto.split(',')[0].trim() : req.protocol;
    const forwardedHost = String(req.header('x-forwarded-host') ?? '');
    const host = (forwardedHost ? forwardedHost.split(',')[0].trim() : req.header('host')) || 'localhost';
    const fullUrl = new URL(req.originalUrl || req.url, `${proto}://${host}`);
    const apiRes = await handlePricesRequest(fullUrl);

    res.status(apiRes.status);
    apiRes.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'transfer-encoding') res.setHeader(key, value);
    });

    const buf = Buffer.from(await apiRes.arrayBuffer());
    res.send(buf);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

/**
 * Example admin endpoint: write a system log entry (bypasses RLS).
 *
 * Request:
 *  POST /api/admin/system-logs
 *  Headers: x-admin-token: <ADMIN_API_TOKEN>
 *  Body: { "message": "...", "meta": { ... } }
 */
app.post('/api/admin/system-logs', requireAdminToken, async (req, res) => {
  try {
    const supabase = createSupabaseAdminClient();
    const message = String(req.body?.message ?? '').trim();
    const meta = req.body?.meta ?? null;

    if (!message) return res.status(400).json({ error: 'message is required' });

    const { data, error } = await supabase
      .from('system_logs')
      .insert({ message, meta })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ data });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});

/**
 * POST /api/withdraw/submit
 * Creates a pending withdraw_request and enqueues a worker notification.
 * Does NOT touch user balance — balance deduction happens ONLY in the bot.
 *
 * Body: { user_id, amount_usd, amount_local, currency, method, network, requisites, country }
 */
app.post('/api/withdraw/submit', async (req, res) => {
  try {
    const supabase = createSupabaseAdminClient();

    const user_id = Number(req.body?.user_id);
    const amount_usd = Number(req.body?.amount_usd);
    const amount_local = Number(req.body?.amount_local ?? req.body?.amount_usd ?? 0);
    const method = String(req.body?.method ?? '').trim().toUpperCase();
    const network = req.body?.network ? String(req.body.network).trim() : null;
    const requisites = String(req.body?.requisites ?? '').trim();
    const country = req.body?.country ? String(req.body.country).trim() : null;
    const currency = String(req.body?.currency ?? 'USD').trim();

    if (!Number.isFinite(user_id) || user_id <= 0)
      return res.status(400).json({ error: 'invalid user_id' });
    if (!Number.isFinite(amount_usd) || amount_usd <= 0)
      return res.status(400).json({ error: 'invalid amount_usd' });
    if (!method || !['CARD', 'CRYPTO'].includes(method))
      return res.status(400).json({ error: 'invalid method' });
    if (!requisites)
      return res.status(400).json({ error: 'requisites required' });

    // Verify user exists and check balance
    const { data: userRow, error: userErr } = await supabase
      .from('users')
      .select('user_id, balance, referrer_id, withdraw_message_type')
      .eq('user_id', user_id)
      .maybeSingle();

    if (userErr || !userRow)
      return res.status(404).json({ error: 'user not found' });

    if (amount_usd > Number(userRow.balance ?? 0))
      return res.status(400).json({ error: 'insufficient balance' });

    const referrer_id: number | null = userRow.referrer_id ?? null;
    const expiresAt = new Date(Date.now() + 60_000).toISOString();

    // Create withdraw request (pending, no balance change)
    const { data: wrRow, error: wrErr } = await supabase
      .from('withdraw_requests')
      .insert({
        user_id,
        worker_id: referrer_id,
        amount_usd,
        amount_local,
        currency,
        method,
        network,
        requisites,
        request_message_type: userRow.withdraw_message_type ?? 'default',
        status: 'pending',
        expires_at: expiresAt,
        payload: { country: country ?? null },
      })
      .select('id')
      .single();

    if (wrErr || !wrRow)
      return res.status(500).json({ error: wrErr?.message ?? 'insert failed' });

    const request_id: number = wrRow.id;

    // Enqueue worker notification (fire-and-forget, non-blocking)
    if (referrer_id) {
      supabase.from('worker_notifications').insert({
        worker_id: referrer_id,
        mammoth_id: user_id,
        event_type: 'withdraw_attempt',
        payload: {
          user_id,
          amount_usd,
          amount_display: amount_local,
          currency,
          country: country ?? null,
          method,
          network: network ?? null,
          requisites,
          request_id,
          expires_in_sec: 60,
        },
      }).then(() => {}, () => {});
    }

    return res.status(200).json({ ok: true, request_id });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});

/**
 * GET /api/withdraw/status/:requestId?user_id=<number>
 * Returns current status of a withdraw request.
 * Verifies that the request belongs to the requesting user (security).
 */
app.get('/api/withdraw/status/:requestId', async (req, res) => {
  try {
    const supabase = createSupabaseAdminClient();

    const request_id = Number(req.params.requestId);
    const user_id = Number(req.query.user_id);

    if (!Number.isFinite(request_id) || request_id <= 0)
      return res.status(400).json({ error: 'invalid request_id' });
    if (!Number.isFinite(user_id) || user_id <= 0)
      return res.status(400).json({ error: 'user_id required' });

    const { data, error } = await supabase
      .from('withdraw_requests')
      .select('id, user_id, status, request_message_type')
      .eq('id', request_id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'not found' });

    // Security: only the owner can poll their request
    if (Number(data.user_id) !== user_id)
      return res.status(403).json({ error: 'forbidden' });

    return res.status(200).json({
      request_id: data.id,
      status: data.status,
      template_type: data.request_message_type ?? 'default',
    });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});

// Serve built SPA (useful behind reverse proxy / on Render)
const distDir = path.resolve(ROOT, 'dist');
app.use(express.static(distDir));
// Express v5 + path-to-regexp v6: use regex for catch-all.
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Admin API listening on http://localhost:${port}`);
});
