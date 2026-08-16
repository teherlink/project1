import type { NextApiRequest, NextApiResponse } from 'next';
import { initDb, query } from '../../../lib/db';
import { verifyJwt } from '../../../lib/auth';
import { getStakeRewardPreview } from '../../../lib/staking';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing auth' });
  let payload: any;
  try { payload = verifyJwt(auth.slice('Bearer '.length)); } catch (e) { return res.status(401).json({ error: 'Invalid token' }); }

  try {
    await initDb();
    const camps = await query(`SELECT id, name, return_percent, risk_level, min_amount FROM staking_campaigns ORDER BY return_percent`);
    const stakesRes = await query(`SELECT id, campaign_id, amount, started_at, status, withdrawn_at, payout_amount, last_claimed_at, claimed_amount, lock_until FROM user_stakes WHERE user_id = $1 ORDER BY started_at DESC`, [payload.userId]);
    const campaigns = camps.rows;
    const stakes = stakesRes.rows.map((s: any) => {
      const camp = campaigns.find((c: any) => c.id === s.campaign_id) || { return_percent: 0 };
      const preview = getStakeRewardPreview({
        amount: s.amount,
        startedAt: s.started_at,
        lastClaimedAt: s.last_claimed_at,
        ratePercent: camp.return_percent,
        lockUntil: s.lock_until,
      });
      const principal = Number(s.amount || 0);
      const monthly = preview.monthlyReward;
      const earned = preview.claimableMonths * monthly;
      const current_value = principal + earned;
      return {
        ...s,
        campaign: camp,
        months_elapsed: preview.monthsElapsed,
        monthly_payout: monthly,
        earned,
        current_value,
        claimable_months: preview.claimableMonths,
        claimable_amount: preview.claimableAmount,
        lock_until: s.lock_until ? new Date(s.lock_until).toISOString() : null,
        locked: preview.locked,
        remaining_lock_days: preview.remainingLockDays,
      };
    });
    return res.status(200).json({ campaigns, stakes });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to load staking', detail: err.message });
  }
}
