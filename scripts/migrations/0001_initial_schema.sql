-- Initial production schema for the application

CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  full_name text NOT NULL DEFAULT '',
  password_hash text NOT NULL,
  email_verified boolean NOT NULL DEFAULT false,
  assigned_wallet_id integer REFERENCES wallet_pool(id) ON DELETE SET NULL,
  assigned_wallet_address text UNIQUE,
  wallet_address text UNIQUE,
  verification_token text,
  email_verification_token text,
  password_reset_token text,
  password_reset_expires_at timestamptz,
  referral_code text UNIQUE,
  referred_by_user_id integer REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallet_pool (
  id serial PRIMARY KEY,
  address text UNIQUE NOT NULL,
  encrypted_private_key text,
  key_storage_path text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'available',
  balance numeric NOT NULL DEFAULT 0,
  last_chain_sync_at timestamptz,
  assigned_to_user_id integer REFERENCES users(id) ON DELETE SET NULL,
  assigned_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallets (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  currency text NOT NULL DEFAULT 'USDT',
  balance numeric NOT NULL DEFAULT 0,
  locked_balance numeric NOT NULL DEFAULT 0,
  staked_balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_id integer NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deposit_events (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_id integer NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  previous_balance numeric NOT NULL,
  new_balance numeric NOT NULL,
  status text NOT NULL DEFAULT 'detected',
  confirmations integer NOT NULL DEFAULT 0,
  detected_at timestamptz NOT NULL DEFAULT now(),
  validated_at timestamptz,
  credited_at timestamptz
);

CREATE TABLE IF NOT EXISTS staking_campaigns (
  id serial PRIMARY KEY,
  name text NOT NULL,
  return_percent numeric NOT NULL,
  risk_level text NOT NULL,
  min_amount numeric NOT NULL DEFAULT 0,
  duration_days integer NOT NULL DEFAULT 30,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_stakes (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_id integer NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  campaign_id integer NOT NULL REFERENCES staking_campaigns(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active',
  withdrawn_at timestamptz,
  payout_amount numeric,
  last_claimed_at timestamptz,
  claimed_amount numeric NOT NULL DEFAULT 0,
  lock_until timestamptz
);

CREATE TABLE IF NOT EXISTS reward_ledger (
  id serial PRIMARY KEY,
  reward_id text UNIQUE NOT NULL,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position_id integer REFERENCES user_stakes(id) ON DELETE CASCADE,
  asset text NOT NULL DEFAULT 'USDT',
  principal numeric NOT NULL,
  rate numeric NOT NULL,
  calculation_period text NOT NULL,
  reward_amount numeric NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'completed'
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id serial PRIMARY KEY,
  journal_id text NOT NULL,
  wallet_id integer REFERENCES wallets(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('debit', 'credit')),
  amount numeric NOT NULL,
  account text NOT NULL,
  counterparty_account text NOT NULL,
  balance_before numeric,
  balance_after numeric,
  reference_id integer,
  reference_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ledger_entries_journal_id_idx ON ledger_entries (journal_id);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id serial PRIMARY KEY,
  wallet_id integer NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  type text NOT NULL,
  amount numeric NOT NULL,
  balance_before numeric NOT NULL,
  balance_after numeric NOT NULL,
  reference_id integer,
  reference_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  id serial PRIMARY KEY,
  request_id text UNIQUE NOT NULL,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  response jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referral_bonus_events (
  id serial PRIMARY KEY,
  referrer_user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deposit_amount numeric NOT NULL,
  bonus_amount numeric NOT NULL,
  deposit_event_id integer REFERENCES deposit_events(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
