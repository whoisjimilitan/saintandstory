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

async function getRealProspects(): Promise<ProspectData[]> {
  const sql = neon(process.env.DATABASE_URL!);

  const leads = await sql`
    SELECT
      bl.id,
      bl.business_name,
      bl.business_category,
      bl.email,
      bl.email_sent_at,
      bl.engagement_score,
      bl.lead_tier,
      eb.opportunity,
      eb.ai_observations
    FROM b2b_leads bl
    LEFT JOIN enriched_businesses eb ON bl.id::text = eb.discovered_business_id::text
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

  return leads.map((lead: any) => ({
    id: lead.id,
    business_name: lead.business_name,
    business_category: lead.business_category,
    email: lead.email || undefined,
    last_contacted_at: lead.email_sent_at || undefined,
    engagement_score: lead.engagement_score || 0,
    lead_tier: lead.lead_tier,
    opportunity: lead.opportunity || `Exploring partnership opportunities with ${lead.business_name}.`,
    context: lead.ai_observations || `This ${lead.business_category} business has been identified as a qualified opportunity based on commercial signals.`,
    recommendation: `Contact to discuss how we can support ${lead.business_name}'s growth.`,
    executiveSummary: `Tier-${lead.lead_tier || 'C'} opportunity with engagement score ${lead.engagement_score}/100.`,
    evidence: [
      `Discovered via autonomous discovery pipeline`,
      `Category: ${lead.business_category}`,
      `Engagement Score: ${lead.engagement_score}/100`,
      `Lead Tier: ${lead.lead_tier || 'C'}`
    ]
  }));
}

export default async function B2BTodayPage() {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId) redirect("/sign-in");
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email)) redirect("/dashboard/driver");

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
