export type StakeRewardPreview = {
  principal: number;
  ratePercent: number;
  monthsElapsed: number;
  monthsClaimed: number;
  claimableMonths: number;
  monthlyReward: number;
  claimableAmount: number;
  locked: boolean;
  remainingLockDays: number;
};

export function getStakeRewardPreview(params: {
  amount: number | string;
  startedAt: string | Date;
  lastClaimedAt?: string | Date | null;
  ratePercent: number | string;
  lockUntil?: string | Date | null;
  now?: Date;
}): StakeRewardPreview {
  const principal = Number(params.amount || 0);
  const ratePercent = Number(params.ratePercent || 0);
  const now = params.now ?? new Date();
  const started = new Date(params.startedAt);
  const msPerMonth = 30 * 24 * 60 * 60 * 1000;
  const monthsElapsed = Math.max(0, Math.floor((now.getTime() - started.getTime()) / msPerMonth));

  let monthsClaimed = 0;
  if (params.lastClaimedAt) {
    const lastClaimed = new Date(params.lastClaimedAt);
    monthsClaimed = Math.max(0, Math.floor((lastClaimed.getTime() - started.getTime()) / msPerMonth));
  }

  const claimableMonths = Math.max(0, monthsElapsed - monthsClaimed);
  const monthlyReward = principal * (ratePercent / 100);
  const claimableAmount = claimableMonths * monthlyReward;

  const lockUntil = params.lockUntil ? new Date(params.lockUntil) : null;
  const locked = !!lockUntil && now < lockUntil;
  const remainingLockDays = lockUntil
    ? Math.max(0, Math.ceil((lockUntil.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
    : 0;

  return {
    principal,
    ratePercent,
    monthsElapsed,
    monthsClaimed,
    claimableMonths,
    monthlyReward,
    claimableAmount,
    locked,
    remainingLockDays,
  };
}
