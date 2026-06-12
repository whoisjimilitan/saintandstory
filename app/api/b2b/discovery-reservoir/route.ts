import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { ensureB2BSchema } from "@/lib/b2b-schema";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk",
];

async function isAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  return ADMIN_EMAILS.includes(email);
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureB2BSchema();
  const sql = neon(process.env.DATABASE_URL!);

  try {
    // Count by discovery stage
    const [discovered, enriched, qualified, totalLeads, activeLeads, tierC, tierD, unqualified] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM discovered_businesses`,
      sql`SELECT COUNT(*) as count FROM enriched_businesses`,
      sql`SELECT COUNT(*) as count FROM qualified_businesses`,
      sql`SELECT COUNT(*) as count FROM b2b_leads WHERE source IN ('discovery_promoted', 'discovery')`,
      sql`SELECT COUNT(*) as count FROM b2b_leads WHERE source IN ('discovery_promoted', 'discovery') AND (lead_tier IS NULL OR lead_tier IN ('A', 'B'))`,
      sql`SELECT COUNT(*) as count FROM b2b_leads WHERE source IN ('discovery_promoted', 'discovery') AND lead_tier = 'C'`,
      sql`SELECT COUNT(*) as count FROM b2b_leads WHERE source IN ('discovery_promoted', 'discovery') AND lead_tier = 'D'`,
      sql`SELECT COUNT(*) as count FROM qualified_businesses WHERE promoted_to_lead_at IS NULL`,
    ]);

    // Discovery sources breakdown
    const sourceStats = await sql`
      SELECT source, COUNT(*) as count
      FROM discovered_businesses
      GROUP BY source
      ORDER BY count DESC
    `;

    // Mission success rates
    const missionStats = await sql`
      SELECT
        name,
        status,
        discoveries_found,
        businesses_qualified,
        leads_created,
        created_at
      FROM research_missions
      ORDER BY created_at DESC
      LIMIT 20
    `;

    // Opportunity signals detected
    const signalStats = await sql`
      SELECT signal_type, COUNT(*) as count
      FROM opportunity_signals
      GROUP BY signal_type
      ORDER BY count DESC
    `;

    // Top scoring unqualified
    const topUnqualified = await sql`
      SELECT
        db.business_name,
        db.category,
        qb.opportunity_score,
        qb.confidence,
        COUNT(os.id) as signal_count
      FROM qualified_businesses qb
      JOIN discovered_businesses db ON qb.discovered_business_id = db.id
      LEFT JOIN opportunity_signals os ON db.id = os.discovered_business_id
      WHERE qb.promoted_to_lead_at IS NULL
      GROUP BY qb.id, db.id
      ORDER BY qb.opportunity_score DESC
      LIMIT 10
    `;

    // Score distribution
    const scoreDistribution = await sql`
      SELECT
        COUNT(*) as count,
        CASE
          WHEN opportunity_score >= 80 THEN 'hot'
          WHEN opportunity_score >= 60 THEN 'warm'
          WHEN opportunity_score >= 40 THEN 'cool'
          ELSE 'cold'
        END as tier
      FROM qualified_businesses
      GROUP BY tier
    `;

    return NextResponse.json({
      reservoir: {
        discovered: (discovered[0] as any).count,
        enriched: (enriched[0] as any).count,
        qualified: (qualified[0] as any).count,
        leads_total: (totalLeads[0] as any).count,
        leads_active: (activeLeads[0] as any).count,
        leads_tier_c: (tierC[0] as any).count,
        leads_tier_d: (tierD[0] as any).count,
        unqualified_reserve: (unqualified[0] as any).count,
      },
      sources: sourceStats,
      missions: missionStats,
      signals: signalStats,
      score_distribution: scoreDistribution,
      top_unqualified: topUnqualified,
      metrics: {
        discovery_to_enrichment_ratio: (enriched[0] as any).count / Math.max((discovered[0] as any).count, 1),
        enrichment_to_qualification_ratio: (qualified[0] as any).count / Math.max((enriched[0] as any).count, 1),
        qualification_to_active_lead_ratio: (activeLeads[0] as any).count / Math.max((qualified[0] as any).count, 1),
        qualification_to_total_lead_ratio: (totalLeads[0] as any).count / Math.max((qualified[0] as any).count, 1),
        unqualified_percentage: (
          ((unqualified[0] as any).count / Math.max((qualified[0] as any).count, 1)) *
          100
        ).toFixed(1),
      },
    });
  } catch (error) {
    console.error("Error fetching reservoir metrics:", error);
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}
