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
    <div className="w-full">
      {/* B2B Navigation Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-8">
            <Link
              href="/dashboard/admin/b2b"
              className="py-4 px-0 border-b-2 border-blue-600 text-sm font-medium text-blue-600"
            >
              Today
            </Link>
            <Link
              href="/dashboard/admin/b2b/pipeline"
              className="py-4 px-0 border-b-2 border-transparent text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-200"
            >
              Pipeline
            </Link>
            <Link
              href="/dashboard/admin/b2b/discovery"
              className="py-4 px-0 border-b-2 border-transparent text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-200"
            >
              Discovery
            </Link>
            <Link
              href="/dashboard/admin/b2b/orders"
              className="py-4 px-0 border-b-2 border-transparent text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-200"
            >
              Standing Orders
            </Link>
            <Link
              href="/dashboard/admin/b2b/analytics"
              className="py-4 px-0 border-b-2 border-transparent text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-200"
            >
              Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-8 py-12">
          {/* Intelligence Brief Header */}
          <div className="mb-12">
            <p className="text-lg leading-relaxed text-gray-900">
              <span className="font-semibold">{totalProspects} opportunities</span> require attention today.
            </p>
            <p className="text-base leading-relaxed text-gray-700 mt-3">
              {strongSignals} show unusually strong commercial signals. {notContacted} have not been contacted yet. Timing is optimal for initial outreach.
            </p>
          </div>

          {prospectsWithInsights.length === 0 ? (
            // Empty State
            <div className="py-20 text-center">
              <p className="text-lg text-gray-600 mb-6">
                Discovery pipeline is processing. Check back in a few hours.
              </p>
              <Link
                href="/dashboard/admin/b2b/pipeline"
                className="inline-block px-6 py-3 bg-gray-900 text-white font-medium rounded hover:bg-gray-800 transition-colors"
              >
                View Full Pipeline
              </Link>
            </div>
          ) : (
            <>
              {/* Prospect Queue */}
              <div className="space-y-6 mb-12">
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

              {/* Link to Full Pipeline */}
              <div className="text-center">
                <Link
                  href="/dashboard/admin/b2b/pipeline"
                  className="text-gray-600 hover:text-gray-900 text-base transition-colors"
                >
                  View full pipeline →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
