import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../lib/db';
import { createVerificationToken } from '../../lib/auth';
import { enqueueJob } from '../../lib/job-queue';
import {
  applyCorsHeaders,
  applySecurityHeaders,
  checkRateLimit,
  sanitizeText,
  validateEmail,
  validateRequestBodySize,
} from '../../lib/security';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  applySecurityHeaders(res);
  const corsAllowed = applyCorsHeaders(req, res);
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

  const email = sanitizeText(req.body?.email, 254);
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const user = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (!user.rows.length) {
      return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const token = createVerificationToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await query(
      `UPDATE users SET password_reset_token = $1, password_reset_expires_at = $2 WHERE email = $3`,
      [token, expiresAt, email.toLowerCase()]
    );

    await enqueueJob('email.password_reset', { email: email.toLowerCase(), token }, { maxAttempts: 5 });

    return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to request password reset' });
  }
}
