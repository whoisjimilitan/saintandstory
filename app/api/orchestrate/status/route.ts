/**
 * Orchestration Status Dashboard API
 *
 * For operators: see last run, next scheduled run, health metrics
 * No business logic - read-only operational view
 */

import { NextRequest, NextResponse } from "next/server";
import { getRunStats } from "@/lib/orchestration-ledger";

export async function GET(req: NextRequest) {
  try {
    const stats = await getRunStats();

    return NextResponse.json({
      operational: true,
      schedule: "Daily at 02:00 UTC",
      statistics: {
        totalRuns: stats.totalRuns,
        successfulRuns: stats.successfulRuns,
        failedRuns: stats.failedRuns,
        successRate: stats.totalRuns > 0
          ? Math.round((stats.successfulRuns / stats.totalRuns) * 100)
          : 0,
        averageDurationMs: stats.averageDurationMs,
      },
      lastRun: stats.lastRun ? {
        runId: stats.lastRun.run_id,
        startedAt: stats.lastRun.started_at,
        completedAt: stats.lastRun.completed_at,
        durationMs: stats.lastRun.duration_ms,
        status: stats.lastRun.status,
        summary: {
          discovered: stats.lastRun.businesses_found,
          leadsCreated: stats.lastRun.leads_created,
          driversMatched: stats.lastRun.drivers_matched,
          jobsCreated: stats.lastRun.jobs_created,
          failures: stats.lastRun.failures.length > 0
            ? stats.lastRun.failures
            : null,
        },
      } : null,
      nextScheduledRun: stats.nextScheduledRun,
    });
  } catch (err) {
    return NextResponse.json(
      {
        operational: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
