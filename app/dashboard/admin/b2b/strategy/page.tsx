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

// Industry universe from lib/b2b-industries.ts
const B2B_INDUSTRIES = {
  "Property & Construction": ["Estate Agents", "Letting Agents", "Property Management Companies", "Surveyors", "Architects", "Construction Firms", "Building Contractors", "Facilities Management Companies"],
  "Healthcare": ["Pharmacies", "Private Hospitals", "Dental Practices", "Orthodontists", "GP Surgeries", "Veterinary Clinics", "Care Homes", "Medical Laboratories", "Fertility Clinics", "Private Healthcare Providers"],
  "Professional Services": ["Solicitors", "Barristers' Chambers", "Conveyancing Firms", "Litigation Firms", "Notaries", "Accountants", "Financial Advisers", "Mortgage Brokers", "Insurance Brokers"],
  "Trades & Automotive": ["Garages", "MOT Centres", "Vehicle Repair Centres", "Accident Repair Centres", "Vehicle Dealerships", "Fleet Operators", "Commercial Vehicle Workshops", "Electricians", "Plumbers", "Builders"],
  "Logistics & Transport": ["Removal Companies", "Shipping Agents", "Port Operators", "Rail Contractors", "Aircraft Maintenance", "Airports"],
  "Hospitality & Events": ["Event Organisers", "Wedding Planners", "Hotels", "Restaurants", "Bars", "AV Suppliers", "Photography Studios"],
  "Retail & Luxury": ["Jewellers", "Watch Specialists", "Fashion Houses", "Tailors", "Art Galleries", "Luxury Retailers"],
  "Technology": ["IT Support Companies", "Data Centres", "Telecom Providers", "Hardware Resellers", "Managed Service Providers"],
  "Education & Training": ["Universities", "Colleges", "Private Schools", "Training Providers"],
  "Other": ["Recruitment Agencies", "Staffing Agencies", "Security Companies", "Funeral Directors", "Marketing Agencies"]
};

const ACTIVE_DISCOVERY = ["Estate Agents", "Removals", "Care Homes", "Pharmacies"];
const STANDING_ORDERS = ["Estate Agents", "Removals", "Care Homes", "Pharmacies"];

interface StrategyData {
  total_configured: number;
  total_active: number;
  coverage_percentage: number;
  discovered_by_industry: { [key: string]: number };
  qualified_by_industry: { [key: string]: number };
  standing_orders: string[];
  contradictions: Array<{ industry: string; issue: string }>;
}

async function getStrategyData(): Promise<StrategyData> {
  try {
    if (!process.env.DATABASE_URL) {
      return getDefaultStrategy();
    }

    const sql = neon(process.env.DATABASE_URL);

    // Get discovery performance by category
    let discovered_by_category: { [key: string]: number } = {};
    let qualified_count: { [key: string]: number } = {};

    try {
      const discovered = await sql`
        SELECT business_category, COUNT(*) as count
        FROM b2b_leads
        GROUP BY business_category
      `;
      discovered.forEach((row: any) => {
        discovered_by_category[row.business_category] = row.count;
      });
    } catch (err) {
      console.warn("Failed to fetch discovery performance");
    }

    // Count total industries
    const all_industries = Object.values(B2B_INDUSTRIES).flat();
    const total_configured = new Set(all_industries).size;
    const total_active = ACTIVE_DISCOVERY.length;
    const coverage_percentage = (total_active / total_configured) * 100;

    // Find contradictions: standing orders without active discovery
    const contradictions: Array<{ industry: string; issue: string }> = [];
    STANDING_ORDERS.forEach((order) => {
      if (!ACTIVE_DISCOVERY.includes(order)) {
        contradictions.push({
          industry: order,
          issue: "Standing order exists but discovery is not active"
        });
      }
    });

    return {
      total_configured,
      total_active,
      coverage_percentage,
      discovered_by_industry: discovered_by_category,
      qualified_by_industry: qualified_count,
      standing_orders: STANDING_ORDERS,
      contradictions
    };
  } catch (err) {
    console.warn("[Strategy] Error:", err instanceof Error ? err.message : String(err));
    return getDefaultStrategy();
  }
}

function getDefaultStrategy(): StrategyData {
  const all_industries = Object.values(B2B_INDUSTRIES).flat();
  return {
    total_configured: new Set(all_industries).size,
    total_active: ACTIVE_DISCOVERY.length,
    coverage_percentage: (ACTIVE_DISCOVERY.length / new Set(all_industries).size) * 100,
    discovered_by_industry: {},
    qualified_by_industry: {},
    standing_orders: STANDING_ORDERS,
    contradictions: []
  };
}

export default async function StrategyPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  if (!user?.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
    redirect("/");
  }

  const strategy = await getStrategyData();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Navigation */}
      <div className="flex gap-2 mb-12 overflow-x-auto">
        {['ADMIN', 'TODAY', 'PIPELINE', 'DISCOVERY', 'STRATEGY', 'ORDERS', 'ANALYTICS'].map((item) => (
          <Link
            key={item}
            href={item === 'ADMIN' ? '/dashboard/admin' : `/dashboard/admin/b2b${item === 'TODAY' ? '' : '/' + item.toLowerCase()}`}
            className={`text-[10px] font-semibold uppercase tracking-[0.2em] px-4 py-2 rounded border transition-colors whitespace-nowrap ${
              item === 'STRATEGY'
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
          Market Strategy.
        </h1>
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">
          What industries are we targeting and why?
        </p>
      </div>

      {/* SECTION 1: TARGET MARKET UNIVERSE */}
      <div className="mb-16">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          Target Market Universe
        </p>
        <div className="bg-white border border-[#E8E8E8] rounded px-8 py-10">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-2">
                Total Industries Configured
              </p>
              <p className="text-5xl font-black text-[#0D0D0D]">
                {strategy.total_configured}
              </p>
              <p className="text-sm text-[#666666] mt-3">
                Industries available in the system
              </p>
            </div>
            <div className="space-y-3">
              {Object.entries(B2B_INDUSTRIES).map(([sector, industries]) => (
                <div key={sector}>
                  <p className="text-[10px] font-medium text-[#0D0D0D]">
                    {sector}
                  </p>
                  <p className="text-sm text-[#666666]">
                    {industries.length} industries
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: ACTIVE SEARCH COVERAGE */}
      <div className="mb-16">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          Active Search Coverage
        </p>
        <div className="grid grid-cols-3 gap-6">
          {/* Active Count */}
          <div className="bg-white border border-[#E8E8E8] rounded px-6 py-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-3">
              Industries Actively Searched
            </p>
            <p className="text-5xl font-black text-[#0D0D0D]">
              {strategy.total_active}
            </p>
          </div>

          {/* Coverage % */}
          <div className="bg-white border border-[#E8E8E8] rounded px-6 py-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-3">
              Market Coverage
            </p>
            <p className="text-5xl font-black text-[#0D0D0D]">
              {strategy.coverage_percentage.toFixed(1)}%
            </p>
            <p className="text-[10px] text-[#666666] mt-2">
              {strategy.total_active} of {strategy.total_configured}
            </p>
          </div>

          {/* Status Badge */}
          <div className="bg-white border border-[#E8E8E8] rounded px-6 py-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-3">
              Coverage Status
            </p>
            <div className={`inline-block text-[10px] font-semibold uppercase tracking-[0.05em] px-3 py-2 rounded ${
              strategy.coverage_percentage < 10
                ? 'bg-[#FFE5E5] text-[#CC0000]'
                : strategy.coverage_percentage < 25
                ? 'bg-[#FFF8E5] text-[#CC6600]'
                : 'bg-[#F0F0F0] text-[#0D0D0D]'
            }`}>
              {strategy.coverage_percentage < 10 ? 'Severely Limited' : strategy.coverage_percentage < 25 ? 'Limited' : 'Adequate'}
            </div>
          </div>
        </div>
      </div>

      {/* Active Industries List */}
      <div className="mb-16 bg-white border border-[#E8E8E8] rounded p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-4">
          Currently Searched
        </p>
        <div className="space-y-2">
          {ACTIVE_DISCOVERY.map((industry) => (
            <p key={industry} className="text-sm text-[#0D0D0D] flex items-center">
              <span className="text-[#888888] mr-3">•</span>
              {industry}
              {strategy.discovered_by_industry[industry] && (
                <span className="text-[#666666] ml-auto">
                  {strategy.discovered_by_industry[industry]} opportunities
                </span>
              )}
            </p>
          ))}
        </div>
      </div>

      {/* SECTION 3: DISCOVERY PERFORMANCE */}
      <div className="mb-16">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          Discovery Performance by Industry
        </p>
        <div className="bg-white border border-[#E8E8E8] rounded p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E8E8]">
                <th className="text-left text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] pb-4">Industry</th>
                <th className="text-right text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] pb-4">Discovered</th>
                <th className="text-right text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] pb-4">Qualified</th>
                <th className="text-right text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] pb-4">Qualification Rate</th>
              </tr>
            </thead>
            <tbody>
              {ACTIVE_DISCOVERY.map((industry) => {
                const discovered = strategy.discovered_by_industry[industry] || 0;
                const qualification_rate = discovered > 0 ? 100 : 0; // Placeholder: assuming all qualified
                return (
                  <tr key={industry} className="border-b border-[#E8E8E8]">
                    <td className="text-sm text-[#0D0D0D] py-4">{industry}</td>
                    <td className="text-right text-sm font-semibold text-[#0D0D0D] py-4">{discovered}</td>
                    <td className="text-right text-sm font-semibold text-[#0D0D0D] py-4">{discovered}</td>
                    <td className="text-right text-sm font-semibold text-[#0D0D0D] py-4">{qualification_rate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: REVENUE ALIGNMENT */}
      {strategy.contradictions.length > 0 && (
        <div className="mb-16">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
            Strategic Contradictions
          </p>
          <div className="space-y-3">
            {strategy.contradictions.map((contradiction, idx) => (
              <div key={idx} className="bg-[#FFF8E5] border border-[#FFE5C0] rounded p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#CC6600] mb-1">
                  {contradiction.industry}
                </p>
                <p className="text-sm text-[#CC6600]">
                  {contradiction.issue}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: RECOMMENDATIONS */}
      <div className="pt-8 border-t border-[#E8E8E8]">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          Strategic Recommendations
        </p>
        <div className="space-y-3">
          {strategy.contradictions.length > 0 && (
            <>
              {strategy.contradictions.map((contradiction, idx) => (
                <div key={idx} className="bg-white border border-[#E8E8E8] rounded p-4">
                  <p className="text-sm text-[#0D0D0D]">
                    <span className="font-semibold">Activate {contradiction.industry} discovery.</span> Standing order exists but discovery is not active.
                  </p>
                </div>
              ))}
            </>
          )}
          <div className="bg-white border border-[#E8E8E8] rounded p-4">
            <p className="text-sm text-[#0D0D0D]">
              <span className="font-semibold">Review market coverage strategy.</span> Only {strategy.coverage_percentage.toFixed(1)}% of configured industries are being actively searched.
            </p>
          </div>
          {ACTIVE_DISCOVERY.length > 0 && (
            <div className="bg-white border border-[#E8E8E8] rounded p-4">
              <p className="text-sm text-[#0D0D0D]">
                <span className="font-semibold">Analyze performance of active industries.</span> Decide which ones to expand and which to reduce based on discovery results.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
