import { BusinessEvidence, ReviewSnippet, BusinessFact } from './evidence-types';
import { neon } from '@neondatabase/serverless';

// Extract evidence from Google Places API reviews
async function extractGoogleReviews(
  googlePlaceId: string
): Promise<ReviewSnippet[]> {
  if (!googlePlaceId) return [];

  try {
    // Fetch from Google Places API
    // For now, returns empty array — integrate with actual API key
    const reviews: ReviewSnippet[] = [];
    return reviews;
  } catch (error) {
    console.error('Error extracting Google reviews:', error);
    return [];
  }
}

// Extract facts from business data
function extractBusinessFacts(businessData: {
  business_name?: string;
  website?: string;
  city?: string;
  created_at?: Date;
}): BusinessFact[] {
  const facts: BusinessFact[] = [];

  if (businessData.city) {
    facts.push({
      id: `fact_${Date.now()}_1`,
      fact: `Located in ${businessData.city}`,
      source: 'discovery',
      timestamp: new Date(),
    });
  }

  // Check if business appears new
  if (businessData.created_at) {
    const monthsOld = (Date.now() - businessData.created_at.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsOld < 12) {
      facts.push({
        id: `fact_${Date.now()}_2`,
        fact: `Business appears relatively new (${Math.round(monthsOld)} months old)`,
        source: 'discovery',
        timestamp: new Date(),
      });
    }
  }

  return facts;
}

// Calculate average rating from reviews
function calculateAverageRating(reviews: ReviewSnippet[]): number | undefined {
  const ratingsAvailable = reviews.filter(r => r.rating !== undefined);
  if (ratingsAvailable.length === 0) return undefined;

  const sum = ratingsAvailable.reduce((acc, r) => acc + (r.rating || 0), 0);
  return sum / ratingsAvailable.length;
}

// Main function: extract all evidence for a business
export async function extractEvidence(
  businessData: {
    id: string;
    business_name: string;
    website?: string;
    google_place_id?: string;
    city?: string;
    niche?: string;
    created_at?: Date;
  }
): Promise<BusinessEvidence> {
  console.log(`[Evidence Extractor] Starting extraction for ${businessData.business_name}`);

  // Extract Google reviews
  const googleReviews = await extractGoogleReviews(businessData.google_place_id || '');

  // Extract business facts
  const facts = extractBusinessFacts(businessData);

  // Calculate statistics
  const reviewCount = googleReviews.length;
  const ratingAverage = calculateAverageRating(googleReviews);

  const evidence: BusinessEvidence = {
    reviews: googleReviews,
    facts,
    extracted_at: new Date(),
    review_count: reviewCount,
    rating_average: ratingAverage,
  };

  console.log(`[Evidence Extractor] Extracted: ${reviewCount} reviews, ${facts.length} facts`);

  return evidence;
}

// Retrieve stored evidence for a lead
export async function getStoredEvidence(lead_id: string): Promise<BusinessEvidence | null> {
  if (!process.env.DATABASE_URL) return null;

  try {
    const sql = neon(process.env.DATABASE_URL);

    const result = await sql`
      SELECT business_evidence FROM b2b_leads WHERE id = ${lead_id}
    `;

    if (result.length === 0) return null;

    const row = result[0] as { business_evidence: BusinessEvidence | null };
    return row.business_evidence;
  } catch (error) {
    console.error('Error retrieving stored evidence:', error);
    return null;
  }
}

// Store evidence in database
export async function storeEvidence(
  lead_id: string,
  evidence: BusinessEvidence
): Promise<void> {
  if (!process.env.DATABASE_URL) return;

  try {
    const sql = neon(process.env.DATABASE_URL);

    await sql`
      UPDATE b2b_leads
      SET business_evidence = ${JSON.stringify(evidence)}::jsonb
      WHERE id = ${lead_id}
    `;

    console.log(`[Evidence Extractor] Stored evidence for lead ${lead_id}`);
  } catch (error) {
    console.error('Error storing evidence:', error);
  }
}
