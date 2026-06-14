/**
 * Discovery Status Endpoint
 *
 * Real-time visibility into discovery engine operation
 * Shows what's running, what completed, and what was found
 */

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Get active discovery config
    const config = await sql`
      SELECT niche, locations, enabled, priority
      FROM discovery_config
      WHERE enabled = true
      ORDER BY priority DESC
    `;

    // Count discovered businesses by niche
    const discovered = await sql`
      SELECT
        niche,
        COUNT(*) as count,
        MAX(created_at) as last_discovered
      FROM discovered_businesses
      GROUP BY niche
      ORDER BY count DESC
    `;

    // Count new leads by discovery source
    const newLeads = await sql`
      SELECT
        niche,
        COUNT(*) as count,
        MAX(created_at) as last_added
      FROM b2b_leads
      WHERE source = 'discovery'
      GROUP BY niche
      ORDER BY count DESC
    `;

    // Latest orchestration run status
    const latestRun = await sql`
      SELECT
        id,
        run_id,
        status,
        execution_details,
        created_at
      FROM b2b_orchestration_logs
      ORDER BY created_at DESC
      LIMIT 1
    `;

    // Count duplicates skipped
    const duplicateStats = await sql`
      SELECT
        niche,
        COUNT(*) as count
      FROM discovered_businesses db
      WHERE EXISTS (
        SELECT 1 FROM b2b_leads bl
        WHERE bl.google_place_id = db.google_place_id
      )
      GROUP BY niche
    `;

    // Parse orchestration details
    const orchDetails = latestRun[0]?.execution_details
      ? typeof latestRun[0].execution_details === 'string'
        ? JSON.parse(latestRun[0].execution_details)
        : latestRun[0].execution_details
      : null;

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      active_config: config.map((c: any) => ({
        niche: c.niche,
        locations: c.locations,
        priority: c.priority,
      })),
      discovered: discovered.map((d: any) => ({
        niche: d.niche,
        count: d.count,
        last_discovered: d.last_discovered,
      })),
      new_leads: newLeads.map((l: any) => ({
        niche: l.niche,
        count: l.count,
        last_added: l.last_added,
      })),
      duplicates_skipped: duplicateStats.map((d: any) => ({
        niche: d.niche,
        count: d.count,
      })),
      latest_orchestration: {
        run_id: latestRun[0]?.run_id,
        status: latestRun[0]?.status,
        completed_at: latestRun[0]?.created_at,
        stages: orchDetails?.stages || null,
      },
    });
  } catch (error) {
    console.error("[Discovery Status] Error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
