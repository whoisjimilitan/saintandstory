/**
 * GET /api/v1/dashboard/morning-brief
 *
 * Aggregated Morning Brief data for Operator OS
 *
 * Returns:
 * - Top metrics (4 numbers)
 * - Pipeline breakdown (5 stage counts)
 * - Today's actions (array of pending tasks)
 * - Recent activity (20 most recent events)
 * - Metadata (lastUpdated timestamp, version)
 *
 * This is a thin presentation layer endpoint.
 * All business logic is in DashboardService and supporting services.
 */

import { NextResponse } from "next/server";
import { dashboardService } from "@/lib/b2b/dashboard-service";

export async function GET(request: Request) {
  try {
    // Optional: Add basic auth or rate limiting here
    // const apiKey = request.headers.get("x-api-key");
    // if (!apiKey) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get aggregated morning brief data
    const data = await dashboardService.getMorningBriefData();

    // Set cache headers
    // - Morning Brief is typically viewed multiple times per session
    // - Update frequency: real-time (no cache) or configurable later
    const response = NextResponse.json(data);
    response.headers.set("Content-Type", "application/json");
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");

    return response;
  } catch (error) {
    console.error("[Morning Brief API] Error:", error);

    return NextResponse.json(
      {
        error: "Failed to load morning brief",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Optional: Health check endpoint
 * GET /api/v1/dashboard/morning-brief/health
 */
export async function HEAD(request: Request) {
  try {
    const health = await dashboardService.healthCheck();

    if (!health.healthy) {
      return NextResponse.json(
        { healthy: false, errors: health.errors },
        { status: 503 }
      );
    }

    return NextResponse.json({ healthy: true }, { status: 200 });
  } catch (error) {
    console.error("[Morning Brief Health Check] Error:", error);
    return NextResponse.json({ healthy: false }, { status: 503 });
  }
}
