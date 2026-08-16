const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const env = {};
  if (!fs.existsSync(envPath)) return env;

  fs.readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .forEach((line) => {
      const [key, ...rest] = line.split('=');
      if (!key || key.startsWith('#')) return;
      env[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
    });

  return env;
}

async function main() {
  const env = Object.assign({}, process.env, loadEnv());
  const connectionString = env.DATABASE_URL || env.NEON_DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL or NEON_DATABASE_URL is required');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id serial PRIMARY KEY,
        filename text NOT NULL UNIQUE,
        applied_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      const { rows } = await client.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [file]);
      if (rows.length > 0) {
        console.log(`Skipped ${file} (already applied)`);
        continue;
      }

      console.log(`Applying migration ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`Applied ${file}`);
      } catch (migrationErr) {
        await client.query('ROLLBACK');
        throw migrationErr;
      }
    }

    console.log('All migrations applied.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err.message || err);
  process.exit(1);
});
