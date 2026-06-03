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
    HIGH_VALUE_INDUSTRIES.some(ind => input.industry?.includes(ind) || ind.includes(input.industry))
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

export function getScoreColor(score: number): string {
  const tier = getScoreTier(score);
  if (tier === "hot") return "bg-red-100 text-red-700 border-red-300";
  if (tier === "warm") return "bg-yellow-100 text-yellow-700 border-yellow-300";
  return "bg-gray-100 text-gray-700 border-gray-300";
}

export function getScoreLabel(score: number): string {
  const tier = getScoreTier(score);
  if (tier === "hot") return `🔥 ${score}/100 — Call first`;
  if (tier === "warm") return `⚡ ${score}/100 — High potential`;
  return `${score}/100`;
}
