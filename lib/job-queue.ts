import { initDb, query } from './db';

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'retrying';

export type JobQueueRow = {
  id: number;
  type: string;
  payload: Record<string, any>;
  status: JobStatus;
  attempts: number;
  max_attempts: number;
  error: string | null;
  next_run_at: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export async function enqueueJob(
  jobType: string,
  payload: Record<string, any> = {},
  options: { maxAttempts?: number; runAt?: Date | string } = {}
): Promise<JobQueueRow> {
  await initDb();

  const maxAttempts = options.maxAttempts ?? 5;
  const runAt = options.runAt ? new Date(options.runAt) : new Date();

  const result = await query(
    `INSERT INTO job_queue (type, payload, status, attempts, max_attempts, next_run_at, created_at, updated_at)
     VALUES ($1, $2, 'queued', 0, $3, $4, now(), now())
     RETURNING *`,
    [jobType, payload || {}, maxAttempts, runAt.toISOString()]
  );

  return result.rows[0] as JobQueueRow;
}

export async function getPendingJobs(limit = 20): Promise<JobQueueRow[]> {
  await initDb();

  const result = await query(
    `SELECT *
     FROM job_queue
     WHERE status IN ('queued', 'retrying')
       AND next_run_at <= now()
     ORDER BY next_run_at ASC, created_at ASC
     LIMIT $1`,
    [limit]
  );

  return result.rows as JobQueueRow[];
}

export async function markJobProcessing(id: number): Promise<void> {
  await query(
    `UPDATE job_queue
     SET status = 'processing', attempts = attempts + 1, updated_at = now()
     WHERE id = $1`,
    [id]
  );
}

export async function markJobCompleted(id: number, result?: Record<string, any>): Promise<void> {
  await query(
    `UPDATE job_queue
     SET status = 'completed',
         completed_at = now(),
         updated_at = now(),
         result = $2::jsonb
     WHERE id = $1`,
    [id, result ?? {}]
  );
}

export async function markJobRetry(id: number, errorMessage: string, delayMs = 60000): Promise<void> {
  const nextRunAt = new Date(Date.now() + delayMs);
  await query(
    `UPDATE job_queue
     SET status = 'retrying',
         error = $2,
         next_run_at = $3,
         updated_at = now()
     WHERE id = $1`,
    [id, errorMessage, nextRunAt.toISOString()]
  );
}

export async function markJobFailed(id: number, errorMessage: string): Promise<void> {
  await query(
    `UPDATE job_queue
     SET status = 'failed',
         error = $2,
         updated_at = now(),
         completed_at = now()
     WHERE id = $1`,
    [id, errorMessage]
  );
}

export async function processPendingJobs(
  handlers: Record<string, (payload: any) => Promise<any>>,
  limit = 20
): Promise<Array<{ id: number; type: string; result?: any }>> {
  const jobs = await getPendingJobs(limit);
  const results: Array<{ id: number; type: string; result?: any }> = [];

  for (const job of jobs) {
    const handler = handlers[job.type];
    if (!handler) {
      await markJobFailed(job.id, `Unsupported job type: ${job.type}`);
      continue;
    }

    await markJobProcessing(job.id);

    try {
      const result = await handler(job.payload || {});
      await markJobCompleted(job.id, result);
      results.push({ id: job.id, type: job.type, result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const attemptsAfterProcessing = Number(job.attempts || 0) + 1;
      const maxAttempts = Number(job.max_attempts || 5);

      if (attemptsAfterProcessing >= maxAttempts) {
        await markJobFailed(job.id, message);
      } else {
        const backoffMs = Math.min(60 * 1000 * (2 ** (attemptsAfterProcessing - 1)), 10 * 60 * 1000);
        await markJobRetry(job.id, message, backoffMs);
      }
    }
  }

  return results;
}
