import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express, { type Request, type Response, type NextFunction } from 'express';
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
app.disable('x-powered-by');

function parseAllowedOrigins(): string[] {
  return String(process.env.CORS_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function sendJsonError(
  res: Response,
  status: number,
  publicError: string,
  context: string,
  error?: unknown,
) {
  if (error) {
    console.error(`[server:${context}]`, error);
  }
  return res.status(status).json({ error: publicError });
}

const allowedOrigins = parseAllowedOrigins();

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  res.setTimeout(20_000);
  next();
});

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('CORS origin not allowed'));
  },
}));
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
    sendJsonError(res, 502, 'Prices upstream is temporarily unavailable.', 'prices', e);
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
    const rawMeta = req.body?.meta ?? null;
    const meta =
      rawMeta == null || Array.isArray(rawMeta) || typeof rawMeta === 'object'
        ? rawMeta
        : { value: String(rawMeta) };

    if (!message) return res.status(400).json({ error: 'message is required' });
    if (message.length > 4000) return res.status(400).json({ error: 'message is too long' });

    const { data, error } = await supabase
      .from('system_logs')
      .insert({ message, meta })
      .select()
      .single();

    if (error) return sendJsonError(res, 500, 'Failed to write system log.', 'system_logs.insert', error);
    return res.status(200).json({ data });
  } catch (e) {
    return sendJsonError(res, 500, 'Failed to write system log.', 'system_logs.handler', e);
  }
});

// Serve built SPA (useful behind reverse proxy / on Render)
const distDir = path.resolve(ROOT, 'dist');
app.use(express.static(distDir));
// Express v5 + path-to-regexp v6: use regex for catch-all.
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof Error && err.message === 'CORS origin not allowed') {
    sendJsonError(res, 403, 'Origin is not allowed.', 'cors', err);
    return;
  }
  sendJsonError(res, 500, 'Internal server error.', 'unhandled', err);
});

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Admin API listening on http://localhost:${port}`);
});
