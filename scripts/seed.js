const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { randomUUID } = require('crypto');

const walletSeedPath = path.join(__dirname, '..', 'wallet_pool_seed.json');

if (!fs.existsSync(walletSeedPath)) {
  console.error('Missing wallet_pool_seed.json in project root');
  process.exit(1);
}

const seedData = JSON.parse(fs.readFileSync(walletSeedPath, 'utf8'));
if (!Array.isArray(seedData)) {
  console.error('wallet_pool_seed.json must be an array of wallet addresses');
  process.exit(1);
}

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
  console.error('DATABASE_URL or NEON_DATABASE_URL is required in environment');
  process.exit(1);
}

const pool = new Pool({ connectionString });

async function initDatabase() {
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
        assigned_wallet_id integer,
        assigned_wallet_address text UNIQUE,
        wallet_address text UNIQUE,
        verification_token text,
        email_verification_token text,
        created_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS wallet_pool (
        id serial PRIMARY KEY,
        address text UNIQUE NOT NULL,
        encrypted_private_key text,
        key_storage_path text NOT NULL DEFAULT '',
        status text NOT NULL DEFAULT 'available',
        assigned_to_user_id integer REFERENCES users(id) ON DELETE SET NULL,
        assigned_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    for (const address of seedData) {
      await client.query(
        `INSERT INTO wallet_pool (address, key_storage_path, status) VALUES ($1, '', 'available')
         ON CONFLICT (address) DO NOTHING`,
        [address]
      );
    }

    console.log(`Seeded ${seedData.length} wallet addresses into the database.`);
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase().catch((error) => {
  console.error(error);
  process.exit(1);
});
