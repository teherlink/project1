import type { NextApiRequest, NextApiResponse } from 'next';
import { initDb, query, withTransaction, getWalletLedgerBalances, insertLedgerEntries } from '../../lib/db';
import { verifyJwt } from '../../lib/auth';
import { randomUUID } from 'crypto';
import {
  applyCorsHeaders,
  applySecurityHeaders,
  checkRateLimit,
  requireApiAuth,
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

  if (checkRateLimit(req, { maxRequests: 40, windowMs: 60_000 })) {
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
  const { amount, withdrawal_address } = req.body;
  const amountValue = Number(amount);
  const normalizedAddress = typeof withdrawal_address === 'string' ? withdrawal_address.trim() : '';
  const beP20AddressPattern = /^0x[a-fA-F0-9]{40}$/;

  if (!amount || Number.isNaN(amountValue) || amountValue <= 0 || amountValue > 1000000000) {
    return res.status(400).json({ error: 'Amount must be greater than 0' });
  }
  if (!normalizedAddress || !beP20AddressPattern.test(normalizedAddress)) {
    return res.status(400).json({ error: 'A valid BEP20 USDT wallet address is required.' });
  }

  const requestId = typeof req.headers['x-idempotency-key'] === 'string'
    ? req.headers['x-idempotency-key'].trim()
    : req.body?.request_id
      ? String(req.body.request_id).trim()
      : '';
  const endpoint = 'withdraw.submit';

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

      const walletResult = await client.query(
        `SELECT id, balance, locked_balance, staked_balance FROM wallets WHERE user_id = $1 AND currency = 'USDT' FOR UPDATE`,
        [payload.userId]
      );
      if (!walletResult.rows.length) {
        throw new Error('No USDT wallet available for withdrawals');
      }

      const wallet = walletResult.rows[0];
      const ledgerBalances = await getWalletLedgerBalances(wallet.id);
      const availableBalance = Number(ledgerBalances['wallet.available'] ?? Number(wallet.balance || 0));
      const lockedBalance = Number(ledgerBalances['wallet.locked'] ?? Number(wallet.locked_balance || 0));
      if (availableBalance < 10) {
        throw new Error('Available balance must be at least $10 to request a withdrawal');
      }
      if (amountValue > availableBalance) {
        throw new Error('Insufficient available balance for withdrawal');
      }

      await client.query(
        `UPDATE wallets SET locked_balance = locked_balance + $1, updated_at = now() WHERE id = $2`,
        [amountValue, wallet.id]
      );

      const userWpRes = await client.query(`SELECT assigned_wallet_id FROM users WHERE id = $1`, [payload.userId]);
      const walletPoolId = userWpRes.rows[0]?.assigned_wallet_id || null;
      const withdrawalInsert = await client.query(
        `INSERT INTO withdrawal_requests (user_id, wallet_pool_id, wallet_id, amount, withdrawal_address, status)
         VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING id`,
        [payload.userId, walletPoolId, wallet.id, amountValue, normalizedAddress]
      );

      const journalId = randomUUID();
      const availableBefore = availableBalance;
      const availableAfter = availableBalance - amountValue;
      const lockedBefore = lockedBalance;
      const lockedAfter = lockedBalance + amountValue;
      const withdrawalRequestId = withdrawalInsert.rows[0].id;
      await insertLedgerEntries(client, [
        {
          journalId,
          walletId: wallet.id,
          direction: 'debit',
          amount: amountValue,
          account: 'wallet.available',
          counterpartyAccount: 'wallet.locked',
          balanceBefore: availableBefore,
          balanceAfter: availableAfter,
          referenceId: withdrawalRequestId,
          referenceType: 'withdrawal_requests',
        },
        {
          journalId,
          walletId: wallet.id,
          direction: 'credit',
          amount: amountValue,
          account: 'wallet.locked',
          counterpartyAccount: 'wallet.available',
          balanceBefore: lockedBefore,
          balanceAfter: lockedAfter,
          referenceId: withdrawalRequestId,
          referenceType: 'withdrawal_requests',
        },
      ]);

      const response = { message: 'Withdrawal request submitted', withdrawal_id: withdrawalInsert.rows[0].id };
      if (requestId) {
        await client.query(
          `UPDATE idempotency_keys SET status = 'completed', response = $1, updated_at = now() WHERE request_id = $2`,
          [response, requestId]
        );
      }

      return response;
    });

    return res.status(201).json(result);
  } catch (error: any) {
    if (typeof error.message === 'string') {
      if (error.message.includes('No USDT wallet available')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message.includes('Available balance must be at least')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.message.includes('Insufficient available balance')) {
        return res.status(400).json({ error: error.message });
      }
    }
    console.error(error);
    return res.status(500).json({ error: 'Failed to submit withdrawal request' });
  }
}
