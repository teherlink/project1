import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyJwt } from './auth';

const rateLimitStore = new Map<string, number[]>();

// Allowed origins for CORS - includes local dev, production domain, and Vercel deployments
export const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://tetherlink.io',
  'https://www.tetherlink.io',
  // Allow all Vercel preview/deployment URLs
  /^https:\/\/.*\.vercel\.app$/,
];

export function getClientIp(req: Pick<NextApiRequest, 'headers' | 'socket'>) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) {
    return realIp.trim();
  }

  return req.socket?.remoteAddress || 'unknown';
}

export function checkRateLimit(
  req: Pick<NextApiRequest, 'headers' | 'socket'>,
  config: { maxRequests?: number; windowMs?: number; key?: string } = {}
) {
  const maxRequests = config.maxRequests ?? 30;
  const windowMs = config.windowMs ?? 60_000;
  const identifier = config.key || getClientIp(req);
  const now = Date.now();
  const entries = rateLimitStore.get(identifier) || [];
  const recent = entries.filter((stamp) => now - stamp < windowMs);
  recent.push(now);
  rateLimitStore.set(identifier, recent);
  return recent.length > maxRequests;
}

export function sanitizeText(value: unknown, maxLength = 200) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, maxLength);
}

export function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim());
}

export function validateUsername(value: string) {
  const cleaned = sanitizeText(value, 24);
  return /^[a-zA-Z0-9_-]{3,24}$/.test(cleaned);
}

export function validatePassword(value: string) {
  return typeof value === 'string' && value.length >= 8 && value.length <= 128;
}

export function isPositiveNumber(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

export function normalizeOrigin(origin?: string | string[] | null) {
  if (Array.isArray(origin)) {
    return origin[0] || '';
  }
  return origin || '';
}

export function isAllowedOrigin(origin: string | undefined, allowedOrigins: (string | RegExp)[] = ALLOWED_ORIGINS) {
  if (!origin) {
    return true;
  }

  const normalized = origin.replace(/\/$/, '');

  // Check exact matches
  for (const allowed of allowedOrigins) {
    if (typeof allowed === 'string') {
      if (allowed === '*' || allowed === normalized) {
        return true;
      }
    } else if (allowed instanceof RegExp) {
      if (allowed.test(normalized)) {
        return true;
      }
    }
  }

  // Allow localhost patterns
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalized);
}

export function applySecurityHeaders(res: NextApiResponse, extra: Record<string, string> = {}) {
  const baseHeaders = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'X-XSS-Protection': '1; mode=block',
    'Cache-Control': 'no-store',
    ...extra,
  };

  Object.entries(baseHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
}

export function validateRequestBodySize(body: unknown, maxBytes = 128000) {
  const serialized = JSON.stringify(body ?? {});
  return Buffer.byteLength(serialized, 'utf8') <= maxBytes;
}

export function applyCorsHeaders(req: NextApiRequest, res: NextApiResponse, allowedOrigins?: (string | RegExp)[]) {
  const origin = normalizeOrigin(req.headers.origin);
  const finalAllowedOrigins = allowedOrigins && allowedOrigins.length ? allowedOrigins : ALLOWED_ORIGINS;
  
  if (!origin && (!finalAllowedOrigins || finalAllowedOrigins.length === 0)) {
    return true;
  }

  const hasAllowedOrigin = isAllowedOrigin(origin, finalAllowedOrigins);

  if (origin && !hasAllowedOrigin) {
    return false;
  }

  // Set the appropriate origin
  if (origin && hasAllowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (finalAllowedOrigins.length > 0) {
    const firstOrigin = finalAllowedOrigins[0];
    res.setHeader('Access-Control-Allow-Origin', typeof firstOrigin === 'string' ? firstOrigin : '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Idempotency-Key');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  return true;
}

export function requireApiAuth(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return null;
  }

  const token = authHeader.slice('Bearer '.length);
  try {
    const payload = verifyJwt(token) as { userId?: number; email?: string };
    if (!payload?.userId) {
      res.status(401).json({ error: 'Invalid token payload' });
      return null;
    }
    return payload;
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }
}
