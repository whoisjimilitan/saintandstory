/**
 * B2B Daily Orchestration Endpoint
 *
 * Called by Vercel Cron at 02:00 UTC daily
 * Invokes the orchestrator and logs results
 */

import { NextRequest, NextResponse } from "next/server";
import { runDailyB2BOrchestration } from "@/lib/b2b-orchestrator";
import { neon } from "@neondatabase/serverless";

export const maxDuration = 300; // 5 minutes max execution

export async function POST(req: NextRequest) {
  // Verify request came from Vercel Cron
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // If CRON_SECRET is set, verify it matches
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.error("[B2B Orchestrator] Unauthorized cron request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[B2B Orchestrator] Starting daily autonomy cycle");

    // Run the orchestration
    const result = await runDailyB2BOrchestration();

    // Store execution log in database
    const sql = neon(process.env.DATABASE_URL!);

    try {
      const startedAt = new Date(result.timestamp);
      const completedAt = new Date();
      const durationMs = completedAt.getTime() - startedAt.getTime();

      await sql`
        CREATE TABLE IF NOT EXISTS b2b_orchestration_runs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          run_id TEXT NOT NULL UNIQUE,
          started_at TIMESTAMPTZ NOT NULL,
          completed_at TIMESTAMPTZ NOT NULL,
          discovery_count INTEGER,
          businesses_found INTEGER,
          leads_created INTEGER,
          drivers_matched INTEGER,
          emails_sent INTEGER,
          standing_orders_processed INTEGER,
          jobs_created INTEGER,
          failures TEXT[],
          status TEXT NOT NULL,
          duration_ms INTEGER,
          execution_details JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await sql`
        INSERT INTO b2b_orchestration_runs (
          run_id, started_at, completed_at, status, execution_details,
          discovery_count, businesses_found, leads_created,
          drivers_matched, emails_sent, standing_orders_processed,
          jobs_created, failures, duration_ms
        ) VALUES (
          ${result.executionId},
          ${startedAt.toISOString()},
          ${completedAt.toISOString()},
          ${result.success ? "success" : "partial_failure"},
          ${JSON.stringify(result)},
          ${result.stages.discovery.count},
          ${result.stages.discovery.count + result.stages.discovery.skipped},
          ${result.stages.discovery.count},
          ${result.stages.driverMatching.attempted},
          ${result.stages.driverMatching.succeeded},
          ${result.stages.standingOrders.created},
          ${result.stages.standingOrders.created},
          ${[
            ...result.stages.discovery.errors,
            ...result.stages.driverMatching.failed,
            ...result.stages.standingOrders.failed,
          ]},
          ${durationMs}
        )
      `;
    } catch (logError) {
      console.error(
        "[B2B Orchestrator] Failed to log execution:",
        logError instanceof Error ? logError.message : String(logError)
      );
    }

    console.log(
      `[B2B Orchestrator] Cycle complete. Status: ${result.success ? "✅ SUCCESS" : "⚠️ PARTIAL_FAILURE"}`
    );

    return NextResponse.json({
      success: result.success,
      executionId: result.executionId,
      timestamp: result.timestamp,
      durationMs: result.totalDurationMs,
      summary: {
        discoveryCount: result.stages.discovery.count,
        driverMatching: result.stages.driverMatching.attempted,
        jobsCreated: result.stages.standingOrders.created,
        status: result.success ? "success" : "partial_failure",
      },
    });
  } catch (err) {
    console.error(
      "[B2B Orchestrator] Fatal error:",
      err instanceof Error ? err.message : String(err)
    );

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Allow GET for health checks
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: "ready",
    endpoint: "/api/orchestrate/b2b-daily",
    method: "POST",
    schedule: "0 2 * * *",
    timezone: "UTC",
  });
}
