import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { ensureB2BSchema } from "@/lib/b2b-schema";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com", "oye.van@outlook.com"];

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

interface PlacesResult {
  place_id: string;
  name: string;
  formatted_address: string;
  website?: string;
  formatted_phone_number?: string;
  rating?: number;
  reviews?: { rating: number; text: string; time: number }[];
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
  // Text search
  const searchRes = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(`${query} in ${city} UK`)}&key=${apiKey}&language=en&region=gb`,
    { next: { revalidate: 0 } }
  );
  const searchData = await searchRes.json() as { results?: { place_id: string; name: string; formatted_address: string; rating?: number }[] };
  if (!searchData.results?.length) return [];

  // Get details for top results
  const places: PlacesResult[] = [];
  for (const result of searchData.results.slice(0, 5)) {
    try {
      const detailRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${result.place_id}&fields=name,formatted_address,website,formatted_phone_number,rating,reviews&key=${apiKey}&language=en`,
        { next: { revalidate: 0 } }
      );
      const detail = await detailRes.json() as { result?: PlacesResult };
      if (detail.result) {
        places.push({ ...detail.result, place_id: result.place_id });
      }
    } catch { /* skip on error */ }
  }
  return places;
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GOOGLE_MAPS_API_KEY not configured" }, { status: 500 });

  const { niche, city } = await request.json() as { niche: string; city: string };
  const queries = NICHE_SEARCH_MAP[niche] ?? [niche];

  await ensureB2BSchema();
  const sql = neon(process.env.DATABASE_URL!);

  const added: string[] = [];
  const BASE_URL = "https://saintandstoryltd.co.uk";

  for (const query of queries) {
    const places = await searchPlaces(query, city, apiKey);

    for (const place of places) {
      if (!place.place_id) continue;

      // Skip if already in DB
      const existing = await sql`SELECT id FROM b2b_leads WHERE google_place_id = ${place.place_id} LIMIT 1`;
      if (existing.length > 0) continue;

      const { painPoint, reviewText, rating } = detectPainPoint(place.reviews);

      // Extract city from address
      const addressCity = place.formatted_address?.split(",").slice(-3, -1).join("").trim() ?? city;

      await sql`
        INSERT INTO b2b_leads (
          business_name, business_category, email, phone, city,
          website, google_place_id, pain_point, pain_point_review, review_rating,
          source, status, niche, landing_page_url
        ) VALUES (
          ${place.name}, ${niche}, null, ${place.formatted_phone_number ?? null}, ${addressCity},
          ${place.website ?? null}, ${place.place_id}, ${painPoint}, ${reviewText ?? null},
          ${rating ?? null}, 'discovery', 'new', ${niche},
          ${`${BASE_URL}/b2b/${niche}`}
        )
      `;
      added.push(place.name);
    }
  }

  return NextResponse.json({ added, count: added.length });
}
