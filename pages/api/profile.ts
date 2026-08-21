import type { NextApiRequest, NextApiResponse } from 'next';
import { initDb, query, getCurrentWalletBalances } from '../../lib/db';
import { verifyJwt } from '../../lib/auth';
import { getStakeRewardPreview } from '../../lib/staking';
import {
  applyCorsHeaders,
  applySecurityHeaders,
  checkRateLimit,
  requireApiAuth,
  sanitizeText,
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

  if (checkRateLimit(req, { maxRequests: 120, windowMs: 60_000 })) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  const authPayload = requireApiAuth(req, res);
  if (!authPayload) {
    return;
  }

  const payload = authPayload as any;

  try {
    await initDb();

    if (req.method === 'POST') {
      const { full_name, username } = req.body as { full_name?: string; username?: string };
      const newName = sanitizeText(full_name, 120);
      const newUsername = sanitizeText(username, 24);

      if (!newName || !newUsername) {
        return res.status(400).json({ error: 'Full name and username are required.' });
      }

      if (!validateUsername(newUsername)) {
        return res.status(400).json({ error: 'Username format is invalid.' });
      }

      await query(
        `UPDATE users SET full_name = $1, username = $2, updated_at = now() WHERE id = $3`,
        [newName, newUsername, payload.userId]
      );

      const updated = await query(
        `SELECT id, email, username, full_name, email_verified, assigned_wallet_address, wallet_address, referral_code
         FROM users WHERE id = $1`,
        [payload.userId]
      );

      if (!updated.rows.length) {
        return res.status(404).json({ error: 'User not found after update.' });
      }

      const row = updated.rows[0];
      const walletRes = await query(`SELECT id, currency, balance, locked_balance, staked_balance FROM wallets WHERE user_id = $1 AND currency = 'USDT'`, [payload.userId]);
      const walletRow = walletRes.rows[0] || { id: null, currency: 'USDT', balance: '0', locked_balance: '0', staked_balance: '0' };
      const walletId = walletRow.id;
      const currentBalances = walletId ? await getCurrentWalletBalances(walletId) : { available_balance: 0, locked_balance: 0, staked_balance: 0 };
      const availableBalance = currentBalances.available_balance;
      const lockedBalance = currentBalances.locked_balance;
      const stakedBalance = currentBalances.staked_balance;
      const totalBalance = availableBalance + lockedBalance + stakedBalance;

      return res.status(200).json({
        message: 'Profile updated successfully.',
        user: {
          id: row.id,
          email: row.email,
          username: row.username,
          full_name: row.full_name,
          email_verified: row.email_verified,
          referral_code: row.referral_code,
          assigned_wallet_address: row.assigned_wallet_address,
          wallet_address: row.wallet_address,
          wallet_status: null,
          last_chain_sync_at: null,
          wallet: {
            id: walletRow.id,
            currency: walletRow.currency || 'USDT',
            balance: totalBalance.toString(),
            locked_balance: lockedBalance.toString(),
            staked_balance: stakedBalance.toString(),
            available_balance: availableBalance.toString(),
          },
          withdrawal_requests: [],
          deposit_events: [],
          referral_earnings: {
            total_bonus: '0',
            referral_count: 0,
            events: [],
          },
        },
      });
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const result = await query(
      `SELECT u.id, u.email, u.username, u.full_name, u.email_verified,
              u.assigned_wallet_address, u.wallet_address, u.referral_code,
              wp.status AS wallet_status, wp.last_chain_sync_at,
              w.id AS wallet_id, w.currency, w.balance AS wallet_balance, w.locked_balance, w.staked_balance
       FROM users u
       LEFT JOIN wallets w ON w.user_id = u.id AND w.currency = 'USDT'
       LEFT JOIN wallet_pool wp ON u.assigned_wallet_id = wp.id
       WHERE u.id = $1`,
      [payload.userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const withdrawals = await query(
      `SELECT id, amount, status, requested_at, withdrawal_address
       FROM withdrawal_requests
       WHERE user_id = $1
       ORDER BY requested_at DESC`,
      [payload.userId]
    );

    const deposits = await query(
      `SELECT id, previous_balance, new_balance, detected_at
       FROM deposit_events
       WHERE user_id = $1
       ORDER BY detected_at DESC`,
      [payload.userId]
    );

    const referralStats = await query(
      `SELECT COALESCE(SUM(bonus_amount), 0) AS total_bonus, COUNT(*) AS referral_count
       FROM referral_bonus_events
       WHERE referrer_user_id = $1`,
      [payload.userId]
    );

    const referralEvents = await query(
      `SELECT rbe.id, rbe.deposit_amount, rbe.bonus_amount, rbe.created_at,
              u.email AS referred_email, u.username AS referred_username
       FROM referral_bonus_events rbe
       LEFT JOIN users u ON u.id = rbe.referred_user_id
       WHERE rbe.referrer_user_id = $1
       ORDER BY rbe.created_at DESC`,
      [payload.userId]
    );

    const campaignsRes = await query(
      `SELECT id, name, return_percent, risk_level, min_amount
       FROM staking_campaigns
       WHERE is_active = true
       ORDER BY return_percent`,
      []
    );

    const allCampaignsRes = await query(
      `SELECT id, name, return_percent, risk_level, min_amount
       FROM staking_campaigns
       ORDER BY return_percent`,
      []
    );

    const stakesRes = await query(
      `SELECT id, campaign_id, amount, started_at, status, withdrawn_at, payout_amount, last_claimed_at, claimed_amount, lock_until
       FROM user_stakes
       WHERE user_id = $1
       ORDER BY started_at DESC`,
      [payload.userId]
    );

    const row = result.rows[0];
    const walletId = row.wallet_id;
    const currentBalances = walletId ? await getCurrentWalletBalances(walletId) : { available_balance: 0, locked_balance: 0, staked_balance: 0 };
    const availableBalance = currentBalances.available_balance;
    const lockedBalance = currentBalances.locked_balance;
    const stakedBalance = currentBalances.staked_balance;
    const totalBalance = availableBalance + lockedBalance + stakedBalance;
    const campaigns = campaignsRes.rows;
    const allCampaigns = allCampaignsRes.rows;
    const stakes = stakesRes.rows.map((s: any) => {
      const camp = allCampaigns.find((c: any) => c.id === s.campaign_id) || { return_percent: 0 };
      const preview = getStakeRewardPreview({
        amount: s.amount,
        startedAt: s.started_at,
        lastClaimedAt: s.last_claimed_at,
        ratePercent: camp.return_percent,
        lockUntil: s.lock_until,
      });

      return {
        ...s,
        campaign: camp,
        months_elapsed: preview.monthsElapsed,
        monthly_payout: preview.monthlyReward,
        earned: preview.claimableAmount,
        current_value: Number(s.amount || 0) + preview.claimableAmount,
        claimable_months: preview.claimableMonths,
        claimable_amount: preview.claimableAmount,
        lock_until: s.lock_until ? new Date(s.lock_until).toISOString() : null,
        locked: preview.locked,
        remaining_lock_days: preview.remainingLockDays,
      };
    });

    return res.status(200).json({
      user: {
        id: row.id,
        email: row.email,
        username: row.username,
        full_name: row.full_name,
        email_verified: row.email_verified,
        referral_code: row.referral_code,
        assigned_wallet_address: row.assigned_wallet_address,
        wallet_address: row.wallet_address,
        wallet_status: row.wallet_status,
        last_chain_sync_at: row.last_chain_sync_at,
        wallet: {
          id: row.wallet_id,
          currency: row.currency || 'USDT',
          balance: totalBalance.toString(),
          locked_balance: lockedBalance.toString(),
          staked_balance: stakedBalance.toString(),
          available_balance: availableBalance.toString(),
        },
        withdrawal_requests: withdrawals.rows,
        deposit_events: deposits.rows,
        referral_earnings: {
          total_bonus: referralStats.rows[0]?.total_bonus ?? '0',
          referral_count: Number(referralStats.rows[0]?.referral_count ?? 0),
          events: referralEvents.rows,
        },
      },
      campaigns,
      stakes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to load profile' });
  }
}
