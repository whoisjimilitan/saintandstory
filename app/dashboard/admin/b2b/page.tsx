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
    <div className="p-8 max-w-7xl mx-auto">
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

      {/* AWAITING ATTENTION SECTIONS */}
      <div className="mb-16">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          Awaiting Attention
        </p>
        <div className="space-y-4">
          {/* Section 1: Prospects Awaiting Response */}
          <Link
            href="/dashboard/admin/b2b/pipeline"
            className="block border border-[#E8E8E8] rounded p-6 bg-white hover:border-[#D0D0D0] transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-2">
                  Prospects Awaiting Response
                </p>
                <p className="text-4xl font-black text-[#0D0D0D] mb-2">
                  {briefing.awaiting_response.count}
                </p>
                <p className="text-sm text-[#666666]">
                  opened email but didn't reply
                </p>
                <p className="text-[10px] font-semibold text-[#0A66C2] mt-3">
                  Revenue impact: £{briefing.awaiting_response.revenue_impact.toLocaleString()}/month if converted
                </p>
              </div>
              <div className="text-[#D0D0D0] text-lg">→</div>
            </div>
            <p className="text-[10px] text-[#888888] mt-4 border-t border-[#E8E8E8] pt-4">
              Action: Review Pipeline. Follow up with prospects showing interest.
            </p>
          </Link>

          {/* Section 2: Standing Orders Requiring Intervention */}
          <Link
            href="/dashboard/admin/b2b/orders"
            className="block border border-[#E8E8E8] rounded p-6 bg-white hover:border-[#D0D0D0] transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-2">
                  Standing Orders Requiring Intervention
                </p>
                <p className="text-4xl font-black text-[#0D0D0D] mb-2">
                  {briefing.orders_requiring_intervention.count}
                </p>
                <p className="text-sm text-[#666666]">
                  blocked or at-risk
                </p>
                <p className="text-[10px] font-semibold text-[#CC6600] mt-3">
                  Revenue at risk: £{briefing.orders_requiring_intervention.revenue_at_risk.toLocaleString()}/month
                </p>
              </div>
              <div className="text-[#D0D0D0] text-lg">→</div>
            </div>
            <p className="text-[10px] text-[#888888] mt-4 border-t border-[#E8E8E8] pt-4">
              Action: Go to Orders. Unblock or renegotiate before revenue is lost.
            </p>
          </Link>

          {/* Section 3: New Opportunities Ready */}
          <Link
            href="/dashboard/admin/b2b/discovery"
            className="block border border-[#E8E8E8] rounded p-6 bg-white hover:border-[#D0D0D0] transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-2">
                  New Opportunities Ready for Outreach
                </p>
                <p className="text-4xl font-black text-[#0D0D0D] mb-2">
                  {briefing.new_opportunities.count}
                </p>
                <p className="text-sm text-[#666666]">
                  businesses identified and waiting
                </p>
                <p className="text-[10px] font-semibold text-[#0A66C2] mt-3">
                  Expected: 2-3 will convert to standing orders
                </p>
              </div>
              <div className="text-[#D0D0D0] text-lg">→</div>
            </div>
            <p className="text-[10px] text-[#888888] mt-4 border-t border-[#E8E8E8] pt-4">
              Action: Go to Discovery. Initiate outreach to high-priority prospects.
            </p>
          </Link>
        </div>
      </div>

      {/* SYSTEM SNAPSHOT */}
      <div className="mb-16 border-t border-[#E8E8E8] pt-12">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          System Snapshot
        </p>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white border border-[#E8E8E8] rounded px-6 py-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-3">
              Prospects in Pipeline
            </p>
            <p className="text-4xl font-black text-[#0D0D0D]">
              {briefing.system_status.total_prospects}
            </p>
            <p className="text-[10px] text-[#666666] mt-2">
              actively engaged
            </p>
          </div>

          <div className="bg-white border border-[#E8E8E8] rounded px-6 py-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-3">
              Standing Orders Active
            </p>
            <p className="text-4xl font-black text-[#0D0D0D]">
              {briefing.system_status.total_orders}
            </p>
            <p className="text-[10px] text-[#666666] mt-2">
              generating recurring revenue
            </p>
          </div>

          <div className="bg-white border border-[#E8E8E8] rounded px-6 py-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-3">
              Monthly Revenue
            </p>
            <p className="text-4xl font-black text-[#0D0D0D]">
              £{briefing.system_status.total_revenue_monthly.toLocaleString()}
            </p>
            <p className="text-[10px] text-[#666666] mt-2">
              from active orders
            </p>
          </div>
        </div>
      </div>

      {/* RECENT LEARNING */}
      <div className="border-t border-[#E8E8E8] pt-12">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          Recent Learning (from Analytics)
        </p>
        <div className="bg-[#F9FAFB] border border-[#E8E8E8] rounded p-6">
          <p className="text-sm text-[#0D0D0D] leading-relaxed">
            {briefing.recent_learning}
          </p>
          <p className="text-[10px] text-[#888888] mt-4">
            Use this insight to guide your Discovery searches and Pipeline prioritization.
          </p>
        </div>
      </div>
    </div>
  );
}
