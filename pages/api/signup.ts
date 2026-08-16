import type { NextApiRequest, NextApiResponse } from 'next';
import { createUser } from '../../lib/auth';
import { enqueueJob } from '../../lib/job-queue';
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

  if (checkRateLimit(req, { maxRequests: 8, windowMs: 60_000 })) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  const email = sanitizeText(req.body?.email, 254);
  const username = sanitizeText(req.body?.username, 24);
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  const referralCode = sanitizeText(req.body?.referral_code, 32);

  if (!email || !username || !password) {
    return res.status(400).json({ error: 'Email, username, and password are required' });
  }

  if (!validateEmail(email) || !validateUsername(username) || !validatePassword(password)) {
    return res.status(400).json({ error: 'Please provide valid signup details' });
  }

  try {
    const user = await createUser(email.toLowerCase(), username, password, '', referralCode || undefined);
    await enqueueJob('email.verification', {
      email: user.email,
      token: user.verification_token,
    }, { maxAttempts: 5 });

    return res.status(201).json({
      message: 'Signup successful. Verification email queued. Check your inbox.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        wallet_address: user.wallet_address,
        wallet_id: user.wallet_id,
      },
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'Failed to create user' });
  }
}
