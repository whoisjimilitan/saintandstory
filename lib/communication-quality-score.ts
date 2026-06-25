/**
 * COMMUNICATION QUALITY SCORE
 *
 * Metric: Quality = PD × Trust × Authenticity
 *
 * This replaces single-metric scoring.
 *
 * PD alone is not sufficient (interesting ≠ believable).
 * Trust alone is not sufficient (safe ≠ compelling).
 * Authenticity alone is not sufficient (honest ≠ effective).
 *
 * Only the combination creates high-quality communication.
 */

export interface QualityScoreComponents {
  pd: number; // Psychological Density (1-10)
  trust: number; // Trustworthiness (1-10)
  authenticity: number; // Genuine (1-10)
}

export interface QualityScore extends QualityScoreComponents {
  combinedScore: number; // PD × Trust × Authenticity (max 1000)
  percentile: number; // 0-100
  rating: "exceptional" | "excellent" | "good" | "fair" | "poor";
  analysis: string;
}

/**
 * Calculate Psychological Density score
 * Measures: How many psychological functions does this perform?
 */
export function calculatePDScore(sentence: string): number {
  let score = 0;

  // Specificity (timestamp, number, location)
  if (/\d+|Monday|Tuesday|Friday|London|M25|Old Bailey|Black Friday|October|Thursday/i.test(
    sentence
  )) {
    score++;
  }

  // Active verb (arrives, deliver, pick up, wait, text, scramble)
  if (
    /arrive|deliver|pick|wait|text|scramble|sit|handle|send|drive|call|hit|go|is|are/i.test(
      sentence
    )
  ) {
    score++;
  }

  // Relevance (you, your, happens, happens to you)
  if (/you|your|happens/.test(sentence)) {
    score++;
  }

  // Permission structure (if, don't, never, skip, ignore, stop)
  if (/if |don't|never|skip|ignore|stop/.test(sentence)) {
    score++;
  }

  // Brevity (under 15 words creates emphasis)
  if (sentence.split(" ").length < 15) {
    score++;
  }

  // Emotional reality (late, wait, fail, run, crunch, improve, improvise)
  if (/late|wait|fail|run|crunch|improvise|scramble|gap|short/.test(sentence)) {
    score++;
  }

  // Question or response format (?, or, respond)
  if (/\?|or[^a-z]|respond/.test(sentence)) {
    score++;
  }

  // Simple language (no corporate jargon)
  if (
    !/optimize|leverage|synergy|stakeholder|ecosystem|paradigm|innovative|cutting edge/.test(
      sentence
    )
  ) {
    score++;
  }

  return Math.min(score, 10);
}

/**
 * Calculate Trust score
 * Measures: Does this deserve to be believed?
 */
export function calculateTrustScore(sentence: string): number {
  let score = 5; // Start at neutral

  // Observable detail (specific, not claimed)
  if (/your.*[A-Z]|Thursday|Friday|morning|afternoon|weekend|week|month/.test(sentence)) {
    score += 2;
  }

  // Evidence-based (shows, not tells)
  if (
    /noticed|observed|see|happens|experience|found|discovered|showed/.test(sentence)
  ) {
    score += 2;
  }

  // Admits limitation (builds trust through honesty)
  if (
    /don't|never|not|probably|maybe|sometimes|might|could/.test(sentence)
  ) {
    score += 1;
  }

  // Avoids claims (doesn't assert expertise)
  if (
    !/we provide|we offer|we help|we're|best|leading|expert|proven|trusted/.test(
      sentence
    )
  ) {
    score += 1;
  }

  // Respects reader (doesn't over-explain)
  if (sentence.split(" ").length < 20) {
    score += 1;
  }

  // Penalties

  // Manufactured trust signal
  if (/i'm not trying|no pressure|no obligation|feel free|if interested/.test(sentence)) {
    score -= 3; // Inserted restraint loses trust
  }

  // Urgency language (creates doubt)
  if (/need|must|urgent|hurry|limited|act now|today/.test(sentence)) {
    score -= 2;
  }

  // Marketing language
  if (
    /cutting[- ]edge|innovative|synergy|partner|ecosystem|paradigm|leverage|optimize|solution/.test(
      sentence
    )
  ) {
    score -= 2;
  }

  // Over-explanation (disrespects intelligence)
  if (/this means|in other words|essentially|basically|as you can see/.test(sentence)) {
    score -= 1;
  }

  return Math.max(0, Math.min(score, 10));
}

/**
 * Calculate Authenticity score
 * Measures: Is this genuinely true in this context?
 */
export function calculateAuthenticityScore(
  sentence: string,
  context: {
    industry: string;
    stage: number;
    isPermissionStatement: boolean;
  }
): number {
  let score = 5; // Start at neutral

  // Specific to industry (not generic)
  if (
    (context.industry.includes("law") &&
      /court|filing|client|deadline|partner/.test(sentence)) ||
    (context.industry.includes("ecommerce") &&
      /courier|capacity|order|delivery|peak|october|black friday/.test(
        sentence
      )) ||
    (context.industry.includes("restaurant") &&
      /friday|supply|delivery|ingredients|kitchen/.test(sentence)) ||
    (context.industry.includes("manufacturing") &&
      /production|parts|delivery|capacity|line/.test(sentence))
  ) {
    score += 2;
  }

  // Permission statements are authentic by nature
  if (context.isPermissionStatement) {
    score += 1;
  }

  // Avoids universal claims (generic claims = inauthentic)
  if (!/all|every|always|never/.test(sentence)) {
    score += 1;
  }

  // Shows genuine limitation (authentic systems admit boundaries)
  if (/probably|might|sometimes|could/.test(sentence)) {
    score += 1;
  }

  // Penalties

  // Manufactured statement (generic permission used for tactics)
  if (
    /you probably don't need|you're likely|i'm sure you/.test(sentence) &&
    Math.random() > 0.5 // Would need context to truly detect
  ) {
    score -= 2;
  }

  // Unsupported claim (inauthentic)
  if (/we provide|we offer|we help|we're trusted|we understand/.test(sentence)) {
    score -= 3;
  }

  // Oversimplification (loses authenticity)
  if (sentence.split(" ").length < 5) {
    score -= 1;
  }

  return Math.max(0, Math.min(score, 10));
}

/**
 * Combined quality score
 */
export function calculateQualityScore(
  sentence: string,
  context: {
    industry: string;
    stage: number;
    isPermissionStatement: boolean;
  }
): QualityScore {
  const pd = calculatePDScore(sentence);
  const trust = calculateTrustScore(sentence);
  const authenticity = calculateAuthenticityScore(sentence, context);

  const combinedScore = pd * trust * authenticity;
  const maxPossible = 10 * 10 * 10; // 1000
  const percentile = (combinedScore / maxPossible) * 100;

  let rating: "exceptional" | "excellent" | "good" | "fair" | "poor";
  if (percentile >= 80) rating = "exceptional";
  else if (percentile >= 60) rating = "excellent";
  else if (percentile >= 40) rating = "good";
  else if (percentile >= 20) rating = "fair";
  else rating = "poor";

  return {
    pd,
    trust,
    authenticity,
    combinedScore,
    percentile: Math.round(percentile),
    rating,
    analysis: `PD: ${pd}/10 | Trust: ${trust}/10 | Authenticity: ${authenticity}/10 = ${Math.round(combinedScore)}/1000 (${percentile.toFixed(0)}%)`,
  };
}

/**
 * Score an entire email
 */
export function scoreEntireEmail(
  emailBody: string,
  context: {
    industry: string;
    stage: number;
  }
): { scores: QualityScore[]; average: QualityScore; recommendation: string } {
  const sentences = emailBody
    .split(/[.!?]\s+/)
    .filter((s) => s.trim().length > 0);

  const scores = sentences.map((sentence, index) => {
    const isPermissionStatement =
      (index === 0 && /if |you don't|you probably/.test(sentence)) ||
      /if |ignore|skip|don't need/.test(sentence);

    return calculateQualityScore(sentence, {
      industry: context.industry,
      stage: context.stage,
      isPermissionStatement,
    });
  });

  // Calculate average
  const avgPD =
    scores.reduce((sum, s) => sum + s.pd, 0) / scores.length || 0;
  const avgTrust =
    scores.reduce((sum, s) => sum + s.trust, 0) / scores.length || 0;
  const avgAuthenticity =
    scores.reduce((sum, s) => sum + s.authenticity, 0) / scores.length || 0;
  const avgCombined = avgPD * avgTrust * avgAuthenticity;
  const avgPercentile = (avgCombined / 1000) * 100;

  let avgRating: "exceptional" | "excellent" | "good" | "fair" | "poor";
  if (avgPercentile >= 80) avgRating = "exceptional";
  else if (avgPercentile >= 60) avgRating = "excellent";
  else if (avgPercentile >= 40) avgRating = "good";
  else if (avgPercentile >= 20) avgRating = "fair";
  else avgRating = "poor";

  const average: QualityScore = {
    pd: Math.round(avgPD * 10) / 10,
    trust: Math.round(avgTrust * 10) / 10,
    authenticity: Math.round(avgAuthenticity * 10) / 10,
    combinedScore: Math.round(avgCombined),
    percentile: Math.round(avgPercentile),
    rating: avgRating,
    analysis: `Average - PD: ${Math.round(avgPD * 10) / 10}/10 | Trust: ${Math.round(avgTrust * 10) / 10}/10 | Auth: ${Math.round(avgAuthenticity * 10) / 10}/10`,
  };

  // Recommendation
  let recommendation = "";
  if (avgRating === "exceptional") {
    recommendation = "✓ APPROVE - High quality communication";
  } else if (avgRating === "excellent") {
    recommendation =
      "✓ APPROVE - Strong communication. Minor refinements possible.";
  } else if (avgRating === "good") {
    recommendation = "⚠ REVIEW - Some sentences need improvement";
  } else {
    recommendation = "✗ REWRITE - Multiple quality issues need addressing";
  }

  return { scores, average, recommendation };
}
