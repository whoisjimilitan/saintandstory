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

    // Check lead distribution by niche
    const byNiche = await sql`
      SELECT niche, COUNT(*) as count
      FROM b2b_leads
      GROUP BY niche
      ORDER BY count DESC
    `;

    // Check recent leads (last 500)
    const recent = await sql`
      SELECT id, business_name, niche, created_at
      FROM b2b_leads
      ORDER BY created_at DESC
      LIMIT 10
    `;

    // Check facility_managers specifically
    const facilityMgrs = await sql`
      SELECT COUNT(*) as count
      FROM b2b_leads
      WHERE niche ILIKE '%facility%' OR business_category ILIKE '%facility%'
    `;

    return NextResponse.json({
      leads_by_niche: byNiche,
      facility_managers_variants: facilityMgrs[0],
      recent_10_leads: recent,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
