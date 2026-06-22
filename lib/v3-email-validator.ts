/**
 * V3 EMAIL VALIDATION TEST HARNESS
 * 
 * Validates that every generated email follows the locked V3 reasoning pattern:
 * 1. MOMENT - Specific, timestamped, reasoned
 * 2. INSIGHT - Articulates what they haven't said
 * 3. INVERSE - Permission to ignore (restraint)
 * 4. SERVICE - Specific, local, factual
 * 5. ASK - Reciprocal (one word response)
 * 
 * CRITICAL: Must not be templated. Every email must be unique and reasoned.
 */

interface V3ValidationReport {
  isValid: boolean;
  qualityScore: number; // 0-100
  components: {
    moment: { present: boolean; score: number; reason: string };
    insight: { present: boolean; score: number; reason: string };
    inverse: { present: boolean; score: number; reason: string };
    service: { present: boolean; score: number; reason: string };
    ask: { present: boolean; score: number; reason: string };
  };
  issues: string[];
  templateDetected: boolean;
  wordCount: number;
  verdict: "PASS" | "FAIL" | "NEEDS_REVISION";
}

export function validateV3Email(email: string): V3ValidationReport {
  const issues: string[] = [];
  let totalScore = 0;
  const lowerEmail = email.toLowerCase();
  const wordCount = email.split(/\s+/).length;

  // Check 1: MOMENT - Specific timestamp/day + context
  const hasMomentPattern = /\b(it'?s?\s+)?\d{1,2}[:\.]\d{2}|(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(email);
  const hasMomentContext = /(?:moment|standing|realizing|wondering|asking|facing|running|wondering)/i.test(email);
  const momentScore = (hasMomentPattern ? 50 : 0) + (hasMomentContext ? 50 : 0);
  
  if (momentScore < 80) {
    issues.push("MOMENT: Missing specific timestamp OR situational context");
  }

  // Check 2: INSIGHT - Articulates unsaid (what matters/being tested)
  const hasInsightPhrase = /(?:what|in that moment|being tested|what matters|realize|haven't|articulate)/i.test(email);
  const insightScore = hasInsightPhrase ? 100 : 0;
  
  if (insightScore < 100) {
    issues.push("INSIGHT: Missing articulated insight about their situation");
  }

  // Check 3: INVERSE - Permission to ignore (restraint/humility)
  const hasInversePhrase = /(?:if you|ignore|figured out|solved|already|don't apply|doesn't apply)/i.test(email);
  const inverseScore = hasInversePhrase ? 100 : 0;
  
  if (inverseScore < 100) {
    issues.push("INVERSE: Missing permission to ignore (restraint)");
  }

  // Check 4: SERVICE - Specific, local, factual
  const hasServiceLocation = /(?:london|manchester|birmingham|bristol|edinburgh|leeds|glasgow|aberdeen|durham|york|cardiff|belfast|dublin|cork|[a-z]+(?:\s+(?:removals|law|pharmacy|restaurant|coaching|services))?)/i.test(email);
  const hasServiceAction = /(?:help|get|manage|coordinate|deliver|provide|build|solve)/i.test(email);
  const serviceScore = (hasServiceLocation ? 50 : 0) + (hasServiceAction ? 50 : 0);
  
  if (serviceScore < 80) {
    issues.push("SERVICE: Missing local + specific action description");
  }

  // Check 5: ASK - Reciprocal (one word back)
  const hasAskPattern = /(?:one word|yes|maybe|no|reply)/i.test(email);
  const askScore = hasAskPattern ? 100 : 0;
  
  if (askScore < 100) {
    issues.push("ASK: Missing reciprocal one-word ask");
  }

  // Check 6: Template Detection (CRITICAL)
  const templatePatterns = [
    /\[name\]|\[prospect\]|\[company\]|\[city\]/i,
    /\{\{.*?\}\}/,
    /\$\{.*?\}/,
    /<%.*?%>/,
    /{{.*?}}/,
    /\$\(.*?\)/,
  ];

  let templateDetected = false;
  for (const pattern of templatePatterns) {
    if (pattern.test(email)) {
      templateDetected = true;
      issues.push("TEMPLATE: Contains variable placeholders (not personalized)");
      break;
    }
  }

  // Check 7: Uniqueness indicators (should be different per prospect)
  const uniqueIndicators = email.match(/london|manchester|birmingham|bristol|law|pharmacy|removals|restaurant/gi) || [];
  const hasPersonalization = uniqueIndicators.length > 0;

  // Check 8: Word count should be 60-80 words (concise)
  const wordCountOk = wordCount >= 60 && wordCount <= 80;
  if (!wordCountOk && wordCount < 100) {
    issues.push(`CONCISENESS: ${wordCount} words (target: 60-80)`);
  }

  // Calculate final scores
  const componentScores = {
    moment: { score: momentScore, present: momentScore >= 80 },
    insight: { score: insightScore, present: insightScore >= 100 },
    inverse: { score: inverseScore, present: inverseScore >= 100 },
    service: { score: serviceScore, present: serviceScore >= 80 },
    ask: { score: askScore, present: askScore >= 100 },
  };

  totalScore =
    (componentScores.moment.score * 0.2 +
      componentScores.insight.score * 0.2 +
      componentScores.inverse.score * 0.2 +
      componentScores.service.score * 0.2 +
      componentScores.ask.score * 0.2) /
    100;

  if (templateDetected) totalScore *= 0.5; // Heavily penalize templates

  const allComponentsPresent =
    componentScores.moment.present &&
    componentScores.insight.present &&
    componentScores.inverse.present &&
    componentScores.service.present &&
    componentScores.ask.present;

  const qualityScore = Math.floor(totalScore * 100);

  let verdict: "PASS" | "FAIL" | "NEEDS_REVISION" = "PASS";
  if (!allComponentsPresent || templateDetected || qualityScore < 70) {
    verdict = "FAIL";
  } else if (qualityScore < 80) {
    verdict = "NEEDS_REVISION";
  }

  return {
    isValid: verdict === "PASS",
    qualityScore,
    components: {
      moment: { ...componentScores.moment, reason: hasMomentPattern ? "✓ Specific timestamp" : "✗ Generic timing" },
      insight: { ...componentScores.insight, reason: hasInsightPhrase ? "✓ Articulates insight" : "✗ Missing insight" },
      inverse: { ...componentScores.inverse, reason: hasInversePhrase ? "✓ Allows to ignore" : "✗ No restraint" },
      service: { ...componentScores.service, reason: hasServiceLocation && hasServiceAction ? "✓ Local + specific" : "✗ Vague service" },
      ask: { ...componentScores.ask, reason: hasAskPattern ? "✓ One-word ask" : "✗ No ask" },
    },
    issues,
    templateDetected,
    wordCount,
    verdict,
  };
}

/**
 * Test multiple emails to ensure consistency
 */
export function validateEmailBatch(emails: string[]): {
  summary: {
    totalEmails: number;
    passed: number;
    failed: number;
    averageQuality: number;
  };
  results: V3ValidationReport[];
} {
  const results = emails.map((email) => validateV3Email(email));
  const passed = results.filter((r) => r.verdict === "PASS").length;
  const failed = results.filter((r) => r.verdict === "FAIL").length;
  const averageQuality =
    Math.floor(results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length);

  return {
    summary: {
      totalEmails: emails.length,
      passed,
      failed,
      averageQuality,
    },
    results,
  };
}

export type { V3ValidationReport };
