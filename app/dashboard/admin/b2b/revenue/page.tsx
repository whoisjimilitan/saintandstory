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

interface RevenueData {
  opportunities: number;
  contacted: number;
  interested: number;
  follow_up_required: number;
  jobs_created: number;
  revenue_generated: number;
  biggest_leak_from: string;
  biggest_leak_to: string;
  biggest_leak_count: number;
  blocked_standing_orders: number;
  high_value_opportunities: any[];
}

async function getRevenueData(): Promise<RevenueData> {
  try {
    if (!process.env.DATABASE_URL) {
      return getDefaultRevenue();
    }

    const sql = neon(process.env.DATABASE_URL);

    // Count opportunities
    let opportunities = 0;
    let contacted = 0;
    let interested = 0;
    let follow_up_required = 0;

    try {
      const oppResult = await sql`SELECT COUNT(*) as count FROM b2b_leads`;
      opportunities = oppResult[0]?.count || 0;

      const contactedResult = await sql`SELECT COUNT(*) as count FROM b2b_leads WHERE email_sent_at IS NOT NULL`;
      contacted = contactedResult[0]?.count || 0;

      // Interested = opened email (warm or engaged status)
      const interestedResult = await sql`SELECT COUNT(*) as count FROM b2b_leads WHERE status IN ('warm', 'engaged')`;
      interested = interestedResult[0]?.count || 0;

      // Follow-up required = opened but not replied
      const followUpResult = await sql`SELECT COUNT(*) as count FROM b2b_leads WHERE status = 'warm'`;
      follow_up_required = followUpResult[0]?.count || 0;
    } catch (err) {
      console.warn('[Revenue] Failed to fetch opportunity counts:', err instanceof Error ? err.message : String(err));
    }

    // Get high value opportunities (opportunities closest to revenue)
    let high_value_opportunities: any[] = [];
    try {
      const hvResult = await sql`
        SELECT
          id,
          business_name,
          status,
          email_sent_at,
          engagement_score
        FROM b2b_leads
        WHERE status IN ('warm', 'engaged')
        ORDER BY status DESC, engagement_score DESC
        LIMIT 5
      `;
      high_value_opportunities = hvResult.map((row: any) => ({
        id: row.id,
        name: row.business_name,
        status: row.status === 'engaged' ? 'ACTIVE INTEREST' : 'AWAITING RESPONSE',
        score: row.engagement_score
      }));
    } catch (err) {
      console.warn('[Revenue] Failed to fetch high value opportunities');
    }

    // Count blocked standing orders
    let blocked_standing_orders = 0;
    try {
      const blockedResult = await sql`SELECT COUNT(*) as count FROM b2b_standing_orders WHERE status = 'blocked'`;
      blocked_standing_orders = blockedResult[0]?.count || 0;
    } catch (err) {
      console.warn('[Revenue] Failed to fetch blocked standing orders');
    }

    // Identify biggest leak
    let biggest_leak_from = 'Opportunities';
    let biggest_leak_to = 'Contacted';
    let biggest_leak_count = opportunities - contacted;

    if (contacted > 0 && interested < contacted) {
      biggest_leak_from = 'Contacted';
      biggest_leak_to = 'Interested';
      biggest_leak_count = contacted - interested;
    }

    if (interested > 0 && follow_up_required < interested) {
      biggest_leak_from = 'Interested';
      biggest_leak_to = 'Follow-Up';
      biggest_leak_count = interested - follow_up_required;
    }

    return {
      opportunities,
      contacted,
      interested,
      follow_up_required,
      jobs_created: 0,
      revenue_generated: 0,
      biggest_leak_from,
      biggest_leak_to,
      biggest_leak_count,
      blocked_standing_orders,
      high_value_opportunities
    };
  } catch (err) {
    console.warn('[Revenue] Critical error:', err instanceof Error ? err.message : String(err));
    return getDefaultRevenue();
  }
}

function getDefaultRevenue(): RevenueData {
  return {
    opportunities: 0,
    contacted: 0,
    interested: 0,
    follow_up_required: 0,
    jobs_created: 0,
    revenue_generated: 0,
    biggest_leak_from: 'Opportunities',
    biggest_leak_to: 'Contacted',
    biggest_leak_count: 0,
    blocked_standing_orders: 0,
    high_value_opportunities: []
  };
}

export default async function RevenuePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  if (!user?.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
    redirect("/");
  }

  const revenue = await getRevenueData();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Navigation */}
      <div className="flex gap-2 mb-12 overflow-x-auto">
        {['ADMIN', 'TODAY', 'PIPELINE', 'DISCOVERY', 'STRATEGY', 'ORDERS', 'REVENUE'].map((item) => (
          <Link
            key={item}
            href={item === 'ADMIN' ? '/dashboard/admin' : `/dashboard/admin/b2b${item === 'TODAY' ? '' : '/' + item.toLowerCase()}`}
            className={`text-[10px] font-semibold uppercase tracking-[0.2em] px-4 py-2 rounded border transition-colors whitespace-nowrap ${
              item === 'REVENUE'
                ? 'bg-[#0D0D0D] text-white border-[#0D0D0D]'
                : 'bg-white text-[#0D0D0D] border-[#E8E8E8] hover:border-[#D0D0D0]'
            }`}
          >
            {item}
          </Link>
        ))}
      </div>

      {/* Page Header */}
      <div className="mb-16">
        <h1 className="font-sans font-black text-[#0D0D0D] text-4xl tracking-tight mb-1">
          Revenue Engine.
        </h1>
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">
          Where is money getting stuck?
        </p>
      </div>

      {/* SECTION 1: REVENUE BRIEF */}
      <div className="mb-16 bg-white border border-[#E8E8E8] rounded px-6 py-5">
        <p className="text-sm leading-relaxed text-[#0D0D0D]">
          <span className="font-semibold">{revenue.opportunities}</span> opportunities exist in the system.
          <span className="font-semibold ml-1">{revenue.interested}</span> show commercial interest.
          <span className="font-semibold ml-1">{revenue.jobs_created}</span> have progressed to jobs.
          {revenue.biggest_leak_count > 0 && (
            <>
              The primary bottleneck is conversion from <span className="font-semibold">{revenue.biggest_leak_from}</span> to <span className="font-semibold">{revenue.biggest_leak_to}</span>
              (<span className="font-semibold">{revenue.biggest_leak_count} prospects stuck</span>).
            </>
          )}
        </p>
      </div>

      {/* SECTION 2: REVENUE FUNNEL */}
      <div className="mb-16">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          Revenue Funnel
        </p>
        <div className="bg-white border border-[#E8E8E8] rounded p-8">
          <div className="flex items-center justify-between">
            {/* Opportunities */}
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-2">
                Opportunities
              </p>
              <p className="text-5xl font-black text-[#0D0D0D]">
                {revenue.opportunities}
              </p>
            </div>

            {/* Arrow */}
            <div className="text-[#D0D0D0] text-2xl mx-2">→</div>

            {/* Contacted */}
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-2">
                Contacted
              </p>
              <p className="text-5xl font-black text-[#0D0D0D]">
                {revenue.contacted}
              </p>
            </div>

            {/* Arrow */}
            <div className="text-[#D0D0D0] text-2xl mx-2">→</div>

            {/* Interested */}
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-2">
                Interested
              </p>
              <p className="text-5xl font-black text-[#0D0D0D]">
                {revenue.interested}
              </p>
            </div>

            {/* Arrow */}
            <div className="text-[#D0D0D0] text-2xl mx-2">→</div>

            {/* Jobs */}
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-2">
                Jobs
              </p>
              <p className="text-5xl font-black text-[#0D0D0D]">
                {revenue.jobs_created}
              </p>
            </div>

            {/* Arrow */}
            <div className="text-[#D0D0D0] text-2xl mx-2">→</div>

            {/* Revenue */}
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-2">
                Revenue
              </p>
              <p className="text-5xl font-black text-[#0D0D0D]">
                £{revenue.revenue_generated}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: BOTTLENECK DETECTION */}
      {revenue.biggest_leak_count > 0 && (
        <div className="mb-16">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
            Biggest Leak
          </p>
          <div className="bg-[#FFF8E5] border border-[#FFE5C0] rounded p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#CC6600] mb-4">
              {revenue.biggest_leak_from} → {revenue.biggest_leak_to}
            </p>
            <p className="text-lg text-[#CC6600] mb-4">
              <span className="font-semibold">{revenue.biggest_leak_count}</span> prospects stuck
            </p>
            <p className="text-sm text-[#CC6600]">
              <span className="font-semibold">System Recommendation:</span> {revenue.biggest_leak_from === 'Opportunities' ? 'Increase outreach velocity.' : revenue.biggest_leak_from === 'Contacted' ? 'Improve email engagement.' : revenue.biggest_leak_from === 'Interested' ? 'Follow-up process required.' : 'Sales engagement needed.'}
            </p>
          </div>
        </div>
      )}

      {/* SECTION 4: HIGH VALUE ACTIONS */}
      {revenue.high_value_opportunities.length > 0 && (
        <div className="mb-16">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
            Opportunities Closest to Revenue
          </p>
          <div className="space-y-3">
            {revenue.high_value_opportunities.map((opp, idx) => (
              <div key={idx} className="bg-white border border-[#E8E8E8] rounded p-4 hover:border-[#D0D0D0] transition-colors">
                <p className="text-sm font-semibold text-[#0D0D0D] mb-2">
                  {opp.name}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-semibold uppercase tracking-[0.05em] px-2 py-1 rounded ${
                    opp.status === 'ACTIVE INTEREST'
                      ? 'bg-[#E8F5E9] text-[#1B5E20]'
                      : 'bg-[#E3F2FD] text-[#0D47A1]'
                  }`}>
                    {opp.status}
                  </span>
                  <span className="text-sm text-[#0D0D0D]">Score: <span className="font-semibold">{opp.score}/100</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: REVENUE RISKS */}
      {revenue.blocked_standing_orders > 0 && (
        <div className="pt-8 border-t border-[#E8E8E8]">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
            Revenue Risks
          </p>
          <div className="bg-[#FFE5E5] border border-[#FFCCCC] rounded p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#CC0000] mb-2">
              Blocked Standing Orders
            </p>
            <p className="text-sm text-[#CC0000]">
              <span className="font-semibold">{revenue.blocked_standing_orders}</span> revenue programs blocked. Missing postcode data preventing job generation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
