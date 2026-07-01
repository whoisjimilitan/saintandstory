import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getTier1Businesses,
  getTier2Businesses,
} from "@/lib/business-pain-promise-map";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com", "oye@saintandstoryltd.co.uk"];
const UK_CITIES = [
  "London",
  "Manchester",
  "Birmingham",
  "Leeds",
  "Glasgow",
  "Liverpool",
  "Edinburgh",
  "Bristol",
  "Cardiff",
  "Belfast",
];

interface TierConfig {
  tier: 1 | 2 | 3;
  enabled: boolean;
  priority: number;
  categories: string[];
}

/**
 * AUTONOMOUS DISCOVERY: Tier-Based Pipeline
 *
 * Reads operator's enabled tiers from settings, generates dork queries,
 * executes Google Custom Search for each tier's categories, stores leads.
 *
 * Flow:
 * 1. Get enabled tiers from request body (or default Tier 1 + 2)
 * 2. For each enabled tier, iterate through its categories
 * 3. For each category, generate dork query for each UK city
 * 4. Execute dork search (calls Google Custom Search)
 * 5. Parse results and store leads in b2b_leads table
 * 6. Return stats (leads found per tier, total, new)
 */

export async function POST(request: NextRequest) {
  try {
    // ✅ AUTH
    const email = request.headers.get("x-admin-email") || "unknown";
    if (!ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const tierConfigs: TierConfig[] = body.tiers || getDefaultTiers();

    console.log(`[TIER-DISCOVERY] Starting autonomous discovery for ${email}`);
    console.log(`[TIER-DISCOVERY] Tiers:`, tierConfigs.map((t) => `Tier ${t.tier} (${t.enabled ? "ON" : "OFF"})`));

    const results = {
      tiersProcessed: 0,
      categoriesSearched: 0,
      leadsFound: 0,
      leadsNew: 0,
      leadsTotal: 0,
      tierResults: [] as any[],
      executedAt: new Date().toISOString(),
    };

    // ✅ PROCESS EACH ENABLED TIER
    for (const tierConfig of tierConfigs.filter((t) => t.enabled)) {
      console.log(`[TIER-DISCOVERY] Processing Tier ${tierConfig.tier}`);

      const tierResult = {
        tier: tierConfig.tier,
        categories: tierConfig.categories.length,
        citiesSearched: 0,
        leadsFound: 0,
        leadsNew: 0,
      };

      // For each category in this tier
      for (const category of tierConfig.categories) {
        // For each UK city
        for (const city of UK_CITIES) {
          const query = `${category.replace(/_/g, " ")} ${city} UK`;

          try {
            console.log(`[TIER-DISCOVERY] Searching: "${query}"`);

            // Call dork-search endpoint
            const dorkRes = await fetch(
              `${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000"}/api/b2b/dork-search`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
              }
            );

            if (!dorkRes.ok) {
              console.error(`[TIER-DISCOVERY] Dork search failed for "${query}"`);
              continue;
            }

            const dorkData = await dorkRes.json();
            const leadsCreated = dorkData.leadsCreated || 0;

            if (leadsCreated > 0) {
              tierResult.leadsFound += leadsCreated;
              tierResult.citiesSearched += 1;
              results.categoriesSearched += 1;
              console.log(`[TIER-DISCOVERY] Found ${leadsCreated} leads for "${query}"`);
            }
          } catch (err) {
            console.error(`[TIER-DISCOVERY] Error searching "${query}":`, err);
          }
        }
      }

      results.tiersProcessed += 1;
      results.leadsFound += tierResult.leadsFound;
      results.tierResults.push(tierResult);
    }

    // ✅ GET FINAL COUNTS
    const totalLeads = await prisma.b2bLead.count();
    results.leadsTotal = totalLeads;

    console.log(`[TIER-DISCOVERY] Complete:`, {
      tiersProcessed: results.tiersProcessed,
      leadsFound: results.leadsFound,
      totalLeads: results.leadsTotal,
    });

    return NextResponse.json({
      success: true,
      message: `Autonomous discovery complete. Found ${results.leadsFound} leads across ${results.tiersProcessed} tiers.`,
      ...results,
    });
  } catch (error) {
    console.error("[TIER-DISCOVERY] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Discovery failed",
        success: false,
      },
      { status: 500 }
    );
  }
}

/**
 * Default tier configuration: Tier 1 + 2 enabled, Tier 3 disabled
 */
function getDefaultTiers(): TierConfig[] {
  const tier1 = getTier1Businesses();
  const tier2 = getTier2Businesses();

  return [
    { tier: 1, enabled: true, priority: 1, categories: tier1 },
    { tier: 2, enabled: true, priority: 2, categories: tier2 },
    { tier: 3, enabled: false, priority: 3, categories: [] },
  ];
}
