const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
  env = fs.readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .reduce((acc, line) => {
      const [key, ...rest] = line.split('=');
      if (!key || key.startsWith('#')) return acc;
      acc[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
      return acc;
    }, {});
}

const connectionString = env.DATABASE_URL || env.NEON_DATABASE_URL || process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL or NEON_DATABASE_URL is required');
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function main() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
      id serial PRIMARY KEY,
      email text UNIQUE NOT NULL,
      username text UNIQUE NOT NULL,
      full_name text NOT NULL DEFAULT '',
      password_hash text NOT NULL,
      email_verified boolean NOT NULL DEFAULT false,
      assigned_wallet_id integer NULL,
      assigned_wallet_address text UNIQUE NULL,
      wallet_address text UNIQUE,
      verification_token text,
      email_verification_token text,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

    const userColumns = await client.query(
      "SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('assigned_wallet_id','assigned_wallet_address','wallet_address','verification_token','email_verification_token','email_verified','full_name')"
    );
    const existingColumns = userColumns.rows.map((row) => row.column_name);
    const usersByColumn = userColumns.rows.reduce((acc, row) => {
      acc[row.column_name] = row;
      return acc;
    }, {});

    if (!existingColumns.includes('assigned_wallet_id')) {
      await client.query('ALTER TABLE users ADD COLUMN assigned_wallet_id integer');
      console.log('Added users.assigned_wallet_id');
    } else if (usersByColumn.assigned_wallet_id.is_nullable === 'NO') {
      await client.query('ALTER TABLE users ALTER COLUMN assigned_wallet_id DROP NOT NULL');
      console.log('Dropped NOT NULL on users.assigned_wallet_id');
    }
    if (!existingColumns.includes('assigned_wallet_address')) {
      await client.query('ALTER TABLE users ADD COLUMN assigned_wallet_address text');
      console.log('Added users.assigned_wallet_address');
    } else if (usersByColumn.assigned_wallet_address.is_nullable === 'NO') {
      await client.query('ALTER TABLE users ALTER COLUMN assigned_wallet_address DROP NOT NULL');
      console.log('Dropped NOT NULL on users.assigned_wallet_address');
    }
    if (!existingColumns.includes('wallet_address')) {
      await client.query('ALTER TABLE users ADD COLUMN wallet_address text');
      console.log('Added users.wallet_address');
    }
    if (!existingColumns.includes('verification_token')) {
      await client.query('ALTER TABLE users ADD COLUMN verification_token text');
      console.log('Added users.verification_token');
    }
    if (!existingColumns.includes('email_verification_token')) {
      await client.query('ALTER TABLE users ADD COLUMN email_verification_token text');
      console.log('Added users.email_verification_token');
    }
    if (!existingColumns.includes('full_name')) {
      await client.query("ALTER TABLE users ADD COLUMN full_name text NOT NULL DEFAULT ''");
      console.log('Added users.full_name');
    }

    await client.query(`
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
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );

      -- Trading tables removed

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
        detected_at timestamptz NOT NULL DEFAULT now()
      );
    `);

      // Ensure legacy `wallets` table is compatible with the new per-user wallet schema
      await client.query(`
        ALTER TABLE wallets
          ADD COLUMN IF NOT EXISTS user_id integer REFERENCES users(id) ON DELETE CASCADE,
          ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USDT',
          ADD COLUMN IF NOT EXISTS balance numeric NOT NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS locked_balance numeric NOT NULL DEFAULT 0,
          ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
          ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
      `);

      // Allow legacy pool rows to remain without an address for new user-wallet rows
      await client.query(`
        ALTER TABLE wallets
          ALTER COLUMN address DROP NOT NULL;
      `);

    await client.query(`
      ALTER TABLE withdrawal_requests
        ADD COLUMN IF NOT EXISTS wallet_id integer REFERENCES wallets(id) ON DELETE CASCADE;
    `);

    await client.query(`
      ALTER TABLE deposit_events
        ADD COLUMN IF NOT EXISTS wallet_id integer REFERENCES wallets(id) ON DELETE CASCADE;
    `);

    await client.query(`
      INSERT INTO wallets (user_id, currency, balance, locked_balance)
      SELECT u.id, 'USDT', 0, 0
      FROM users u
      WHERE NOT EXISTS (
        SELECT 1 FROM wallets w WHERE w.user_id = u.id AND w.currency = 'USDT'
      );
    `);

    await client.query(`
      UPDATE withdrawal_requests wr
      SET wallet_id = w.id
      FROM wallets w
      WHERE wr.wallet_id IS NULL
        AND wr.user_id = w.user_id
        AND w.currency = 'USDT';
    `);

    await client.query(`
      UPDATE deposit_events de
      SET wallet_id = w.id
      FROM wallets w
      WHERE de.wallet_id IS NULL
        AND de.user_id = w.user_id
        AND w.currency = 'USDT';
    `);

    await client.query(`
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

    await client.query(`
      ALTER TABLE wallet_pool
        ALTER COLUMN key_storage_path SET DEFAULT '',
        ALTER COLUMN status SET DEFAULT 'available',
        ALTER COLUMN updated_at SET DEFAULT now();
    `);

    await client.query(`
      UPDATE wallet_pool SET key_storage_path = '' WHERE key_storage_path IS NULL;
      UPDATE wallet_pool SET status = 'available' WHERE status IS NULL;
    `);

    await client.query(`
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

    console.log('Database schema checked and initialized.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
