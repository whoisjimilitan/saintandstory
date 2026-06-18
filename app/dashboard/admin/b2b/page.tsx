import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];

interface BriefingData {
  awaiting_response: {
    count: number;
    revenue_impact: number;
  };
  orders_requiring_intervention: {
    count: number;
    revenue_at_risk: number;
  };
  new_opportunities: {
    count: number;
  };
  system_status: {
    total_prospects: number;
    total_orders: number;
    total_revenue_monthly: number;
  };
  recent_learning: string;
}

async function getBriefingData(): Promise<BriefingData> {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('[B2B] DATABASE_URL not configured');
      return getDefaultBriefing();
    }

    const sql = neon(process.env.DATABASE_URL);

    let awaiting_response = { count: 0, revenue_impact: 0 };
    let orders_requiring_intervention = { count: 0, revenue_at_risk: 0 };
    let new_opportunities = { count: 0 };
    let system_status = { total_prospects: 0, total_orders: 0, total_revenue_monthly: 0 };

    try {
      const awaitingResult = await sql`
        SELECT COUNT(DISTINCT lead_id) as count
        FROM b2b_outreach
        WHERE event_type = 'email_opened'
        AND NOT EXISTS (
          SELECT 1 FROM b2b_outreach o2
          WHERE o2.lead_id = b2b_outreach.lead_id
          AND o2.event_type = 'reply_received'
        )
        AND created_at > NOW() - INTERVAL '7 days'
      `;
      awaiting_response.count = awaitingResult[0]?.count || 0;
      awaiting_response.revenue_impact = awaiting_response.count * 250;
    } catch (err) {
      console.warn('[B2B] Failed to fetch awaiting response');
    }

    try {
      const ordersResult = await sql`
        SELECT
          COUNT(*) as count,
          COALESCE(SUM(CAST(revenue_potential as INTEGER)), 0) as revenue
        FROM b2b_standing_orders
        WHERE status IN ('blocked', 'attention_required')
      `;
      orders_requiring_intervention.count = ordersResult[0]?.count || 0;
      orders_requiring_intervention.revenue_at_risk = ordersResult[0]?.revenue || 0;
    } catch (err) {
      console.warn('[B2B] Failed to fetch orders requiring intervention');
    }

    try {
      const newResult = await sql`
        SELECT COUNT(*) as count
        FROM b2b_leads
        WHERE status = 'new'
      `;
      new_opportunities.count = newResult[0]?.count || 0;
    } catch (err) {
      console.warn('[B2B] Failed to fetch new opportunities');
    }

    try {
      const statusResult = await sql`
        SELECT
          (SELECT COUNT(*) FROM b2b_leads) as total_prospects,
          (SELECT COUNT(*) FROM b2b_standing_orders) as total_orders,
          COALESCE(
            (SELECT SUM(CAST(revenue_potential as INTEGER)) FROM b2b_standing_orders WHERE status = 'healthy'),
            0
          ) as total_revenue
      `;
      system_status.total_prospects = statusResult[0]?.total_prospects || 0;
      system_status.total_orders = statusResult[0]?.total_orders || 0;
      system_status.total_revenue_monthly = statusResult[0]?.total_revenue || 0;
    } catch (err) {
      console.warn('[B2B] Failed to fetch system status');
    }

    return {
      awaiting_response,
      orders_requiring_intervention,
      new_opportunities,
      system_status,
      recent_learning: "Logistics category: 52% conversion rate. Finding live bottleneck signals."
    };
  } catch (err) {
    console.warn('[B2B] Critical error:', err instanceof Error ? err.message : String(err));
    return getDefaultBriefing();
  }
}

function getDefaultBriefing(): BriefingData {
  return {
    awaiting_response: { count: 0, revenue_impact: 0 },
    orders_requiring_intervention: { count: 0, revenue_at_risk: 0 },
    new_opportunities: { count: 0 },
    system_status: { total_prospects: 0, total_orders: 0, total_revenue_monthly: 0 },
    recent_learning: "System initializing..."
  };
}

export default async function B2BPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  if (!user?.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
    redirect("/");
  }

  const briefing = await getBriefingData();

  return (
    <div className="px-6 py-10 max-w-3xl mx-auto">
      {/* Navigation */}
      <div className="flex gap-2 mb-12">
        {['ADMIN', 'TODAY', 'DISCOVERY', 'PIPELINE', 'ORDERS', 'ANALYTICS'].map((item) => (
          <Link
            key={item}
            href={item === 'ADMIN' ? '/dashboard/admin' : `/dashboard/admin/b2b${item === 'TODAY' ? '' : '/' + item.toLowerCase()}`}
            className={`text-[10px] font-semibold uppercase tracking-[0.2em] px-4 py-2 rounded border transition-colors ${
              item === 'TODAY'
                ? 'bg-[#0D0D0D] text-white border-[#0D0D0D]'
                : 'bg-white text-[#0D0D0D] border-[#E8E8E8] hover:border-[#D0D0D0]'
            }`}
          >
            {item}
          </Link>
        ))}
      </div>

      {/* Header */}
      <div className="mb-12">
        <h1 className="font-sans font-black text-[#0D0D0D] text-4xl tracking-tight mb-1">
          Today's Commercial Briefing.
        </h1>
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">
          What deserves your attention right now
        </p>
      </div>

      {/* CRITICAL STATE: Blocked Orders (if exists) */}
      {briefing.orders_requiring_intervention.count > 0 && (
        <div className="mb-20 pl-4 border-l-4 border-[#DC2626]">
          <p className="text-8xl font-black text-[#0D0D0D] mb-4">
            {briefing.orders_requiring_intervention.count}
          </p>
          <p className="text-4xl font-bold text-[#DC2626] mb-3">
            £{briefing.orders_requiring_intervention.revenue_at_risk.toLocaleString()}/month at risk
          </p>
          <p className="text-xl text-[#0D0D0D] mb-2">
            Standing orders blocked or requiring intervention.
          </p>
          <p className="text-base text-[#666666]">
            Action: Go to Orders immediately.
          </p>
        </div>
      )}

      {/* PRIMARY METRICS */}
      <div className="mb-20 space-y-12">
        {/* Prospects Awaiting Response */}
        {briefing.awaiting_response.count > 0 && (
          <Link href="/dashboard/admin/b2b/pipeline" className="block hover:opacity-70 transition-opacity">
            <p className="text-5xl font-bold text-[#0D0D0D] mb-3">
              {briefing.awaiting_response.count}
            </p>
            <p className="text-base text-[#0D0D0D] hover:underline leading-relaxed">
              Prospects opened email but didn't reply. Follow up in Pipeline.
            </p>
          </Link>
        )}

        {/* New Opportunities */}
        {briefing.new_opportunities.count > 0 && (
          <Link href="/dashboard/admin/b2b/discovery" className="block hover:opacity-70 transition-opacity">
            <p className="text-5xl font-bold text-[#0D0D0D] mb-3">
              {briefing.new_opportunities.count}
            </p>
            <p className="text-base text-[#0D0D0D] hover:underline leading-relaxed">
              Opportunities ready for outreach in Discovery.
            </p>
          </Link>
        )}
      </div>

      {/* SECONDARY: System Status */}
      <div className="pt-12 border-t border-[#E8E8E8]">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">
          System Snapshot
        </p>
        <p className="text-base text-[#0D0D0D] leading-relaxed">
          <span className="font-semibold">{briefing.system_status.total_prospects}</span> prospects in pipeline. <span className="font-semibold">{briefing.system_status.total_orders}</span> active standing orders. <span className="font-semibold">£{briefing.system_status.total_revenue_monthly.toLocaleString()}</span> monthly revenue.
        </p>
      </div>

      {/* SYSTEM MEMORY: Learning */}
      <div className="mt-12 pt-12 border-t border-[#E8E8E8]">
        <p className="text-base text-[#0D0D0D] leading-relaxed">
          {briefing.recent_learning}
        </p>
      </div>
    </div>
  );
}
