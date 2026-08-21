INSERT INTO staking_campaigns (name, return_percent, risk_level, min_amount, duration_days)
SELECT 'Fixed 8% Monthly APY', 8, 'standard', 10, 30
WHERE NOT EXISTS (
  SELECT 1 FROM staking_campaigns WHERE return_percent = 8
);
