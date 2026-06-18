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
      recent_learning: "Logistics category: 52% conversion rate. Prioritize 'delivery bottleneck' signal."
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
    <div className="px-8 py-12 max-w-7xl mx-auto">
      {/* Navigation */}
      <div className="flex gap-2 mb-16">
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
      <div className="mb-16">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.3em] mb-4">Today</p>
        <h1 className="font-sans font-black text-[#0D0D0D] text-6xl tracking-tight mb-3">
          Commercial Briefing
        </h1>
        <p className="text-base text-[#666666]">
          What deserves your attention right now
        </p>
      </div>

      {/* CRITICAL STATE: Blocked Orders */}
      {briefing.orders_requiring_intervention.count > 0 && (
        <div className="mb-16 bg-[#FEF2F2] border-l-4 border-[#DC2626] p-8 rounded">
          <p className="text-[10px] font-semibold text-[#DC2626] uppercase tracking-[0.2em] mb-4">
            Requires Immediate Action
          </p>
          <div className="flex items-baseline gap-4 mb-6">
            <p className="text-7xl font-black text-[#0D0D0D]">
              {briefing.orders_requiring_intervention.count}
            </p>
            <p className="text-xl text-[#666666]">
              standing order{briefing.orders_requiring_intervention.count !== 1 ? 's' : ''} blocked
            </p>
          </div>
          <p className="text-3xl font-bold text-[#DC2626] mb-4">
            £{briefing.orders_requiring_intervention.revenue_at_risk.toLocaleString()}/month at risk
          </p>
          <Link href="/dashboard/admin/b2b/orders" className="inline-block text-sm font-semibold text-[#0D0D0D] hover:text-[#DC2626] transition-colors">
            Go to Orders →
          </Link>
        </div>
      )}

      {/* PRIMARY METRICS GRID */}
      <div className="grid grid-cols-2 gap-8 mb-16">
        {/* Prospects Awaiting Response */}
        {briefing.awaiting_response.count > 0 && (
          <Link href="/dashboard/admin/b2b/pipeline" className="block bg-[#EBEBF9] p-8 rounded hover:bg-[#DCDAEC] transition-colors">
            <p className="text-[10px] font-semibold text-[#6366F1] uppercase tracking-[0.2em] mb-4">
              In Pipeline
            </p>
            <p className="text-6xl font-black text-[#0D0D0D] mb-4">
              {briefing.awaiting_response.count}
            </p>
            <p className="text-sm text-[#666666]">
              Prospects opened email but haven't replied
            </p>
          </Link>
        )}

        {/* New Opportunities */}
        {briefing.new_opportunities.count > 0 && (
          <Link href="/dashboard/admin/b2b/discovery" className="block bg-[#FFFAF0] p-8 rounded hover:bg-[#FEF3E2] transition-colors">
            <p className="text-[10px] font-semibold text-[#F59E0B] uppercase tracking-[0.2em] mb-4">
              New Opportunities
            </p>
            <p className="text-6xl font-black text-[#0D0D0D] mb-4">
              {briefing.new_opportunities.count}
            </p>
            <p className="text-sm text-[#666666]">
              Ready for outreach in Discovery
            </p>
          </Link>
        )}
      </div>

      {/* SYSTEM STATUS */}
      <div className="grid grid-cols-3 gap-8 mb-16">
        <div className="bg-[#F0FFFE] p-8 rounded">
          <p className="text-[10px] font-semibold text-[#06B6D4] uppercase tracking-[0.2em] mb-4">
            Total Pipeline
          </p>
          <p className="text-5xl font-black text-[#0D0D0D] mb-2">
            {briefing.system_status.total_prospects}
          </p>
          <p className="text-sm text-[#666666]">
            prospects in active engagement
          </p>
        </div>

        <div className="bg-[#F0FDF4] p-8 rounded">
          <p className="text-[10px] font-semibold text-[#10B981] uppercase tracking-[0.2em] mb-4">
            Recurring Revenue
          </p>
          <p className="text-4xl font-black text-[#0D0D0D] mb-2">
            {briefing.system_status.total_orders}
          </p>
          <p className="text-sm text-[#666666]">
            active standing orders
          </p>
        </div>

        <div className="bg-[#FEF3C7] p-8 rounded">
          <p className="text-[10px] font-semibold text-[#D97706] uppercase tracking-[0.2em] mb-4">
            Monthly Revenue
          </p>
          <p className="text-4xl font-black text-[#0D0D0D] mb-2">
            £{briefing.system_status.total_revenue_monthly.toLocaleString()}
          </p>
          <p className="text-sm text-[#666666]">
            from standing orders
          </p>
        </div>
      </div>

      {/* INSIGHT */}
      <div className="bg-[#F3F4F6] p-8 rounded border border-[#E5E7EB]">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3">
          System Learning
        </p>
        <p className="text-base text-[#0D0D0D]">
          {briefing.recent_learning}
        </p>
      </div>
    </div>
  );
}
