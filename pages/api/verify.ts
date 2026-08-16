import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../lib/db';
import {
  applyCorsHeaders,
  applySecurityHeaders,
  checkRateLimit,
  sanitizeText,
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

  if (checkRateLimit(req, { maxRequests: 20, windowMs: 60_000 })) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  if (!validateRequestBodySize(req.body, 8000)) {
    return res.status(413).json({ error: 'Request body too large' });
  }

  const token = sanitizeText(req.body?.token, 128);
  if (!token) {
    return res.status(400).json({ error: 'Verification token is required' });
  }

  try {
    const result = await query(
      `UPDATE users SET email_verified = true, verification_token = NULL
       WHERE verification_token = $1 AND email_verified = false
       RETURNING id, email, username, wallet_address`,
      [token]
    );

    if (!result.rows.length) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    return res.status(200).json({ message: 'Email verified successfully', user: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to verify email' });
  }
}
