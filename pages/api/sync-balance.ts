import type { NextApiRequest, NextApiResponse } from 'next';
import { initDb, query, withTransaction, insertLedgerEntries } from '../../lib/db';
import { getChainBalance, formatEther } from '../../lib/chain';
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

  if (checkRateLimit(req, { maxRequests: 30, windowMs: 60_000 })) {
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

  const requestId = typeof req.headers['x-idempotency-key'] === 'string'
    ? req.headers['x-idempotency-key'].trim()
    : req.body?.request_id
      ? String(req.body.request_id).trim()
      : '';
  const endpoint = 'wallet.sync_balance';

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

    const userResult = await query(`SELECT assigned_wallet_id, assigned_wallet_address, referred_by_user_id FROM users WHERE id = $1`, [payload.userId]);
    if (!userResult.rows.length || !userResult.rows[0].assigned_wallet_address) {
      return res.status(400).json({ error: 'No assigned wallet' });
    }

    const walletAddress = userResult.rows[0].assigned_wallet_address;

    let chainBalance: number;
    try {
      const balanceWei = await getChainBalance(walletAddress);
      chainBalance = Number(formatEther(balanceWei));
    } catch (rpcErr: any) {
      console.error('Chain RPC error', rpcErr);
      return res.status(502).json({ error: 'Failed to fetch on-chain balance' });
    }

    const response = await withTransaction(async (client) => {
      const wpRes = await client.query(`SELECT id, balance FROM wallet_pool WHERE address = $1 FOR UPDATE`, [walletAddress]);
      if (!wpRes.rows.length) {
        throw new Error('Assigned wallet not found in wallet pool');
      }

      const prevChainBalance = Number(wpRes.rows[0].balance || 0);
      const depositAmount = chainBalance > prevChainBalance ? chainBalance - prevChainBalance : 0;

      if (requestId) {
        await client.query(
          `INSERT INTO idempotency_keys (request_id, user_id, endpoint, status, created_at, updated_at)
           VALUES ($1, $2, $3, 'pending', now(), now())`,
          [requestId, payload.userId, endpoint]
        );
      }

      await client.query(
        `UPDATE wallet_pool SET balance = $1, last_chain_sync_at = now(), updated_at = now() WHERE id = $2`,
        [chainBalance, wpRes.rows[0].id]
      );

      let deposited = 0;
      if (depositAmount > 0) {
        const walletRes = await client.query(`SELECT id, balance FROM wallets WHERE user_id = $1 AND currency = 'USDT' FOR UPDATE`, [payload.userId]);
        let walletId: number;
        let previousBalance = 0;

        if (walletRes.rows.length) {
          walletId = walletRes.rows[0].id;
          previousBalance = Number(walletRes.rows[0].balance || 0);
          await client.query(`UPDATE wallets SET balance = balance + $1, updated_at = now() WHERE id = $2`, [depositAmount, walletId]);
        } else {
          const walletInsert = await client.query(
            `INSERT INTO wallets (user_id, currency, balance, locked_balance)
             VALUES ($1, 'USDT', $2, 0)
             RETURNING id`,
            [payload.userId, depositAmount]
          );
          walletId = walletInsert.rows[0].id;
        }

        const newBalance = previousBalance + depositAmount;
        const depositResult = await client.query(
          `INSERT INTO deposit_events (user_id, wallet_id, previous_balance, new_balance, status, confirmations, detected_at)
           VALUES ($1, $2, $3, $4, 'pending', 0, now()) RETURNING id`,
          [payload.userId, walletId, previousBalance, newBalance]
        );
        const depositEventId = depositResult.rows[0].id;

        await client.query(
          `UPDATE deposit_events SET status = 'credited', validated_at = now(), credited_at = now() WHERE id = $1`,
          [depositEventId]
        );

        const journalId = randomUUID();
        await insertLedgerEntries(client, [
          {
            journalId,
            walletId,
            direction: 'debit',
            amount: depositAmount,
            account: 'wallet.available',
            counterpartyAccount: 'chain.deposit',
            balanceBefore: previousBalance,
            balanceAfter: newBalance,
            referenceId: depositEventId,
            referenceType: 'deposit_events',
          },
          {
            journalId,
            walletId: null,
            direction: 'credit',
            amount: depositAmount,
            account: 'chain.deposit',
            counterpartyAccount: 'wallet.available',
            balanceBefore: null,
            balanceAfter: null,
            referenceId: depositEventId,
            referenceType: 'deposit_events',
          },
        ]);

        // legacy transaction logging kept for backward compatibility; primary accounting uses ledger entries.

        if (previousBalance === 0 && userResult.rows[0].referred_by_user_id) {
          const referrerId = userResult.rows[0].referred_by_user_id;
          const bonusAmountRow = await client.query(`SELECT ($1::numeric * 0.1)::numeric AS bonus_amount`, [depositAmount]);
          const bonusAmount = Number(bonusAmountRow.rows[0]?.bonus_amount || 0);

          if (bonusAmount > 0) {
            let refWalletId: number;
            const refWalletResult = await client.query(`SELECT id, balance FROM wallets WHERE user_id = $1 AND currency = 'USDT' FOR UPDATE`, [referrerId]);
            if (refWalletResult.rows.length) {
              refWalletId = refWalletResult.rows[0].id;
              const refBalanceBefore = Number(refWalletResult.rows[0].balance || 0);
              const refBalanceAfter = refBalanceBefore + bonusAmount;
              await client.query(`UPDATE wallets SET balance = balance + $1, updated_at = now() WHERE id = $2`, [bonusAmount, refWalletId]);
              const journalId = randomUUID();
              await insertLedgerEntries(client, [
                {
                  journalId,
                  walletId: refWalletId,
                  direction: 'debit',
                  amount: bonusAmount,
                  account: 'wallet.available',
                  counterpartyAccount: 'referral.payable',
                  balanceBefore: refBalanceBefore,
                  balanceAfter: refBalanceAfter,
                  referenceId: depositEventId,
                  referenceType: 'referral_bonus_events',
                },
                {
                  journalId,
                  walletId: null,
                  direction: 'credit',
                  amount: bonusAmount,
                  account: 'referral.payable',
                  counterpartyAccount: 'wallet.available',
                  balanceBefore: null,
                  balanceAfter: null,
                  referenceId: depositEventId,
                  referenceType: 'referral_bonus_events',
                },
              ]);
              // legacy transaction logging kept for backward compatibility; primary accounting uses ledger entries.
            } else {
              const insertRefWallet = await client.query(
                `INSERT INTO wallets (user_id, currency, balance, locked_balance)
                 VALUES ($1, 'USDT', $2, 0)
                 RETURNING id`,
                [referrerId, bonusAmount]
              );
              refWalletId = insertRefWallet.rows[0].id;
              const journalId = randomUUID();
              await insertLedgerEntries(client, [
                {
                  journalId,
                  walletId: refWalletId,
                  direction: 'debit',
                  amount: bonusAmount,
                  account: 'wallet.available',
                  counterpartyAccount: 'referral.payable',
                  balanceBefore: 0,
                  balanceAfter: bonusAmount,
                  referenceId: depositEventId,
                  referenceType: 'referral_bonus_events',
                },
                {
                  journalId,
                  walletId: null,
                  direction: 'credit',
                  amount: bonusAmount,
                  account: 'referral.payable',
                  counterpartyAccount: 'wallet.available',
                  balanceBefore: null,
                  balanceAfter: null,
                  referenceId: depositEventId,
                  referenceType: 'referral_bonus_events',
                },
              ]);
              // legacy transaction logging kept for backward compatibility; primary accounting uses ledger entries.
            }

            await client.query(
              `INSERT INTO referral_bonus_events (referrer_user_id, referred_user_id, deposit_amount, bonus_amount, deposit_event_id)
               VALUES ($1, $2, $3, $4, $5)`,
              [referrerId, payload.userId, depositAmount, bonusAmount, depositEventId]
            );
          }
        }

        deposited = depositAmount;
      }

      const result = { balance: chainBalance, walletAddress, deposited };
      if (requestId) {
        await client.query(
          `UPDATE idempotency_keys SET status = 'completed', response = $1, updated_at = now() WHERE request_id = $2`,
          [result, requestId]
        );
      }

      return result;
    });

    return res.status(200).json(response);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'Failed to sync balance' });
  }
}
