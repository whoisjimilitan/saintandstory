import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

async function isAdmin(request: NextRequest) {
  const email = request.headers.get("x-admin-email");
  return email && ADMIN_EMAILS.includes(email);
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);

    // 1. Check orchestration runs (did cron execute?)
    const runs = await sql`
      SELECT
        id, run_id, started_at, completed_at, status,
        discovery_count, leads_created, duration_ms
      FROM b2b_orchestration_runs
      ORDER BY started_at DESC
      LIMIT 5
    `;

    // 2. Check discovery configs (what configs exist?)
    const configs = await sql`
      SELECT
        id, niche, locations, enabled, priority, target_count,
        expires_at, created_at, updated_at
      FROM discovery_config
      ORDER BY created_at DESC
    `;

    // 3. Check active configs (what would run next?)
    const activeConfigs = await sql`
      SELECT
        id, niche, locations, priority, target_count, expires_at
      FROM discovery_config
      WHERE enabled = true AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY priority DESC
    `;

    // 4. Check b2b_leads (any new leads created recently?)
    const recentLeads = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as last_24h,
        COUNT(CASE WHEN niche = 'facility_managers' THEN 1 END) as facility_managers
      FROM b2b_leads
    `;

    // 5. Check current time
    const now = await sql`SELECT NOW() as current_time`;

    return NextResponse.json({
      timestamp: now[0].current_time,
      diagnostics: {
        cron_execution: {
          recent_runs: runs.length > 0 ? runs : "❌ No orchestration runs found",
          last_run: runs.length > 0 ? {
            started: runs[0].started_at,
            completed: runs[0].completed_at,
            status: runs[0].status,
            discoveries: runs[0].discovery_count,
            leads: runs[0].leads_created,
            duration_ms: runs[0].duration_ms,
          } : null,
        },
        discovery_configs: {
          total: configs.length,
          all: configs.map((c: any) => ({
            niche: c.niche,
            enabled: c.enabled,
            priority: c.priority,
            cities: c.locations?.length || 0,
            target: c.target_count,
            expires: c.expires_at,
            created: c.created_at,
          })),
        },
        active_configs: {
          count: activeConfigs.length,
          configs: activeConfigs.map((c: any) => ({
            niche: c.niche,
            priority: c.priority,
            cities: c.locations?.length || 0,
            target: c.target_count,
            expires_at: c.expires_at,
          })),
        },
        b2b_leads: {
          total: recentLeads[0].total,
          last_24h: recentLeads[0].last_24h,
          facility_managers: recentLeads[0].facility_managers,
        },
        issues_found: [
          runs.length === 0 ? "⚠️ No orchestration runs - cron may not be executing" : "✅ Cron runs found",
          activeConfigs.length === 0 ? "⚠️ No active configs - nothing will run next cron" : "✅ Active configs exist",
          recentLeads[0].facility_managers === 0 ? "⚠️ No facility_managers leads yet" : "✅ Facility managers leads found",
        ].filter(s => s.includes("⚠️")),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        hint: "Schema may not be initialized. This is expected if b2b_orchestration_runs doesn't exist yet.",
      },
      { status: 500 }
    );
  }
}
