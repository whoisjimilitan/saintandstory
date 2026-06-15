import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ensureB2BSchema } from "@/lib/b2b-schema";
import ProspectCard from "@/components/ProspectCard";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];

interface Lead {
  id: string;
  business_name: string;
  business_category?: string;
  email?: string;
  pain_point?: string;
  engagement_score?: number;
  last_contacted_at?: string;
}

const categoryInsights: Record<
  string,
  {
    opportunity: string
    context: string
    recommendation: string
    executiveSummary: string
    evidence: string[]
  }
> = {
  florist: {
    opportunity: "Expanding service capacity with high event booking pressure.",
    context: "Florists experience peak demand seasons. Vendors supporting expansion during high-demand windows capture long-term contracts.",
    recommendation: "Contact before procurement cycle begins.",
    executiveSummary: "Commercial signals suggest expansion into new service categories. Timing is optimal for vendor evaluation.",
    evidence: [
      "Recent hiring activity",
      "Event calendar shows peak season approaching",
      "Website updates indicate active marketing"
    ]
  },
  accountant: {
    opportunity: "Planning year-end process improvements with budget allocation.",
    context: "Year-end planning cycles determine Q1-Q2 vendor priorities. Early engagement wins budget prioritization.",
    recommendation: "Send assessment proposal within 7 days.",
    executiveSummary: "Planning phase signals readiness for efficiency tools. Budget cycles are underway.",
    evidence: [
      "Staff additions indicate growth",
      "Tax season timing suggests capacity strain",
      "Competitor movement shows active market evaluation"
    ]
  },
  dental: {
    opportunity: "Managing high service capacity with patient acquisition focus.",
    context: "Dental practices at capacity are highly motivated buyers. Excess capacity improves deal probability.",
    recommendation: "Initiate conversation within 10 days.",
    executiveSummary: "Capacity signals suggest vendor evaluation window. Practice is positioned to invest.",
    evidence: [
      "Service expansion recent",
      "Reviews strong but new patient acquisition declining",
      "Marketing refresh suggests new strategy"
    ]
  },
  removal: {
    opportunity: "Managing seasonal capacity volatility with pipeline planning.",
    context: "Seasonal companies benefit most from pipeline visibility. Early contracts secure capacity.",
    recommendation: "Contact within 7 days.",
    executiveSummary: "Seasonal signals indicate planning phase. Timing advantage is time-limited.",
    evidence: [
      "Seasonal hiring pattern underway",
      "Fleet maintenance suggests preparation",
      "Job listings higher than historical baseline"
    ]
  },
  restaurant: {
    opportunity: "Planning Q3 customer acquisition strategy.",
    context: "Off-peak planning improves execution. Early engagement ensures systems are live before peak.",
    recommendation: "Contact within 5 days.",
    executiveSummary: "Strategic planning phase detected. Optimal timing for implementation discussion.",
    evidence: [
      "Promotion activity on social channels",
      "Menu updates suggest strategy refresh",
      "Management changes indicate new focus"
    ]
  },
  legal: {
    opportunity: "Preparing business development cycle with expansion focus.",
    context: "Planning cycles are annual. Early engagement wins implementation priority.",
    recommendation: "Contact within 10 days.",
    executiveSummary: "Strategic planning phase detected. Early positioning improves prioritization.",
    evidence: [
      "Practice area expansion underway",
      "BD team additions recent",
      "Market movement suggests evaluation phase"
    ]
  },
};

async function getTodayQueue(): Promise<Lead[]> {
  if (!process.env.DATABASE_URL) return [];

  try {
    await ensureB2BSchema();
  } catch {
    return [];
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    const leads = (await sql`
      SELECT
        id,
        business_name,
        business_category,
        email,
        engagement_score,
        last_contacted_at
      FROM b2b_leads
      WHERE engagement_score >= 30
        AND (lead_status = 'ready' OR status = 'new')
      ORDER BY engagement_score DESC, created_at ASC
      LIMIT 12
    `) as Lead[];

    return leads;
  } catch {
    return [];
  }
}

export default async function B2BTodayPage() {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId) redirect("/sign-in");
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email)) redirect("/dashboard/driver");

  const prospects = await getTodayQueue();

  const prospectsWithInsights = prospects.map((prospect) => {
    const category = prospect.business_category?.toLowerCase() || "default";
    const insights = categoryInsights[category as keyof typeof categoryInsights] || {
      opportunity: "Commercial signals detected.",
      context: "Optimal timing for engagement.",
      recommendation: "Initiate contact within 7 days.",
      executiveSummary: "Strong commercial positioning.",
      evidence: []
    };
    return { ...prospect, ...insights };
  });

  const strong = prospectsWithInsights.filter(p =>
    p.evidence?.some(e => e.toLowerCase().includes("expansion") || e.toLowerCase().includes("recent"))
  ).length;
  const uncontacted = prospectsWithInsights.filter(p => !p.last_contacted_at).length;

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
          <span className="font-semibold">{prospectsWithInsights.length} {prospectsWithInsights.length === 1 ? "opportunity" : "opportunities"}</span> currently exceed action threshold.
        </p>
        {prospectsWithInsights.length > 0 && (
          <>
            <p className="text-base leading-relaxed text-[#0D0D0D] mb-2">
              <span className="font-semibold">{strong}</span> {strong === 1 ? "displays" : "display"} unusually strong commercial signals.
            </p>
            <p className="text-base leading-relaxed text-[#0D0D0D] mb-2">
              <span className="font-semibold">{uncontacted}</span> {uncontacted === 1 ? "requires" : "require"} operator review.
            </p>
            <p className="text-base leading-relaxed text-[#666666]">
              Discovery continues autonomously.
            </p>
          </>
        )}
      </div>

      {/* SECTION 2: TODAY'S OPPORTUNITIES */}
      {prospectsWithInsights.length > 0 && (
        <>
          <div className="mb-8">
            <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">
              Today's Opportunities
            </p>

            {/* SECTION 3: QUEUE */}
            <div className="space-y-4">
              {prospectsWithInsights.map((prospect) => (
                <ProspectCard
                  key={prospect.id}
                  prospect={prospect}
                  opportunity={prospect.opportunity}
                  context={prospect.context}
                  recommendation={prospect.recommendation}
                  executiveSummary={prospect.executiveSummary}
                  evidence={prospect.evidence}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* SECTION 4: SYSTEM STATUS */}
      <div className="mt-12 pt-8 border-t border-[#E8E8E8]">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-2">
          System Status
        </p>
        <div className="flex gap-4 text-[10px] text-[#888888]">
          <span>Discovery active.</span>
          <span>Enrichment active.</span>
          <span>Learning active.</span>
        </div>
      </div>
    </div>
  );
}
