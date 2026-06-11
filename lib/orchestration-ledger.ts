/**
 * Operational Run Ledger
 *
 * Persistent record of every autonomous execution.
 * Operators can see: last run, next scheduled run, duration, failures.
 * No business logic - record-only.
 */

import { neon } from "@neondatabase/serverless";

export interface OrchestrationRunRecord {
  run_id: string;
  started_at: string;
  completed_at: string;
  discovery_count: number;
  businesses_found: number;
  leads_created: number;
  drivers_matched: number;
  emails_sent: number;
  standing_orders_processed: number;
  jobs_created: number;
  failures: string[];
  status: "success" | "partial_failure" | "failure";
  duration_ms: number;
}

export async function initializeLedger(): Promise<void> {
  const sql = neon(process.env.DATABASE_URL!);

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS b2b_orchestration_runs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        run_id TEXT NOT NULL UNIQUE,
        started_at TIMESTAMPTZ NOT NULL,
        completed_at TIMESTAMPTZ NOT NULL,

        discovery_count INTEGER DEFAULT 0,
        businesses_found INTEGER DEFAULT 0,
        leads_created INTEGER DEFAULT 0,
        drivers_matched INTEGER DEFAULT 0,
        emails_sent INTEGER DEFAULT 0,
        standing_orders_processed INTEGER DEFAULT 0,
        jobs_created INTEGER DEFAULT 0,

        failures TEXT[] DEFAULT ARRAY[]::TEXT[],
        status TEXT NOT NULL CHECK (status IN ('success', 'partial_failure', 'failure')),
        duration_ms INTEGER,

        execution_details JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Create indexes separately
    await sql`CREATE INDEX IF NOT EXISTS idx_runs_started_at ON b2b_orchestration_runs (started_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_runs_status ON b2b_orchestration_runs (status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_runs_run_id ON b2b_orchestration_runs (run_id)`;

    console.log("[Ledger] Orchestration runs table initialized");
  } catch (err) {
    // Table might already exist - ignore error
    if (!(err instanceof Error && err.message.includes("already exists"))) {
      console.error("[Ledger] Error initializing table:", err);
    }
  }
}

export async function recordRun(
  record: OrchestrationRunRecord
): Promise<void> {
  const sql = neon(process.env.DATABASE_URL!);

  try {
    await sql`
      INSERT INTO b2b_orchestration_runs (
        run_id, started_at, completed_at,
        discovery_count, businesses_found, leads_created,
        drivers_matched, emails_sent, standing_orders_processed,
        jobs_created, failures, status, duration_ms, execution_details
      ) VALUES (
        ${record.run_id},
        ${new Date(record.started_at).toISOString()},
        ${new Date(record.completed_at).toISOString()},
        ${record.discovery_count},
        ${record.businesses_found},
        ${record.leads_created},
        ${record.drivers_matched},
        ${record.emails_sent},
        ${record.standing_orders_processed},
        ${record.jobs_created},
        ${JSON.stringify(record.failures)},
        ${record.status},
        ${record.duration_ms},
        ${JSON.stringify(record)}
      )
    `;

    console.log(`[Ledger] Recorded run ${record.run_id}`);
  } catch (err) {
    console.error("[Ledger] Error recording run:", err);
    throw err;
  }
}

export async function getLastRun(): Promise<OrchestrationRunRecord | null> {
  const sql = neon(process.env.DATABASE_URL!);

  try {
    const results = await sql`
      SELECT
        run_id, started_at, completed_at,
        discovery_count, businesses_found, leads_created,
        drivers_matched, emails_sent, standing_orders_processed,
        jobs_created, failures, status,
        EXTRACT(EPOCH FROM (completed_at - started_at))::INTEGER as duration_ms
      FROM b2b_orchestration_runs
      ORDER BY started_at DESC
      LIMIT 1
    `;

    if (results.length === 0) return null;

    const row = results[0] as Record<string, unknown>;
    return {
      run_id: row.run_id as string,
      started_at: (row.started_at as Date).toISOString(),
      completed_at: (row.completed_at as Date).toISOString(),
      discovery_count: row.discovery_count as number,
      businesses_found: row.businesses_found as number,
      leads_created: row.leads_created as number,
      drivers_matched: row.drivers_matched as number,
      emails_sent: row.emails_sent as number,
      standing_orders_processed: row.standing_orders_processed as number,
      jobs_created: row.jobs_created as number,
      failures: (row.failures as string[]) || [],
      status: row.status as "success" | "partial_failure" | "failure",
      duration_ms: row.duration_ms as number,
    };
  } catch (err) {
    console.error("[Ledger] Error fetching last run:", err);
    return null;
  }
}

export async function getRunStats(): Promise<{
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  lastRun: OrchestrationRunRecord | null;
  averageDurationMs: number;
  nextScheduledRun: string;
}> {
  const sql = neon(process.env.DATABASE_URL!);

  try {
    const stats = await sql`
      SELECT
        COUNT(*) as total_runs,
        COUNT(*) FILTER (WHERE status = 'success') as successful_runs,
        COUNT(*) FILTER (WHERE status IN ('partial_failure', 'failure')) as failed_runs,
        AVG(duration_ms)::INTEGER as avg_duration_ms
      FROM b2b_orchestration_runs
    `;

    const lastRun = await getLastRun();

    // Calculate next scheduled run (02:00 UTC tomorrow)
    const now = new Date();
    const next = new Date(now);
    next.setUTCDate(next.getUTCDate() + 1);
    next.setUTCHours(2, 0, 0, 0);

    const row = stats[0] as Record<string, unknown>;
    return {
      totalRuns: Number(row.total_runs || 0),
      successfulRuns: Number(row.successful_runs || 0),
      failedRuns: Number(row.failed_runs || 0),
      lastRun,
      averageDurationMs: Number(row.avg_duration_ms || 0),
      nextScheduledRun: next.toISOString(),
    };
  } catch (err) {
    console.error("[Ledger] Error fetching stats:", err);
    return {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      lastRun: null,
      averageDurationMs: 0,
      nextScheduledRun: new Date().toISOString(),
    };
  }
}
