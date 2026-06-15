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
  engagement?: {
    sent_at?: string;
    opened_count?: number;
    clicked_count?: number;
    replied?: boolean;
  };
}

interface MorningBriefData {
  overnight: {
    discovered: number;
    qualified: number;
  };
  funnel: {
    discovered: number;
    qualified: number;
    contacted: number;
    opened: number;
    clicked: number;
    replied: number;
    won: number;
  };
  queue_state: {
    waiting_for_outreach: number;
    awaiting_response: number;
    stuck_over_5_days: number;
  };
  system_health: {
    open_rate: number;
    reply_rate: number;
    conversion_rate: number;
  };
}

async function getMorningBrief(): Promise<MorningBriefData> {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('[B2B] DATABASE_URL not configured');
      return getDefaultBrief();
    }

    const sql = neon(process.env.DATABASE_URL);

    // Get overnight activity
    let overnight = { discovered: 0, qualified: 0 };
    try {
      const lastRunResult = await sql`
        SELECT discovery_count, leads_created
        FROM b2b_orchestration_logs
        ORDER BY started_at DESC
        LIMIT 1
      `;
      if (lastRunResult.length > 0) {
        overnight = {
          discovered: lastRunResult[0].discovery_count || 0,
          qualified: lastRunResult[0].leads_created || 0
        };
      }
    } catch (err) {
      console.warn('[B2B] Failed to fetch overnight activity:', err instanceof Error ? err.message : String(err));
    }

    // Get conversion funnel
    let funnel = {
      discovered: 0,
      qualified: 0,
      contacted: 0,
      opened: 0,
      clicked: 0,
      replied: 0,
      won: 0
    };
    try {
      const funnelResult = await sql`
        SELECT
          COUNT(*) as discovered,
          COUNT(*) FILTER (WHERE lead_tier IS NOT NULL) as qualified,
          COUNT(*) FILTER (WHERE email_sent_at IS NOT NULL) as contacted,
          COUNT(*) FILTER (WHERE status IN ('warm', 'engaged')) as opened,
          COUNT(*) FILTER (WHERE status = 'engaged') as clicked,
          COUNT(*) FILTER (WHERE status = 'qualified') as replied,
          COUNT(*) FILTER (WHERE status = 'won') as won
        FROM b2b_leads
      `;
      if (funnelResult.length > 0) {
        const row = funnelResult[0] as any;
        funnel = {
          discovered: row.discovered || 0,
          qualified: row.qualified || 0,
          contacted: row.contacted || 0,
          opened: row.opened || 0,
          clicked: row.clicked || 0,
          replied: row.replied || 0,
          won: row.won || 0
        };
      }
    } catch (err) {
      console.warn('[B2B] Failed to fetch conversion funnel:', err instanceof Error ? err.message : String(err));
    }

    // Get queue state
    let queueState = { waiting_for_outreach: 0, awaiting_response: 0, stuck_over_5_days: 0 };
    try {
      const queueResult = await sql`
        SELECT
          COUNT(*) FILTER (WHERE email_sent_at IS NULL) as waiting_for_outreach,
          COUNT(*) FILTER (WHERE email_sent_at IS NOT NULL AND status = 'new') as awaiting_response,
          COUNT(*) FILTER (WHERE email_sent_at IS NOT NULL AND created_at < NOW() - INTERVAL '5 days' AND status = 'new') as stuck_over_5_days
        FROM b2b_leads
      `;
      if (queueResult.length > 0) {
        queueState = {
          waiting_for_outreach: queueResult[0].waiting_for_outreach || 0,
          awaiting_response: queueResult[0].awaiting_response || 0,
          stuck_over_5_days: queueResult[0].stuck_over_5_days || 0
        };
      }
    } catch (err) {
      console.warn('[B2B] Failed to fetch queue state:', err instanceof Error ? err.message : String(err));
    }

    // Calculate system health
    const open_rate = funnel.contacted > 0 ? Math.round((funnel.opened / funnel.contacted) * 100) : 0;
    const reply_rate = funnel.contacted > 0 ? Math.round((funnel.replied / funnel.contacted) * 100) : 0;
    const conversion_rate = funnel.qualified > 0 ? Math.round((funnel.won / funnel.qualified) * 100) : 0;

    return {
      overnight,
      funnel,
      queue_state: queueState,
      system_health: {
        open_rate,
        reply_rate,
        conversion_rate
      }
    };
  } catch (err) {
    console.error('[B2B] Fatal error in getMorningBrief:', err instanceof Error ? err.message : String(err));
    return getDefaultBrief();
  }
}

function getDefaultBrief(): MorningBriefData {
  return {
    overnight: { discovered: 0, qualified: 0 },
    funnel: {
      discovered: 0,
      qualified: 0,
      contacted: 0,
      opened: 0,
      clicked: 0,
      replied: 0,
      won: 0
    },
    queue_state: {
      waiting_for_outreach: 0,
      awaiting_response: 0,
      stuck_over_5_days: 0
    },
    system_health: {
      open_rate: 0,
      reply_rate: 0,
      conversion_rate: 0
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
      // Query sorted by conversation urgency (REPLIED → CLICKED → OPENED → CONTACTED → UNCONTACTED)
      leads = await sql`
        SELECT
          bl.id,
          bl.business_name,
          bl.business_category,
          bl.email,
          bl.email_sent_at,
          bl.engagement_score,
          bl.lead_tier,
          bl.status
        FROM b2b_leads bl
        ORDER BY
          CASE
            WHEN bl.status = 'engaged' THEN 1
            WHEN bl.status = 'warm' AND bl.email_sent_at IS NOT NULL THEN 2
            WHEN bl.email_sent_at IS NOT NULL THEN 3
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

    return leads.map((lead: any) => {
      const isContacted = !!lead.email_sent_at;
      const state = !isContacted ? 'Waiting for outreach' : lead.status === 'warm' ? 'Awaiting response' : lead.status === 'engaged' ? 'Engaged' : 'New';

      return {
        id: lead.id,
        business_name: lead.business_name,
        business_category: lead.business_category,
        email: lead.email || undefined,
        last_contacted_at: lead.email_sent_at || undefined,
        engagement_score: lead.engagement_score || 0,
        lead_tier: lead.lead_tier,
        opportunity: `${state} — ${lead.business_name}`,
        context: `Current stage: ${state}. This prospect is ${!isContacted ? 'ready for initial outreach' : 'awaiting our response'}.`,
        recommendation: !isContacted ? `Send first outreach email` : `Follow up with sequence`,
        executiveSummary: `State: ${state} | Score: ${lead.engagement_score}/100 | Category: ${lead.business_category}`,
        evidence: [
          `Status: ${state}`,
          isContacted ? `First contacted: ${new Date(lead.email_sent_at).toLocaleDateString()}` : 'Not yet contacted',
          `Category: ${lead.business_category}`,
          `Engagement: ${lead.engagement_score}/100`
        ],
        engagement: {
          sent_at: lead.sent_at || undefined,
          opened_count: 0,
          clicked_count: 0,
          replied: (lead.replied_count || 0) > 0
        }
      };
    });
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

      {/* MORNING BRIEF — SYSTEM MOVEMENT (Premium Metrics) */}
      <div className="mb-16">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          System Health
        </p>

        {/* Metric Cards Grid — Large, Clean, Focused */}
        <div className="grid grid-cols-3 gap-8">
          {/* Waiting for Outreach */}
          <div className="border border-[#E8E8E8] rounded px-6 py-8 bg-white hover:border-[#D0D0D0] transition-colors">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888] mb-4">
              Waiting for Outreach
            </p>
            <p className="text-5xl font-black text-[#0D0D0D] leading-none">
              {brief.queue_state.waiting_for_outreach}
            </p>
          </div>

          {/* Awaiting Response */}
          <div className="border border-[#E8E8E8] rounded px-6 py-8 bg-white hover:border-[#D0D0D0] transition-colors">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888] mb-4">
              Awaiting Response
            </p>
            <p className="text-5xl font-black text-[#0D0D0D] leading-none">
              {brief.queue_state.awaiting_response}
            </p>
          </div>

          {/* Open Rate */}
          <div className="border border-[#E8E8E8] rounded px-6 py-8 bg-white hover:border-[#D0D0D0] transition-colors">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888] mb-4">
              Open Rate
            </p>
            <p className="text-5xl font-black text-[#0D0D0D] leading-none">
              {brief.system_health.open_rate}%
            </p>
          </div>
        </div>
      </div>

      {/* Conversion Funnel — Visual Clarity */}
      <div className="mb-16">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          Conversion Pipeline
        </p>
        <div className="border border-[#E8E8E8] rounded px-8 py-10 bg-white">
          <div className="flex items-end justify-between">
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888] mb-3">
                Discovered
              </p>
              <p className="text-4xl font-black text-[#0D0D0D]">
                {brief.funnel.discovered}
              </p>
            </div>
            <div className="text-[#D0D0D0] text-2xl mb-4">—</div>
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888] mb-3">
                Qualified
              </p>
              <p className="text-4xl font-black text-[#0D0D0D]">
                {brief.funnel.qualified}
              </p>
            </div>
            <div className="text-[#D0D0D0] text-2xl mb-4">—</div>
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888] mb-3">
                Contacted
              </p>
              <p className="text-4xl font-black text-[#0D0D0D]">
                {brief.funnel.contacted}
              </p>
            </div>
            <div className="text-[#D0D0D0] text-2xl mb-4">—</div>
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888] mb-3">
                Replied
              </p>
              <p className="text-4xl font-black text-[#0D0D0D]">
                {brief.funnel.replied}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Alert — Subtle, Focused */}
      {brief.queue_state.stuck_over_5_days > 0 && (
        <div className="mb-16 border border-[#E8E8E8] rounded px-6 py-5 bg-[#FAFAFA]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888] mb-2">
            Attention
          </p>
          <p className="text-sm text-[#0D0D0D]">
            <span className="font-semibold">{brief.queue_state.stuck_over_5_days}</span> prospect{brief.queue_state.stuck_over_5_days !== 1 ? 's' : ''} awaiting response for 5+ days
          </p>
        </div>
      )}

      {/* MORNING BRIEF — EXECUTIVE INTELLIGENCE SURFACE */}
      <div className="mb-16">
        <h1 className="font-sans font-black text-[#0D0D0D] text-5xl tracking-tight mb-8">
          Good Morning.
        </h1>

        {/* PRESSURE ENGINE — Forces Immediate Action */}
        <div className="bg-white border border-[#E8E8E8] rounded px-8 py-8 mb-12">
          <div className="space-y-4">
            {brief.overnight.discovered > 0 && (
              <p className="text-base leading-relaxed text-[#0D0D0D]">
                <span className="font-semibold text-[#0D0D0D]">{brief.overnight.discovered} high-intent opportunity{brief.overnight.discovered !== 1 ? 'ies' : ''} require outreach today.</span>
              </p>
            )}

            {brief.queue_state.waiting_for_outreach > 0 && (
              <p className="text-base leading-relaxed text-[#0D0D0D]">
                <span className="font-semibold text-[#0D0D0D]">{brief.queue_state.waiting_for_outreach} conversation{brief.queue_state.waiting_for_outreach !== 1 ? 's' : ''} at risk of going cold</span> — follow-up needed.
              </p>
            )}

            {brief.queue_state.stuck_over_5_days > 0 && (
              <p className="text-base leading-relaxed text-[#CC6600]">
                <span className="font-semibold text-[#CC6600]">{brief.queue_state.stuck_over_5_days} revenue stream blocked</span> — preventing job creation.
              </p>
            )}

            {brief.funnel.replied === 0 && brief.queue_state.waiting_for_outreach > 0 && (
              <p className="text-base leading-relaxed text-[#0D0D0D]">
                <span className="font-semibold text-[#0D0D0D]">Zero replies detected</span> — outreach copy requires review.
              </p>
            )}
          </div>
        </div>

        {/* PRIORITY ACTION — Single Focus Point */}
        {prospects.length > 0 && (
          <div className="mb-12 bg-[#0D0D0D] text-white rounded px-8 py-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-2 opacity-75">
              Priority Action
            </p>
            <p className="text-lg font-semibold">
              {prospects[0].business_name} — follow up today.
            </p>
          </div>
        )}
      </div>

      {/* TODAY'S WORK — Execution Section */}
      <div className="mb-12">
        <h2 className="font-sans font-black text-[#0D0D0D] text-2xl tracking-tight mb-8">
          Today's Work.
        </h2>

        {/* SECTION 2: PROSPECT QUEUE */}
        <div className="space-y-4 mb-16">
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
              engagement={prospect.engagement}
            />
          ))
        )}
        </div>

        {/* SECTION 3: SYSTEM STATUS */}
        <div className="pt-12 border-t border-[#E8E8E8]">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">
            Background Operations
          </p>
          <div className="grid grid-cols-2 gap-4 text-[10px] text-[#888888]">
            <div>Discovery Pipeline: <span className="font-semibold">Active</span></div>
            <div>Enrichment: <span className="font-semibold">Active</span></div>
            <div>Ranking Engine: <span className="font-semibold">Active</span></div>
            <div>Learning System: <span className="font-semibold">Active</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
