import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];

export async function GET() {
  try {
    // Auth check
    const { userId } = await auth();
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress ?? "";

    if (!userId || !ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const sql = neon(process.env.DATABASE_URL);

    // Simple, safe aggregations
    const leadsData = await sql`
      SELECT
        COUNT(*) as total_leads,
        COUNT(*) FILTER (WHERE pain_point IS NOT NULL) as leads_with_pain
      FROM b2b_leads
      WHERE created_at >= DATE_TRUNC('month', NOW())
    `;

    const standaloneOrdersData = await sql`
      SELECT COUNT(*) as total_standing_orders
      FROM b2b_standing_orders
      WHERE created_at >= DATE_TRUNC('month', NOW())
    `;

    const jobsData = await sql`
      SELECT COUNT(*) as total_jobs
      FROM jobs
      WHERE created_at >= DATE_TRUNC('month', NOW())
    `;

    const leads_result = leadsData[0] as any || { total_leads: 0, leads_with_pain: 0 };
    const so_result = standaloneOrdersData[0] as any || { total_standing_orders: 0 };
    const jobs_result = jobsData[0] as any || { total_jobs: 0 };

    const leads_discovered = Number(leads_result.total_leads || 0);
    const leads_with_pain = Number(leads_result.leads_with_pain || 0);
    const standing_orders_created = Number(so_result.total_standing_orders || 0);
    const jobs_generated = Number(jobs_result.total_jobs || 0);

    // Calculate averages safely
    const avg_pain_penetration = leads_discovered > 0
      ? Math.round((leads_with_pain / leads_discovered) * 100)
      : 0;

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      metrics: {
        leads_discovered: {
          value: leads_discovered,
          target: "10+",
          status: leads_discovered >= 10 ? "success" : "pending"
        },
        leads_with_pain: {
          value: leads_with_pain,
          target: "5+",
          status: leads_with_pain >= 5 ? "success" : "pending"
        },
        pain_penetration: {
          value: avg_pain_penetration,
          unit: "%",
          target: "50%+",
          status: avg_pain_penetration >= 50 ? "success" : "warning"
        },
        standing_orders: {
          value: standing_orders_created,
          target: "2+",
          status: standing_orders_created >= 2 ? "success" : "pending"
        },
        jobs_generated: {
          value: jobs_generated,
          target: "1+",
          status: jobs_generated >= 1 ? "success" : "pending"
        }
      }
    });
  } catch (err) {
    console.error("[Knowledge Loop Metrics] Error:", err);
    // Return safe empty state instead of error
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      metrics: {
        leads_discovered: { value: 0, target: "10+", status: "pending" },
        leads_with_pain: { value: 0, target: "5+", status: "pending" },
        pain_penetration: { value: 0, unit: "%", target: "50%+", status: "pending" },
        standing_orders: { value: 0, target: "2+", status: "pending" },
        jobs_generated: { value: 0, target: "1+", status: "pending" }
      }
    });
  }
}
