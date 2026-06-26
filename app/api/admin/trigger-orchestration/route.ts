import { NextRequest, NextResponse } from "next/server";
import { runDailyB2BOrchestration } from "@/lib/b2b-orchestrator";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

async function isAdmin(request: NextRequest) {
  const email = request.headers.get("x-admin-email");
  return email && ADMIN_EMAILS.includes(email);
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[manual-trigger] Starting orchestration...");
    const startTime = Date.now();

    const result = await runDailyB2BOrchestration();

    const duration = Date.now() - startTime;

    return NextResponse.json({
      status: "success",
      executionId: result.executionId,
      timestamp: result.timestamp,
      durationMs: duration,
      summary: {
        discoveries: result.stages.discovery.count,
        leadsCreated: result.stages.discovery.count,
        driverMatching: result.stages.driverMatching.succeeded,
        standingOrdersCreated: result.stages.standingOrders.created,
        jobsCreated: result.stages.standingOrders.created,
      },
      details: {
        discovery: {
          attempted: result.stages.discovery.attempted,
          succeeded: result.stages.discovery.count,
          skipped: result.stages.discovery.skipped,
          errors: result.stages.discovery.errors,
        },
        driverMatching: {
          attempted: result.stages.driverMatching.attempted,
          succeeded: result.stages.driverMatching.succeeded,
          failed: result.stages.driverMatching.failed,
        },
        standingOrders: {
          created: result.stages.standingOrders.created,
          failed: result.stages.standingOrders.failed,
        },
      },
      nextSteps: [
        "✅ Orchestration completed successfully",
        "📊 Results are being written to database",
        "👀 Check /operator/pipeline to see new prospects",
        "📅 Check /operator TODAY page to see today's activity",
      ],
    });
  } catch (error) {
    console.error("[manual-trigger] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        status: "failed",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    endpoint: "/api/admin/trigger-orchestration",
    method: "POST",
    auth: { header: "x-admin-email", value: "whoisjimi.today@gmail.com" },
    description: "Manually trigger the daily B2B orchestration pipeline now",
    note: "Results will appear in /operator/pipeline and /operator TODAY page",
  });
}
