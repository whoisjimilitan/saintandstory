/**
 * Four-Layer Discovery Pipeline
 *
 * Layer 1: DISCOVERY → discovered_businesses (everything persisted, nothing discarded)
 * Layer 2: ENRICHMENT → enriched_businesses (intelligence extracted)
 * Layer 3: QUALIFICATION → qualified_businesses (scored and ranked)
 * Layer 4: PROMOTION → b2b_leads (only active leads)
 *
 * Key principle: Discovery never decides qualification.
 * All candidates preserved. Qualification happens separately.
 */

import { scoreOpportunity } from "./lead-scoring";
import type { DiscoveredLeadScoringInput } from "./lead-scoring";

export interface RawBusinessDiscovery {
  placeId: string;
  name: string;
  address: string;
  postcode?: string;
  category: string;
  source: string; // 'discovery', 'operator_search', 'csv_upload'
  reviews?: Array<{ rating: number; text: string; author: string; time: number }>;
  website?: string;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  rawData?: any;
}

export interface DiscoveredBusiness {
  id: string;
  google_place_id: string;
  business_name: string;
  address: string;
  postcode: string | null;
  category: string;
  source: string;
  discovered_at: string;
}

export interface EnrichedBusiness {
  id: string;
  discovered_business_id: string;
  google_place_id: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  review_count: number;
  average_rating: number | null;
  review_summary: any;
  digital_signals: any;
  transport_signals: any;
  ai_observations: string | null;
  enriched_at: string;
}

export interface QualifiedBusiness {
  id: string;
  discovered_business_id: string;
  google_place_id: string;
  opportunity_score: number;
  score_breakdown: any;
  confidence: "high" | "medium" | "low";
  qualification_reason: string;
  estimated_monthly_value: number | null;
  qualified_at: string;
}

/**
 * LAYER 1: DISCOVERY
 * Persist raw business discovery without any filtering
 */
export async function persistDiscovery(
  sql: any,
  business: RawBusinessDiscovery
): Promise<DiscoveredBusiness | null> {
  try {
    const result = (await sql`
      INSERT INTO discovered_businesses (
        google_place_id, business_name, address, postcode, category, source, raw_data
      ) VALUES (
        ${business.placeId}, ${business.name}, ${business.address || null},
        ${business.postcode || null}, ${business.category}, ${business.source},
        ${JSON.stringify(business.rawData || {})}
      )
      ON CONFLICT (google_place_id) DO NOTHING
      RETURNING *
    `) as DiscoveredBusiness[];

    if (result.length > 0) {
      return result[0];
    }
    return null; // Already existed
  } catch (error) {
    console.error("[Pipeline] Error persisting discovery:", error);
    return null;
  }
}

/**
 * LAYER 2: ENRICHMENT
 * Extract intelligence from reviews, website, contact info
 */
export async function enrichBusiness(
  sql: any,
  discoveredId: string,
  googlePlaceId: string,
  business: RawBusinessDiscovery
): Promise<EnrichedBusiness | null> {
  try {
    // Extract review intelligence
    const reviewSummary = extractReviewSignals(business.reviews || []);

    // Digital maturity signals
    const digitalSignals = {
      has_website: !!business.website,
      has_contact_form: false, // Would check website content
      has_booking: false, // Would check website content
      website_quality: business.website ? 50 : 0, // Simplified
    };

    // Transport dependency signals (care sector keywords)
    const transportSignals = analyzeTransportDependency(
      business.name,
      business.category,
      business.reviews || []
    );

    const result = (await sql`
      INSERT INTO enriched_businesses (
        discovered_business_id, google_place_id, website, phone,
        review_count, average_rating, review_summary,
        digital_signals, transport_signals
      ) VALUES (
        ${discoveredId}, ${googlePlaceId}, ${business.website || null},
        ${business.phone || null}, ${business.reviewCount || 0},
        ${business.rating || null}, ${JSON.stringify(reviewSummary)},
        ${JSON.stringify(digitalSignals)}, ${JSON.stringify(transportSignals)}
      )
      ON CONFLICT DO NOTHING
      RETURNING *
    `) as EnrichedBusiness[];

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Pipeline] Error enriching business:", error);
    return null;
  }
}

/**
 * LAYER 3: QUALIFICATION
 * Score and rank enriched businesses
 */
export async function qualifyBusiness(
  sql: any,
  enrichedId: string,
  discoveredId: string,
  googlePlaceId: string,
  business: RawBusinessDiscovery,
  enrichedData: EnrichedBusiness
): Promise<QualifiedBusiness | null> {
  try {
    // Score using the comprehensive opportunity scoring
    const scoringInput: DiscoveredLeadScoringInput = {
      industryCategory: business.category,
      painPoint: extractPainPoint(business.reviews || []),
      painPointReview: null,
      reviewRating: business.rating,
    };

    const score = scoreOpportunity({
      businessName: business.name,
      category: business.category,
      reviewCount: business.reviewCount,
      rating: business.rating,
      hasWebsite: !!business.website,
      painPoint: scoringInput.painPoint,
    });

    const qualificationReason = generateQualificationReason(
      score,
      business,
      enrichedData
    );

    const result = (await sql`
      INSERT INTO qualified_businesses (
        enriched_business_id, discovered_business_id, google_place_id,
        opportunity_score, score_breakdown, confidence, qualification_reason,
        estimated_monthly_value
      ) VALUES (
        ${enrichedId}, ${discoveredId}, ${googlePlaceId},
        ${score.total}, ${JSON.stringify(score.breakdown)},
        ${score.confidence}, ${qualificationReason}, ${score.estimatedMonthlyValue}
      )
      ON CONFLICT DO NOTHING
      RETURNING *
    `) as QualifiedBusiness[];

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Pipeline] Error qualifying business:", error);
    return null;
  }
}

/**
 * LAYER 4: PROMOTION
 * Move qualified business to active lead (only when threshold crossed)
 */
export async function promoteToLead(
  sql: any,
  qualifiedBusinessId: string,
  qualifiedBusiness: QualifiedBusiness,
  minScore: number = 40
): Promise<{ success: boolean; leadId?: string }> {
  try {
    // Check if score meets threshold
    if (qualifiedBusiness.opportunity_score < minScore) {
      return { success: false };
    }

    // Get the underlying discovered and enriched data
    const enrichedResult = (await sql`
      SELECT db.business_name, db.address, db.postcode, db.google_place_id, db.category,
             eb.website, eb.phone, eb.review_count, eb.average_rating
      FROM qualified_businesses qb
      JOIN enriched_businesses eb ON qb.enriched_business_id = eb.id
      JOIN discovered_businesses db ON qb.discovered_business_id = db.id
      WHERE qb.id = ${qualifiedBusinessId}
    `) as Array<any>;

    if (enrichedResult.length === 0) {
      return { success: false };
    }

    const data = enrichedResult[0];

    // Create lead in b2b_leads
    const leadResult = (await sql`
      INSERT INTO b2b_leads (
        business_name, business_category, email, phone, city, website,
        google_place_id, opportunity_score, score_breakdown,
        qualified_business_id, discovered_business_id,
        promoted_from_qualified_at, source, status, niche, created_at, updated_at
      ) VALUES (
        ${data.business_name}, ${data.category}, null, ${data.phone || null},
        ${extractCityFromAddress(data.address)},
        ${data.website || null}, ${data.google_place_id},
        ${qualifiedBusiness.opportunity_score},
        ${JSON.stringify(qualifiedBusiness.score_breakdown)},
        ${qualifiedBusinessId}, ${qualifiedBusiness.discovered_business_id},
        NOW(), 'discovery_promoted', 'new', ${data.category},
        NOW(), NOW()
      )
      RETURNING id
    `) as Array<{ id: string }>;

    if (leadResult.length > 0) {
      // Record promotion
      await sql`
        INSERT INTO lead_promotions (
          qualified_business_id, lead_id, promotion_reason, promoted_by
        ) VALUES (
          ${qualifiedBusinessId}, ${leadResult[0].id},
          'Score exceeded threshold (' || ${qualifiedBusiness.opportunity_score} || ' >= ' || ${minScore} || ')',
          'system'
        )
      `;

      // Mark as promoted
      await sql`
        UPDATE qualified_businesses SET promoted_to_lead_at = NOW()
        WHERE id = ${qualifiedBusinessId}
      `;

      return { success: true, leadId: leadResult[0].id };
    }

    return { success: false };
  } catch (error) {
    console.error("[Pipeline] Error promoting to lead:", error);
    return { success: false };
  }
}

/**
 * FULL PIPELINE: Discover → Enrich → Qualify → Promote
 */
export async function runFullPipeline(
  sql: any,
  business: RawBusinessDiscovery,
  promoteIfScoreAbove: number = 40
): Promise<{ discovered: boolean; qualified: boolean; promoted: boolean }> {
  // Layer 1: Discovery
  const discovered = await persistDiscovery(sql, business);
  if (!discovered) {
    return { discovered: false, qualified: false, promoted: false };
  }

  // Layer 2: Enrichment
  const enriched = await enrichBusiness(
    sql,
    discovered.id,
    business.placeId,
    business
  );
  if (!enriched) {
    return { discovered: true, qualified: false, promoted: false };
  }

  // Layer 3: Qualification
  const qualified = await qualifyBusiness(
    sql,
    enriched.id,
    discovered.id,
    business.placeId,
    business,
    enriched
  );
  if (!qualified) {
    return { discovered: true, qualified: false, promoted: false };
  }

  // Layer 4: Promotion (if score meets threshold)
  const promotion = await promoteToLead(
    sql,
    qualified.id,
    qualified,
    promoteIfScoreAbove
  );

  return {
    discovered: true,
    qualified: true,
    promoted: promotion.success,
  };
}

// Helper functions

function extractReviewSignals(reviews: any[]) {
  const painPoints: string[] = [];
  const themes: string[] = [];
  let positiveCount = 0;
  let negativeCount = 0;

  const painKeywords = [
    "delivery",
    "courier",
    "shipping",
    "late",
    "didn't show",
    "no show",
  ];

  for (const review of reviews) {
    const text = (review.text || "").toLowerCase();
    if (review.rating <= 3) negativeCount++;
    else positiveCount++;

    for (const keyword of painKeywords) {
      if (text.includes(keyword) && !painPoints.includes(keyword)) {
        painPoints.push(keyword);
      }
    }
  }

  return { pain_points: painPoints, themes, sentiment: { positive: positiveCount, negative: negativeCount } };
}

function extractPainPoint(reviews: any[]): string | null {
  for (const review of reviews) {
    if ((review.rating || 5) <= 3) {
      const text = (review.text || "").toLowerCase();
      const keywords = [
        "delivery",
        "courier",
        "shipping",
        "late",
        "no show",
        "logistics",
      ];
      for (const keyword of keywords) {
        if (text.includes(keyword)) return keyword;
      }
    }
  }
  return null;
}

function analyzeTransportDependency(
  businessName: string,
  category: string,
  reviews: any[]
): any {
  const careKeywords = [
    "care",
    "nursing",
    "home",
    "domiciliary",
    "assisted",
    "disability",
    "supported",
  ];

  const transportKeywords = [
    "delivery",
    "pickup",
    "transport",
    "courier",
    "shift",
    "visit",
  ];

  const businessLower = businessName.toLowerCase();
  const categoryLower = category.toLowerCase();

  const careScore = careKeywords.filter((k) =>
    businessLower.includes(k) || categoryLower.includes(k)
  ).length * 15;

  let transportScore = 0;
  for (const review of reviews) {
    const text = (review.text || "").toLowerCase();
    transportScore += transportKeywords.filter((k) => text.includes(k)).length * 5;
  }

  return {
    keywords_found: [
      ...careKeywords.filter((k) => businessLower.includes(k)),
      ...transportKeywords.filter((k) =>
        reviews.some((r) => (r.text || "").toLowerCase().includes(k))
      ),
    ],
    relevance_score: Math.min(careScore + transportScore, 100),
  };
}

function generateQualificationReason(score: any, business: any, enriched: any): string {
  const reasons: string[] = [];

  if (score.breakdown.businessTypeScore >= 20) {
    reasons.push("Care-sector business");
  }
  if (score.breakdown.serviceComplexityScore >= 15) {
    reasons.push("Multi-service operation");
  }
  if (enriched.review_count > 20) {
    reasons.push("Strong market presence");
  }
  if (score.breakdown.painSignalBonus > 0) {
    reasons.push("Operational friction detected");
  }

  return reasons.length > 0 ? reasons.join("; ") : "Discovery candidate";
}

function extractCityFromAddress(address: string): string {
  if (!address) return "";
  const parts = address.split(",");
  return parts.length > 1 ? parts[parts.length - 2].trim() : "";
}
