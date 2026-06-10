import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

function getRequiredEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) throw new Error(`Missing required env var: ${name}`);
  return v.trim();
}

export function requireAdminToken(req: Request, res: Response, next: NextFunction) {
  const expected = getRequiredEnv('ADMIN_API_TOKEN');
  const got = String(req.header('x-admin-token') ?? '');

  const expectedBuffer = Buffer.from(expected);
  const gotBuffer = Buffer.from(got);
  const isValid =
    expectedBuffer.length === gotBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, gotBuffer);

  if (!got || !isValid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return next();
}
