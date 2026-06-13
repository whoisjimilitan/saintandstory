import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { getCategoryLearnings } from "@/lib/learning-outcomes";

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

    // Driver-triggered discovery metrics
    const driverData = await sql`
      SELECT
        COUNT(DISTINCT driver_id) as total_drivers,
        COUNT(*) FILTER (WHERE driver_id IS NOT NULL) as leads_discovered_by_drivers,
        COUNT(*) FILTER (WHERE driver_id IS NOT NULL AND email_sent_at IS NOT NULL) as emails_sent_by_drivers
      FROM b2b_leads
      WHERE created_at >= DATE_TRUNC('month', NOW())
    `;

    const leads_result = leadsData[0] as any || { total_leads: 0, leads_with_pain: 0 };
    const so_result = standaloneOrdersData[0] as any || { total_standing_orders: 0 };
    const jobs_result = jobsData[0] as any || { total_jobs: 0 };
    const driver_result = driverData[0] as any || { total_drivers: 0, leads_discovered_by_drivers: 0, emails_sent_by_drivers: 0 };

    const leads_discovered = Number(leads_result.total_leads || 0);
    const leads_with_pain = Number(leads_result.leads_with_pain || 0);
    const standing_orders_created = Number(so_result.total_standing_orders || 0);
    const jobs_generated = Number(jobs_result.total_jobs || 0);

    // Calculate averages safely
    const avg_pain_penetration = leads_discovered > 0
      ? Math.round((leads_with_pain / leads_discovered) * 100)
      : 0;

    const drivers_active = Number(driver_result.total_drivers || 0);
    const leads_by_drivers = Number(driver_result.leads_discovered_by_drivers || 0);
    const emails_sent = Number(driver_result.emails_sent_by_drivers || 0);

    // Get category-specific learning outcomes
    const topCategories = await sql`
      SELECT DISTINCT business_category
      FROM b2b_learning_outcomes
      WHERE created_at >= DATE_TRUNC('month', NOW())
      ORDER BY business_category
    `;

    const categoryLearnings: Record<string, any> = {};
    for (const row of topCategories) {
      const category = row.business_category as string;
      const learning = await getCategoryLearnings(sql, category);
      if (learning.totalOutcomes > 0) {
        categoryLearnings[category] = {
          outcomes: learning.totalOutcomes,
          conversion_rate: Math.round(learning.conversionRate * 100),
          avg_winning_score: learning.averageScoreForConversion,
          avg_days_to_convert: learning.averageDaysToConversion,
          score_ranges: learning.scoreRanges,
        };
      }
    }

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
        },
        drivers_active: {
          value: drivers_active,
          target: "1+",
          status: drivers_active >= 1 ? "success" : "pending"
        },
        driver_discovery: {
          value: leads_by_drivers,
          label: "Leads discovered by drivers",
          target: "5+",
          status: leads_by_drivers >= 5 ? "success" : "pending"
        },
        driver_emails_sent: {
          value: emails_sent,
          label: "Recognition emails sent",
          target: "5+",
          status: emails_sent >= 5 ? "success" : "pending"
        }
      },
      learning_insights: categoryLearnings,
      learning_status: Object.keys(categoryLearnings).length > 0 ? "active" : "initializing"
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
        jobs_generated: { value: 0, target: "1+", status: "pending" },
        drivers_active: { value: 0, target: "1+", status: "pending" },
        driver_discovery: { value: 0, label: "Leads discovered by drivers", target: "5+", status: "pending" },
        driver_emails_sent: { value: 0, label: "Recognition emails sent", target: "5+", status: "pending" }
      }
    });
  }
}
