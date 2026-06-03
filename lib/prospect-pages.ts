import { neon } from "@neondatabase/serverless";
import { ProspectPageBusiness, Movement, ProspectPageData } from "./prospect-types";
import { getMovementsForBusiness } from "./movement-intelligence";
import { rankMovementsByOpportunity } from "./opportunity-engine";

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

    const result = await sql`
      SELECT business_name, business_category, city, website
      FROM b2b_leads
      WHERE LOWER(REPLACE(REPLACE(REPLACE(business_name, '&', ''), '.', ''), ' ', '-')) = ${slug}
      LIMIT 1
    `;

    console.log("[PROSPECT] Query returned", result.length, "rows for slug:", slug);

    if (result.length === 0) {
      console.log("[PROSPECT] No business found for slug:", slug);
      return null;
    }

    const row = result[0] as any;
    console.log("[PROSPECT] Found business:", row.business_name);

    return {
      name: row.business_name,
      category: row.business_category || "Business",
      city: row.city || "UK",
      website: row.website || undefined,
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
  const category = business.category.toLowerCase();

  // Map movements to personalized briefs based on industry
  const briefs: Record<string, Record<string, { description: string; solution: string }>> = {
    legal: {
      "Court Filing Documents": {
        description:
          "When documents must reach court before a specific deadline, timing becomes critical.",
        solution:
          "Saint & Story provides same-day collection, delivery and proof of delivery.",
      },
      "Signed Legal Contracts": {
        description:
          "When signatures are obtained, counterparties typically expect documents to arrive promptly.",
        solution: "We handle contract transfers the same day they are signed.",
      },
      "Property Completion Documents": {
        description:
          "Completion days often involve keys, signed documents and strict timelines.",
        solution:
          "Saint & Story supports these transfers with real-time updates and driver confirmation.",
      },
    },
    "estate agent": {
      "Property Completion Keys": {
        description:
          "Completion days often involve keys, signed documents and strict timelines.",
        solution:
          "Saint & Story supports completion-day movements with 15-minute driver confirmation and tracking.",
      },
      "Urgent Valuation Documents": {
        description: "When clients need valuations urgently, delays cost viewings and sales.",
        solution: "We deliver valuation documents same-day so clients get immediate feedback.",
      },
      "Mortgage & Contract Documents": {
        description:
          "During transactions, documents are constantly moving between offices and clients.",
        solution: "Fixed price, same-day movement keeps your sales pipeline moving.",
      },
    },
    construction: {
      "Emergency Site Materials": {
        description:
          "When a critical component doesn't arrive and a crew is standing idle, costs mount quickly.",
        solution:
          "Saint & Story provides rapid site rescue deliveries to prevent crew downtime.",
      },
      "Revised Specifications": {
        description:
          "When site changes occur, updated drawings and specifications must reach crews immediately.",
        solution: "We deliver updated specs same-day to keep projects on track.",
      },
      "Safety Certificates": {
        description:
          "Compliance documents often have tight deadlines and inspection windows.",
        solution: "We ensure safety certificates reach inspection sites on deadline.",
      },
    },
    medical: {
      "Prescription & Medication Transfers": {
        description:
          "Patient emergencies require immediate medication transfers between locations.",
        solution:
          "Saint & Story provides same-day emergency medication transfers with tracking.",
      },
      "Medical Specimens": {
        description: "Specimens degrade over time; urgent transfers are critical for test accuracy.",
        solution:
          "We handle time-sensitive specimen movement with chain-of-custody documentation.",
      },
      "Medical Records": {
        description: "Patient transfers and consultations require medical records to arrive quickly.",
        solution: "Same-day record transfers support continuity of care.",
      },
    },
  };

  // Get category-specific brief, or use generic fallback
  const categoryBrief = briefs[category] || {};
  const movementBrief = categoryBrief[movement.type];

  if (movementBrief) {
    return {
      type: movement.type,
      briefDescription: movementBrief.description,
      howWeSolveIt: movementBrief.solution,
    };
  }

  // Generic fallback
  return {
    type: movement.type,
    briefDescription: `This delivery situation is likely common within businesses like ${business.name}.`,
    howWeSolveIt: "Saint & Story provides same-day delivery with real-time tracking and confirmation.",
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
