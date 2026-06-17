/**
 * POST /api/b2b/discover/search
 *
 * Searches for qualified B2B leads by postcode and radius.
 *
 * Request body:
 * {
 *   postcode: string (e.g., "M1 1AA")
 *   radius: number (miles)
 * }
 *
 * Response:
 * {
 *   results: [{
 *     id, business_name, business_category, city, postcode,
 *     email, phone, pressure_type, engagement_score, lead_tier
 *   }]
 * }
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface SearchRequest {
  postcode: string;
  radius: number;
}

/**
 * Simple postcode to coordinates lookup
 * In production, use proper geocoding service
 */
function estimateCoordinatesFromPostcode(
  postcode: string
): { lat: number; lng: number } | null {
  // This is simplified - in production use Google Maps API or similar
  // For now, return null to search by postcode string only
  return null;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Used for radius filtering after database query
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SearchRequest;
    const { postcode, radius } = body;

    if (!postcode || !radius) {
      return NextResponse.json(
        { error: "Postcode and radius required" },
        { status: 400 }
      );
    }

    // Search for leads near the postcode
    // Filter by engagement_score >= 30 (Tier A quality)
    const leads = await prisma.b2b_leads.findMany({
      where: {
        postcode: {
          startsWith: postcode.toUpperCase(),
        },
        engagement_score: {
          gte: 30, // Only Tier A quality
        },
        email: {
          not: null, // Must have email to contact
        },
      },
      select: {
        id: true,
        business_name: true,
        business_category: true,
        city: true,
        postcode: true,
        email: true,
        phone: true,
        engagement_score: true,
        lead_tier: true,
        latitude: true,
        longitude: true,
      },
      orderBy: {
        engagement_score: "desc",
      },
      take: 50, // Limit results
    });

    // Get pressure types from b2b_outreach for each lead
    const resultsWithPressure = await Promise.all(
      leads.map(async (lead) => {
        const outreach = await prisma.b2b_outreach.findFirst({
          where: {
            lead_id: lead.id,
          },
          select: {
            pressure_type: true,
          },
        });

        return {
          ...lead,
          pressure_type: outreach?.pressure_type || null,
        };
      })
    );

    // Filter by radius if coordinates available
    // (simplified - in production use proper geocoding)
    const filtered = resultsWithPressure.filter((lead) => {
      // For now, just return all within the postcode
      // Radius filtering would use lat/lng distance calculation
      return true;
    });

    return NextResponse.json({
      results: filtered,
      count: filtered.length,
    });
  } catch (error) {
    console.error("[SEARCH] Error:", error);
    return NextResponse.json(
      {
        error: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
