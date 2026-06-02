import { searchPlaces, getPlaceDetails } from '@/lib/google-places';

interface EvidenceNote {
  businessName: string;
  totalReviews: number;
  rating: number;
  snippet: string;
  whyItMatters: string;
  potentialBusinessMeaning: string;
}

// Manual annotation rules - looking for business opportunity signals
// Not sentiment classification, but operational pattern detection
function annotateReview(snippet: string, businessName: string): { whyItMatters: string; potentialBusinessMeaning: string } | null {
  const text = snippet.toLowerCase();

  // PATTERN 1: Product praised + delivery criticized (tension)
  if (
    (text.includes('beautiful') || text.includes('stunning') || text.includes('lovely') || text.includes('excellent')) &&
    (text.includes('late') || text.includes('delayed') || text.includes('didn\'t arrive') || text.includes('disappointed'))
  ) {
    return {
      whyItMatters: 'Product is strong. Delivery is weak. This is operational tension.',
      potentialBusinessMeaning: 'Owner has mastered product quality but delivery systems lag. Clear opportunity for courier partnership.',
    };
  }

  // PATTERN 2: Same-day or emergency requests mentioned
  if (text.includes('last minute') || text.includes('same-day') || text.includes('urgent') || text.includes('emergency')) {
    return {
      whyItMatters: 'Customer demand for speed/emergency service exists.',
      potentialBusinessMeaning: 'Business may struggle with urgent requests. Recurring service could capture this demand.',
    };
  }

  // PATTERN 3: Multiple/repeated service mentions (high workload)
  if (text.includes('wedding') && (text.includes('bridesmaids') || text.includes('buttonholes') || text.includes('ceremony'))) {
    return {
      whyItMatters: 'Large, complex orders with multiple components. High coordination load.',
      potentialBusinessMeaning: 'Wedding season creates complexity. Standing delivery orders for wedding florists = significant revenue.',
    };
  }

  // PATTERN 4: Seasonal mention with positive sentiment (capacity indicator)
  if ((text.includes('valentine') || text.includes('mother') || text.includes('christmas') || text.includes('easter')) &&
      (text.includes('beautiful') || text.includes('excellent') || text.includes('perfect') || text.includes('delighted'))) {
    return {
      whyItMatters: 'Seasonal peaks with successful execution. But are they struggling behind the scenes?',
      potentialBusinessMeaning: 'Owner handles seasonal peaks. May need standing order help for next peak.',
    };
  }

  // PATTERN 5: Repeated delivery mentions (logistics is active)
  if ((text.match(/delivery/g) || []).length >= 2) {
    return {
      whyItMatters: 'Delivery is mentioned multiple times. Suggests it\'s a significant part of their operation.',
      potentialBusinessMeaning: 'High delivery involvement. Opportunity to handle delivery operations as a service.',
    };
  }

  // PATTERN 6: Speed praised specifically
  if (text.includes('quick') || text.includes('fast') || text.includes('speedy') || text.includes('rapid')) {
    return {
      whyItMatters: 'Speed is a competitive advantage. But can they sustain it during peaks?',
      potentialBusinessMeaning: 'Owner values speed. May be at capacity during busy seasons.',
    };
  }

  // PATTERN 7: Communication mentioned (suggests owner is accessible/responsive)
  if (text.includes('communication') || text.includes('responsive') || text.includes('helpful') || text.includes('easy to order')) {
    return {
      whyItMatters: 'Owner is accessible and engaged. Good sign for partnership conversation.',
      potentialBusinessMeaning: 'Owner is customer-focused and responsive. Good candidate for strategic conversation.',
    };
  }

  // PATTERN 8: Workarounds or constraints mentioned
  if (text.includes('couldn\'t come in person') || text.includes('remote') || text.includes('out of season') || text.includes('managed to create')) {
    return {
      whyItMatters: 'Owner finding creative solutions to constraints. Shows problem-solving mindset.',
      potentialBusinessMeaning: 'Owner innovates when constrained. May be receptive to solutions that expand capacity.',
    };
  }

  // PATTERN 9: Comparison to competitors
  if (text.includes('compared to') || text.includes('instead of') || text.includes('bucket at the local garage') || text.includes('splash out')) {
    return {
      whyItMatters: 'Customer chose this florist over alternatives. What if they couldn\'t handle the order?',
      potentialBusinessMeaning: 'Strong enough to win discretionary orders. Opportunity: recurring premium service.',
    };
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('query') || 'florist';
    const location = url.searchParams.get('location') || 'Manchester, UK';

    console.log(`[Research] Collecting evidence from "${query}" businesses in "${location}"\n`);

    const searchResults = await searchPlaces(query, location);
    const allEvidence: EvidenceNote[] = [];

    // Limit to 20 businesses for this research run
    for (let i = 0; i < Math.min(searchResults.length, 20); i++) {
      const business = searchResults[i];

      try {
        const details = await getPlaceDetails(business.place_id);
        if (!details || !details.reviews || details.reviews.length === 0) continue;

        // For each business, collect interesting reviews
        for (const review of details.reviews) {
          const annotation = annotateReview(review.text, details.name);
          if (annotation) {
            allEvidence.push({
              businessName: details.name,
              totalReviews: details.review_count,
              rating: details.rating,
              snippet: review.text,
              whyItMatters: annotation.whyItMatters,
              potentialBusinessMeaning: annotation.potentialBusinessMeaning,
            });
          }
        }
      } catch (error) {
        console.error(`[Research] Error processing ${business.name}:`, error);
      }
    }

    console.log(`[Research] Collected ${allEvidence.length} pieces of evidence\n`);

    return new Response(JSON.stringify(allEvidence, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Research] Error:', error);
    return new Response(JSON.stringify({ error: String(error) }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
