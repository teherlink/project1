import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../lib/db';
import { verifyJwt, verifyPassword, hashPassword } from '../../lib/auth';
import {
  applyCorsHeaders,
  applySecurityHeaders,
  checkRateLimit,
  requireApiAuth,
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

  if (checkRateLimit(req, { maxRequests: 20, windowMs: 60_000 })) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  if (!validateRequestBodySize(req.body, 16000)) {
    return res.status(413).json({ error: 'Request body too large' });
  }

  const authPayload = requireApiAuth(req, res);
  if (!authPayload) {
    return;
  }

  const payload = authPayload as any;
  const { current_password, new_password } = req.body as { current_password?: string; new_password?: string };
  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }
  if (!validatePassword(new_password)) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long' });
  }

  try {
    const result = await query('SELECT password_hash FROM users WHERE id = $1', [payload.userId]);
    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    if (!verifyPassword(current_password, user.password_hash)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const passwordHash = hashPassword(new_password);
    await query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [passwordHash, payload.userId]);

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update password' });
  }
}
