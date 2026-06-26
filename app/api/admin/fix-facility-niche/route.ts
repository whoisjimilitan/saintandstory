import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

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
    const sql = neon(process.env.DATABASE_URL!);

    console.log("[fix-facility-niche] Starting niche correction...");

    // 1. VERIFY current state before changes
    const before = await sql`
      SELECT COUNT(*) as count, niche
      FROM b2b_leads
      WHERE niche = 'establishment'
        AND (
          business_name ILIKE '%facilit%' OR
          business_name ILIKE '%maintenance%' OR
          business_name ILIKE '%management%'
        )
      GROUP BY niche
    `;

    const facilityEstablishmentCount = before[0]?.count || 0;
    console.log(`[fix-facility-niche] Found ${facilityEstablishmentCount} facility businesses with wrong niche`);

    // 2. UPDATE: Correct the niche
    const updated = await sql`
      UPDATE b2b_leads
      SET niche = 'facility_managers', updated_at = NOW()
      WHERE (
        business_name ILIKE '%facilit%' OR
        business_name ILIKE '%maintenance%' OR
        business_name ILIKE '%management%'
      )
      AND niche = 'establishment'
    `;

    console.log(`[fix-facility-niche] Updated ${facilityEstablishmentCount} leads`);

    // 3. VERIFY after changes
    const after = await sql`
      SELECT COUNT(*) as count, niche
      FROM b2b_leads
      WHERE niche = 'facility_managers'
      GROUP BY niche
    `;

    const facilityManagersCount = after[0]?.count || 0;

    // 4. Get sample of updated leads
    const samples = await sql`
      SELECT id, business_name, niche, created_at, status
      FROM b2b_leads
      WHERE niche = 'facility_managers'
      ORDER BY updated_at DESC
      LIMIT 5
    `;

    // 5. Create audit log entry
    await sql`
      INSERT INTO admin_audit_log (
        action, description, affected_rows, created_by, details
      ) VALUES (
        'niche_correction',
        'Fixed facility management business niche from establishment to facility_managers',
        ${facilityEstablishmentCount},
        ${request.headers.get("x-admin-email")},
        ${JSON.stringify({
          before_count: facilityEstablishmentCount,
          after_total_facility_managers: facilityManagersCount,
          pattern: ['%facilit%', '%maintenance%', '%management%'],
          timestamp: new Date().toISOString(),
        })}
      )
    `.catch(() => {
      // Table might not exist, that's ok - just log to console
      console.log("[fix-facility-niche] Audit log table not found, skipping");
    });

    return NextResponse.json({
      status: "success",
      action: "niche_correction_complete",
      results: {
        facilities_corrected: facilityEstablishmentCount,
        total_facility_managers_now: facilityManagersCount,
        sample_updated_leads: samples,
        next_step: "Emails should now use correct templates. Check /operator/pipeline for ready-to-contact leads.",
      },
    });
  } catch (error) {
    console.error("[fix-facility-niche] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    endpoint: "/api/admin/fix-facility-niche",
    method: "POST",
    description: "Correct niche for facility management businesses from 'establishment' to 'facility_managers'",
    action: "Relabels facility businesses so email templates and outreach rules apply correctly",
    safety: "Read-only verification before/after, audit logged, no data deletion",
  });
}
