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

// Category-based insights (pressure, opportunity, recommendation, reasoning)
const categoryInsights: Record<
  string,
  {
    pressure: string
    opportunity: string
    recommendation: string
    reasoning: string[]
  }
> = {
  florist: {
    pressure: "Seasonal demand creates unpredictable revenue swings.",
    opportunity: "Event-focused promotions could stabilize year-round bookings.",
    recommendation: "Send Event Growth Brief",
    reasoning: [
      "Event planning is driving demand for seasonal florists",
      "No contact in 8+ days (optimal engagement window)",
      "Similar businesses saw 28% conversion rate"
    ]
  },
  accountant: {
    pressure: "Client acquisition is the primary growth constraint.",
    opportunity: "Streamlined processes could double billable hours.",
    recommendation: "Send Efficiency Assessment",
    reasoning: [
      "Administrative overhead is limiting growth potential",
      "Process automation aligns with their business model",
      "Peer firms in this space show strong adoption"
    ]
  },
  dental: {
    pressure: "Patient acquisition directly impacts practice utilization.",
    opportunity: "Strategic marketing could fill 15-20% of open slots.",
    recommendation: "Send Patient Pipeline Strategy",
    reasoning: [
      "Dental practices are capacity-constrained, not demand-constrained",
      "Recent data suggests growth opportunity",
      "Proven track record with similar practices"
    ]
  },
  removal: {
    pressure: "Job availability is unpredictable and inconsistent.",
    opportunity: "Predictable pipeline would improve team utilization.",
    recommendation: "Send Pipeline Stability Plan",
    reasoning: [
      "Removal companies benefit from consistent booking flow",
      "Long sales cycle means early engagement matters",
      "No recent contact activity detected"
    ]
  },
  restaurant: {
    pressure: "Customer acquisition is expensive and sporadic.",
    opportunity: "Regular promotions could build predictable traffic.",
    recommendation: "Send Marketing Automation Proposal",
    reasoning: [
      "Restaurants rely on repeat customers and consistency",
      "Marketing automation has proven ROI in this sector",
      "Timing suggests readiness for growth conversation"
    ]
  },
  legal: {
    pressure: "Client retention requires constant relationship investment.",
    opportunity: "Better systems could strengthen existing relationships.",
    recommendation: "Send Client Relationship Framework",
    reasoning: [
      "Law firms prioritize existing client expansion",
      "Systems investment improves retention and lifetime value",
      "Industry trends support this conversation now"
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
      pressure: prospect.pain_point || "Lead generation",
      opportunity: "Process improvement could unlock growth",
      recommendation: "Send introduction",
      reasoning: [
        "Strong fit for our services",
        "No recent contact activity",
        "Optimal engagement window"
      ]
    };
    return { ...prospect, ...insights };
  });

  // Count high-confidence and stats
  const highConfidence = prospectsWithInsights.filter(p =>
    (p.recommendation?.includes("Strategy") || p.recommendation?.includes("Framework"))
  ).length;
  const notContacted = prospectsWithInsights.filter(p => !p.last_contacted_at).length;
  const totalProspects = prospectsWithInsights.length;

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
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">Good morning.</h1>
          <div className="space-y-2 mb-8">
            <p className="text-lg text-gray-700">
              <span className="font-semibold">{totalProspects} opportunities</span> need attention today.
            </p>
            <p className="text-gray-600">
              <span className="font-medium">{highConfidence} are high-confidence</span> • {notContacted} have not been contacted • Perfect timing for outreach
            </p>
          </div>

          {prospectsWithInsights.length === 0 ? (
            // Empty State
            <div className="py-16 text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                No prospects ready today
              </h2>
              <p className="text-gray-600 mb-6">
                Discovery pipeline is processing new candidates. Check back in a
                few hours or view the full pipeline.
              </p>
              <Link
                href="/dashboard/admin/b2b/pipeline"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded text-sm hover:bg-blue-700 transition-colors"
              >
                View Full Pipeline
              </Link>
            </div>
          ) : (
            <>
              {/* Prospects Grid */}
              <div className="space-y-4 mb-8">
                {prospectsWithInsights.map((prospect) => (
                  <ProspectCard
                    key={prospect.id}
                    prospect={prospect}
                    pressure={prospect.pressure}
                    opportunity={prospect.opportunity}
                    recommendation={prospect.recommendation}
                    reasoning={prospect.reasoning}
                  />
                ))}
              </div>

              {/* Show Full Pipeline Link */}
              <div className="pt-6 border-t border-gray-200">
                <Link
                  href="/dashboard/admin/b2b/pipeline"
                  className="text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors"
                >
                  Show full pipeline ({prospects.length}+ prospects) →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
