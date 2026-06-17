import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { neon } from "@neondatabase/serverless";
import { B2BDiscoverySection } from "@/components/B2BDiscoverySection";
import { DiscoveryModes } from "@/components/DiscoveryModes";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];

interface DiscoveryData {
  discovered_overnight: number;
  qualified_overnight: number;
  discovered_total: number;
  enriched_total: number;
  qualified_total: number;
  promoted_total: number;
  discovery_velocity: number;
  qualification_rate: number;
  promotion_rate: number;
  top_categories: Array<{ category: string; count: number; percentage: number }>;
  active_research: string[];
  intake_sources: Array<{
    name: string;
    route: string;
    status: 'operational' | 'hidden' | 'missing';
    count: number;
    last_activity?: string;
    color: string;
  }>;
}

async function getDiscoveryData(): Promise<DiscoveryData> {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('[Discovery] DATABASE_URL not configured');
      return getDefaultDiscovery();
    }

    const sql = neon(process.env.DATABASE_URL);

    // Get overnight discovery
    let discovered_overnight = 0;
    let qualified_overnight = 0;
    try {
      const overnightResult = await sql`
        SELECT discovery_count, leads_created
        FROM b2b_orchestration_logs
        ORDER BY started_at DESC
        LIMIT 1
      `;
      if (overnightResult.length > 0) {
        discovered_overnight = overnightResult[0].discovery_count || 0;
        qualified_overnight = overnightResult[0].leads_created || 0;
      }
    } catch (err) {
      console.warn('[Discovery] Failed to fetch overnight activity:', err instanceof Error ? err.message : String(err));
    }

    // Get totals at each stage
    let discovered_total = 0;
    let enriched_total = 0;
    let qualified_total = 0;
    let promoted_total = 0;

    try {
      const discoveredResult = await sql`SELECT COUNT(*) as count FROM discovered_businesses`;
      discovered_total = discoveredResult[0]?.count || 0;
    } catch (err) {
      console.warn('[Discovery] Failed to fetch discovered count');
    }

    try {
      const enrichedResult = await sql`SELECT COUNT(*) as count FROM enriched_businesses`;
      enriched_total = enrichedResult[0]?.count || 0;
    } catch (err) {
      console.warn('[Discovery] Failed to fetch enriched count');
    }

    try {
      const qualifiedResult = await sql`SELECT COUNT(*) as count FROM qualified_businesses`;
      qualified_total = qualifiedResult[0]?.count || 0;
    } catch (err) {
      console.warn('[Discovery] Failed to fetch qualified count');
    }

    try {
      const promotedResult = await sql`SELECT COUNT(*) as count FROM b2b_leads`;
      promoted_total = promotedResult[0]?.count || 0;
    } catch (err) {
      console.warn('[Discovery] Failed to fetch promoted count');
    }

    // Get category distribution (top categories from discovered businesses)
    let top_categories: Array<{ category: string; count: number; percentage: number }> = [];
    try {
      const categoriesResult = await sql`
        SELECT category, COUNT(*) as count
        FROM discovered_businesses
        WHERE category IS NOT NULL AND category != ''
        GROUP BY category
        ORDER BY count DESC
        LIMIT 10
      `;
      
      const total_categorized = categoriesResult.reduce((sum: number, row: any) => sum + row.count, 0);
      top_categories = categoriesResult.map((row: any) => ({
        category: row.category || 'Unknown',
        count: row.count,
        percentage: total_categorized > 0 ? (row.count / total_categorized) * 100 : 0
      }));
    } catch (err) {
      console.warn('[Discovery] Failed to fetch categories');
    }

    // Calculate rates
    const discovery_velocity = discovered_total;
    const qualification_rate = discovered_total > 0 ? (qualified_total / discovered_total) * 100 : 0;
    const promotion_rate = qualified_total > 0 ? (promoted_total / qualified_total) * 100 : 0;

    // Active research topics (system is actively monitoring these sectors)
    const active_research = [
      'Estate agents with recent hiring',
      'Removal companies expanding operations',
      'Care providers with service growth',
      'Property management firms scaling',
      'Logistics companies modernizing'
    ];

    // Get intake source statistics
    let autonomousCount = 0;
    let postcodeCount = 0;
    let csvCount = 0;
    let manualCount = 0;

    try {
      const sourceStats = await sql`
        SELECT source, COUNT(*) as count FROM discovered_businesses GROUP BY source
      `;
      for (const row of sourceStats) {
        if (row.source === 'discovery') autonomousCount = row.count;
        else if (row.source === 'operator_search') postcodeCount = row.count;
        else if (row.source === 'csv') csvCount = row.count;
        else if (row.source === 'manual') manualCount = row.count;
      }
    } catch (err) {
      console.warn('[Discovery] Failed to fetch source statistics');
    }

    const intake_sources = [
      {
        name: 'Autonomous Discovery',
        route: '/api/discovery/run',
        status: 'operational' as const,
        count: autonomousCount,
        last_activity: 'Daily 02:00 UTC',
        color: '#0D0D0D'
      },
      {
        name: 'Postcode Search',
        route: '/api/b2b/operator-discovery',
        status: 'operational' as const,
        count: postcodeCount,
        last_activity: 'On demand',
        color: '#0D0D0D'
      },
      {
        name: 'CSV Import',
        route: '/api/b2b/csv-import',
        status: 'operational' as const,
        count: csvCount,
        last_activity: 'On demand',
        color: '#0D0D0D'
      },
      {
        name: 'Manual Entry',
        route: '/api/b2b/manual-entry',
        status: 'operational' as const,
        count: manualCount,
        last_activity: 'On demand',
        color: '#0D0D0D'
      }
    ];

    return {
      discovered_overnight,
      qualified_overnight,
      discovered_total,
      enriched_total,
      qualified_total,
      promoted_total,
      discovery_velocity,
      qualification_rate,
      promotion_rate,
      top_categories,
      active_research,
      intake_sources
    };
  } catch (err) {
    console.warn('[Discovery] Critical error:', err instanceof Error ? err.message : String(err));
    return getDefaultDiscovery();
  }
}

function getDefaultDiscovery(): DiscoveryData {
  return {
    discovered_overnight: 0,
    qualified_overnight: 0,
    discovered_total: 0,
    enriched_total: 0,
    qualified_total: 0,
    promoted_total: 0,
    discovery_velocity: 0,
    qualification_rate: 0,
    promotion_rate: 0,
    top_categories: [],
    active_research: [],
    intake_sources: [
      {
        name: 'Autonomous Discovery',
        route: '/api/discovery/run',
        status: 'operational',
        count: 0,
        last_activity: 'Daily 02:00 UTC',
        color: '#0D0D0D'
      },
      {
        name: 'Postcode Search',
        route: '/api/b2b/operator-discovery',
        status: 'operational',
        count: 0,
        last_activity: 'On demand',
        color: '#0D0D0D'
      },
      {
        name: 'CSV Import',
        route: '/api/b2b/csv-import',
        status: 'operational',
        count: 0,
        last_activity: 'On demand',
        color: '#0D0D0D'
      },
      {
        name: 'Manual Entry',
        route: '/api/b2b/manual-entry',
        status: 'operational',
        count: 0,
        last_activity: 'On demand',
        color: '#0D0D0D'
      }
    ]
  };
}

export default async function DiscoveryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  if (!user?.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
    redirect("/");
  }

  const discovery = await getDiscoveryData();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Navigation */}
      <div className="flex gap-2 mb-12">
        {['ADMIN', 'TODAY', 'PIPELINE', 'DISCOVERY', 'ORDERS', 'ANALYTICS'].map((item) => (
          <Link
            key={item}
            href={item === 'ADMIN' ? '/dashboard/admin' : `/dashboard/admin/b2b${item === 'TODAY' ? '' : '/' + item.toLowerCase()}`}
            className={`text-[10px] font-semibold uppercase tracking-[0.2em] px-4 py-2 rounded border transition-colors ${
              item === 'DISCOVERY'
                ? 'bg-[#0D0D0D] text-white border-[#0D0D0D]'
                : 'bg-white text-[#0D0D0D] border-[#E8E8E8] hover:border-[#D0D0D0]'
            }`}
          >
            {item}
          </Link>
        ))}
      </div>

      {/* Page Header */}
      <div className="mb-12">
        <h1 className="font-sans font-black text-[#0D0D0D] text-4xl tracking-tight mb-1">
          Operator Discovery.
        </h1>
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">
          Four ways to find and qualify business opportunities
        </p>
      </div>

      {/* PRIMARY MODE: POSTCODE DISCOVERY (FULL WIDTH, DOMINANT) */}
      <div className="mb-20">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          Mode 1: Postcode Discovery (Primary)
        </p>
        <div className="bg-white border-2 border-[#0D0D0D] rounded p-8 shadow-sm">
          <B2BDiscoverySection sources={discovery.intake_sources} />
        </div>
      </div>

      {/* MODES 2-4: SECONDARY DISCOVERY MODES (3-COLUMN) */}
      <DiscoveryModes
        csvCount={discovery.intake_sources.find(s => s.name === 'CSV Import')?.count || 0}
        manualCount={discovery.intake_sources.find(s => s.name === 'Manual Entry')?.count || 0}
        autonomousCount={discovery.intake_sources.find(s => s.name === 'Autonomous Discovery')?.count || 0}
      />

      {/* SYSTEM INSIGHTS LAYER (Bottom) */}
      <div className="pt-12 border-t border-[#E8E8E8] mt-20">
        <h2 className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-12">
          System Intelligence & Insights
        </h2>

        {/* Pipeline Overview */}
        <div className="mb-16">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
            Pipeline Status
          </p>
          <div className="bg-white border border-[#E8E8E8] rounded p-8">
          <div className="flex items-center justify-between">
            {/* Discovered */}
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-2">
                Discovered
              </p>
              <p className="text-5xl font-black text-[#0D0D0D]">
                {discovery.discovered_total}
              </p>
            </div>

            {/* Arrow */}
            <div className="text-[#D0D0D0] text-2xl mx-2">→</div>

            {/* Enriched */}
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-2">
                Enriched
              </p>
              <p className="text-5xl font-black text-[#0D0D0D]">
                {discovery.enriched_total}
              </p>
            </div>

            {/* Arrow */}
            <div className="text-[#D0D0D0] text-2xl mx-2">→</div>

            {/* Qualified */}
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-2">
                Qualified
              </p>
              <p className="text-5xl font-black text-[#0D0D0D]">
                {discovery.qualified_total}
              </p>
            </div>

            {/* Arrow */}
            <div className="text-[#D0D0D0] text-2xl mx-2">→</div>

            {/* Promoted */}
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-2">
                Promoted
              </p>
              <p className="text-5xl font-black text-[#0D0D0D]">
                {discovery.promoted_total}
              </p>
            </div>
          </div>
          </div>
        </div>

        {/* SECTION 3: CATEGORY INTELLIGENCE */}
      <div className="mb-16">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          Category Intelligence
        </p>
        <div className="space-y-3">
          {discovery.top_categories.length > 0 ? (
            discovery.top_categories.map((cat, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-[#0D0D0D]">
                    {cat.category}
                  </p>
                  <p className="text-sm font-semibold text-[#0D0D0D]">
                    {cat.percentage.toFixed(0)}%
                  </p>
                </div>
                <div className="w-full bg-[#F5F5F5] rounded h-6 overflow-hidden border border-[#E8E8E8]">
                  <div
                    className="h-full bg-[#0D0D0D] transition-all"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#666666] italic">No category data available yet.</p>
          )}
        </div>
      </div>

      {/* SECTION 4: RESEARCH ACTIVITY */}
      <div className="mb-16">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          Active Intelligence Work
        </p>
        <div className="bg-white border border-[#E8E8E8] rounded p-4">
          <ul className="space-y-3">
            {discovery.active_research.map((activity, idx) => (
              <li key={idx} className="flex items-start text-sm text-[#0D0D0D]">
                <span className="text-[#888888] mr-3 mt-0.5">•</span>
                <span>{activity}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Health Indicators */}
      <div>
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          Pipeline Health Indicators
        </p>
        <div className="grid grid-cols-3 gap-6">
          {/* Discovery Velocity */}
          <div className="bg-white border border-[#E8E8E8] rounded px-6 py-8 hover:border-[#D0D0D0] transition-colors">
            <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-3">
              Discovery Velocity
            </p>
            <p className="text-4xl font-black text-[#0D0D0D]">
              {discovery.discovery_velocity}
            </p>
            <p className="text-[10px] text-[#666666] mt-2">
              Total businesses discovered
            </p>
          </div>

          {/* Qualification Rate */}
          <div className="bg-white border border-[#E8E8E8] rounded px-6 py-8 hover:border-[#D0D0D0] transition-colors">
            <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-3">
              Qualification Rate
            </p>
            <p className="text-4xl font-black text-[#0D0D0D]">
              {discovery.qualification_rate.toFixed(0)}%
            </p>
            <p className="text-[10px] text-[#666666] mt-2">
              Qualified / Discovered
            </p>
          </div>

          {/* Promotion Rate */}
          <div className="bg-white border border-[#E8E8E8] rounded px-6 py-8 hover:border-[#D0D0D0] transition-colors">
            <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-3">
              Promotion Rate
            </p>
            <p className="text-4xl font-black text-[#0D0D0D]">
              {discovery.promotion_rate.toFixed(0)}%
            </p>
            <p className="text-[10px] text-[#666666] mt-2">
              Promoted / Qualified
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
