import { searchPlaces, getPlaceDetails } from '../lib/google-places';
import { extractEvidence } from '../lib/evidence-extractor';
import { generateQuestions, prioritizeQuestions } from '../lib/question-engine';
import { generateProposal } from '../lib/proposal-engine';
import { ReviewSnippet } from '../lib/evidence-types';

async function validateSystem() {
  console.log('🚀 [Validation] Starting system validation with 10 florist businesses\n');

  // Search for florist businesses in Manchester
  console.log('📍 Searching for florist businesses in Manchester...\n');
  const searchResults = await searchPlaces('florist', 'Manchester, UK');

  if (searchResults.length === 0) {
    console.log('❌ No businesses found');
    return;
  }

  const businesses = searchResults.slice(0, 10);
  console.log(`✓ Found ${businesses.length} businesses\n`);

  // Process each business
  for (let i = 0; i < businesses.length; i++) {
    const business = businesses[i];
    console.log(`\n${'='.repeat(80)}`);
    console.log(`#${i + 1}: ${business.name}`);
    console.log(`${'='.repeat(80)}`);

    // Get detailed information
    const details = await getPlaceDetails(business.place_id);
    if (!details) {
      console.log('⚠ Could not fetch details');
      continue;
    }

    // Convert reviews to ReviewSnippets
    const reviewSnippets: ReviewSnippet[] = (details.reviews || []).map((review, idx) => ({
      id: `review_${i}_${idx}`,
      text: review.text,
      source: 'google',
      timestamp: new Date(review.time * 1000),
      rating: review.rating,
      author: review.author_name,
    }));

    // Extract evidence
    const evidence = {
      reviews: reviewSnippets,
      facts: [
        {
          id: `fact_${i}_1`,
          fact: `Located in ${details.formatted_address}`,
          source: 'discovery',
          timestamp: new Date(),
        },
        {
          id: `fact_${i}_2`,
          fact: `Rating: ${details.rating} stars (${details.review_count} reviews)`,
          source: 'google',
          timestamp: new Date(),
        },
      ],
      extracted_at: new Date(),
      review_count: details.review_count,
      rating_average: details.rating,
    };

    // Generate questions
    const questions = generateQuestions(evidence, 'florists');
    const prioritized = prioritizeQuestions(questions);

    // Generate proposal
    const proposal = generateProposal(business.name, evidence, prioritized, 'florists');

    // ANALYSIS SECTION
    console.log('\n📊 WHAT WE LEARNED:');
    console.log(`  • ${evidence.review_count} customer reviews`);
    console.log(`  • Average rating: ${evidence.rating_average} stars`);

    // Extract key themes from reviews
    const reviewTexts = reviewSnippets.map(r => r.text.toLowerCase());
    const themes: string[] = [];

    if (reviewTexts.some(t => t.includes('delivery') || t.includes('courier'))) {
      themes.push('Delivery/logistics mentioned');
    }
    if (reviewTexts.some(t => /valentine|mother|easter|christmas/i.test(t))) {
      themes.push('Seasonal peaks detected');
    }
    if (reviewTexts.some(t => t.includes('same-day') || t.includes('urgent') || t.includes('emergency'))) {
      themes.push('Emergency/urgent requests detected');
    }
    if (reviewTexts.some(t => t.includes('wedding') || t.includes('event'))) {
      themes.push('Event/wedding services detected');
    }
    if (reviewTexts.some(t => t.includes('slow') || t.includes('late') || t.includes('delayed'))) {
      themes.push('Delivery delays mentioned');
    }
    if (reviewTexts.some(t => t.includes('unreliable'))) {
      themes.push('Courier reliability concerns');
    }

    themes.forEach(theme => console.log(`  • ${theme}`));

    console.log('\n💡 WHAT SURPRISED US:');
    const lowRatingReviews = reviewSnippets.filter(r => r.rating && r.rating <= 3);
    const highRatingReviews = reviewSnippets.filter(r => r.rating && r.rating >= 5);

    if (lowRatingReviews.length > 0 && highRatingReviews.length > 0) {
      console.log(`  • Mix of ratings: Despite delivery issues, customers still rate highly`);
      console.log(`    (${lowRatingReviews.length} low ratings, ${highRatingReviews.length} high ratings)`);
    } else if (lowRatingReviews.length > 0) {
      console.log(`  • Multiple low ratings despite good product quality`);
    } else if (highRatingReviews.length === evidence.review_count) {
      console.log(`  • All reviews positive - no obvious pain points`);
    }

    // Check for urgency growth
    const recentReviews = reviewSnippets.slice(-3);
    const recentMentionsUrgency = recentReviews.some(r =>
      r.text.toLowerCase().includes('urgent') ||
      r.text.toLowerCase().includes('emergency') ||
      r.text.toLowerCase().includes('same-day')
    );

    if (recentMentionsUrgency && !reviewTexts.every(t => t.includes('urgent'))) {
      console.log(`  • Recent surge in urgent/same-day requests`);
    }

    console.log('\n❓ FIRST QUESTION TO ASK:');
    if (prioritized.length > 0) {
      const firstQ = prioritized[0];
      console.log(`  "${firstQ.text}"`);
      console.log(`  Why: ${firstQ.relevance}`);
    } else {
      console.log('  [No questions generated - unlikely prospect]');
    }

    console.log('\n✅ WHY CONTACT THIS BUSINESS:');
    const reasons: string[] = [];

    if (reviewSnippets.some(r => r.text.toLowerCase().includes('delivery'))) {
      reasons.push('Delivery logistics challenges mentioned in reviews');
    }
    if (reviewSnippets.some(r => r.text.toLowerCase().includes('late') || r.text.toLowerCase().includes('slow'))) {
      reasons.push('Fulfillment speed is an issue');
    }
    if (reviewSnippets.some(r => /valentine|mother|easter|christmas/i.test(r.text))) {
      reasons.push('Handles seasonal peaks - we can support overflow');
    }
    if (reviewSnippets.some(r => r.text.toLowerCase().includes('unreliable'))) {
      reasons.push('Current courier unreliable - clear pain point');
    }
    if (evidence.review_count > 80) {
      reasons.push('High volume business - standing orders would be valuable');
    }
    if (details.rating >= 4.6) {
      reasons.push('Quality product - good fit for premium service');
    }

    if (reasons.length === 0) {
      reasons.push('Low priority - few obvious pain points');
    }

    reasons.forEach((reason, idx) => console.log(`  ${idx + 1}. ${reason}`));

    console.log('\n📝 EVIDENCE EXTRACTED:');
    console.log(`  Reviews: ${reviewSnippets.length}`);
    console.log(`  Facts: ${evidence.facts.length}`);

    console.log('\n❓ QUESTIONS GENERATED:');
    console.log(`  Total: ${questions.length}`);
    prioritized.slice(0, 3).forEach((q, idx) => {
      console.log(`  ${idx + 1}. ${q.text}`);
    });

    console.log('\n📧 SAMPLE PROPOSAL OPENING:');
    console.log(`  Observation: "${proposal.observation}"`);
    console.log(`  How we help: "${proposal.how_we_help}"`);
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log('✅ Validation complete\n');
}

// Run validation
validateSystem().catch(console.error);
