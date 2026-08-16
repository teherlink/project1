import { Pool, PoolClient } from 'pg';
import { config } from './config';

const connectionString = config.databaseUrl;
const pool = new Pool({ connectionString });

export { pool };

export async function query(text: string, params?: Array<any>) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Rollback failed', rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function getLedgerBalanceByAccount(walletId: number, account: string) {
  const result = await query(
    `SELECT COALESCE(SUM(CASE WHEN direction = 'debit' THEN amount ELSE -amount END), 0) AS balance
     FROM ledger_entries
     WHERE wallet_id = $1 AND account = $2`,
    [walletId, account]
  );
  return Number(result.rows[0]?.balance || 0);
}

export async function getWalletLedgerBalances(walletId: number) {
  const result = await query(
    `SELECT account,
            COALESCE(SUM(CASE WHEN direction = 'debit' THEN amount ELSE -amount END), 0)::numeric AS balance
     FROM ledger_entries
     WHERE wallet_id = $1
     GROUP BY account`,
    [walletId]
  );
  return result.rows.reduce((acc: Record<string, number>, row: any) => {
    acc[row.account] = Number(row.balance || 0);
    return acc;
  }, {});
}

export async function getCurrentWalletBalances(walletId: number) {
  const balances = await getWalletLedgerBalances(walletId);
  return {
    available_balance: Number(balances['wallet.available'] ?? 0),
    locked_balance: Number(balances['wallet.locked'] ?? 0),
    staked_balance: Number(balances['wallet.staked'] ?? 0),
  };
}

export async function insertLedgerEntry(
  client: PoolClient,
  journalId: string,
  walletId: number | null,
  direction: 'debit' | 'credit',
  amount: number,
  account: string,
  counterpartyAccount: string,
  balanceBefore: number | null,
  balanceAfter: number | null,
  referenceId: number | null,
  referenceType: string | null
) {
  await client.query(
    `INSERT INTO ledger_entries
      (journal_id, wallet_id, direction, amount, account, counterparty_account, balance_before, balance_after, reference_id, reference_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [journalId, walletId, direction, amount, account, counterpartyAccount, balanceBefore, balanceAfter, referenceId, referenceType]
  );
}

export async function insertLedgerEntries(
  client: PoolClient,
  entries: Array<{
    journalId: string;
    walletId: number | null;
    direction: 'debit' | 'credit';
    amount: number;
    account: string;
    counterpartyAccount: string;
    balanceBefore: number | null;
    balanceAfter: number | null;
    referenceId: number | null;
    referenceType: string | null;
  }>
) {
  for (const entry of entries) {
    await insertLedgerEntry(
      client,
      entry.journalId,
      entry.walletId,
      entry.direction,
      entry.amount,
      entry.account,
      entry.counterpartyAccount,
      entry.balanceBefore,
      entry.balanceAfter,
      entry.referenceId,
      entry.referenceType
    );
  }
}

export async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id serial PRIMARY KEY,
      email text UNIQUE NOT NULL,
      username text UNIQUE NOT NULL,
      full_name text NOT NULL DEFAULT '',
      password_hash text NOT NULL,
      email_verified boolean NOT NULL DEFAULT false,
      assigned_wallet_id integer,
      assigned_wallet_address text UNIQUE,
      wallet_address text UNIQUE,
      verification_token text,
      email_verification_token text,
      password_reset_token text,
      password_reset_expires_at timestamptz,
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
      withdrawal_address text,
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

    CREATE TABLE IF NOT EXISTS job_queue (
      id serial PRIMARY KEY,
      type text NOT NULL,
      payload jsonb NOT NULL DEFAULT '{}'::jsonb,
      status text NOT NULL DEFAULT 'queued',
      attempts integer NOT NULL DEFAULT 0,
      max_attempts integer NOT NULL DEFAULT 5,
      error text,
      result jsonb,
      next_run_at timestamptz NOT NULL DEFAULT now(),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      completed_at timestamptz
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

    CREATE TABLE IF NOT EXISTS referral_bonus_events (
      id serial PRIMARY KEY,
      referrer_user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      referred_user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      deposit_amount numeric NOT NULL,
      bonus_amount numeric NOT NULL,
      deposit_event_id integer REFERENCES deposit_events(id) ON DELETE SET NULL,
      created_at timestamptz NOT NULL DEFAULT now()
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
  `);

  await query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS assigned_wallet_id integer,
      ADD COLUMN IF NOT EXISTS assigned_wallet_address text UNIQUE,
      ADD COLUMN IF NOT EXISTS wallet_address text UNIQUE,
      ADD COLUMN IF NOT EXISTS verification_token text,
      ADD COLUMN IF NOT EXISTS email_verification_token text,
      ADD COLUMN IF NOT EXISTS password_reset_token text,
      ADD COLUMN IF NOT EXISTS password_reset_expires_at timestamptz,
      ADD COLUMN IF NOT EXISTS full_name text NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS referral_code text,
      ADD COLUMN IF NOT EXISTS referred_by_user_id integer;
  `);

  await query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'users_referral_code_key'
          AND conrelid = 'users'::regclass
      ) THEN
        ALTER TABLE users ADD CONSTRAINT users_referral_code_key UNIQUE (referral_code);
      END IF;
    END
    $$;
  `);

  await query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'users_referred_by_user_id_fkey'
          AND conrelid = 'users'::regclass
      ) THEN
        ALTER TABLE users ADD CONSTRAINT users_referred_by_user_id_fkey
          FOREIGN KEY (referred_by_user_id) REFERENCES users(id) ON DELETE SET NULL;
      END IF;
    END
    $$;
  `);

  await query(`
    ALTER TABLE wallet_pool
      ADD COLUMN IF NOT EXISTS encrypted_private_key text,
      ADD COLUMN IF NOT EXISTS key_storage_path text NOT NULL DEFAULT '',
      ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'available',
      ADD COLUMN IF NOT EXISTS balance numeric NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_chain_sync_at timestamptz,
      ADD COLUMN IF NOT EXISTS assigned_to_user_id integer,
      ADD COLUMN IF NOT EXISTS assigned_at timestamptz,
      ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
  `);

  await query(`
    ALTER TABLE wallets
      ADD COLUMN IF NOT EXISTS staked_balance numeric NOT NULL DEFAULT 0;
  `);

  await query(`
    ALTER TABLE user_stakes
      ADD COLUMN IF NOT EXISTS withdrawn_at timestamptz,
      ADD COLUMN IF NOT EXISTS payout_amount numeric,
      ADD COLUMN IF NOT EXISTS last_claimed_at timestamptz,
      ADD COLUMN IF NOT EXISTS claimed_amount numeric NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS lock_until timestamptz;
  `);

  await query(`
    ALTER TABLE withdrawal_requests
      ADD COLUMN IF NOT EXISTS wallet_id integer REFERENCES wallets(id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS withdrawal_address text;
  `);

  await query(`
    ALTER TABLE deposit_events
      ADD COLUMN IF NOT EXISTS wallet_id integer REFERENCES wallets(id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'detected',
      ADD COLUMN IF NOT EXISTS confirmations integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS validated_at timestamptz,
      ADD COLUMN IF NOT EXISTS credited_at timestamptz;
  `);

  await query(`
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
  `);

  await query(`
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
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS job_queue (
      id serial PRIMARY KEY,
      type text NOT NULL,
      payload jsonb NOT NULL DEFAULT '{}'::jsonb,
      status text NOT NULL DEFAULT 'queued',
      attempts integer NOT NULL DEFAULT 0,
      max_attempts integer NOT NULL DEFAULT 5,
      error text,
      result jsonb,
      next_run_at timestamptz NOT NULL DEFAULT now(),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      completed_at timestamptz
    );
  `);

  await query(`
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
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS ledger_entries_journal_id_idx ON ledger_entries (journal_id);
  `);

  await query(`
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
  `);

  await query(`
    INSERT INTO wallets (user_id, currency, balance, locked_balance)
    SELECT u.id, 'USDT', 0, 0
    FROM users u
    WHERE NOT EXISTS (
      SELECT 1 FROM wallets w WHERE w.user_id = u.id AND w.currency = 'USDT'
    );
  `);

  await query(`
    UPDATE withdrawal_requests wr
    SET wallet_id = w.id
    FROM wallets w
    WHERE wr.wallet_id IS NULL
      AND wr.user_id = w.user_id
      AND w.currency = 'USDT';
  `);

  await query(`
    UPDATE deposit_events de
    SET wallet_id = w.id
    FROM wallets w
    WHERE de.wallet_id IS NULL
      AND de.user_id = w.user_id
      AND w.currency = 'USDT';
  `);

  await query(`
    ALTER TABLE wallet_pool
      ALTER COLUMN key_storage_path SET DEFAULT '',
      ALTER COLUMN status SET DEFAULT 'available',
      ALTER COLUMN updated_at SET DEFAULT now();
  `);

  await query(`
    UPDATE wallet_pool SET key_storage_path = '' WHERE key_storage_path IS NULL;
    UPDATE wallet_pool SET status = 'available' WHERE status IS NULL;
    UPDATE wallet_pool SET balance = 0 WHERE balance IS NULL;
  `);

  await query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'users_assigned_wallet_id_fkey'
          AND conrelid = 'users'::regclass
      ) THEN
        ALTER TABLE users ADD CONSTRAINT users_assigned_wallet_id_fkey FOREIGN KEY (assigned_wallet_id) REFERENCES wallet_pool(id);
      END IF;
    END
    $$;
  `);
}
