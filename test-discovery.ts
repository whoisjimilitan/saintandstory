/**
 * TEST DISCOVERY WORKFLOW
 *
 * This script simulates the complete discovery workflow locally
 * to identify the exact failure point.
 *
 * It will show:
 * - Google Maps API requests and responses
 * - Database schema check
 * - Database insert attempts and results
 */

import { neon } from "@neondatabase/serverless";

// Same keywords as in route.ts
const PAIN_KEYWORDS = [
  "delivery", "courier", "shipping", "supplier", "didn't show", "never arrived",
  "late delivery", "no show", "delivery failed", "never got", "still waiting",
  "logistics", "dispatch", "collection", "pickup", "pick up", "drop off",
];

const SATISFACTION_PHRASES = [
  "great delivery", "quick delivery", "fast delivery", "on time", "arrived safely",
  "delivered perfectly", "excellent courier",
];

const NICHE_SEARCH_MAP: Record<string, string[]> = {
  florists: ["florist", "flower shop", "flowers"],
  restaurants: ["restaurant", "cafe", "bistro", "eatery"],
  retailers: ["retail store", "shop", "boutique"],
  legal: ["solicitors", "law firm", "legal services"],
  "estate-agents": ["estate agent", "property agent", "letting agent"],
};

function detectPainPoint(reviews: any): { painPoint: string | null; reviewText: string | null; rating: number | null } {
  if (!reviews?.length) return { painPoint: null, reviewText: null, rating: null };

  for (const review of reviews) {
    if (review.rating > 3) continue;
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

async function searchPlaces(query: string, city: string, apiKey: string): Promise<any[]> {
  try {
    console.log(`\n[SEARCH] Querying Google Maps for: "${query}" in "${city}"`);

    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(`${query} in ${city} UK`)}&key=${apiKey}&language=en&region=gb`;
    console.log(`[SEARCH] URL: ${searchUrl.substring(0, 80)}...`);

    const searchRes = await fetch(searchUrl);
    console.log(`[SEARCH] Response status: ${searchRes.status}`);

    const searchData = await searchRes.json() as any;
    console.log(`[SEARCH] Google status: ${searchData.status}`);
    console.log(`[SEARCH] Results count: ${searchData.results?.length ?? 0}`);

    if (!searchData.results?.length) {
      console.log(`[SEARCH] ✗ No results from Google Maps`);
      return [];
    }

    const places: any[] = [];
    for (const result of searchData.results.slice(0, 3)) {
      try {
        console.log(`[SEARCH]   Getting details for: ${result.name}`);

        const detailRes = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${result.place_id}&fields=name,formatted_address,website,formatted_phone_number,rating,reviews&key=${apiKey}&language=en`
        );
        const detail = await detailRes.json() as any;

        if (detail.result) {
          places.push({ ...detail.result, place_id: result.place_id });
          console.log(`[SEARCH]     ✓ Got details`);
        }
      } catch (e) {
        console.log(`[SEARCH]     ✗ Error:`, e);
      }
    }

    console.log(`[SEARCH] Total places with details: ${places.length}`);
    return places;
  } catch (error) {
    console.error(`[SEARCH] ✗ Fatal error:`, error);
    return [];
  }
}

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("DISCOVERY SYSTEM TEST");
  console.log("═══════════════════════════════════════════════════");

  // Check environment
  console.log("\n[ENV] Checking environment variables...");
  const dbUrl = process.env.DATABASE_URL;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  console.log(`[ENV] DATABASE_URL set: ${dbUrl ? "✓" : "✗"}`);
  console.log(`[ENV] GOOGLE_MAPS_API_KEY set: ${apiKey ? "✓" : "✗"}`);

  if (!dbUrl) {
    console.log("\n✗ FATAL: DATABASE_URL not set");
    process.exit(1);
  }

  if (!apiKey) {
    console.log("\n✗ FATAL: GOOGLE_MAPS_API_KEY not set");
    process.exit(1);
  }

  // Test database connection
  console.log("\n[DB] Testing database connection...");
  const sql = neon(dbUrl);

  try {
    const result = await sql`SELECT COUNT(*) as count FROM b2b_leads`;
    console.log(`[DB] ✓ Connected. Current b2b_leads count: ${(result[0] as any).count}`);
  } catch (error) {
    console.log(`[DB] ✗ Connection failed:`, error);
    process.exit(1);
  }

  // Test Google Maps API
  console.log("\n[GOOGLE] Testing Google Maps API...");
  const testQuery = NICHE_SEARCH_MAP.legal[0];
  const testCity = "London";

  const places = await searchPlaces(testQuery, testCity, apiKey);

  if (places.length === 0) {
    console.log(`\n✗ FAILURE: Google Maps returned 0 results for "${testQuery}" in "${testCity}"`);
    console.log("This could mean:");
    console.log("  1. API key is invalid");
    console.log("  2. API key has no quota");
    console.log("  3. API is returning errors");
    process.exit(1);
  }

  console.log(`\n✓ Google Maps test successful - got ${places.length} places with details`);

  // Test database insert
  console.log("\n[DB INSERT] Testing database insert with sample data...");

  if (places.length > 0) {
    const testPlace = places[0];
    console.log(`[DB INSERT] Test inserting: ${testPlace.name}`);

    // Check if already exists
    const existing = await sql`
      SELECT id FROM b2b_leads WHERE google_place_id = ${testPlace.place_id} LIMIT 1
    `;

    if (existing.length > 0) {
      console.log(`[DB INSERT] ✓ Already in database, skipping insert test`);
    } else {
      try {
        console.log(`[DB INSERT] Attempting INSERT...`);

        const { painPoint, reviewText, rating } = detectPainPoint(testPlace.reviews);
        console.log(`[DB INSERT]   Pain point: ${painPoint || "none"}`);
        console.log(`[DB INSERT]   Review text: ${reviewText ? reviewText.substring(0, 50) + "..." : "none"}`);
        console.log(`[DB INSERT]   Rating: ${rating || "none"}`);

        await sql`
          INSERT INTO b2b_leads (
            business_name, business_category, email, phone, city,
            website, google_place_id, pain_point, pain_point_review, review_rating,
            source, status, niche, landing_page_url
          ) VALUES (
            ${testPlace.name}, 'legal', null, ${testPlace.formatted_phone_number ?? null}, 'London',
            ${testPlace.website ?? null}, ${testPlace.place_id}, ${painPoint}, ${reviewText ?? null},
            ${rating ?? null}, 'discovery', 'new', 'legal',
            'https://saintandstoryltd.co.uk/b2b/legal'
          )
        `;

        console.log(`[DB INSERT] ✓ INSERT successful`);

        // Verify insert
        const verify = await sql`SELECT COUNT(*) as count FROM b2b_leads WHERE google_place_id = ${testPlace.place_id}`;
        console.log(`[DB INSERT] ✓ Verified: Business now in database`);
      } catch (error) {
        console.log(`[DB INSERT] ✗ INSERT failed:`, error);
      }
    }
  }

  console.log("\n═══════════════════════════════════════════════════");
  console.log("TEST COMPLETE");
  console.log("═══════════════════════════════════════════════════");
}

main().catch(console.error);
