/**
 * Pattern extraction from raw events.
 *
 * NO scoring. NO ranking. Only counts and observations.
 */

export type ObservedPattern = {
  description: string;
  occurrences: number;
  examples: string[];
};

export function extractPatterns(reviews: Array<{ text: string }>) {
  const patterns: ObservedPattern[] = [];

  // Pattern 1: Wedding mentions
  const weddingReviews = reviews.filter(r =>
    /wedding|bridal|bouquet|bridesmaids/i.test(r.text)
  );
  if (weddingReviews.length > 0) {
    patterns.push({
      description: "Wedding-related work mentioned",
      occurrences: weddingReviews.length,
      examples: weddingReviews.slice(0, 2).map(r => r.text),
    });
  }

  // Pattern 2: Seasonal occasions
  const seasonalReviews = reviews.filter(r =>
    /valentine|mother.s day|christmas|easter|holiday|season/i.test(r.text)
  );
  if (seasonalReviews.length > 0) {
    patterns.push({
      description: "Seasonal occasions mentioned",
      occurrences: seasonalReviews.length,
      examples: seasonalReviews.slice(0, 2).map(r => r.text),
    });
  }

  // Pattern 3: Owner personal involvement
  const ownerReviews = reviews.filter(r =>
    /hannah|emma|daisy|owner|proprietor|herself|himself/i.test(r.text)
  );
  if (ownerReviews.length > 0) {
    patterns.push({
      description: "Owner mentioned by name or personal involvement noted",
      occurrences: ownerReviews.length,
      examples: ownerReviews.slice(0, 2).map(r => r.text),
    });
  }

  // Pattern 4: Coordination/custom work
  const coordinationReviews = reviews.filter(r =>
    /coordination|custom|bespoke|personalized|tailored|designed/i.test(r.text)
  );
  if (coordinationReviews.length > 0) {
    patterns.push({
      description: "Custom coordination or bespoke service mentioned",
      occurrences: coordinationReviews.length,
      examples: coordinationReviews.slice(0, 2).map(r => r.text),
    });
  }

  // Pattern 5: Last-minute or urgent requests
  const urgentReviews = reviews.filter(r =>
    /last.minute|urgent|rush|emergency|tight deadline/i.test(r.text)
  );
  if (urgentReviews.length > 0) {
    patterns.push({
      description: "Last-minute or urgent requests handled",
      occurrences: urgentReviews.length,
      examples: urgentReviews.slice(0, 2).map(r => r.text),
    });
  }

  return patterns;
}

export function countOutcomeTypes(
  outcomes: Array<{
    signalType: string;
    truthLevel: string;
  }>
) {
  const counts = {
    no_contact: 0,
    contacted: 0,
    positive_response: 0,
    negative_response: 0,
    neutral_response: 0,
    no_response: 0,
    deal_not_possible: 0,
  };

  outcomes.forEach(o => {
    if (o.signalType in counts) {
      counts[o.signalType as keyof typeof counts]++;
    }
  });

  return counts;
}

export function summarizeObservations(data: {
  reviews: Array<{ text: string }>;
  outcomes: Array<{ signalType: string; truthLevel: string }>;
  hypotheses: Array<{ statement: string; status?: string }>;
}) {
  const patterns = extractPatterns(data.reviews);
  const outcomeCounts = countOutcomeTypes(data.outcomes);

  return {
    totalReviews: data.reviews.length,
    totalConversations: data.outcomes.length,
    observedPatterns: patterns,
    outcomeDistribution: outcomeCounts,
    hypothesesDocumented: data.hypotheses.length,
    dataPoints: {
      "Reviews analyzed": data.reviews.length,
      "Conversations logged": data.outcomes.length,
      "Patterns observed": patterns.length,
      "Hypotheses documented": data.hypotheses.length,
    },
  };
}
