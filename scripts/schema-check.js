const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
  env = fs.readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#'))
    .reduce((acc, line) => {
      const [key, ...rest] = line.split('=');
      acc[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
      return acc;
    }, {});
}

const connectionString = env.DATABASE_URL || env.NEON_DATABASE_URL || process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL or NEON_DATABASE_URL required');
  process.exit(1);
}

const pool = new Pool({ connectionString });

(async () => {
  const client = await pool.connect();
  try {
    const res = await client.query(
      "SELECT table_name,column_name,data_type,udt_name FROM information_schema.columns WHERE table_name IN ('users','wallet_pool','wallets','withdrawal_requests','deposit_events','staking_campaigns','user_stakes') ORDER BY table_name,column_name"
    );
    console.log('columns:', JSON.stringify(res.rows, null, 2));

    const fk = await client.query(
      "SELECT conname, conrelid::regclass AS table, confrelid::regclass AS referenced_table, pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE contype = 'f' AND conrelid IN ('wallet_pool'::regclass, 'wallets'::regclass, 'withdrawal_requests'::regclass, 'deposit_events'::regclass, 'user_stakes'::regclass)"
    );
    console.log('fks:', JSON.stringify(fk.rows, null, 2));
  } finally {
    client.release();
    await pool.end();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
