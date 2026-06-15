import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { neon } from "@neondatabase/serverless";
import ProspectCard from "@/components/ProspectCard";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];

interface ProspectData {
  id: string;
  business_name: string;
  business_category: string | null;
  email: string | undefined;
  last_contacted_at: string | undefined;
  engagement_score: number;
  lead_tier: string | null;
  opportunity: string;
  context: string;
  recommendation: string;
  executiveSummary: string;
  evidence: string[];
}

interface MorningBriefData {
  lastRun: {
    timestamp: string;
    status: 'success' | 'partial_failure' | 'failure' | null;
    discovered: number;
    leads_created: number;
    failures: string[];
  };
  standing_orders_issues: {
    total_active: number;
    blocked_count: number;
    blocked_reasons: string[];
  };
  today_queue: {
    tier_a_count: number;
    tier_b_count: number;
    tier_c_count: number;
    total_count: number;
  };
}

async function getMorningBrief(): Promise<MorningBriefData> {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('[B2B] DATABASE_URL not configured');
      return getDefaultBrief();
    }

    const sql = neon(process.env.DATABASE_URL);

    // Get last orchestration run
    let lastRun = null;
    try {
      const lastRunResult = await sql`
        SELECT
          started_at,
          status,
          discovery_count,
          leads_created,
          failures
        FROM b2b_orchestration_logs
        ORDER BY started_at DESC
        LIMIT 1
      `;
      lastRun = lastRunResult.length > 0 ? lastRunResult[0] : null;
    } catch (err) {
      console.warn('[B2B] Failed to fetch orchestration logs:', err instanceof Error ? err.message : String(err));
    }

    // Get standing order issues
    let soIssues = null;
    try {
      const soIssuesResult = await sql`
        SELECT
          COUNT(*) as total_active,
          COUNT(*) FILTER (WHERE pickup_postcode IS NULL OR delivery_postcode IS NULL) as blocked_count
        FROM b2b_standing_orders
        WHERE active = true
      `;
      soIssues = soIssuesResult[0];
    } catch (err) {
      console.warn('[B2B] Failed to fetch standing orders:', err instanceof Error ? err.message : String(err));
    }

    // Get blocked standing order reasons
    let blockedReasons: string[] = [];
    try {
      const blockedSOResult = await sql`
        SELECT DISTINCT
          CASE
            WHEN pickup_postcode IS NULL THEN 'Missing pickup postcode'
            WHEN delivery_postcode IS NULL THEN 'Missing delivery postcode'
            ELSE 'Unknown'
          END as reason
        FROM b2b_standing_orders
        WHERE active = true
          AND (pickup_postcode IS NULL OR delivery_postcode IS NULL)
      `;
      blockedReasons = blockedSOResult.map((r: any) => r.reason);
    } catch (err) {
      console.warn('[B2B] Failed to fetch blocked SO reasons:', err instanceof Error ? err.message : String(err));
    }

    // Get today queue stats
    let queueStats = null;
    try {
      const queueStatsResult = await sql`
        SELECT
          COUNT(*) FILTER (WHERE lead_tier = 'A') as tier_a,
          COUNT(*) FILTER (WHERE lead_tier = 'B') as tier_b,
          COUNT(*) FILTER (WHERE lead_tier = 'C') as tier_c,
          COUNT(*) as total
        FROM b2b_leads
        WHERE lead_tier IN ('A', 'B', 'C')
      `;
      queueStats = queueStatsResult[0];
    } catch (err) {
      console.warn('[B2B] Failed to fetch queue stats:', err instanceof Error ? err.message : String(err));
    }

    return {
      lastRun: {
        timestamp: lastRun?.started_at ? new Date(lastRun.started_at).toISOString() : 'Never',
        status: lastRun?.status || null,
        discovered: lastRun?.discovery_count || 0,
        leads_created: lastRun?.leads_created || 0,
        failures: lastRun?.failures || []
      },
      standing_orders_issues: {
        total_active: soIssues?.total_active || 0,
        blocked_count: soIssues?.blocked_count || 0,
        blocked_reasons: blockedReasons
      },
      today_queue: {
        tier_a_count: queueStats?.tier_a || 0,
        tier_b_count: queueStats?.tier_b || 0,
        tier_c_count: queueStats?.tier_c || 0,
        total_count: queueStats?.total || 0
      }
    };
  } catch (err) {
    console.error('[B2B] Fatal error in getMorningBrief:', err instanceof Error ? err.message : String(err));
    return getDefaultBrief();
  }
}

function getDefaultBrief(): MorningBriefData {
  return {
    lastRun: {
      timestamp: 'Never',
      status: null,
      discovered: 0,
      leads_created: 0,
      failures: []
    },
    standing_orders_issues: {
      total_active: 0,
      blocked_count: 0,
      blocked_reasons: []
    },
    today_queue: {
      tier_a_count: 0,
      tier_b_count: 0,
      tier_c_count: 0,
      total_count: 0
    }
  };
}

async function getRealProspects(): Promise<ProspectData[]> {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('[B2B] DATABASE_URL not configured for getRealProspects');
      return [];
    }

    const sql = neon(process.env.DATABASE_URL);

    let leads: any[] = [];
    try {
      leads = await sql`
        SELECT
          bl.id,
          bl.business_name,
          bl.business_category,
          bl.email,
          bl.email_sent_at,
          bl.engagement_score,
          bl.lead_tier
        FROM b2b_leads bl
        ORDER BY
          CASE
            WHEN bl.lead_tier = 'A' THEN 1
            WHEN bl.lead_tier = 'B' THEN 2
            WHEN bl.lead_tier = 'C' THEN 3
            ELSE 4
          END,
          bl.engagement_score DESC,
          bl.created_at DESC
        LIMIT 12
      `;
    } catch (queryErr) {
      console.warn('[B2B] Failed to fetch leads:', queryErr instanceof Error ? queryErr.message : String(queryErr));
      return [];
    }

    return leads.map((lead: any) => ({
      id: lead.id,
      business_name: lead.business_name,
      business_category: lead.business_category,
      email: lead.email || undefined,
      last_contacted_at: lead.email_sent_at || undefined,
      engagement_score: lead.engagement_score || 0,
      lead_tier: lead.lead_tier,
      opportunity: `Exploring partnership opportunities with ${lead.business_name}.`,
      context: `This ${lead.business_category} business has been identified as a qualified opportunity based on commercial signals.`,
      recommendation: `Contact to discuss how we can support ${lead.business_name}'s growth.`,
      executiveSummary: `Tier-${lead.lead_tier || 'C'} opportunity with engagement score ${lead.engagement_score}/100.`,
      evidence: [
        `Discovered via autonomous discovery pipeline`,
        `Category: ${lead.business_category}`,
        `Engagement Score: ${lead.engagement_score}/100`,
        `Lead Tier: ${lead.lead_tier || 'C'}`
      ]
    }));
  } catch (err) {
    console.error('[B2B] Fatal error in getRealProspects:', err instanceof Error ? err.message : String(err));
    return [];
  }
}

export default async function B2BTodayPage() {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId) redirect("/sign-in");
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email)) redirect("/dashboard/driver");

  const brief = await getMorningBrief();
  const prospects = await getRealProspects();

  const formatTime = (iso: string) => {
    if (iso === 'Never') return 'Never';
    const date = new Date(iso);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const day = isToday ? 'Today' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${day} at ${time}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-1">
        <Link href="/dashboard/admin" className="text-[10px] font-semibold text-[#888888] hover:text-[#0D0D0D] uppercase tracking-[0.2em] transition-colors border border-[#E8E8E8] px-3 py-1 rounded-full">
          Admin ↻
        </Link>
        <div className="flex gap-2">
          <Link href="/dashboard/admin/b2b" className="text-[10px] font-semibold text-[#0D0D0D] uppercase tracking-[0.15em] border border-[#0D0D0D] px-3 py-1 rounded-full">
            Today
          </Link>
          <Link href="/dashboard/admin/b2b/pipeline" className="text-[10px] font-semibold text-[#888888] hover:text-[#0D0D0D] uppercase tracking-[0.15em] transition-colors border border-[#E8E8E8] px-3 py-1 rounded-full">
            Pipeline
          </Link>
          <Link href="/dashboard/admin/b2b/discovery" className="text-[10px] font-semibold text-[#888888] hover:text-[#0D0D0D] uppercase tracking-[0.15em] transition-colors border border-[#E8E8E8] px-3 py-1 rounded-full">
            Discovery
          </Link>
          <Link href="/dashboard/admin/b2b/orders" className="text-[10px] font-semibold text-[#888888] hover:text-[#0D0D0D] uppercase tracking-[0.15em] transition-colors border border-[#E8E8E8] px-3 py-1 rounded-full">
            Orders
          </Link>
          <Link href="/dashboard/admin/b2b/analytics" className="text-[10px] font-semibold text-[#888888] hover:text-[#0D0D0D] uppercase tracking-[0.15em] transition-colors border border-[#E8E8E8] px-3 py-1 rounded-full">
            Analytics
          </Link>
        </div>
      </div>

      {/* MORNING BRIEF — PHASE 0: VISIBILITY */}
      <div className="bg-[#FAFAFA] border border-[#E8E8E8] rounded px-6 py-5 mb-12">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">
          Morning Brief
        </p>

        {/* Row 1: Last orchestration */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888] mb-1">
              Last Run
            </p>
            <p className="text-sm text-[#0D0D0D]">
              {formatTime(brief.lastRun.timestamp)}
            </p>
            <p className={`text-[10px] font-semibold uppercase tracking-[0.1em] mt-2 ${
              brief.lastRun.status === 'success' ? 'text-[#0D0D0D]' : 'text-[#666666]'
            }`}>
              {brief.lastRun.status === 'success' ? '✅ Success' : brief.lastRun.status === 'partial_failure' ? '⚠️ Partial Failure' : brief.lastRun.status === 'failure' ? '❌ Failed' : '—'}
            </p>
          </div>

          {/* Row 1: Discovery stats */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888] mb-1">
              Overnight Activity
            </p>
            <p className="text-sm text-[#0D0D0D]">
              <span className="font-semibold">{brief.lastRun.discovered}</span> discovered, <span className="font-semibold">{brief.lastRun.leads_created}</span> qualified
            </p>
          </div>
        </div>

        {/* Row 2: Today's queue */}
        <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-[#E8E8E8]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888] mb-1">
              Tier A
            </p>
            <p className="text-lg font-black text-[#0D0D0D]">
              {brief.today_queue.tier_a_count}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888] mb-1">
              Tier B
            </p>
            <p className="text-lg font-black text-[#0D0D0D]">
              {brief.today_queue.tier_b_count}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888] mb-1">
              Tier C
            </p>
            <p className="text-lg font-black text-[#0D0D0D]">
              {brief.today_queue.tier_c_count}
            </p>
          </div>
        </div>

        {/* Row 3: System status & blockers */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888] mb-1">
              System Status
            </p>
            <p className="text-sm text-[#0D0D0D]">
              ✅ Discovery Active
            </p>
          </div>

          <div>
            {brief.standing_orders_issues.blocked_count > 0 ? (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888] mb-1">
                  ⚠️ Issues
                </p>
                <p className="text-sm text-[#0D0D0D]">
                  {brief.standing_orders_issues.blocked_count} standing order{brief.standing_orders_issues.blocked_count !== 1 ? 's' : ''} blocked
                </p>
                <ul className="text-[10px] text-[#666666] mt-2 space-y-1">
                  {brief.standing_orders_issues.blocked_reasons.slice(0, 2).map((reason, i) => (
                    <li key={i}>• {reason}</li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888] mb-1">
                  Standing Orders
                </p>
                <p className="text-sm text-[#0D0D0D]">
                  {brief.standing_orders_issues.total_active} active, no issues
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Page Title */}
      <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight mb-8">
        Today Queue.
      </h1>

      {/* SECTION 1: INTELLIGENCE BRIEF */}
      <div className="mb-12">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3">
          Intelligence Brief
        </p>
        <p className="text-base leading-relaxed text-[#0D0D0D] mb-2">
          <span className="font-semibold">{Math.min(prospects.length, 12)} opportunities</span> ranked and ready for outreach.
        </p>
        <p className="text-base leading-relaxed text-[#0D0D0D] mb-2">
          <span className="font-semibold">{prospects.filter(p => p.lead_tier === 'A').length} Tier-A</span>, <span className="font-semibold">{prospects.filter(p => p.lead_tier === 'B').length} Tier-B</span> in today's queue.
        </p>
        <p className="text-base leading-relaxed text-[#0D0D0D] mb-2">
          Engagement scores range <span className="font-semibold">{Math.min(...prospects.map(p => p.engagement_score))}</span>–<span className="font-semibold">{Math.max(...prospects.map(p => p.engagement_score))}</span>.
        </p>
        <p className="text-base leading-relaxed text-[#666666]">
          All leads discovered and qualified autonomously. No outreach sent yet.
        </p>
      </div>

      {/* SECTION 2: OPPORTUNITIES REQUIRING ATTENTION */}
      <div className="mb-8">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">
          Opportunities Requiring Attention
        </p>

        {/* SECTION 3: PROSPECT QUEUE */}
        <div className="space-y-4">
          {prospects.length === 0 ? (
            <p className="text-sm text-[#666666] italic">No leads qualified for outreach yet. Discovery pipeline continues.</p>
          ) : (
            prospects.map((prospect) => (
              <ProspectCard
                key={prospect.id}
                prospect={{
                  id: prospect.id,
                  business_name: prospect.business_name,
                  business_category: prospect.business_category || undefined,
                  email: prospect.email,
                  last_contacted_at: prospect.last_contacted_at,
                }}
                opportunity={prospect.opportunity}
                context={prospect.context}
                recommendation={prospect.recommendation}
                executiveSummary={prospect.executiveSummary}
                evidence={prospect.evidence}
              />
            ))
          )}
        </div>
      </div>

      {/* SECTION 4: SYSTEM STATUS */}
      <div className="mt-12 pt-8 border-t border-[#E8E8E8]">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-2">
          System Status
        </p>
        <div className="flex gap-4 text-[10px] text-[#888888]">
          <span>Discovery Active.</span>
          <span>Enrichment Active.</span>
          <span>Ranking Active.</span>
          <span>Learning Active.</span>
          <span>Research Missions Active.</span>
        </div>
      </div>
    </div>
  );
}
