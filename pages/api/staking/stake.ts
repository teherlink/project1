import type { NextApiRequest, NextApiResponse } from 'next';
import { initDb, query, withTransaction, getWalletLedgerBalances, insertLedgerEntries } from '../../../lib/db';
import { verifyJwt } from '../../../lib/auth';
import { randomUUID } from 'crypto';
import {
  applyCorsHeaders,
  applySecurityHeaders,
  checkRateLimit,
  requireApiAuth,
  validateRequestBodySize,
} from '../../../lib/security';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  applySecurityHeaders(res);
  const corsAllowed = applyCorsHeaders(req, res);
  if (!corsAllowed) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (checkRateLimit(req, { maxRequests: 60, windowMs: 60_000 })) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  if (!validateRequestBodySize(req.body, 12000)) {
    return res.status(413).json({ error: 'Request body too large' });
  }

  const authPayload = requireApiAuth(req, res);
  if (!authPayload) {
    return;
  }

  const payload = authPayload as any;
  const { campaign_id, amount } = req.body as { campaign_id: number; amount: number };
  const amt = Number(amount || 0);
  if (!campaign_id || amt <= 0 || amt > 1000000000) return res.status(400).json({ error: 'Invalid input' });

  const requestId = typeof req.headers['x-idempotency-key'] === 'string'
    ? req.headers['x-idempotency-key'].trim()
    : req.body?.request_id
      ? String(req.body.request_id).trim()
      : '';
  const endpoint = 'staking.stake';

  try {
    await initDb();

    if (requestId) {
      const idempotencyRow = await query(
        `SELECT status, response FROM idempotency_keys WHERE request_id = $1 AND user_id = $2 AND endpoint = $3`,
        [requestId, payload.userId, endpoint]
      );
      if (idempotencyRow.rows.length) {
        const row = idempotencyRow.rows[0];
        if (row.status === 'completed') {
          return res.status(200).json(row.response);
        }
        return res.status(409).json({ error: 'Request already in progress' });
      }
    }

    const result = await withTransaction(async (client) => {
      if (requestId) {
        await client.query(
          `INSERT INTO idempotency_keys (request_id, user_id, endpoint, status, created_at, updated_at)
           VALUES ($1, $2, $3, 'pending', now(), now())`,
          [requestId, payload.userId, endpoint]
        );
      }

      const campRes = await client.query(
        `SELECT id, min_amount, duration_days, return_percent FROM staking_campaigns WHERE id = $1`,
        [campaign_id]
      );
      if (!campRes.rows.length) {
        throw new Error('Campaign not found');
      }

      if (Number(campRes.rows[0].return_percent) !== 8) {
        throw new Error('Only the fixed 8% monthly APY product is available');
      }

      const min = Number(campRes.rows[0].min_amount || 0);
      const duration = Number(campRes.rows[0].duration_days || 30);
      if (amt < min) {
        throw new Error(`Minimum stake is ${min}`);
      }

      const walletRes = await client.query(
        `SELECT id, balance, locked_balance, staked_balance FROM wallets WHERE user_id = $1 AND currency = 'USDT' FOR UPDATE`,
        [payload.userId]
      );
      if (!walletRes.rows.length) {
        throw new Error('No USDT wallet');
      }

      const wallet = walletRes.rows[0];
      const ledgerBalances = await getWalletLedgerBalances(wallet.id);
      const available = Number(ledgerBalances['wallet.available'] ?? Number(wallet.balance || 0));
      const staked = Number(ledgerBalances['wallet.staked'] ?? Number(wallet.staked_balance || 0));
      const locked = Number(ledgerBalances['wallet.locked'] ?? Number(wallet.locked_balance || 0));
      if (amt > available) {
        throw new Error('Insufficient available balance');
      }

      await client.query(
        `UPDATE wallets SET balance = balance - $1, staked_balance = staked_balance + $1, updated_at = now() WHERE id = $2`,
        [amt, wallet.id]
      );

      const lockUntil = new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString();
      const stakeInsert = await client.query(
        `INSERT INTO user_stakes (user_id, wallet_id, campaign_id, amount, lock_until)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [payload.userId, wallet.id, campaign_id, amt, lockUntil]
      );
      const stakeId = stakeInsert.rows[0].id;

      const journalId = randomUUID();
      const balanceAvailableBefore = available;
      const balanceAvailableAfter = available - amt;
      const balanceStakedBefore = staked;
      const balanceStakedAfter = staked + amt;
      await insertLedgerEntries(client, [
        {
          journalId,
          walletId: wallet.id,
          direction: 'debit',
          amount: amt,
          account: 'wallet.available',
          counterpartyAccount: 'wallet.staked',
          balanceBefore: balanceAvailableBefore,
          balanceAfter: balanceAvailableAfter,
          referenceId: stakeId,
          referenceType: 'user_stakes',
        },
        {
          journalId,
          walletId: wallet.id,
          direction: 'credit',
          amount: amt,
          account: 'wallet.staked',
          counterpartyAccount: 'wallet.available',
          balanceBefore: balanceStakedBefore,
          balanceAfter: balanceStakedAfter,
          referenceId: stakeId,
          referenceType: 'user_stakes',
        },
      ]);

      const response = { message: 'Staked successfully', stake_id: stakeId };
      if (requestId) {
        await client.query(
          `UPDATE idempotency_keys SET status = 'completed', response = $1, updated_at = now() WHERE request_id = $2`,
          [response, requestId]
        );
      }

      return response;
    });

    return res.status(201).json(result);
  } catch (err: any) {
    if (
      err.message === 'Campaign not found' ||
      err.message.startsWith('Minimum stake') ||
      err.message === 'Only the fixed 8% monthly APY product is available'
    ) {
      return res.status(400).json({ error: err.message });
    }
    if (err.message === 'No USDT wallet' || err.message === 'Insufficient available balance') {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: 'Failed to stake' });
  }
}
