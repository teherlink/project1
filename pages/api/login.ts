import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../lib/db';
import { verifyPassword, createJwt } from '../../lib/auth';
import {
  applyCorsHeaders,
  applySecurityHeaders,
  checkRateLimit,
  sanitizeText,
  validateEmail,
  validatePassword,
  validateUsername,
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

  if (checkRateLimit(req, { maxRequests: 10, windowMs: 60_000 })) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  const identifier = sanitizeText(req.body?.email, 254);
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email or username and password are required' });
  }

  if ((!validateEmail(identifier) && !validateUsername(identifier)) || !validatePassword(password)) {
    return res.status(400).json({ error: 'Enter a valid email or username and password' });
  }

  try {
    const result = await query(
      `SELECT id, email, password_hash, email_verified
       FROM users
       WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)`,
      [identifier]
    );
    if (!result.rows.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    if (!verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.email_verified) {
      return res.status(403).json({ error: 'Email not verified' });
    }

    const token = createJwt({ userId: user.id, email: user.email.toLowerCase() });
    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to login' });
  }
}
