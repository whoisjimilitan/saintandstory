export interface LeadScoringInput {
  industry?: string;
  deliveryFrequency?: string;
  averageDeliveries?: string;
  courierProvider?: string;
  deliveryChallenge?: string;
}

export interface ScoringBreakdown {
  frequencyScore: number;
  industryScore: number;
  volumeScore: number;
  courierScore: number;
  challengeScore: number;
  total: number;
}

const HIGH_VALUE_INDUSTRIES = [
  "Construction Firms",
  "Building Contractors",
  "Solicitors",
  "Barristers' Chambers",
  "Law Firms",
  "Private Hospitals",
  "Pharmacies",
  "Medical Laboratories",
  "Healthcare Providers",
];

const HIGH_VALUE_CHALLENGES = [
  "Reliability Issues",
  "Lack of Same-Day Service",
];

export function calculateLeadScore(input: LeadScoringInput): ScoringBreakdown {
  let frequencyScore = 0;
  let industryScore = 0;
  let volumeScore = 0;
  let courierScore = 0;
  let challengeScore = 0;

  // Delivery Frequency Scoring
  if (input.deliveryFrequency === "Daily") {
    frequencyScore = 25;
  } else if (input.deliveryFrequency === "Several Times Per Week") {
    frequencyScore = 15;
  } else if (input.deliveryFrequency === "Weekly") {
    frequencyScore = 10;
  }

  // Industry Scoring
  if (
    input.industry &&
    HIGH_VALUE_INDUSTRIES.some(ind => input.industry!.includes(ind) || ind.includes(input.industry!))
  ) {
    industryScore = 25;
  }

  // Volume Scoring
  if (input.averageDeliveries === "50+") {
    volumeScore = 25;
  } else if (input.averageDeliveries === "26-50") {
    volumeScore = 15;
  } else if (input.averageDeliveries === "11-25") {
    volumeScore = 10;
  }

  // Courier Provider Scoring (they have a provider = pain point opportunity)
  if (input.courierProvider && input.courierProvider !== "None") {
    courierScore = 20;
  }

  // Challenge Scoring
  if (
    input.deliveryChallenge &&
    HIGH_VALUE_CHALLENGES.includes(input.deliveryChallenge)
  ) {
    challengeScore = 15;
  }

  const total = frequencyScore + industryScore + volumeScore + courierScore + challengeScore;

  return {
    frequencyScore,
    industryScore,
    volumeScore,
    courierScore,
    challengeScore,
    total: Math.min(total, 100),
  };
}

export function getScoreTier(score: number): "hot" | "warm" | "cool" {
  if (score >= 60) return "hot";
  if (score >= 40) return "warm";
  return "cool";
}

export function getScoreStyle(score: number): { containerClass: string; badgeClass: string } {
  const tier = getScoreTier(score);

  if (tier === "hot") {
    return {
      containerClass: "bg-[#0D0D0D] text-white border-0",
      badgeClass: "text-[11px] font-black",
    };
  }

  if (tier === "warm") {
    return {
      containerClass: "bg-[#F5F5F5] text-[#0D0D0D] border border-[#E8E8E8]",
      badgeClass: "text-[10px] font-semibold",
    };
  }

  return {
    containerClass: "bg-white text-[#888888] border border-[#E8E8E8]",
    badgeClass: "text-[9px] font-medium",
  };
}

export function getScoreLabel(score: number): string {
  return `${score}/100`;
}

/**
 * Score discovered leads based on Google Maps review insights
 * Input: business category, pain points, review rating
 * Output: 0-100 score indicating lead quality/opportunity
 */
export interface DiscoveredLeadScoringInput {
  industryCategory?: string;
  painPoint?: string | null;
  painPointReview?: string | null;
  reviewRating?: number | null;
}

export function scoreDiscoveredLead(input: DiscoveredLeadScoringInput): number {
  let score = 20; // Base score for any discovered lead

  // Pain point presence (strong signal of opportunity)
  if (input.painPoint) {
    score += 30;
  }

  // Review rating indicates dissatisfaction (lower rating = more pain)
  if (input.reviewRating) {
    if (input.reviewRating === 1) {
      score += 25; // 1-star: extreme pain
    } else if (input.reviewRating === 2) {
      score += 20; // 2-star: significant pain
    } else if (input.reviewRating === 3) {
      score += 10; // 3-star: some dissatisfaction
    }
    // 4-5 stars: satisfied, no score boost
  }

  // Industry category (business_category is broader, but use for additional context)
  // This keeps the score conservative for discovered leads without form data
  if (input.industryCategory) {
    score += 5; // Just acknowledging we know the industry
  }

  return Math.min(score, 100);
}

