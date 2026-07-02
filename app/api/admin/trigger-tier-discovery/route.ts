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

    let body: any;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("[TIER-DISCOVERY] JSON parse error:", parseError);
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    let tierConfigs: TierConfig[];
    try {
      tierConfigs = body.tiers || getDefaultTiers();
    } catch (tierError) {
      console.error("[TIER-DISCOVERY] Error getting tier config:", tierError);
      return NextResponse.json({ error: "Failed to get tier configuration" }, { status: 500 });
    }

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
            const baseUrl = process.env.VERCEL_URL
              ? `https://${process.env.VERCEL_URL}`
              : "http://localhost:3000";

            const dorkUrl = `${baseUrl}/api/b2b/dork-search`;
            console.log(`[TIER-DISCOVERY] Calling dork-search at ${dorkUrl}`);

            let dorkRes;
            try {
              dorkRes = await fetch(dorkUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
              });
            } catch (fetchError) {
              console.error(`[TIER-DISCOVERY] Fetch error for dork-search:`, fetchError);
              continue;
            }

            if (!dorkRes.ok) {
              const errorText = await dorkRes.text();
              console.error(`[TIER-DISCOVERY] Dork search failed (${dorkRes.status}) for "${query}":`, errorText.substring(0, 200));
              continue;
            }

            let dorkData;
            try {
              dorkData = await dorkRes.json();
            } catch (jsonError) {
              console.error(`[TIER-DISCOVERY] JSON parse error from dork-search:`, jsonError);
              continue;
            }

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
  try {
    const tier1 = getTier1Businesses();
    const tier2 = getTier2Businesses();

    return [
      { tier: 1, enabled: true, priority: 1, categories: tier1 },
      { tier: 2, enabled: true, priority: 2, categories: tier2 },
      { tier: 3, enabled: false, priority: 3, categories: [] },
    ];
  } catch (error) {
    console.error("[TIER-DISCOVERY] Error loading default tiers:", error);
    // Return safe fallback
    return [
      { tier: 1, enabled: true, priority: 1, categories: [] },
      { tier: 2, enabled: true, priority: 2, categories: [] },
      { tier: 3, enabled: false, priority: 3, categories: [] },
    ];
  }
}
