import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProspectCard from "@/components/ProspectCard";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];

interface MockProspect {
  id: string;
  business_name: string;
  business_category: string;
  email: string;
  last_contacted_at?: string;
  opportunity: string;
  context: string;
  recommendation: string;
  executiveSummary: string;
  evidence: string[];
}

// Mock data for design review
const mockProspects: MockProspect[] = [
  {
    id: "1",
    business_name: "Meadowbrook Care Group",
    business_category: "care homes",
    email: "procurement@meadowbrook.co.uk",
    last_contacted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    opportunity: "Expanding operations across three new locations in the North West.",
    context: "Recent hiring activity and procurement changes indicate active vendor evaluation. Expansion timelines suggest procurement decisions are underway.",
    recommendation: "Initiate contact before procurement planning completes.",
    executiveSummary: "Commercial signals indicate expansion phase. Vendor selection process is likely underway. Timing advantage is optimal for partnership positioning.",
    evidence: [
      "Opened second location in Manchester",
      "Hiring Operations Manager and Supply Chain roles",
      "New procurement contact identified on LinkedIn",
      "Corporate website updated with expansion strategy"
    ]
  },
  {
    id: "2",
    business_name: "Premier Removals & Storage",
    business_category: "removals",
    email: "operations@premierremovalsstorage.co.uk",
    last_contacted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    opportunity: "Managing seasonal capacity planning for summer peak period.",
    context: "Seasonal companies operate month-to-month on job availability. Early pipeline visibility reduces idle capacity and improves crew utilization.",
    recommendation: "Contact within 7 days to position for summer contract planning.",
    executiveSummary: "Seasonal signals suggest active planning for Q3 capacity. Fleet expansion hints indicate preparation for high-volume period. Early engagement secures long-term positioning.",
    evidence: [
      "Seasonal hiring announcements posted",
      "Fleet maintenance records updated recently",
      "Job listings 34% higher than same period last year",
      "New depot being prepared for operations"
    ]
  },
  {
    id: "3",
    business_name: "Commercial Cleaning Solutions Ltd",
    business_category: "commercial cleaning",
    email: "tenders@ccleaningsolutions.co.uk",
    last_contacted_at: undefined,
    opportunity: "Managing rapid growth with expanded client base and service territories.",
    context: "Growth-phase companies evaluate vendor partnerships when expansion accelerates. Decision cycles compress during rapid scaling periods.",
    recommendation: "Introduce capabilities before expansion finalizes.",
    executiveSummary: "Growth trajectory suggests vendor consolidation underway. Management changes indicate strategic repositioning. Expansion window is open for partnership discussions.",
    evidence: [
      "Won three new corporate contracts in Q2",
      "Announced expansion to Scotland and Wales",
      "New Managing Director onboarded recently",
      "Recruitment drive for operational roles"
    ]
  },
  {
    id: "4",
    business_name: "Riverside Property Management",
    business_category: "property management",
    email: "director@riversideproperty.co.uk",
    last_contacted_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    opportunity: "Implementing technology refresh across portfolio operations.",
    context: "Property management firms benefit from integrated systems during portfolio expansion. Technology adoption accelerates during growth phases.",
    recommendation: "Schedule consultation before technology selection completes.",
    executiveSummary: "Digital transformation indicators suggest system evaluation phase. Portfolio growth signals capability expansion needs. Early positioning wins integration priority.",
    evidence: [
      "Portfolio expanded by 12 properties in last 6 months",
      "RFP issued for management software platforms",
      "New Technology Director hired in March",
      "Stakeholder meetings scheduled for Q3"
    ]
  },
  {
    id: "5",
    business_name: "Logistics Hub Distribution",
    business_category: "logistics",
    email: "procurement@logisticshubd.co.uk",
    last_contacted_at: undefined,
    opportunity: "Planning supply chain optimization for UK network expansion.",
    context: "Distribution hubs operate on tight margins. Supply chain improvements directly impact profitability and competitive positioning.",
    recommendation: "Initiate capabilities discussion before network planning finalizes.",
    executiveSummary: "Network expansion plans indicate vendor evaluation window. Margin pressure suggests operational efficiency focus. Supply chain modernization is imminent.",
    evidence: [
      "New distribution center under construction",
      "Supply chain team expanded by four positions",
      "Procurement audit completed in April",
      "Management consultants engaged for optimization"
    ]
  },
  {
    id: "6",
    business_name: "Elite Construction Group",
    business_category: "construction",
    email: "operations@eliteconstructiongroup.co.uk",
    last_contacted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    opportunity: "Managing concurrent projects with increased operational complexity.",
    context: "Construction firms scaling operations require vendor partnerships for complexity management. Project volume increases create procurement windows.",
    recommendation: "Contact within 10 days to discuss operational support options.",
    executiveSummary: "Project pipeline growth indicates capability expansion needs. Operational complexity is increasing. Vendor consolidation conversations are likely underway.",
    evidence: [
      "Major contract awarded for residential development",
      "Project pipeline increased 40% year-on-year",
      "Operations team doubled in the past 12 months",
      "New regional office opening in Birmingham"
    ]
  },
  {
    id: "7",
    business_name: "Facilities Plus Management",
    business_category: "facilities management",
    email: "director@facilitiesplus.co.uk",
    last_contacted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    opportunity: "Consolidating vendor partnerships across multiple client contracts.",
    context: "Multi-client facilities management firms benefit from standardized vendor relationships. Contract consolidation improves margin profile and operational efficiency.",
    recommendation: "Propose integration before annual contract reviews.",
    executiveSummary: "Contract portfolio consolidation suggests vendor evaluation phase. Operational efficiency focus indicates margin pressure. Partnership conversation is timely.",
    evidence: [
      "Won five-year contract with national retail group",
      "Vendor audit completed for all current partnerships",
      "Operations centralization project underway",
      "CFO hired from FTSE 100 background"
    ]
  },
  {
    id: "8",
    business_name: "StorageMax UK Limited",
    business_category: "storage",
    email: "commercial@storagemaxuk.co.uk",
    last_contacted_at: undefined,
    opportunity: "Expanding storage capacity across regional footprint.",
    context: "Storage operators experience cyclical demand patterns. Expansion during growth phases creates vendor selection windows.",
    recommendation: "Contact within 5 days before capacity planning finalizes.",
    executiveSummary: "Expansion announcements indicate vendor evaluation phase. Capacity planning is underway. Early positioning improves partnership likelihood.",
    evidence: [
      "Announced two new regional facilities",
      "Land acquisition completed in three markets",
      "Operations Director promoted to VP Operations",
      "Capacity planning RFP distributed to vendors"
    ]
  }
];

export default async function B2BTodayPage() {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId) redirect("/sign-in");
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email)) redirect("/dashboard/driver");

  const prospects = mockProspects;

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
          <span className="font-semibold">12 opportunities</span> currently exceed action threshold.
        </p>
        <p className="text-base leading-relaxed text-[#0D0D0D] mb-2">
          <span className="font-semibold">8 display</span> unusually strong commercial signals.
        </p>
        <p className="text-base leading-relaxed text-[#0D0D0D] mb-2">
          <span className="font-semibold">3 should</span> be contacted today.
        </p>
        <p className="text-base leading-relaxed text-[#0D0D0D] mb-2">
          <span className="font-semibold">2 require</span> operator review.
        </p>
        <p className="text-base leading-relaxed text-[#666666]">
          Discovery continues autonomously. Ranking models evaluated 1,847 prospects in the last cycle.
        </p>
      </div>

      {/* SECTION 2: OPPORTUNITIES REQUIRING ATTENTION */}
      <div className="mb-8">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">
          Opportunities Requiring Attention
        </p>

        {/* SECTION 3: PROSPECT QUEUE */}
        <div className="space-y-4">
          {prospects.map((prospect) => (
            <ProspectCard
              key={prospect.id}
              prospect={{
                id: prospect.id,
                business_name: prospect.business_name,
                business_category: prospect.business_category,
                email: prospect.email,
                last_contacted_at: prospect.last_contacted_at,
              }}
              opportunity={prospect.opportunity}
              context={prospect.context}
              recommendation={prospect.recommendation}
              executiveSummary={prospect.executiveSummary}
              evidence={prospect.evidence}
            />
          ))}
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
