import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];

export async function GET(request: NextRequest) {
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

  try {
    // METRIC 1: Knowledge Capture Adoption
    const adoptionData = await sql`
      SELECT
        COUNT(*) FILTER (WHERE array_length(human_observations, 1) > 0)::float /
        NULLIF(COUNT(*), 0)::float * 100 as adoption_rate,
        COUNT(*) FILTER (WHERE array_length(human_observations, 1) > 0) as leads_with_observations,
        COUNT(*) as total_leads
      FROM b2b_leads
      WHERE lead_state = 'self_confirmed'
        AND created_at >= DATE_TRUNC('month', NOW())
    `;

    // METRIC 2: Standing Order Operational Completeness
    const completenessData = await sql`
      SELECT
        COUNT(*) FILTER (WHERE pickup_postcode IS NOT NULL AND delivery_postcode IS NOT NULL)::float /
        NULLIF(COUNT(*), 0)::float * 100 as completeness_rate,
        COUNT(*) FILTER (WHERE pickup_postcode IS NOT NULL AND delivery_postcode IS NOT NULL) as complete_orders,
        COUNT(*) as total_orders
      FROM b2b_standing_orders
      WHERE created_at >= DATE_TRUNC('month', NOW())
    `;

    // METRIC 3: Fulfillment Readiness
    const fulfillmentData = await sql`
      SELECT
        COUNT(*) FILTER (WHERE last_generated_at IS NOT NULL)::float /
        NULLIF(COUNT(*), 0)::float * 100 as fulfillment_rate,
        COUNT(*) FILTER (WHERE last_generated_at IS NOT NULL) as generated_orders,
        COUNT(*) as total_orders
      FROM b2b_standing_orders
      WHERE created_at >= DATE_TRUNC('month', NOW())
    `;

    // METRIC 4: Observation Usage
    const observationData = await sql`
      SELECT
        AVG(array_length(human_observations, 1))::float as avg_observations,
        COUNT(*) FILTER (WHERE array_length(human_observations, 1) > 0) as leads_with_observations,
        COUNT(*) as total_leads,
        MAX((human_observations)[array_length(human_observations, 1)]->>'recorded_at') as latest_observation_time
      FROM b2b_leads
      WHERE lead_state = 'self_confirmed'
        AND created_at >= DATE_TRUNC('month', NOW())
    `;

    // METRIC 5: Revenue Flow Completeness
    const revenueData = await sql`
      SELECT
        COUNT(DISTINCT so.id)::float as total_standing_orders,
        COUNT(DISTINCT CASE WHEN j.id IS NOT NULL THEN so.id END)::float as orders_with_jobs,
        COUNT(DISTINCT CASE WHEN j.status = 'completed' THEN j.id END)::float as completed_jobs,
        COUNT(DISTINCT CASE WHEN j.status = 'cancelled' THEN j.id END)::float as cancelled_jobs
      FROM b2b_standing_orders so
      LEFT JOIN jobs j ON j.lead_id = so.lead_id
      WHERE so.created_at >= DATE_TRUNC('month', NOW())
    `;

    // METRIC 6: Operational Efficiency Gain
    const efficiencyData = await sql`
      SELECT
        AVG(j.completed_at - so.created_at)::text as avg_time,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (j.completed_at - so.created_at))::text as median_time,
        MIN(j.completed_at - so.created_at)::text as fastest_time,
        MAX(j.completed_at - so.created_at)::text as slowest_time,
        COUNT(*) as completed_jobs
      FROM b2b_standing_orders so
      JOIN jobs j ON j.lead_id = so.lead_id
      WHERE so.created_at >= DATE_TRUNC('month', NOW())
        AND j.status = 'completed'
        AND j.completed_at IS NOT NULL
    `;

    const adoption = adoptionData[0] as any;
    const completeness = completenessData[0] as any;
    const fulfillment = fulfillmentData[0] as any;
    const observation = observationData[0] as any;
    const revenue = revenueData[0] as any;
    const efficiency = efficiencyData[0] as any;

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      metrics: {
        knowledge_capture_adoption: {
          value: parseFloat(adoption.adoption_rate || "0").toFixed(1),
          unit: "%",
          target: "50%",
          leads_with_observations: adoption.leads_with_observations || 0,
          total_leads: adoption.total_leads || 0,
          status: (parseFloat(adoption.adoption_rate || "0") >= 50) ? "success" : "warning"
        },
        standing_order_completeness: {
          value: parseFloat(completeness.completeness_rate || "0").toFixed(1),
          unit: "%",
          target: "100%",
          complete_orders: completeness.complete_orders || 0,
          total_orders: completeness.total_orders || 0,
          status: (parseFloat(completeness.completeness_rate || "0") >= 100) ? "success" : "warning"
        },
        fulfillment_readiness: {
          value: parseFloat(fulfillment.fulfillment_rate || "0").toFixed(1),
          unit: "%",
          target: "100%",
          generated_orders: fulfillment.generated_orders || 0,
          total_orders: fulfillment.total_orders || 0,
          status: (parseFloat(fulfillment.fulfillment_rate || "0") >= 100) ? "success" : "warning"
        },
        observation_usage: {
          value: (observation.avg_observations || 0).toFixed(2),
          unit: "avg",
          target: "2+",
          leads_with_observations: observation.leads_with_observations || 0,
          total_leads: observation.total_leads || 0,
          latest_observation: observation.latest_observation_time,
          status: (parseFloat(observation.avg_observations || "0") >= 2) ? "success" : "warning"
        },
        revenue_flow_completeness: {
          jobs_generated_percent: revenue.total_standing_orders > 0
            ? (((revenue.orders_with_jobs || 0) / revenue.total_standing_orders) * 100).toFixed(1)
            : "0",
          jobs_completed_percent: revenue.orders_with_jobs > 0
            ? (((revenue.completed_jobs || 0) / revenue.orders_with_jobs) * 100).toFixed(1)
            : "0",
          jobs_cancelled_percent: revenue.orders_with_jobs > 0
            ? (((revenue.cancelled_jobs || 0) / revenue.orders_with_jobs) * 100).toFixed(1)
            : "0",
          total_standing_orders: revenue.total_standing_orders || 0,
          target: "90%+",
          status: (parseFloat(revenue.orders_with_jobs || "0") / (revenue.total_standing_orders || 1)) >= 0.9 ? "success" : "warning"
        },
        operational_efficiency: {
          avg_time: efficiency.avg_time || "N/A",
          median_time: efficiency.median_time || "N/A",
          fastest_time: efficiency.fastest_time || "N/A",
          slowest_time: efficiency.slowest_time || "N/A",
          completed_jobs: efficiency.completed_jobs || 0,
          target: "< 7 days (median)",
          status: efficiency.completed_jobs > 0 ? "success" : "pending"
        }
      }
    });
  } catch (error) {
    console.error("[Knowledge Loop Metrics API] Error:", error);
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}
