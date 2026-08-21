ALTER TABLE staking_campaigns
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

UPDATE staking_campaigns
SET is_active = false
WHERE return_percent IN (5, 10, 20, 30);

UPDATE staking_campaigns
SET is_active = true,
    name = 'Fixed 8% Monthly APY'
WHERE return_percent = 8;