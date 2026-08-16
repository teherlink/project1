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

  const email = sanitizeText(req.body?.email, 254);
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (!validateEmail(email) || !validatePassword(password)) {
    return res.status(400).json({ error: 'Invalid email or password format' });
  }

  try {
    const result = await query(`SELECT id, password_hash, email_verified FROM users WHERE email = $1`, [email.toLowerCase()]);
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

    const token = createJwt({ userId: user.id, email: email.toLowerCase() });
    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to login' });
  }
}
