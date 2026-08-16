import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../lib/db';
import { hashPassword } from '../../lib/auth';
import {
  applyCorsHeaders,
  applySecurityHeaders,
  checkRateLimit,
  sanitizeText,
  validatePassword,
  validateRequestBodySize,
} from '../../lib/security';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  applySecurityHeaders(res);
  const corsAllowed = applyCorsHeaders(req, res, ['http://localhost:3000', 'http://127.0.0.1:3000']);
  if (!corsAllowed) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (checkRateLimit(req, { maxRequests: 15, windowMs: 60_000 })) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  if (!validateRequestBodySize(req.body, 12000)) {
    return res.status(413).json({ error: 'Request body too large' });
  }

  const token = sanitizeText(req.body?.token, 128);
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required' });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  try {
    const result = await query(
      `SELECT id, password_reset_expires_at FROM users WHERE password_reset_token = $1`,
      [token]
    );

    if (!result.rows.length) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const user = result.rows[0];
    const expiresAt = user.password_reset_expires_at ? new Date(user.password_reset_expires_at) : null;
    if (!expiresAt || expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    const hashedPassword = hashPassword(password);
    await query(
      `UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires_at = NULL, updated_at = now() WHERE id = $2`,
      [hashedPassword, user.id]
    );

    return res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
}
