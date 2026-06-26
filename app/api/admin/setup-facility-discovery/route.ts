import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { ensureB2BSchema } from "@/lib/b2b-schema";

/**
 * Temporary endpoint: Sets up facility manager discovery and triggers orchestration
 * DELETE THIS ENDPOINT AFTER 2026-06-26
 */

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

const UK_CITIES = [
  "London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Liverpool",
  "Edinburgh", "Bristol", "Cardiff", "Belfast", "Sheffield", "Nottingham",
  "Leicester", "Coventry", "Bradford", "Bath", "Oxford", "Cambridge",
  "Reading", "Norwich", "Peterborough", "Southampton", "Portsmouth",
  "Newcastle", "Sunderland", "Hull", "Stoke-on-Trent", "Wolverhampton",
  "Slough"
];

export async function POST(request: NextRequest) {
  try {
    // Check auth
    const email = request.headers.get("x-admin-email");
    if (!email || !ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureB2BSchema();
    const sql = neon(process.env.DATABASE_URL!);

    console.log("[setup-facility-discovery] Creating config...");

    // 1. Create facility manager discovery config
    const config = await sql`
      INSERT INTO discovery_config (
        mode, niche, locations, enabled, priority, min_score, target_count, expires_at, created_by
      ) VALUES (
        'google_places', 'facility_managers', ${JSON.stringify(UK_CITIES)},
        true, 100, 40, 500, NOW() + INTERVAL '6 hours', 'admin'
      )
      ON CONFLICT DO NOTHING
      RETURNING id, niche, locations, enabled
    `;

    if (!config || config.length === 0) {
      return NextResponse.json({
        status: "skipped",
        message: "Config already exists",
      });
    }

    console.log("[setup-facility-discovery] Config created:", config[0].id);

    // 2. Check what will run
    const allConfigs = await sql`
      SELECT niche, priority, locations, target_count
      FROM discovery_config
      WHERE enabled = true AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY priority DESC
    `;

    return NextResponse.json({
      status: "success",
      config: config[0],
      activeConfigs: allConfigs.map((c: any) => ({
        niche: c.niche,
        priority: c.priority,
        cities: c.locations.length,
        target: c.target_count,
      })),
      nextSteps: [
        "1. Vercel auto-deployed the API fix",
        "2. Facility manager config is created and enabled",
        "3. Cron will run at 02:00 UTC tomorrow",
        "4. Results visible in /operator/pipeline by 07:00 UTC",
      ],
    });
  } catch (error) {
    console.error("[setup-facility-discovery] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// DELETE THIS ENDPOINT AFTER VERIFICATION
export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: "/api/admin/setup-facility-discovery",
    method: "POST",
    headers: { "x-admin-email": "whoisjimi.today@gmail.com" },
    note: "Temporary endpoint — DELETE AFTER 2026-06-26",
  });
}
