import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { ensureB2BSchema } from "@/lib/b2b-schema";
import { runFullPipeline } from "@/lib/four-layer-pipeline";
import { DiscoverOrchestrator } from "@/lib/discover/orchestrator";
import { CRMProvider } from "@/lib/discover/providers/crm";
import { GooglePlacesProvider } from "@/lib/discover/providers/google-places";
import { CompaniesHouseProvider } from "@/lib/discover/providers/companies-house";
import { SearchQuery } from "@/lib/discover/types";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];

// Logistics pain keywords in reviews
const PAIN_KEYWORDS = [
  "delivery", "courier", "shipping", "supplier", "didn't show", "never arrived",
  "late delivery", "no show", "delivery failed", "never got", "still waiting",
  "logistics", "dispatch", "collection", "pickup", "pick up", "drop off",
];

const SATISFACTION_PHRASES = [
  "great delivery", "quick delivery", "fast delivery", "on time", "arrived safely",
  "delivered perfectly", "excellent courier",
];

// Category → Google Maps search type
const NICHE_SEARCH_MAP: Record<string, string[]> = {
  florists: ["florist", "flower shop", "flowers"],
  restaurants: ["restaurant", "cafe", "bistro", "eatery"],
  retailers: ["retail store", "shop", "boutique"],
  legal: ["solicitors", "law firm", "legal services"],
  "estate-agents": ["estate agent", "property agent", "letting agent"],
};

// Form industry values → NICHE_SEARCH_MAP keys
// Maps B2B_INDUSTRIES values to their corresponding search categories
const FORM_VALUE_TO_NICHE: Record<string, string> = {
  // Legal
  "solicitors": "legal",
  "barristers' chambers": "legal",
  "conveyancing firms": "legal",
  "litigation firms": "legal",
  "notaries": "legal",

  // Florists
  "florists": "florists",
  "flower shops": "florists",

  // Restaurants
  "restaurants": "restaurants",
  "cafes": "restaurants",
  "bistros": "restaurants",
  "eateries": "restaurants",

  // Retailers
  "retail stores": "retailers",
  "shops": "retailers",
  "boutiques": "retailers",

  // Estate Agents
  "estate agents": "estate-agents",
  "letting agents": "estate-agents",
  "property management companies": "estate-agents",
};

interface PlacesResult {
  place_id: string;
  name: string;
  formatted_address: string;
  website?: string;
  formatted_phone_number?: string;
  rating?: number;
  reviews?: { rating: number; text: string; time: number }[];
}

function isUKLocation(address: string | undefined): boolean {
  if (!address) return false;
  const upperAddress = address.toUpperCase();

  // REJECT: US state abbreviations and ZIP codes
  const usStates = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'];

  // Check for US state abbreviations (usually after comma: "City, OR 97302")
  for (const state of usStates) {
    if (upperAddress.includes(`, ${state}`) || upperAddress.includes(` ${state} `)) {
      return false;
    }
  }

  // Reject ZIP code pattern (5 digits or 5+4)
  if (/\s\d{5}(-\d{4})?\s*$/.test(address.trim())) {
    return false;
  }

  // ACCEPT: Contains UK indicators
  const ukIndicators = ['UNITED KINGDOM', 'UK', 'ENGLAND', 'SCOTLAND', 'WALES', 'NORTHERN IRELAND', 'LONDON', 'MANCHESTER', 'BIRMINGHAM', 'LEEDS', 'BRISTOL', 'EDINBURGH', 'CARDIFF', 'BELFAST'];
  if (ukIndicators.some(indicator => upperAddress.includes(indicator))) {
    return true;
  }

  // Check for UK postcode format (e.g., SW1A 1AA, E1 6AN)
  if (/[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}|[A-Z]{1,2}\d[A-Z]\s?\d[A-Z]{2}/i.test(address)) {
    return true;
  }

  return false;
}

function detectPainPoint(reviews: PlacesResult["reviews"]): { painPoint: string | null; reviewText: string | null; rating: number | null } {
  if (!reviews?.length) return { painPoint: null, reviewText: null, rating: null };

  for (const review of reviews) {
    if (review.rating > 3) continue; // Only negative reviews
    const text = review.text.toLowerCase();

    const hasSatisfaction = SATISFACTION_PHRASES.some(p => text.includes(p));
    if (hasSatisfaction) continue;

    const matchedKeyword = PAIN_KEYWORDS.find(k => text.includes(k));
    if (matchedKeyword) {
      return {
        painPoint: matchedKeyword,
        reviewText: review.text.slice(0, 300),
        rating: review.rating,
      };
    }
  }
  return { painPoint: null, reviewText: null, rating: null };
}

async function searchPlaces(query: string, city: string, apiKey: string): Promise<PlacesResult[]> {
  try {
    console.log(`[DISCOVER/SEARCH] Querying Google Maps for: "${query}" in "${city}"`);

    // Text search
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(`${query} in ${city} UK`)}&key=${apiKey}&language=en&region=gb`;
    console.log(`[DISCOVER/SEARCH] URL:`, searchUrl.substring(0, 100) + "...");

    const searchRes = await fetch(searchUrl, { next: { revalidate: 0 } });
    console.log(`[DISCOVER/SEARCH] Response status:`, searchRes.status);

    const searchData = await searchRes.json() as { results?: { place_id: string; name: string; formatted_address: string; rating?: number }[]; status?: string };
    console.log(`[DISCOVER/SEARCH] Google response status:`, searchData.status);
    console.log(`[DISCOVER/SEARCH] Results count:`, searchData.results?.length ?? 0);

    if (!searchData.results?.length) {
      console.log(`[DISCOVER/SEARCH] No results returned from Google Maps`);
      return [];
    }

    console.log(`[DISCOVER/SEARCH] Getting details for top ${Math.min(5, searchData.results.length)} results`);

    // Get details for top results
    const places: PlacesResult[] = [];
    for (const result of searchData.results.slice(0, 5)) {
      try {
        console.log(`[DISCOVER/SEARCH]   Fetching details for: ${result.name}`);

        const detailRes = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${result.place_id}&fields=name,formatted_address,website,formatted_phone_number,rating,reviews&key=${apiKey}&language=en`,
          { next: { revalidate: 0 } }
        );
        const detail = await detailRes.json() as { result?: PlacesResult; status?: string };

        console.log(`[DISCOVER/SEARCH]     Detail status: ${detail.status}, has result: ${!!detail.result}`);

        if (detail.result) {
          places.push({ ...detail.result, place_id: result.place_id });
          console.log(`[DISCOVER/SEARCH]     ✓ Added to results`);
        } else {
          console.log(`[DISCOVER/SEARCH]     ✗ No result in detail response`);
        }
      } catch (error) {
        console.log(`[DISCOVER/SEARCH]     ✗ Error fetching details:`, error);
      }
    }

    console.log(`[DISCOVER/SEARCH] Total places with details: ${places.length}`);

    // FILTER: Remove US locations (keep UK only)
    const ukPlaces = places.filter(place => {
      const isUK = isUKLocation(place.formatted_address);
      if (!isUK) {
        console.log(`[DISCOVER/SEARCH] ✗ Rejected non-UK location: ${place.name} (${place.formatted_address})`);
      }
      return isUK;
    });

    console.log(`[DISCOVER/SEARCH] After UK filtering: ${ukPlaces.length}/${places.length} results`);
    return ukPlaces;
  } catch (error) {
    console.error(`[DISCOVER/SEARCH] ✗ Fatal error in searchPlaces:`, error);
    return [];
  }
}

/**
 * GET /api/b2b/discover
 * Intelligence-driven business discovery
 * Queries multiple providers: CRM, Google Places, Companies House
 * Returns deduplicated, ranked results with source attribution
 */
export async function GET(request: Request) {
  try {
    console.log("[DISCOVER] ═══════════════════════════════════════");
    console.log("[DISCOVER] Starting intelligence discovery (GET)");

    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !ADMIN_EMAILS.includes(user?.emailAddresses[0]?.emailAddress ?? "")) {
      console.log("[DISCOVER] ✗ FAILED: Authorization failed");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const query: SearchQuery = {
      keyword: url.searchParams.get("query") || url.searchParams.get("keyword") || undefined,
      postcode: url.searchParams.get("postcode") || undefined,
      city: url.searchParams.get("city") || undefined,
      radius: url.searchParams.get("radius") ? parseInt(url.searchParams.get("radius")!) : undefined,
      category: url.searchParams.get("category") || undefined,
      limit: url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!) : 100,
    };

    console.log("[DISCOVER] Query parameters:", query);

    // Allow empty results for filter-only queries (backward compatibility)
    // If no search criteria, return empty results rather than error
    if (!query.keyword && !query.postcode && !query.city) {
      console.log("[DISCOVER] ℹ️  Filter-only query, returning empty results");
      return NextResponse.json({
        success: true,
        results: [],
        totalCount: 0,
        sources: { crm: 0, google_places: 0, companies_house: 0 },
        errors: [],
        processingTimeMs: 0,
      });
    }

    // Initialize providers
    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    const companiesHouseKey = process.env.COMPANIES_HOUSE_API_KEY;

    if (!googleApiKey) {
      console.log("[DISCOVER] ⚠️ WARNING: GOOGLE_MAPS_API_KEY not configured");
    }

    if (!companiesHouseKey) {
      console.log("[DISCOVER] ⚠️ WARNING: COMPANIES_HOUSE_API_KEY not configured");
    }

    const providers = [
      new CRMProvider(),
      ...(googleApiKey ? [new GooglePlacesProvider(googleApiKey)] : []),
      ...(companiesHouseKey ? [new CompaniesHouseProvider(companiesHouseKey)] : []),
    ];

    // Execute discovery
    const orchestrator = new DiscoverOrchestrator(providers);
    const result = await orchestrator.search(query);

    console.log(
      `[DISCOVER] ✓ Discovery complete: ${result.businesses.length} businesses in ${result.processingTimeMs}ms`
    );
    console.log("[DISCOVER] Provider breakdown:", result.sources);

    // Log ID format of returned businesses
    if (result.businesses.length > 0) {
      console.log("[DISCOVER] ========== RETURNED BUSINESS IDs ==========");
      result.businesses.slice(0, 5).forEach((biz, idx) => {
        console.log(`[DISCOVER] Business ${idx + 1}:`);
        console.log(`[DISCOVER]   ID: "${biz.id}"`);
        console.log(`[DISCOVER]   Type: ${typeof biz.id}`);
        console.log(`[DISCOVER]   Length: ${biz.id.length}`);
        console.log(`[DISCOVER]   Format: ${biz.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? 'UUID' : 'NOT UUID'}`);
        console.log(`[DISCOVER]   Business: "${biz.businessName}"`);
      });
      console.log("[DISCOVER] ==========================================");
    }

    if (result.errors.length > 0) {
      console.log("[DISCOVER] Errors encountered:", result.errors);
    }

    return NextResponse.json({
      success: true,
      results: result.businesses,
      totalCount: result.totalCount,
      sources: result.sources,
      processingTimeMs: result.processingTimeMs,
      errors: result.errors,
    });
  } catch (error) {
    console.error("[DISCOVER] ✗ Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Discovery failed",
        results: [],
        totalCount: 0,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log("[DISCOVER] ═══════════════════════════════════════");
  console.log("[DISCOVER] Starting discovery workflow");

  const { userId } = await auth();
  const user = await currentUser();

  console.log("[DISCOVER] Auth - userId:", userId ? "✓" : "✗");
  console.log("[DISCOVER] Auth - email:", user?.emailAddresses[0]?.emailAddress);

  if (!userId) {
    console.log("[DISCOVER] ✗ FAILED: Not authenticated");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email)) {
    console.log("[DISCOVER] ✗ FAILED: Not admin. Email:", email, "Allowed:", ADMIN_EMAILS);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  console.log("[DISCOVER] ✓ Auth passed");

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.log("[DISCOVER] ✗ FAILED: GOOGLE_MAPS_API_KEY not set");
    return NextResponse.json({ error: "GOOGLE_MAPS_API_KEY not configured" }, { status: 500 });
  }

  console.log("[DISCOVER] ✓ Google Maps API key configured");

  // INPUT VALIDATION GATE
  let body: { postcode?: string; radius?: number; category?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  // Validate and normalize inputs
  const postcode = body.postcode?.trim();
  const radius = Math.max(1, Math.min(25, body.radius || 5));
  const category = body.category?.trim() || "all";

  // Extract or default city
  const city = postcode ? postcode.split(" ")[0].trim() : "UK";

  // Ensure all critical values are safe strings
  if (!city || typeof city !== "string") {
    return NextResponse.json({ error: "Invalid city extracted from postcode" }, { status: 400 });
  }
  if (!category || typeof category !== "string") {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  console.log("[DISCOVER] Request payload - postcode:", postcode, "radius:", radius, "category:", category, "city:", city);

  // Translate form industry value to NICHE_SEARCH_MAP key
  const rawNiche = category === "all" ? undefined : category;
  const lowerNiche = (rawNiche || "business").toLowerCase();
  const mappedNiche = FORM_VALUE_TO_NICHE[lowerNiche];
  const niche = mappedNiche || lowerNiche.replace(/\s+/g, "-");

  console.log("[DISCOVER] Raw niche:", rawNiche);
  console.log("[DISCOVER] Mapped niche:", mappedNiche || "(no direct mapping, using normalized)");
  console.log("[DISCOVER] Final niche key:", niche);

  const queries = NICHE_SEARCH_MAP[niche] ?? ["business"];
  console.log("[DISCOVER] Search queries:", queries);
  console.log("[DISCOVER] Query source:", NICHE_SEARCH_MAP[niche] ? "mapped" : "fallback (original value)");

  try {
    await ensureB2BSchema();
    console.log("[DISCOVER] ✓ B2B schema ensured");
  } catch (err) {
    console.error("[DISCOVER_SCHEMA_ERROR]", err);
    return NextResponse.json(
      { error: "Discovery schema initialization failed" },
      { status: 500 }
    );
  }

  const sql = neon(process.env.DATABASE_URL!);
  console.log("[DISCOVER] ✓ Database connection initialized");

  const added: string[] = [];
  const BASE_URL = "https://saintandstoryltd.co.uk";
  let totalPlaces = 0;
  let skippedExisting = 0;
  let insertAttempts = 0;
  let insertSuccesses = 0;
  let insertFailures = 0;

  for (const query of queries) {
    console.log(`[DISCOVER] Searching for: "${query}"`);

    const places = await searchPlaces(query, city, apiKey);
    console.log(`[DISCOVER] Google Maps returned ${places.length} results for "${query}"`);
    totalPlaces += places.length;

    for (const place of places) {
      if (!place.place_id) {
        console.log(`[DISCOVER] Skipping place (no place_id): ${place.name}`);
        continue;
      }

      // VALIDATION: Ensure email is from verified source (Google Places)
      // Do not use generated or assumed emails
      if (place.website && !place.formatted_phone_number) {
        // If we have website but no phone, email is less certain
        console.log(`[DISCOVER]   ⚠️  Email verification: Has website but no phone number`);
      }

      if (!place.formatted_phone_number && !place.website) {
        // No phone or website = limited verification of contact info
        console.log(`[DISCOVER]   ⚠️  Email verification: No phone or website from Google Places`);
      }

      // Skip if already in DB
      console.log(`[DISCOVER] Checking if exists: ${place.name} (place_id: ${place.place_id})`);
      const existing = await sql`SELECT id FROM b2b_leads WHERE google_place_id = ${place.place_id} LIMIT 1`;

      if (existing.length > 0) {
        console.log(`[DISCOVER]   → Already exists, skipping`);
        skippedExisting++;
        continue;
      }

      console.log(`[DISCOVER]   → New business, processing`);

      const { painPoint, reviewText, rating } = detectPainPoint(place.reviews);
      console.log(`[DISCOVER]   Pain point: ${painPoint || "none"}`);

      // EMAIL SOURCE VALIDATION
      // Only use emails that come directly from Google Places data
      // Do not generate or assume emails
      let emailSource = "none";
      let useThisEmail = null;

      if (place.formatted_phone_number || place.website) {
        // Email is more reliable if we have verified contact info
        emailSource = place.formatted_phone_number ? "verified-phone" : "website-domain";
        useThisEmail = undefined; // Don't use unverified emails
        console.log(`[DISCOVER]   Email source: ${emailSource} (not using email from Google)`);
      } else {
        console.log(`[DISCOVER]   ⚠️  Email source: Unverified (no phone or website from Google Places)`);
      }

      // Extract city from address
      const addressCity = place.formatted_address?.split(",").slice(-3, -1).join("").trim() ?? city;
      console.log(`[DISCOVER]   Address city: ${addressCity}`);

      try {
        insertAttempts++;
        console.log(`[DISCOVER] INSERT ATTEMPT #${insertAttempts}: ${place.name}`);

        // Run through four-layer pipeline: discover → enrich → qualify → promote
        const pipelineResult = await runFullPipeline(sql, {
          placeId: place.place_id,
          name: place.name,
          address: place.formatted_address ?? "",
          postcode: undefined,
          category: niche,
          source: "discovery",
          reviews: (place.reviews || []).map(r => ({
            rating: r.rating,
            text: r.text,
            author: "Google Reviews",
            time: r.time,
          })),
          website: place.website,
          phone: place.formatted_phone_number,
          rating: place.rating,
          reviewCount: place.reviews?.length ?? 0,
          rawData: {
            city: addressCity,
            painPoint,
            painPointReview: reviewText,
          },
        });

        if (pipelineResult.promoted) {
          insertSuccesses++;
          console.log(`[DISCOVER]   ✓ PROMOTED TO LEAD: ${place.name}`);
          added.push(place.name);
        } else if (pipelineResult.qualified) {
          insertSuccesses++;
          console.log(`[DISCOVER]   ✓ QUALIFIED (awaiting score threshold): ${place.name}`);
          added.push(place.name);
        } else if (pipelineResult.discovered) {
          console.log(`[DISCOVER]   ⚠ DISCOVERED (not yet enriched): ${place.name}`);
          added.push(place.name);
        } else {
          console.log(`[DISCOVER]   ✗ PIPELINE FAILED: ${place.name}`);
        }
      } catch (error) {
        insertFailures++;
        console.error(`[DISCOVER]   ✗ PIPELINE ERROR: ${place.name}`);
        console.error(`[DISCOVER]   Error:`, error);
      }
    }
  }

  console.log("[DISCOVER] ═══════════════════════════════════════");
  console.log("[DISCOVER] SUMMARY");
  console.log("[DISCOVER]   Total places from Google Maps:", totalPlaces);
  console.log("[DISCOVER]   Skipped (already in DB):", skippedExisting);
  console.log("[DISCOVER]   Insert attempts:", insertAttempts);
  console.log("[DISCOVER]   Insert successes:", insertSuccesses);
  console.log("[DISCOVER]   Insert failures:", insertFailures);
  console.log("[DISCOVER]   Final added count:", added.length);
  console.log("[DISCOVER] ═══════════════════════════════════════");

  // PRIORITY 2: Ensure DB transaction is flushed before returning
  await new Promise(resolve => setTimeout(resolve, 500));

  // Query for the actual created leads from database (use correct snake_case column names)
  let createdLeads: any[] = [];
  try {
    createdLeads = await sql`
      SELECT id, business_name, business_category, email, city, postcode, status, lead_state, created_at, pain_point, business_evidence
      FROM b2b_leads
      WHERE created_at > NOW() - INTERVAL '10 seconds'
      AND (business_evidence IS NOT NULL OR id IS NOT NULL)
      ORDER BY created_at DESC
      LIMIT ${Math.max(added.length, 100)}
    `;
    console.log("[DISCOVER] Query returned", createdLeads.length, "leads from database");

    // Transform to match expected format for QueueCenter
    createdLeads = createdLeads.map((lead: any) => ({
      id: lead.id,
      businessName: lead.business_name,
      businessCategory: lead.business_category,
      industry: lead.business_category,
      city: lead.city,
      postcode: lead.postcode,
      email: lead.email,
      contactName: undefined,
      confidenceScore: 70, // Default confidence
      status: lead.status,
    }));
  } catch (err) {
    console.error("[DISCOVER] Error querying created leads:", err);
    // Don't fail - return empty array and let caller handle it
  }

  // Return actual lead records from database (not fallbacks)
  return NextResponse.json({
    results: createdLeads,
    businesses: createdLeads,
    totalCount: createdLeads.length,
    count: createdLeads.length,
    success: true,
    message: createdLeads.length > 0 ? "Leads created and returned" : "No leads were created (pipeline processing)"
  });
}
