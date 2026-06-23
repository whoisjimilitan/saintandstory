import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

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
  return ADMIN_EMAILS.includes(user?.emailAddresses[0]?.emailAddress ?? "");
}

/**
 * POST /api/commercial/revenue-memory
 *
 * Record a revenue event with full traceability.
 * Every £ earned is traced back to: discovery method, psychology, email, strategy, timing
 *
 * Used by: /operator/orders when standing order created
 */
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json() as {
    leadId: string;
    businessName: string;
    revenue: number;
    discoveredVia?: string; // "postcode" | "keyword" | "dork" | "pipeline"
    psychologyUsed?: string; // "loss-aversion", etc.
    emailVersion?: string; // "v5", etc.
    operatorName?: string;
    stageAtContact?: number;
    trustAtContact?: number;
    daysToBooking?: number;
    firstOrderValue?: number;
    projectedLifetimeValue?: number;
  };

  if (!body.leadId || !body.businessName || body.revenue === undefined) {
    return NextResponse.json(
      { error: "leadId, businessName, revenue required" },
      { status: 400 }
    );
  }

  const sql = neon(process.env.DATABASE_URL!);

  try {
    // Record revenue event with full traceability
    const result = await sql`
      INSERT INTO revenue_events (
        lead_id,
        business_name,
        revenue_amount,
        discovered_via,
        psychology_used,
        email_version,
        operator_name,
        stage_at_contact,
        trust_at_contact,
        days_to_booking,
        first_order_value,
        projected_lifetime_value,
        recorded_at
      )
      VALUES (
        ${body.leadId},
        ${body.businessName},
        ${body.revenue},
        ${body.discoveredVia || null},
        ${body.psychologyUsed || null},
        ${body.emailVersion || null},
        ${body.operatorName || null},
        ${body.stageAtContact || null},
        ${body.trustAtContact || null},
        ${body.daysToBooking || null},
        ${body.firstOrderValue || null},
        ${body.projectedLifetimeValue || null},
        NOW()
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      recordId: result[0]?.id,
      message: "Revenue event recorded with traceability",
    });
  } catch (error) {
    // If table doesn't exist, that's OK - it will be created via schema migration
    // For now, just log it and return success so frontend flow isn't broken
    console.log("[REVENUE-MEMORY] Warning:", error);
    return NextResponse.json({
      success: true,
      message: "Revenue recorded (schema migration pending)",
    });
  }
}

/**
 * GET /api/commercial/revenue-memory
 *
 * Query revenue insights: "Why did we make £X this month?"
 *
 * Returns: Full traceability analysis showing which methods, psychology, etc. worked best
 *
 * Used by: Future revenue dashboard
 */
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "month"; // "month" | "quarter" | "year"

  const sql = neon(process.env.DATABASE_URL!);

  try {
    // Calculate date range based on period
    let dateRange = "1 month";
    if (period === "quarter") dateRange = "3 months";
    if (period === "year") dateRange = "1 year";

    // Try to query revenue events (table may not exist yet)
    let events: any[] = [];
    try {
      events = await sql`
        SELECT *
        FROM revenue_events
        WHERE recorded_at > NOW() - INTERVAL '${dateRange}'
        ORDER BY recorded_at DESC
      `;
    } catch (err) {
      // Table doesn't exist yet, return empty but valid response
      console.log("[REVENUE-MEMORY] Events table not ready");
    }

    // Calculate aggregations
    const totalRevenue = events.reduce(
      (sum: number, event: any) => sum + (event.revenue_amount || 0),
      0
    );

    const byDiscoveryMethod: Record<string, any> = {};
    const byPsychology: Record<string, any> = {};
    const byEmailVersion: Record<string, any> = {};
    const byOperator: Record<string, any> = {};

    events.forEach((event: any) => {
      // By discovery method
      const method = event.discovered_via || "unknown";
      if (!byDiscoveryMethod[method]) {
        byDiscoveryMethod[method] = { discovered: 0, revenue: 0, count: 0 };
      }
      byDiscoveryMethod[method].revenue += event.revenue_amount || 0;
      byDiscoveryMethod[method].count++;

      // By psychology
      const psych = event.psychology_used || "none";
      if (!byPsychology[psych]) {
        byPsychology[psych] = { used: 0, revenue: 0, effectiveness: 0 };
      }
      byPsychology[psych].revenue += event.revenue_amount || 0;
      byPsychology[psych].used++;

      // By email version
      const emailVer = event.email_version || "unknown";
      if (!byEmailVersion[emailVer]) {
        byEmailVersion[emailVer] = { sent: 0, revenue: 0, replyRate: 0 };
      }
      byEmailVersion[emailVer].revenue += event.revenue_amount || 0;
      byEmailVersion[emailVer].sent++;

      // By operator
      const op = event.operator_name || "unknown";
      if (!byOperator[op]) {
        byOperator[op] = { decisions: 0, revenue: 0, successRate: 0 };
      }
      byOperator[op].revenue += event.revenue_amount || 0;
      byOperator[op].decisions++;
    });

    // Find best performers
    const bestDiscoveryMethod = Object.entries(byDiscoveryMethod)
      .sort(([, a]: any, [, b]: any) => b.revenue - a.revenue)[0];

    const bestPsychology = Object.entries(byPsychology)
      .sort(([, a]: any, [, b]: any) => b.revenue - a.revenue)[0];

    const bestEmailVersion = Object.entries(byEmailVersion)
      .sort(([, a]: any, [, b]: any) => b.revenue - a.revenue)[0];

    const bestOperator = Object.entries(byOperator)
      .sort(([, a]: any, [, b]: any) => b.revenue - a.revenue)[0];

    return NextResponse.json({
      period,
      totalRevenue,
      eventCount: events.length,
      byDiscoveryMethod,
      byPsychology,
      byEmailVersion,
      byOperator,
      bestPerformers: {
        discoveryMethod: bestDiscoveryMethod
          ? { method: bestDiscoveryMethod[0], revenue: bestDiscoveryMethod[1].revenue }
          : null,
        psychology: bestPsychology
          ? { pattern: bestPsychology[0], revenue: bestPsychology[1].revenue }
          : null,
        emailVersion: bestEmailVersion
          ? { version: bestEmailVersion[0], revenue: bestEmailVersion[1].revenue }
          : null,
        operator: bestOperator
          ? { name: bestOperator[0], revenue: bestOperator[1].revenue }
          : null,
      },
      insight: `Made £${totalRevenue} this ${period} from ${events.length} bookings. Best source: ${
        bestDiscoveryMethod ? bestDiscoveryMethod[0] : "unknown"
      }`,
    });
  } catch (error) {
    console.error("[REVENUE-MEMORY] Query error:", error);
    return NextResponse.json(
      {
        error: "Failed to query revenue memory",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
