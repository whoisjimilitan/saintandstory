// Calculate similarity score between two prospects
interface ProspectForSimilarity {
  id: string;
  businessName: string;
  city?: string;
  industry?: string;
  confidenceScore?: number;
  pressureSignal?: string;
}

export const calculateSimilarity = (
  qualified: ProspectForSimilarity,
  prospect: ProspectForSimilarity
): number => {
  let score = 0;
  let totalWeight = 0;

  // Same industry (weight: 40)
  if (qualified.industry && prospect.industry) {
    totalWeight += 40;
    if (qualified.industry.toLowerCase() === prospect.industry.toLowerCase()) {
      score += 40;
    }
  }

  // Same city (weight: 30)
  if (qualified.city && prospect.city) {
    totalWeight += 30;
    if (qualified.city.toLowerCase() === prospect.city.toLowerCase()) {
      score += 30;
    }
  }

  // Similar confidence score (within 5 points, weight: 20)
  if (qualified.confidenceScore && prospect.confidenceScore) {
    totalWeight += 20;
    const diff = Math.abs(qualified.confidenceScore - prospect.confidenceScore);
    if (diff <= 5) {
      score += 20;
    } else if (diff <= 15) {
      score += 10;
    }
  }

  // Same pressure signal (weight: 10)
  if (qualified.pressureSignal && prospect.pressureSignal) {
    totalWeight += 10;
    if (qualified.pressureSignal === prospect.pressureSignal) {
      score += 10;
    }
  }

  return totalWeight > 0 ? (score / totalWeight) * 100 : 0;
};

export const findSimilarProspects = (
  qualified: ProspectForSimilarity,
  remaining: ProspectForSimilarity[],
  minSimilarity: number = 60
): ProspectForSimilarity[] => {
  const similar = remaining
    .map((prospect) => ({
      prospect,
      similarity: calculateSimilarity(qualified, prospect),
    }))
    .filter(({ similarity }) => similarity >= minSimilarity)
    .sort(({ similarity: a }, { similarity: b }) => b - a)
    .map(({ prospect }) => prospect)
    .slice(0, 10); // Return top 10

  return similar;
};

export const formatSimilarityReason = (
  qualified: ProspectForSimilarity,
  similar: ProspectForSimilarity[]
): string => {
  const reasons: string[] = [];

  if (qualified.industry) {
    const sameIndustry = similar.filter(
      (p) => p.industry?.toLowerCase() === qualified.industry?.toLowerCase()
    ).length;
    if (sameIndustry > 0) {
      reasons.push(`Same industry (${sameIndustry})`);
    }
  }

  if (qualified.city) {
    const sameCity = similar.filter(
      (p) => p.city?.toLowerCase() === qualified.city?.toLowerCase()
    ).length;
    if (sameCity > 0) {
      reasons.push(`Same location (${sameCity})`);
    }
  }

  if (qualified.pressureSignal) {
    const samePressure = similar.filter(
      (p) => p.pressureSignal === qualified.pressureSignal
    ).length;
    if (samePressure > 0) {
      reasons.push(`Same pressure signal (${samePressure})`);
    }
  }

  return reasons.join(" • ");
};
