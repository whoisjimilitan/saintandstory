import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

async function isAdmin(request: NextRequest) {
  const email = request.headers.get("x-admin-email");
  return email && ADMIN_EMAILS.includes(email);
}

/**
 * Hidden Gems Discovery Engine
 * Finds high-margin B2B categories underserved by standard couriers
 * Surfaces: Events, Film/TV Production, Art/Auction Houses
 */

interface HighMarginCategory {
  category: string;
  market_name: string;
  delivery_frequency: string;
  premium_willingness: string;
  pain_points: string[];
  revenue_potential: string;
  solo_viable: boolean;
  priority_rank: number;
  google_search_terms: string[];
  estimated_opportunities_uk: number;
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // High-margin B2B categories ranked by opportunity
    const categories: HighMarginCategory[] = [
      {
        category: "event_planning_catering",
        market_name: "Event Planning & Catering Companies",
        delivery_frequency: "RECURRING (multiple/week)",
        premium_willingness: "35-50% premium",
        pain_points: [
          "Time-sensitive multi-location coordination",
          "Last-minute setup changes",
          "Fragile items (glassware, linens)",
          "Unreliable standard couriers (no-shows)",
          "Need guaranteed arrival windows",
        ],
        revenue_potential: "5-10 accounts = £4,500-7,200/month recurring",
        solo_viable: true,
        priority_rank: 1,
        google_search_terms: [
          "event planning companies UK",
          "catering services London",
          "wedding planners by location",
          "corporate event coordinators",
        ],
        estimated_opportunities_uk: 8000,
      },
      {
        category: "film_tv_production",
        market_name: "Film & TV Production Companies",
        delivery_frequency: "MEDIUM-HIGH (daily during shoots)",
        premium_willingness: "40-60% premium",
        pain_points: [
          "Crew downtime catastrophic (£2-5k/hour when idle)",
          "Equipment damage liability critical",
          "Multi-location shooting logistics",
          "Same-day equipment coordination",
          "Budget overruns from logistics failures",
        ],
        revenue_potential: "3-5 companies = £3,500-6,000/month (seasonal)",
        solo_viable: true,
        priority_rank: 2,
        google_search_terms: [
          "UK film production companies",
          "TV production services UK",
          "UK production company database",
          "film crew suppliers UK",
        ],
        estimated_opportunities_uk: 2500,
      },
      {
        category: "art_auction_antique",
        market_name: "Art Galleries, Auction Houses & Antique Dealers",
        delivery_frequency: "MEDIUM (3-10/month for active dealers)",
        premium_willingness: "50-80% premium",
        pain_points: [
          "Damage liability catastrophic (£50k-500k pieces)",
          "Need specialized white-glove handling",
          "Insurance & tracking requirements",
          "GPS/documentation demands",
          "Standard couriers refuse high-value items",
        ],
        revenue_potential: "8-10 accounts = £2,500-4,500/month",
        solo_viable: false,
        priority_rank: 3,
        google_search_terms: [
          "UK art galleries",
          "auction houses UK",
          "antique dealers UK",
          "fine art shippers",
        ],
        estimated_opportunities_uk: 3000,
      },
    ];

    // Calculate aggregate opportunity
    const total_opportunities = categories.reduce(
      (sum, cat) => sum + cat.estimated_opportunities_uk,
      0
    );
    const total_revenue_potential =
      "£10,500-17,700/month (3 categories, 15-25 accounts total)";

    return NextResponse.json({
      status: "ready",
      discovery_overview: {
        total_high_margin_categories: 3,
        total_estimated_opportunities_uk: total_opportunities,
        combined_revenue_potential: total_revenue_potential,
        reasoning:
          "These categories have HIGH delivery frequency, HIGH willingness to pay premium, and are UNDERSERVED by Bark/TaskRabbit due to complexity and coordination needs",
      },
      high_margin_categories: categories,
      strategy_recommendation: {
        phase_1: "Launch with Event Planning (highest frequency, most desperate clients)",
        phase_2: "Expand to Film/TV Production (seasonal, high-ticket)",
        phase_3:
          "Premium tier: Art/Auction (requires insurance, training, higher investment)",
      },
      competitive_advantage: {
        vs_bark: "Bark is transactional. These verticals need accountability & coordination.",
        vs_standard_couriers: "Standard couriers refuse complexity. You specialize.",
        vs_facebook_ads: "Warm outreach + Google LSA targets these verticals directly (not cold audience)",
      },
      next_steps: [
        "Research Event Planning companies in target cities (Google, LinkedIn, local directories)",
        "Create warm outreach sequence (phone + email) targeting Events first",
        "Build case study with first 3-5 event clients",
        "Establish Film/TV production relationships through production coordinators",
      ],
    });
  } catch (error) {
    console.error("[discover-high-margin] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action, category, city } = (await request.json()) as {
      action: string;
      category?: string;
      city?: string;
    };

    if (action === "find_companies") {
      if (!category || !city) {
        return NextResponse.json(
          { error: "category and city required" },
          { status: 400 }
        );
      }

      // Map category to search terms
      const searchTermMap: Record<string, string[]> = {
        event_planning_catering: [
          `event planning companies ${city}`,
          `catering services ${city}`,
          `wedding planners ${city}`,
          `corporate event coordinators ${city}`,
        ],
        film_tv_production: [
          `film production companies ${city}`,
          `TV production services ${city}`,
          `UK production companies ${city}`,
          `film crew ${city}`,
        ],
        art_auction_antique: [
          `art galleries ${city}`,
          `auction houses ${city}`,
          `antique dealers ${city}`,
          `fine art shippers ${city}`,
        ],
      };

      const searchTerms = searchTermMap[category] || [];

      return NextResponse.json({
        status: "ready_to_search",
        category,
        city,
        search_strategy: `Research ${searchTerms.length} search terms for ${city}`,
        recommended_sources: [
          "Google Maps (local search)",
          "LinkedIn (company profiles, contacts)",
          "Yelp/TripAdvisor (reviews, contact info)",
          "Local directory sites",
          "Industry associations",
        ],
        next_action:
          "Manual research recommended for warm outreach (higher quality than API scraping)",
        sample_search_terms: searchTerms.slice(0, 3),
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'find_companies'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[discover-high-margin] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
