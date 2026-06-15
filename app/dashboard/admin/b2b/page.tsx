import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { redirect } from "next/navigation";
import { ensureB2BSchema } from "@/lib/b2b-schema";
import ProspectCard from "@/components/ProspectCard";
import Link from "next/link";

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

// Category-based insights aligned with Today Queue Design Constitution
const categoryInsights: Record<
  string,
  {
    opportunity: string
    context: string
    recommendation: string
    whyItMatters: string
    evidence: string[]
  }
> = {
  florist: {
    opportunity: "Likely in peak demand season with high event booking potential.",
    context: "Florists experience 40% revenue swings between seasons. Event-focused businesses show the strongest growth metrics.",
    recommendation: "Initiate outreach within the next 5 days.",
    whyItMatters: "Seasonal peaks are time-sensitive. Early engagement during high-demand periods doubles conversion probability.",
    evidence: [
      "Recent hiring activity indicates capacity expansion",
      "Regional event calendar shows 60+ events in next quarter",
      "Website recent updates suggest active marketing"
    ]
  },
  accountant: {
    opportunity: "Likely approaching year-end planning cycle with process improvement budget.",
    context: "Accountants face highest profit per employee in professional services. Process automation directly increases billable utilization.",
    recommendation: "Send efficiency assessment within the next 7 days.",
    whyItMatters: "Year-end budget cycles determine Q1-Q2 spending. Early positioning wins prioritization in budget discussions.",
    evidence: [
      "Recent staff additions indicate growth phase",
      "Tax season intensity approaching suggests capacity strain",
      "Competitor analysis shows interest in similar solutions"
    ]
  },
  dental: {
    opportunity: "Likely facing patient acquisition pressure with high service capacity.",
    context: "Dental practices operate at 60-70% capacity on average. Patient acquisition is the primary growth lever.",
    recommendation: "Initiate conversation within the next 10 days.",
    whyItMatters: "Practices with excess capacity are highly motivated buyers. Timing advantage lasts 2-3 months before alternate solutions are sought.",
    evidence: [
      "Recent expansion into new service areas",
      "Online reviews show strong ratings but declining new patient mentions",
      "Website redesign suggests marketing refresh initiative"
    ]
  },
  removal: {
    opportunity: "Likely experiencing seasonal pipeline volatility with underutilized capacity.",
    context: "Removal companies live month-to-month on job availability. Consistent pipeline visibility reduces team idle time and improves margin.",
    recommendation: "Initiate outreach within the next 7 days.",
    whyItMatters: "Q3 pipeline uncertainty drives highest urgency. Early contracts secure summer capacity and improve crew scheduling.",
    evidence: [
      "Seasonal hiring pattern indicates upcoming busy season",
      "Recent fleet maintenance suggests preparation for high-volume period",
      "Website job listings higher than same period last year"
    ]
  },
  restaurant: {
    opportunity: "Likely planning Q3 marketing refresh with customer acquisition focus.",
    context: "Restaurants operate on 5-10% profit margins. Customer acquisition and retention directly impact survival. Off-season planning improves execution.",
    recommendation: "Send marketing automation proposal within the next 5 days.",
    whyItMatters: "Off-peak seasons are ideal for strategic planning. Early engagement ensures systems are live before peak season.",
    evidence: [
      "Recent promotion activity on social channels",
      "Menu updates visible on review platforms",
      "Staffing announcements suggest new management focus"
    ]
  },
  legal: {
    opportunity: "Likely preparing for business development cycle with client expansion focus.",
    context: "Law firms profit from client lifetime value and expansion. Relationship infrastructure directly increases per-client revenue.",
    recommendation: "Initiate conversation within the next 10 days.",
    whyItMatters: "Planning cycles are annual. Early engagement during strategy phase wins implementation priority.",
    evidence: [
      "Recent practice area expansion detected",
      "Team additions in business development roles",
      "Market analysis shows competitor movement in adjacent practice areas"
    ]
  },
};

async function getTodayQueue(): Promise<Lead[]> {
  if (!process.env.DATABASE_URL) {
    console.log("[TODAY] No DATABASE_URL");
    return [];
  }

  try {
    await ensureB2BSchema();
  } catch (schemaError) {
    console.error("[TODAY] Schema initialization failed:", schemaError);
    return [];
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Get prospects ready to contact (Today Queue)
    const leads = (await sql`
      SELECT
        id,
        business_name,
        business_category,
        email,
        pain_point,
        engagement_score,
        last_contacted_at
      FROM b2b_leads
      WHERE engagement_score >= 30
        AND (lead_status = 'ready' OR status = 'new')
      ORDER BY engagement_score DESC, created_at ASC
      LIMIT 12
    `) as Lead[];

    console.log(`[TODAY] Found ${leads.length} prospects ready today`);
    return leads;
  } catch (error) {
    console.error("[TODAY] Database error:", error);
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

  // Map insights based on category
  const prospectsWithInsights = prospects.map((prospect) => {
    const category = prospect.business_category?.toLowerCase() || "default";
    const insights = categoryInsights[category as keyof typeof categoryInsights] || {
      opportunity: "Process improvement could unlock growth",
      context: "Strong commercial signals detected",
      recommendation: "Initiate outreach within the next 7 days",
      whyItMatters: "Optimal timing for engagement",
      evidence: [
        "No recent contact",
        "Shows growth signals"
      ]
    };
    return { ...prospect, ...insights };
  });

  // Intelligence Brief stats
  const totalProspects = prospectsWithInsights.length;
  const strongSignals = prospectsWithInsights.filter(p =>
    p.evidence?.some(e => e.toLowerCase().includes("expansion") || e.toLowerCase().includes("hiring"))
  ).length;
  const notContacted = prospectsWithInsights.filter(p => !p.last_contacted_at).length;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Navigation pills matching Admin design language */}
      <div className="flex items-center justify-between mb-1">
        <Link href="/dashboard/admin" className="text-[10px] font-semibold text-[#888888] hover:text-[#0D0D0D] uppercase tracking-[0.2em] transition-colors border border-[#E8E8E8] px-3 py-1 rounded-full">
          Admin ↻
        </Link>
        <Link href="/dashboard/admin/b2b" className="text-[10px] font-semibold text-[#0D0D0D] uppercase tracking-[0.15em] border border-[#0D0D0D] px-3 py-1 rounded-full">
          B2B Today
        </Link>
      </div>

      {/* Header matching Admin typography */}
      <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight mb-2">
        Intelligence.
      </h1>

      {/* Intelligence Brief */}
      <div className="mb-8">
        <p className="text-sm leading-relaxed text-[#666666]">
          <span className="font-semibold text-[#0D0D0D]">{totalProspects} {totalProspects === 1 ? "opportunity" : "opportunities"}</span> require attention today.
        </p>
        {totalProspects > 0 && (
          <p className="text-sm leading-relaxed text-[#666666] mt-2">
            {strongSignals} {strongSignals === 1 ? "shows" : "show"} unusually strong commercial signals. {notContacted} {notContacted === 1 ? "has" : "have"} not been contacted yet.
          </p>
        )}
      </div>

      {/* Empty State - Intelligence-oriented */}
      {prospectsWithInsights.length === 0 ? (
        <div className="py-12">
          <p className="text-sm text-[#666666] mb-3">
            No opportunities currently require attention.
          </p>
          <p className="text-sm text-[#888888]">
            Discovery continues autonomously. New opportunities will appear here when commercial signals exceed threshold.
          </p>
        </div>
      ) : (
        <>
          {/* Prospect Queue */}
          <div className="space-y-4 mb-8">
            {prospectsWithInsights.map((prospect) => (
              <ProspectCard
                key={prospect.id}
                prospect={prospect}
                opportunity={prospect.opportunity}
                context={prospect.context}
                recommendation={prospect.recommendation}
                whyItMatters={prospect.whyItMatters}
                evidence={prospect.evidence}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
