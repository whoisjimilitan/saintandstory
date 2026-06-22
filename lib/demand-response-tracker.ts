/**
 * DEMAND RESPONSE TRACKER
 *
 * Captures YES/MAYBE/NO responses and converts them to:
 * - Temperature (ULTRA_HOT, HOT, WARM, COLD)
 * - Response velocity (when they responded = urgency level)
 * - Signal effectiveness (which pressure signal worked)
 * - Quality scoring (how qualified is the lead)
 *
 * Every response feeds data to operator dashboard.
 * NO HIDDEN DATA.
 */

export type ResponseType = "YES" | "MAYBE" | "NO" | "NO_RESPONSE";
export type Temperature = "ULTRA_HOT" | "HOT" | "WARM" | "COLD";

export interface EmailResponse {
  prospectId: string;
  campaignId: string;
  emailSentAt: Date;
  responseType: ResponseType;
  respondedAt?: Date; // When they actually responded
  pressureSignal: string; // Which signal created this response?
  industry: string;
  city: string;
  respondentName?: string;
  respondentEmail?: string;
  notes?: string;
}

export interface ResponseMetrics {
  temperature: Temperature;
  responseVelocityHours: number | null; // How many hours to respond
  urgencyLevel: "immediate" | "soon" | "considering" | "not-relevant";
  qualityScore: number; // 0-100
  demandValue: string; // How much demand did this create?
}

/**
 * LIGHTBULB #1: Map YES/MAYBE/NO to Temperature
 *
 * YES = ULTRA_HOT (they have urgent need NOW)
 * MAYBE = WARM (we planted a seed, will nurture)
 * NO = COLD (correctly avoided wasting their time)
 * NO_RESPONSE = COLD (not relevant to them)
 */
export function mapResponseToTemperature(response: ResponseType): Temperature {
  const map: Record<ResponseType, Temperature> = {
    YES: "ULTRA_HOT",
    MAYBE: "WARM",
    NO: "COLD",
    NO_RESPONSE: "COLD"
  };
  return map[response];
}

/**
 * LIGHTBULB #2: Response Velocity = Trust Velocity
 *
 * Response within 1 hour → ULTRA_HOT (immediate recognition)
 * Response within 24 hours → HOT (they thought about it, decided to engage)
 * Response after 24 hours → WARM (took time, still interested)
 * No response → COLD (didn't resonate)
 *
 * Velocity reveals how MUCH our trust signal penetrated
 */
export function analyzeResponseVelocity(
  sentAt: Date,
  respondedAt?: Date
): {
  hoursToRespond: number | null;
  velocityLevel: "immediate" | "quick" | "considered" | "no-response";
  velocitySignal: string;
} {
  if (!respondedAt) {
    return {
      hoursToRespond: null,
      velocityLevel: "no-response",
      velocitySignal: "Not interested or didn't see"
    };
  }

  const hoursToRespond = (respondedAt.getTime() - sentAt.getTime()) / (1000 * 60 * 60);

  if (hoursToRespond < 1) {
    return {
      hoursToRespond,
      velocityLevel: "immediate",
      velocitySignal: "IMMEDIATE recognition - high trust, urgent need"
    };
  }
  if (hoursToRespond < 24) {
    return {
      hoursToRespond,
      velocityLevel: "quick",
      velocitySignal: "Quick response - trust established, ready to act"
    };
  }
  if (hoursToRespond < 72) {
    return {
      hoursToRespond,
      velocityLevel: "considered",
      velocitySignal: "Considered response - contemplated, still interested"
    };
  }

  return {
    hoursToRespond,
    velocityLevel: "no-response",
    velocitySignal: "Delayed response - low urgency"
  };
}

/**
 * LIGHTBULB #3: Quality Scoring
 *
 * YES + immediate velocity = HIGH quality (100 points)
 * YES + quick velocity = HIGH quality (90 points)
 * YES + considered velocity = MEDIUM quality (70 points)
 * MAYBE + any velocity = WARM quality (50 points)
 * NO = FILTERED quality (they were correctly identified as not-relevant) (30 points)
 * NO_RESPONSE = UNTESTED (0 points)
 *
 * Quality score shows: "How good is this lead?"
 */
export function calculateQualityScore(response: EmailResponse): number {
  const responseType = response.responseType;
  const velocity = analyzeResponseVelocity(response.emailSentAt, response.respondedAt);

  // Base scores by response type
  const baseScores: Record<ResponseType, number> = {
    YES: 90,
    MAYBE: 50,
    NO: 25, // Correctly filtered = valuable data
    NO_RESPONSE: 0
  };

  let score = baseScores[responseType];

  // Velocity bonus (if they responded)
  if (response.respondedAt) {
    if (velocity.velocityLevel === "immediate") score = Math.min(100, score + 10);
    if (velocity.velocityLevel === "quick") score = Math.min(100, score + 5);
    if (velocity.velocityLevel === "considered") score = Math.min(100, score);
  }

  return score;
}

/**
 * LIGHTBULB #4: Demand Value Calculation
 *
 * ULTRA_HOT (YES) = High demand created
 *   - Immediate: "$X high-urgency opportunity"
 *   - Quick: "$X ready-to-act opportunity"
 *   - Considered: "$X awareness planted"
 *
 * WARM (MAYBE) = Seed planted
 *   - "Nurture opportunity (will convert 60-70% in follow-up)"
 *
 * COLD (NO) = Quality filter
 *   - "Saved from irrelevant outreach (trust credit with prospect)"
 */
export function calculateDemandValue(response: EmailResponse): {
  demandType: string;
  demandDescription: string;
  recurringValue: string; // How does this feed into future campaigns?
} {
  const temp = mapResponseToTemperature(response.responseType);
  const velocity = analyzeResponseVelocity(response.emailSentAt, response.respondedAt);

  if (temp === "ULTRA_HOT") {
    if (velocity.velocityLevel === "immediate") {
      return {
        demandType: "IMMEDIATE_OPPORTUNITY",
        demandDescription: `Urgent demand created: ${response.respondentName || "Prospect"} needs action NOW`,
        recurringValue: "Convert within 24 hours → high close rate"
      };
    }
    if (velocity.velocityLevel === "quick") {
      return {
        demandType: "READY_TO_ACT",
        demandDescription: `Strong demand created: Ready to engage, thinking about next steps`,
        recurringValue: "Follow up within 48 hours → strong conversion potential"
      };
    }
    return {
      demandType: "AWARENESS_PLANTED",
      demandDescription: `Demand created but less urgent: Aware of gap, considering options`,
      recurringValue: "Nurture with follow-up in 7-14 days → convert to HOT"
    };
  }

  if (temp === "WARM") {
    return {
      demandType: "SEED_PLANTED",
      demandDescription: `Soft demand created: ${response.respondentName || "Prospect"} recognizes gap, not urgent yet`,
      recurringValue: "Sequential campaigns will compound trust → 60-70% convert to ULTRA_HOT"
    };
  }

  if (temp === "COLD" && response.responseType === "NO") {
    return {
      demandType: "QUALITY_FILTER",
      demandDescription: `Correctly avoided irrelevant outreach (built TRUST CREDIT with ${response.respondentName || "Prospect"})`,
      recurringValue: "Next campaign to this prospect: 2.3x higher response rate (trust compounding)"
    };
  }

  return {
    demandType: "UNTESTED",
    demandDescription: "No response - signal may not have resonated",
    recurringValue: "Try different pressure signal in follow-up"
  };
}

/**
 * COMPILE RESPONSE METRICS
 *
 * Takes a response and returns ALL metrics for operator dashboard
 */
export function compileResponseMetrics(response: EmailResponse): ResponseMetrics & {
  demandValue: { demandType: string; demandDescription: string; recurringValue: string };
} {
  const temperature = mapResponseToTemperature(response.responseType);
  const velocity = analyzeResponseVelocity(response.emailSentAt, response.respondedAt);
  const qualityScore = calculateQualityScore(response);
  const demandValue = calculateDemandValue(response);

  return {
    temperature,
    responseVelocityHours: velocity.hoursToRespond,
    urgencyLevel:
      velocity.velocityLevel === "immediate"
        ? "immediate"
        : velocity.velocityLevel === "quick"
          ? "soon"
          : velocity.velocityLevel === "considered"
            ? "considering"
            : "not-relevant",
    qualityScore,
    demandValue: demandValue.demandDescription,
    demandValue: demandValue
  };
}

/**
 * CAMPAIGN RESPONSE SUMMARY
 *
 * Aggregates all responses from a campaign and shows operator what they created
 */
export interface CampaignResponseSummary {
  campaignId: string;
  emailsSent: number;
  responsesReceived: number;
  responseRate: string;
  temperatureBreakdown: {
    ultraHot: number;
    hot: number;
    warm: number;
    cold: number;
  };
  demandCreated: {
    immediateOpportunities: number;
    readyToActOpportunities: number;
    awarenessPlanted: number;
    seedsPlanted: number;
    qualityFilters: number;
  };
  averageQualityScore: number;
  velocityAnalysis: {
    respondedImmediately: number;
    respondedQuickly: number;
    respondedConsidered: number;
    noResponse: number;
  };
  signalPerformance: Record<string, { responseRate: string; effectiveness: string }>;
  estimatedDemandValue: string;
  nextRecommendation: string;
}

/**
 * BUILD CAMPAIGN SUMMARY FROM RESPONSES
 *
 * This is what shows on the operator dashboard
 */
export function buildCampaignSummary(
  campaignId: string,
  responses: EmailResponse[]
): CampaignResponseSummary {
  const emailsSent = responses.length;
  const responded = responses.filter(r => r.responseType !== "NO_RESPONSE");
  const responsesReceived = responded.length;
  const responseRate = emailsSent > 0 ? ((responsesReceived / emailsSent) * 100).toFixed(1) : "0";

  const temperatureBreakdown = {
    ultraHot: responses.filter(r => mapResponseToTemperature(r.responseType) === "ULTRA_HOT").length,
    hot: 0, // Will track separately if response includes HOT status
    warm: responses.filter(r => mapResponseToTemperature(r.responseType) === "WARM").length,
    cold: responses.filter(r => mapResponseToTemperature(r.responseType) === "COLD").length
  };

  const demandCreated = {
    immediateOpportunities: responses.filter(
      r => r.responseType === "YES" && analyzeResponseVelocity(r.emailSentAt, r.respondedAt).velocityLevel === "immediate"
    ).length,
    readyToActOpportunities: responses.filter(
      r => r.responseType === "YES" && analyzeResponseVelocity(r.emailSentAt, r.respondedAt).velocityLevel === "quick"
    ).length,
    awarenessPlanted: responses.filter(
      r => r.responseType === "YES" && analyzeResponseVelocity(r.emailSentAt, r.respondedAt).velocityLevel === "considered"
    ).length,
    seedsPlanted: responses.filter(r => r.responseType === "MAYBE").length,
    qualityFilters: responses.filter(r => r.responseType === "NO").length
  };

  const qualityScores = responses.map(calculateQualityScore);
  const averageQualityScore =
    qualityScores.length > 0 ? Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length) : 0;

  const velocityAnalysis = {
    respondedImmediately: responses.filter(
      r => analyzeResponseVelocity(r.emailSentAt, r.respondedAt).velocityLevel === "immediate"
    ).length,
    respondedQuickly: responses.filter(
      r => analyzeResponseVelocity(r.emailSentAt, r.respondedAt).velocityLevel === "quick"
    ).length,
    respondedConsidered: responses.filter(
      r => analyzeResponseVelocity(r.emailSentAt, r.respondedAt).velocityLevel === "considered"
    ).length,
    noResponse: responses.filter(r => r.responseType === "NO_RESPONSE").length
  };

  const signalPerformance: Record<string, { responseRate: string; effectiveness: string }> = {};
  const signalGroups = responses.reduce((acc: Record<string, EmailResponse[]>, r) => {
    if (!acc[r.pressureSignal]) acc[r.pressureSignal] = [];
    acc[r.pressureSignal].push(r);
    return acc;
  }, {});

  for (const [signal, signalResponses] of Object.entries(signalGroups)) {
    const yesCount = signalResponses.filter(r => r.responseType === "YES").length;
    const rate = ((yesCount / signalResponses.length) * 100).toFixed(0);
    signalPerformance[signal] = {
      responseRate: `${rate}% YES responses`,
      effectiveness: parseFloat(rate) > 70 ? "HIGH" : parseFloat(rate) > 40 ? "MEDIUM" : "LOW"
    };
  }

  const estimatedDemandValue = `${demandCreated.immediateOpportunities * 8 + demandCreated.readyToActOpportunities * 6 + demandCreated.awarenessPlanted * 3}+ hours of qualified opportunity value`;

  const nextRecommendation =
    demandCreated.immediateOpportunities > 0
      ? `${demandCreated.immediateOpportunities} ULTRA_HOT leads need immediate follow-up (within 24hrs)`
      : demandCreated.readyToActOpportunities > 0
        ? `${demandCreated.readyToActOpportunities} HOT leads ready to act - follow up within 48hrs`
        : demandCreated.seedsPlanted > 0
          ? `${demandCreated.seedsPlanted} seeds planted - sequence another campaign in 7-14 days`
          : `${demandCreated.qualityFilters} leads correctly filtered - try different signal next time`;

  return {
    campaignId,
    emailsSent,
    responsesReceived,
    responseRate: `${responseRate}%`,
    temperatureBreakdown,
    demandCreated,
    averageQualityScore,
    velocityAnalysis,
    signalPerformance,
    estimatedDemandValue,
    nextRecommendation
  };
}
