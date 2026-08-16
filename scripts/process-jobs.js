const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

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
  try {
    const jobs = await pool.query(
      `SELECT *
       FROM job_queue
       WHERE status IN ('queued', 'retrying')
         AND next_run_at <= now()
       ORDER BY next_run_at ASC, created_at ASC
       LIMIT 20`
    );

    for (const job of jobs.rows) {
      const jobType = job.type;
      const payload = job.payload || {};
      try {
        await pool.query('BEGIN');
        await pool.query(
          `UPDATE job_queue
           SET status = 'processing', attempts = attempts + 1, updated_at = now()
           WHERE id = $1`,
          [job.id]
        );

        let result = {};
        if (jobType === 'email.verification') {
          const { sendVerificationEmail } = await import('../lib/email.ts');
          result = { sent: true, email: payload.email };
          await sendVerificationEmail(payload.email, payload.token);
        } else if (jobType === 'email.password_reset') {
          const { sendPasswordResetEmail } = await import('../lib/email.ts');
          result = { sent: true, email: payload.email };
          await sendPasswordResetEmail(payload.email, payload.token);
        } else if (jobType === 'staking.reward_claim') {
          result = { processed: true, userId: payload.userId, stakeId: payload.stakeId, amount: payload.amount };
        } else {
          throw new Error(`Unsupported job type: ${jobType}`);
        }

        await pool.query(
          `UPDATE job_queue
           SET status = 'completed',
               result = $2::jsonb,
               completed_at = now(),
               updated_at = now()
           WHERE id = $1`,
          [job.id, JSON.stringify(result)]
        );
        await pool.query('COMMIT');
        console.log(`Completed job ${job.id} (${jobType})`);
      } catch (error) {
        await pool.query('ROLLBACK');
        const message = error && error.message ? error.message : String(error);
        const attemptsAfterProcessing = Number(job.attempts || 0) + 1;
        const maxAttempts = Number(job.max_attempts || 5);

        if (attemptsAfterProcessing >= maxAttempts) {
          await pool.query(
            `UPDATE job_queue
             SET status = 'failed', error = $2, updated_at = now(), completed_at = now()
             WHERE id = $1`,
            [job.id, message]
          );
          console.error(`Job ${job.id} failed permanently: ${message}`);
        } else {
          const backoffMs = Math.min(60 * 1000 * (2 ** (attemptsAfterProcessing - 1)), 10 * 60 * 1000);
          const nextRunAt = new Date(Date.now() + backoffMs);
          await pool.query(
            `UPDATE job_queue
             SET status = 'retrying', error = $2, next_run_at = $3, updated_at = now()
             WHERE id = $1`,
            [job.id, message, nextRunAt.toISOString()]
          );
          console.warn(`Job ${job.id} failed. Retry scheduled for ${nextRunAt.toISOString()}`);
        }
      }
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Job processor failed:', err && err.message ? err.message : err);
  process.exit(1);
});
