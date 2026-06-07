import { neon } from "@neondatabase/serverless";
import { ProspectPageBusiness, Movement, ProspectPageData } from "./prospect-types";
import { getMovementsForBusiness } from "./movement-intelligence";
import { rankMovementsByOpportunity } from "./opportunity-engine";
import { getMovementCopy } from "./prospect-copy";

// Generate URL slug from business name
export function generateSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Spaces to dashes
    .replace(/-+/g, "-"); // Deduplicate dashes
}

// Find business by slug from b2b_leads table
export async function findBusinessBySlug(
  slug: string
): Promise<ProspectPageBusiness | null> {
  if (!process.env.DATABASE_URL) {
    console.warn("[PROSPECT] DATABASE_URL not set");
    return null;
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log("[PROSPECT] Looking up slug in database:", slug);

    // Fetch all businesses (limited scope for safety)
    const allBusinesses = await sql`
      SELECT business_name, business_category, city, website
      FROM b2b_leads
      WHERE business_name IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 1000
    `;

    console.log("[PROSPECT] Fetched", allBusinesses.length, "businesses from database");

    // Find business by matching generated slug
    // This ensures 100% consistency with the slug generation logic
    const matchedBusiness = allBusinesses.find((row: any) => {
      const generatedSlug = generateSlug(row.business_name);
      return generatedSlug === slug;
    });

    if (!matchedBusiness) {
      console.log("[PROSPECT] No business found matching slug:", slug);
      console.log("[PROSPECT] Searched", allBusinesses.length, "businesses");

      // Debug: log first 3 businesses and their generated slugs
      if (allBusinesses.length > 0) {
        console.log("[PROSPECT] Sample business slugs:");
        allBusinesses.slice(0, 3).forEach((b: any) => {
          console.log(`  "${b.business_name}" → "${generateSlug(b.business_name)}"`);
        });
      }

      return null;
    }

    console.log("[PROSPECT] Found business:", matchedBusiness.business_name);
    console.log("[PROSPECT] Matched slug:", generateSlug(matchedBusiness.business_name));

    return {
      name: matchedBusiness.business_name,
      category: matchedBusiness.business_category || "Business",
      city: matchedBusiness.city || "UK",
      website: matchedBusiness.website || undefined,
    };
  } catch (error) {
    console.error("[PROSPECT] Error finding business by slug:", slug, error);
    return null;
  }
}

// Build personalized brief description for a movement
export function buildMovementBrief(
  movement: any,
  business: ProspectPageBusiness
): Movement {
  // Fetch copy from configurable copy system
  const copy = getMovementCopy(business.category, movement.type);

  return {
    type: movement.type,
    briefDescription: copy.description,
    howWeSolveIt: copy.solution,
  };
}

// Assemble complete prospect page data (no database writes)
export async function buildProspectPageData(
  business: ProspectPageBusiness
): Promise<ProspectPageData | null> {
  try {
    // Get all movements for this business category
    const allMovements = getMovementsForBusiness(business.category);

    // Rank by opportunity
    const rankedMovements = rankMovementsByOpportunity(
      allMovements.map((m) => ({ type: m }))
    );

    // Take top 3
    const topThreeMovements = rankedMovements.slice(0, 3);

    // Build personalized briefs for each
    const briefedMovements: Movement[] = topThreeMovements.map((movementType) => {
      const baseMov = allMovements.find((m) => m === movementType);
      if (!baseMov) {
        return {
          type: movementType,
          briefDescription: "This is a delivery situation your business likely faces.",
          howWeSolveIt: "Saint & Story provides same-day delivery with real-time tracking.",
        };
      }

      return buildMovementBrief({ type: baseMov }, business);
    });

    return {
      business,
      movements: briefedMovements,
    };
  } catch (error) {
    console.error("Error building prospect page data:", error);
    return null;
  }
}
