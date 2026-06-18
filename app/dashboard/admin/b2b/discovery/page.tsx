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
    <div className="px-8 py-12 max-w-7xl mx-auto">
      {/* Navigation */}
      <div className="flex gap-2 mb-16">
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
      <div className="mb-16">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.3em] mb-4">Discovery</p>
        <h1 className="font-sans font-black text-[#0D0D0D] text-6xl tracking-tight mb-3">
          Find Opportunities
        </h1>
        <p className="text-base text-[#666666]">
          Find. Enrich. Qualify. Convert.
        </p>
      </div>

      {/* HERO: POSTCODE SEARCH */}
      <div className="mb-16 bg-gradient-to-br from-[#F0FFFE] to-[#EBEBF9] p-12 rounded-lg">
        <p className="text-[10px] font-semibold text-[#06B6D4] uppercase tracking-[0.2em] mb-6">
          Primary Discovery Method
        </p>
        <h2 className="text-3xl font-bold text-[#0D0D0D] mb-8">
          Search by Postcode
        </h2>
        <p className="text-base text-[#666666] mb-8 max-w-2xl">
          Find businesses in your service areas. Enter postcodes or location names to discover prospects in high-opportunity sectors.
        </p>
        <div className="flex gap-4">
          <button className="bg-[#0D0D0D] text-white px-6 py-3 rounded text-sm font-semibold hover:bg-[#333333] transition-colors">
            Open Postcode Search
          </button>
          <Link href="/api/b2b/operator-discovery" className="text-[#0D0D0D] px-6 py-3 rounded text-sm font-semibold border border-[#E8E8E8] hover:border-[#D0D0D0] transition-colors">
            View Settings →
          </Link>
        </div>
      </div>

      {/* SECONDARY: UPLOAD & AUTONOMOUS */}
      <div className="grid grid-cols-2 gap-8 mb-16">
        {/* Upload */}
        <div className="bg-[#FFFAF0] p-8 rounded-lg">
          <p className="text-[10px] font-semibold text-[#F59E0B] uppercase tracking-[0.2em] mb-4">
            Bulk Import
          </p>
          <h3 className="text-2xl font-bold text-[#0D0D0D] mb-4">
            Upload CSV
          </h3>
          <p className="text-sm text-[#666666] mb-6">
            Import prospects from your own data. Upload a CSV file with company details and we'll enrich them automatically.
          </p>
          <Link href="/api/b2b/csv-import" className="inline-block bg-[#D97706] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-[#B45309] transition-colors">
            Upload File →
          </Link>
        </div>

        {/* Autonomous */}
        <div className="bg-[#F0FDF4] p-8 rounded-lg">
          <p className="text-[10px] font-semibold text-[#10B981] uppercase tracking-[0.2em] mb-4">
            Always Running
          </p>
          <h3 className="text-2xl font-bold text-[#0D0D0D] mb-4">
            Autonomous Discovery
          </h3>
          <p className="text-sm text-[#666666] mb-6">
            Our system runs 24/7 discovery jobs. New prospects identified automatically each night at 02:00 UTC.
          </p>
          <div className="inline-flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></span>
            <span className="text-[#0D0D0D] font-semibold">System Active</span>
          </div>
        </div>
      </div>

      {/* TERTIARY: MANUAL ENTRY */}
      <div className="bg-[#F3F4F6] p-8 rounded-lg mb-16">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">
          Add Individually
        </p>
        <h3 className="text-2xl font-bold text-[#0D0D0D] mb-4">
          Manual Entry
        </h3>
        <p className="text-sm text-[#666666] mb-6">
          Add a single prospect manually. Useful when you have a specific company in mind that needs outreach.
        </p>
        <Link href="/api/b2b/manual-entry" className="inline-block text-[#0D0D0D] px-4 py-2 rounded text-sm font-semibold border border-[#D1D5DB] hover:border-[#9CA3AF] transition-colors">
          Add Prospect →
        </Link>
      </div>

      {/* DISCOVERY PIPELINE STATS */}
      <div className="mb-16">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          Discovery Pipeline
        </p>
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-[#EBEBF9] p-6 rounded">
            <p className="text-[10px] font-semibold text-[#6366F1] uppercase tracking-[0.2em] mb-3">
              Discovered
            </p>
            <p className="text-4xl font-black text-[#0D0D0D] mb-2">
              {discovery.discovered_total}
            </p>
            <p className="text-xs text-[#666666]">
              businesses identified
            </p>
          </div>

          <div className="bg-[#F0FFFE] p-6 rounded">
            <p className="text-[10px] font-semibold text-[#06B6D4] uppercase tracking-[0.2em] mb-3">
              Enriched
            </p>
            <p className="text-4xl font-black text-[#0D0D0D] mb-2">
              {discovery.enriched_total}
            </p>
            <p className="text-xs text-[#666666]">
              with company data
            </p>
          </div>

          <div className="bg-[#FEF3C7] p-6 rounded">
            <p className="text-[10px] font-semibold text-[#D97706] uppercase tracking-[0.2em] mb-3">
              Qualified
            </p>
            <p className="text-4xl font-black text-[#0D0D0D] mb-2">
              {discovery.qualified_total}
            </p>
            <p className="text-xs text-[#666666]">
              meet criteria
            </p>
          </div>

          <div className="bg-[#F0FDF4] p-6 rounded">
            <p className="text-[10px] font-semibold text-[#10B981] uppercase tracking-[0.2em] mb-3">
              Ready
            </p>
            <p className="text-4xl font-black text-[#0D0D0D] mb-2">
              {discovery.promoted_total}
            </p>
            <p className="text-xs text-[#666666]">
              for outreach
            </p>
          </div>
        </div>
      </div>

      {/* TOP CATEGORIES */}
      <div>
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          Focus Categories
        </p>
        <div className="grid grid-cols-3 gap-6">
          {discovery.top_categories.slice(0, 3).map((cat, idx) => (
            <div key={idx} className="bg-white border border-[#E5E7EB] p-6 rounded">
              <p className="text-lg font-bold text-[#0D0D0D] mb-2">
                {cat.category}
              </p>
              <p className="text-3xl font-black text-[#0D0D0D] mb-3">
                {cat.count}
              </p>
              <p className="text-xs text-[#666666]">
                {cat.percentage.toFixed(0)}% of qualified
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
