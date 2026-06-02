import { searchPlaces, getPlaceDetails } from '@/lib/google-places';
import { generateRevelatoryAnalysis } from '@/lib/revelatory-engine';
import { BusinessEvidence, ReviewSnippet } from '@/lib/evidence-types';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('query') || 'florist';
    const location = url.searchParams.get('location') || 'Manchester, UK';

    console.log(`[Validation] Searching for "${query}" in "${location}"...\n`);

    // Search for businesses
    const searchResults = await searchPlaces(query, location);
    console.log(`[Validation] Found ${searchResults.length} results\n`);

    const results = [];

    for (let i = 0; i < Math.min(searchResults.length, 10); i++) {
      const business = searchResults[i];
      console.log(`[Validation] Processing: ${business.name}`);

      try {
        const details = await getPlaceDetails(business.place_id);
        if (!details) {
          console.log(`  ⚠ Could not fetch details`);
          continue;
        }

        // Convert reviews to ReviewSnippets
        const reviewSnippets: ReviewSnippet[] = (details.reviews || []).map((review, idx) => ({
          id: `review_${business.place_id}_${idx}`,
          text: review.text,
          source: 'google',
          timestamp: new Date(review.time * 1000),
          rating: review.rating,
          author: review.author_name,
        }));

        console.log(`  ✓ ${reviewSnippets.length} reviews extracted`);

        // Build evidence
        const evidence: BusinessEvidence = {
          reviews: reviewSnippets,
          facts: [
            {
              id: `fact_${business.place_id}_1`,
              fact: `Located in ${details.formatted_address}`,
              source: 'discovery',
              timestamp: new Date(),
            },
            {
              id: `fact_${business.place_id}_2`,
              fact: `Rating: ${details.rating} stars (${details.review_count} reviews)`,
              source: 'google',
              timestamp: new Date(),
            },
          ],
          extracted_at: new Date(),
          review_count: details.review_count,
          rating_average: details.rating,
        };

        // Generate revelatory analysis
        const analysis = generateRevelatoryAnalysis(evidence);

        results.push({
          name: details.name,
          rating: details.rating,
          totalReviews: details.review_count,
          extractedReviews: reviewSnippets.length,
          conversationPotential: analysis.conversationPotential,
          whyThisRanking: analysis.whyThisRanking,
          pressureHypotheses: analysis.hypotheses.pressureHypotheses.map(h => ({
            statement: h.statement,
            confidence: h.confidence,
            evidenceCount: h.evidence.length,
            howToValidate: h.howToValidate,
          })),
          constraintHypotheses: analysis.hypotheses.constraintHypotheses.map(h => ({
            statement: h.statement,
            confidence: h.confidence,
            evidenceCount: h.evidence.length,
            howToValidate: h.howToValidate,
          })),
          firstQuestion: analysis.firstQuestion,
        });
      } catch (error) {
        console.error(`  ✗ Error processing ${business.name}:`, error);
      }
    }

    console.log(`[Validation] Complete. Processed ${results.length} businesses\n`);

    // Return results as JSON for James to evaluate
    return new Response(JSON.stringify(results, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Validation] Error:', error);
    return new Response(JSON.stringify({ error: String(error) }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
