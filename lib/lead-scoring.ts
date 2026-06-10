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
 * Get semantic meaning of a score for discovered leads
 * Interprets NULL pain signals as "clean business" not "bad lead"
 */
export function getLeadSignalLabel(lead: {
  review_rating?: number | null;
  pain_point?: string | null;
}): string {
  // No negative signals found = clean business profile
  if (!lead.review_rating && !lead.pain_point) {
    return "No operational friction detected";
  }

  // Pain point identified = opportunity signal
  if (lead.pain_point) {
    return "Operational friction detected";
  }

  // Default case
  return "Clean business profile";
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
  let score = 0;

  // Negative review mentions (delivery/logistics friction)
  // +40 per unique friction theme detected
  if (input.painPoint) {
    score += 40;
  }

  // Review severity (lower rating = worse experience)
  if (input.reviewRating) {
    if (input.reviewRating === 1) {
      score += 30; // 1-star: extreme dissatisfaction
    } else if (input.reviewRating === 2) {
      score += 20; // 2-star: significant issues
    } else if (input.reviewRating === 3) {
      score += 10; // 3-star: some friction
    }
    // 4-5 stars: satisfied, no boost (but not penalized)
  }

  // Baseline: if no negative signals, still a discovery opportunity but lower priority
  if (!input.painPoint && !input.reviewRating) {
    score = 15; // Lower baseline for leads without known friction
  }

  // Industry context adds confidence
  if (input.industryCategory) {
    score += 5;
  }

  // Debug logging for transparency
  if (process.env.NODE_ENV === "development") {
    console.log("[SCORING] Discovered Lead", {
      industry: input.industryCategory,
      review_rating: input.reviewRating ?? "NULL",
      pain_point: input.painPoint ?? "NULL",
      final_score: Math.min(score, 100),
    });
  }

  return Math.min(Math.max(score, 0), 100); // Clamp to 0-100
}

