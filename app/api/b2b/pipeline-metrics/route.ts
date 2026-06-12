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
    const [discovered, enriched, qualified, leads, unqualified] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM discovered_businesses`,
      sql`SELECT COUNT(*) as count FROM enriched_businesses`,
      sql`SELECT COUNT(*) as count FROM qualified_businesses`,
      sql`SELECT COUNT(*) as count FROM b2b_leads WHERE source = 'discovery_promoted' OR source = 'discovery'`,
      sql`SELECT COUNT(*) as count FROM qualified_businesses WHERE promoted_to_lead_at IS NULL`,
    ]);

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

    // Top opportunities (unqualified but close)
    const topUnqualified = await sql`
      SELECT
        db.business_name,
        db.category,
        qb.opportunity_score,
        qb.score_breakdown,
        qb.confidence
      FROM qualified_businesses qb
      JOIN discovered_businesses db ON qb.discovered_business_id = db.id
      WHERE qb.promoted_to_lead_at IS NULL
      ORDER BY qb.opportunity_score DESC
      LIMIT 10
    `;

    return NextResponse.json({
      pipeline: {
        discovered: (discovered[0] as any).count,
        enriched: (enriched[0] as any).count,
        qualified: (qualified[0] as any).count,
        promoted_to_leads: (leads[0] as any).count,
        unqualified_but_scored: (unqualified[0] as any).count,
      },
      score_distribution: scoreDistribution,
      top_unqualified_opportunities: topUnqualified,
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}
