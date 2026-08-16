import type { NextApiRequest, NextApiResponse } from 'next';
import { initDb, pool, getWalletLedgerBalances, insertLedgerEntries } from '../../../lib/db';
import { verifyJwt } from '../../../lib/auth';
import { enqueueJob } from '../../../lib/job-queue';
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
  const endpoint = 'staking.claim';

  await initDb();
  const client = await pool.connect();
  try {
    if (requestId) {
      const idempotencyRow = await client.query(
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

    await client.query('BEGIN');

    if (requestId) {
      await client.query(
        `INSERT INTO idempotency_keys (request_id, user_id, endpoint, status, created_at, updated_at)
         VALUES ($1, $2, $3, 'pending', now(), now())`,
        [requestId, payload.userId, endpoint]
      );
    }

    const stakeRes = await client.query('SELECT s.*, c.return_percent FROM user_stakes s JOIN staking_campaigns c ON c.id = s.campaign_id WHERE s.id = $1 FOR UPDATE', [stake_id]);
    if (!stakeRes.rows.length) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Stake not found' }); }
    const stake = stakeRes.rows[0];
    if (stake.user_id !== payload.userId) { await client.query('ROLLBACK'); return res.status(403).json({ error: 'Not your stake' }); }
    if (stake.status !== 'active') { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Stake not active' }); }

    const principal = Number(stake.amount || 0);
    const ratePercent = Number(stake.return_percent || 0);
    const rate = ratePercent / 100;

    const started = new Date(stake.started_at);
    const now = new Date();
    const msPerMonth = 30 * 24 * 60 * 60 * 1000;
    const months = Math.floor((now.getTime() - started.getTime()) / msPerMonth);

    let monthsClaimed = 0;
    if (stake.last_claimed_at) {
      const lc = new Date(stake.last_claimed_at);
      monthsClaimed = Math.floor((lc.getTime() - started.getTime()) / msPerMonth);
      if (monthsClaimed < 0) monthsClaimed = 0;
    }
    const claimableMonths = Math.max(0, months - monthsClaimed);
    if (claimableMonths <= 0) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Nothing to claim' }); }

    const earnedResult = await client.query(
      `SELECT (($1::numeric * $2::numeric) * $3::numeric / 100)::numeric AS earned`,
      [principal, ratePercent, claimableMonths]
    );
    const earned = Number(earnedResult.rows[0]?.earned || 0);

    const walletRes = await client.query('SELECT id, balance FROM wallets WHERE id = $1 FOR UPDATE', [stake.wallet_id]);
    if (!walletRes.rows.length) { await client.query('ROLLBACK'); return res.status(500).json({ error: 'Wallet not found' }); }
    const w = walletRes.rows[0];
    const ledgerBalances = await getWalletLedgerBalances(w.id);
    const availableBefore = Number(ledgerBalances['wallet.available'] ?? Number(w.balance || 0));
    const availableAfter = availableBefore + earned;

    await client.query('UPDATE wallets SET balance = balance + $1, updated_at = now() WHERE id = $2', [earned, w.id]);
    await insertLedgerEntries(client, [
      {
        journalId: randomUUID(),
        walletId: w.id,
        direction: 'debit',
        amount: earned,
        account: 'wallet.available',
        counterpartyAccount: 'rewards.payable',
        balanceBefore: availableBefore,
        balanceAfter: availableAfter,
        referenceId: stake_id,
        referenceType: 'user_stakes',
      },
      {
        journalId: randomUUID(),
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

    await client.query(
      `UPDATE user_stakes SET last_claimed_at = now(), claimed_amount = COALESCE(claimed_amount,0) + $1 WHERE id = $2`,
      [earned, stake_id]
    );

    const rewardId = randomUUID();
    await client.query(
      `INSERT INTO reward_ledger (reward_id, user_id, position_id, asset, principal, rate, calculation_period, reward_amount, status)
       VALUES ($1, $2, $3, 'USDT', $4, $5, $6, $7, 'completed')`,
      [rewardId, payload.userId, stake_id, principal, ratePercent, `claim:${claimableMonths}`, earned]
    );

    const response = { message: 'Claimed', earned, claimableMonths };
    if (requestId) {
      await client.query(
        `UPDATE idempotency_keys SET status = 'completed', response = $1, updated_at = now() WHERE request_id = $2`,
        [response, requestId]
      );
    }

    await enqueueJob('staking.reward_claim', {
      userId: payload.userId,
      stakeId: stake_id,
      amount: earned,
      requestId,
      endpoint,
    }, { maxAttempts: 5 });

    await client.query('COMMIT');
    return res.status(200).json(response);
  } catch (err: any) {
    try { await client.query('ROLLBACK'); } catch (e) {}
    console.error(err);
    return res.status(500).json({ error: 'Failed to claim' });
  } finally {
    client.release();
  }
}
