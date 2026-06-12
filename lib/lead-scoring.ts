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

export function getQualificationTier(score: number): "A" | "B" | "C" | "D" {
  if (score >= 80) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  return "D";
}

// ENGINE C: Opportunity Expansion Intelligence
// Identifies multi-site, branch, decision-maker, partnership and referral opportunities
export function extractExpansionSignals(input: {
  businessName: string;
  address?: string;
  reviews?: Array<{ text: string }>;
  category?: string;
}) {
  const signals = {
    multisite_potential: 0,
    branch_potential: 0,
    referral_potential: 0,
    partnership_potential: 0,
    decision_maker_density: 0,
    expansion_tags: [] as string[]
  };

  const lowerName = input.businessName.toLowerCase();
  const reviewText = (input.reviews || []).map(r => r.text.toLowerCase()).join(" ");
  const addressText = (input.address || "").toLowerCase();

  // Multisite indicators
  if (lowerName.includes("group") || lowerName.includes("network") || lowerName.includes("chain")) {
    signals.multisite_potential = 15;
    signals.expansion_tags.push("multi_site");
  }
  if (reviewText.includes("multiple") || reviewText.includes("several locations") || reviewText.includes("branches")) {
    signals.multisite_potential = Math.min(20, signals.multisite_potential + 10);
  }

  // Branch indicators
  if (lowerName.includes("branch") || addressText.includes("branch") || lowerName.includes("office")) {
    signals.branch_potential = 12;
    signals.expansion_tags.push("franchise");
  }

  // Healthcare/Education network potential
  if (input.category && (input.category.includes("healthcare") || input.category.includes("education"))) {
    signals.partnership_potential = 10;
    signals.expansion_tags.push("healthcare_network");
    if (input.category.includes("school")) {
      signals.expansion_tags.push("school_group");
    }
  }

  // Referral potential (language indicating recommendations)
  if (reviewText.includes("recommend") || reviewText.includes("referred") || reviewText.includes("word of mouth")) {
    signals.referral_potential = 8;
    signals.expansion_tags.push("referral_source");
  }

  // Decision-maker density (organizational signals)
  if (lowerName.includes("group") || lowerName.includes("corporate") || lowerName.includes("association")) {
    signals.decision_maker_density = 10;
  }
  if (input.reviews && input.reviews.length > 20) {
    signals.decision_maker_density = Math.min(15, signals.decision_maker_density + 5);
  }

  // Council/government connected
  if (lowerName.includes("council") || input.category?.includes("council")) {
    signals.partnership_potential = Math.min(18, signals.partnership_potential + 8);
    signals.expansion_tags.push("council_connected");
  }

  return signals;
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

/**
 * Phase 3: New opportunity scoring system
 * Weighted factors for national discovery mode
 * Pain points are signals, not gates
 */
export interface OpportunityScoreInput {
  businessName: string;
  category: string; // care_home, nursing, domiciliary, etc.
  reviewCount?: number;
  rating?: number;
  painPoint?: string | null;
  painPointCount?: number; // number of reviews mentioning pain
  yearsInBusiness?: number;
  locations?: number;
  hasWebsite?: boolean;
  hasContactForm?: boolean;
  serviceTypes?: string[];
  estimatedStaff?: number;
}

export interface OpportunityScore {
  total: number;
  breakdown: {
    businessTypeScore: number;
    maturityScore: number;
    serviceComplexityScore: number;
    transportDependenceScore: number;
    reviewSignalsScore: number;
    digitalMaturityScore: number;
    painSignalBonus: number;
  };
  confidence: "high" | "medium" | "low";
  reasoning: string;
  estimatedMonthlyValue?: number;
}

const CARE_CATEGORIES = {
  care_home: { name: "Care Home", value: 25, monthlyRange: [8000, 15000] },
  nursing_home: { name: "Nursing Home", value: 25, monthlyRange: [10000, 20000] },
  domiciliary_care: { name: "Domiciliary Care", value: 22, monthlyRange: [5000, 12000] },
  home_care: { name: "Home Care Agency", value: 22, monthlyRange: [4000, 10000] },
  assisted_living: { name: "Assisted Living", value: 20, monthlyRange: [6000, 12000] },
  disability_services: { name: "Disability Services", value: 20, monthlyRange: [5000, 10000] },
  supported_living: { name: "Supported Living", value: 20, monthlyRange: [4000, 8000] },
};

export function scoreOpportunity(input: OpportunityScoreInput): OpportunityScore {
  let businessTypeScore = 0;
  let maturityScore = 0;
  let serviceComplexityScore = 0;
  let transportDependenceScore = 0;
  let reviewSignalsScore = 0;
  let digitalMaturityScore = 0;
  let painSignalBonus = 0;
  let estimatedMonthlyValue = 0;

  const categoryKey = input.category.toLowerCase().replace(/\s+/g, "_");
  const categoryConfig = (CARE_CATEGORIES as Record<string, any>)[categoryKey];

  // 1. Business Type Score (0-25)
  if (categoryConfig) {
    businessTypeScore = categoryConfig.value;
    const [minValue, maxValue] = categoryConfig.monthlyRange;
    estimatedMonthlyValue = Math.floor((minValue + maxValue) / 2);
  } else {
    businessTypeScore = 15; // Generic business outside care sector
    estimatedMonthlyValue = 4000;
  }

  // 2. Maturity Score (0-10)
  if (input.yearsInBusiness) {
    if (input.yearsInBusiness < 1) {
      maturityScore = 2;
    } else if (input.yearsInBusiness < 3) {
      maturityScore = 4;
    } else if (input.yearsInBusiness < 7) {
      maturityScore = 7;
    } else {
      maturityScore = 10;
    }
  }

  // 3. Service Complexity Score (0-20)
  if (input.serviceTypes && input.serviceTypes.length > 0) {
    serviceComplexityScore = Math.min(10 + input.serviceTypes.length * 2, 20);
  } else if (input.estimatedStaff) {
    if (input.estimatedStaff < 10) {
      serviceComplexityScore = 5;
    } else if (input.estimatedStaff < 50) {
      serviceComplexityScore = 12;
    } else {
      serviceComplexityScore = 20;
    }
  }

  // 4. Transport Dependence Score (0-20)
  // Higher for care/healthcare categories
  if (categoryConfig && categoryConfig.value >= 20) {
    transportDependenceScore = Math.min(15 + (input.locations || 1) * 2, 20);
  } else {
    transportDependenceScore = input.locations ? Math.min(input.locations * 3, 15) : 5;
  }

  // 5. Review Signals Score (0-20)
  if (input.reviewCount) {
    if (input.reviewCount < 5) {
      reviewSignalsScore = 3;
    } else if (input.reviewCount < 20) {
      reviewSignalsScore = 8;
    } else if (input.reviewCount < 50) {
      reviewSignalsScore = 14;
    } else {
      reviewSignalsScore = 20;
    }

    // Slight boost for good rating
    if (input.rating && input.rating >= 4.0) {
      reviewSignalsScore = Math.min(reviewSignalsScore + 3, 20);
    }
  } else if (input.rating) {
    reviewSignalsScore = input.rating >= 3.5 ? 5 : 2;
  }

  // 6. Digital Maturity Score (0-10)
  if (input.hasWebsite) {
    digitalMaturityScore += 6;
  }
  if (input.hasContactForm) {
    digitalMaturityScore += 4;
  }

  // 7. Pain Signal Bonus (0-10) - pain is helpful but never a gate
  if (input.painPoint) {
    painSignalBonus = 5; // Base pain signal
    if (input.painPointCount && input.painPointCount > 1) {
      painSignalBonus = Math.min(painSignalBonus + input.painPointCount * 2, 10);
    }
  }

  const total = Math.min(
    businessTypeScore +
    maturityScore +
    serviceComplexityScore +
    transportDependenceScore +
    reviewSignalsScore +
    digitalMaturityScore +
    painSignalBonus,
    100
  );

  // Determine confidence
  let confidence: "high" | "medium" | "low" = "low";
  if ((input.reviewCount || 0) > 20 && input.hasWebsite) {
    confidence = "high";
  } else if ((input.reviewCount || 0) > 5 || input.hasWebsite) {
    confidence = "medium";
  }

  // Generate reasoning
  const reasons: string[] = [];
  if (businessTypeScore >= 20) {
    reasons.push("Care sector business (high transport demand)");
  }
  if (maturityScore >= 7) {
    reasons.push("Established operation (3+ years)");
  }
  if (serviceComplexityScore >= 15) {
    reasons.push("Multi-service or substantial operation");
  }
  if (reviewSignalsScore >= 14) {
    reasons.push("Strong market presence (50+ reviews)");
  }
  if (painSignalBonus > 0) {
    reasons.push("Operational friction detected in reviews");
  }
  if (digitalMaturityScore >= 8) {
    reasons.push("Strong digital presence");
  }

  const reasoning =
    reasons.length > 0
      ? reasons.join(". ") + "."
      : "Discovery candidate with growth potential.";

  return {
    total,
    breakdown: {
      businessTypeScore,
      maturityScore,
      serviceComplexityScore,
      transportDependenceScore,
      reviewSignalsScore,
      digitalMaturityScore,
      painSignalBonus,
    },
    confidence,
    reasoning,
    estimatedMonthlyValue,
  };
}

