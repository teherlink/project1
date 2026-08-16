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
  const { stake_id } = req.body as { stake_id: number };
  if (!stake_id || Number(stake_id) <= 0) return res.status(400).json({ error: 'Missing stake_id' });

  const requestId = typeof req.headers['x-idempotency-key'] === 'string'
    ? req.headers['x-idempotency-key'].trim()
    : req.body?.request_id
      ? String(req.body.request_id).trim()
      : '';
  const endpoint = 'staking.unstake';

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

      const stakeRes = await client.query('SELECT * FROM user_stakes WHERE id = $1 FOR UPDATE', [stake_id]);
      if (!stakeRes.rows.length) {
        throw new Error('Stake not found');
      }
      const stake = stakeRes.rows[0];
      if (stake.user_id !== payload.userId) {
        throw new Error('Not your stake');
      }
      if (stake.status !== 'active') {
        throw new Error('Stake not active');
      }
      if (stake.lock_until) {
        const lock = new Date(stake.lock_until);
        if (new Date() < lock) {
          throw new Error(`Stake locked until ${lock.toISOString()}`);
        }
      }

      const campRes = await client.query('SELECT return_percent FROM staking_campaigns WHERE id = $1', [stake.campaign_id]);
      const ratePercent = campRes.rows.length ? Number(campRes.rows[0].return_percent || 0) : 0;
      const principal = Number(stake.amount || 0);
      const started = new Date(stake.started_at);
      const now = new Date();
      const msPerMonth = 30 * 24 * 60 * 60 * 1000;
      const months = Math.floor((now.getTime() - started.getTime()) / msPerMonth);

      const earnedResult = await client.query(
        `SELECT (($1::numeric * $2::numeric) * $3::numeric / 100)::numeric AS earned`,
        [principal, ratePercent, months]
      );
      const earned = Number(earnedResult.rows[0]?.earned || 0);
      const payout = Number((principal + earned).toFixed(12));

      const walletRes = await client.query('SELECT id, balance, staked_balance FROM wallets WHERE id = $1 FOR UPDATE', [stake.wallet_id]);
      if (!walletRes.rows.length) {
        throw new Error('Wallet not found');
      }
      const w = walletRes.rows[0];
      const ledgerBalances = await getWalletLedgerBalances(w.id);
      const availableBefore = Number(ledgerBalances['wallet.available'] ?? Number(w.balance || 0));
      const stakedBefore = Number(ledgerBalances['wallet.staked'] ?? Number(w.staked_balance || 0));
      const availableAfter = availableBefore + payout;
      const stakedAfter = stakedBefore - principal;

      await client.query('UPDATE wallets SET staked_balance = staked_balance - $1, balance = balance + $2, updated_at = now() WHERE id = $3', [principal, payout, w.id]);
      const journalId = randomUUID();
      await insertLedgerEntries(client, [
        {
          journalId,
          walletId: w.id,
          direction: 'debit',
          amount: payout,
          account: 'wallet.available',
          counterpartyAccount: 'wallet.staked',
          balanceBefore: availableBefore,
          balanceAfter: availableAfter,
          referenceId: stake_id,
          referenceType: 'user_stakes',
        },
        {
          journalId,
          walletId: w.id,
          direction: 'credit',
          amount: principal,
          account: 'wallet.staked',
          counterpartyAccount: 'wallet.available',
          balanceBefore: stakedBefore,
          balanceAfter: stakedAfter,
          referenceId: stake_id,
          referenceType: 'user_stakes',
        },
        {
          journalId,
          walletId: null,
          direction: 'credit',
          amount: earned,
          account: 'rewards.payable',
          counterpartyAccount: 'wallet.available',
          balanceBefore: null,
          balanceAfter: null,
          referenceId: stake_id,
          referenceType: 'user_stakes',
        },
      ]);

      await client.query('UPDATE user_stakes SET status = $1, withdrawn_at = now(), payout_amount = $2 WHERE id = $3', ['withdrawn', payout, stake_id]);

      const rewardId = randomUUID();
      await client.query(
        `INSERT INTO reward_ledger (reward_id, user_id, position_id, asset, principal, rate, calculation_period, reward_amount, status)
         VALUES ($1, $2, $3, 'USDT', $4, $5, $6, $7, 'completed')`,
        [rewardId, payload.userId, stake_id, principal, ratePercent, `unstake:${months}`, earned]
      );

      const response = { message: 'Unstaked', payout };
      if (requestId) {
        await client.query(
          `UPDATE idempotency_keys SET status = 'completed', response = $1, updated_at = now() WHERE request_id = $2`,
          [response, requestId]
        );
      }

      return response;
    });

    return res.status(200).json(result);
  } catch (err: any) {
    console.error(err);
    if (err.message === 'Stake not found') return res.status(404).json({ error: err.message });
    if (err.message === 'Stake not active') return res.status(400).json({ error: err.message });
    if (err.message === 'Not your stake') return res.status(403).json({ error: 'Not your stake' });
    if (err.message.startsWith('Stake locked')) return res.status(400).json({ error: err.message });
    if (err.message === 'Wallet not found') return res.status(500).json({ error: err.message });
    return res.status(500).json({ error: 'Failed to unstake' });
  }
}
