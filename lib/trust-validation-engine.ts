/**
 * TRUST VALIDATION ENGINE
 *
 * Layer 3: Quality Assurance
 *
 * This runs AFTER the reasoning engine writes.
 * It audits emails for authenticity and compliance with PD Operating System.
 *
 * Does NOT ask: "Is this persuasive?"
 * Does ask: "Does this deserve trust?"
 *
 * Trust and persuasion are different.
 * Persuasion can be manufactured.
 * Trust must be revealed through authentic behavior.
 */

export interface ValidationFinding {
  question: string;
  answer: "yes" | "no" | "partial";
  severity: "critical" | "warning" | "info";
  suggestion: string;
}

export interface TrustValidationResult {
  trustScore: number; // 0-100
  isValid: boolean; // passes all critical checks
  findings: ValidationFinding[];
  recommendation: "approve" | "rewrite" | "reject";
  focusAreas: string[]; // what to fix first
}

/**
 * Trust Validation Checklist
 *
 * Each question targets a specific layer 1 principle.
 * Answers determine if the email deserves trust.
 */
const validationChecklist = [
  {
    question: "Does this feel like we want something?",
    principle: "Respect before attention",
    severity: "critical" as const,
    description:
      "If the reader senses you need their response, they'll feel pressure. Does this sound like you're trying to get them to buy?",
  },
  {
    question: "Are we helping before selling?",
    principle: "Permission before persuasion",
    severity: "critical" as const,
    description:
      "Does the email establish respect and understanding before requesting action? Or does it launch into what you want?",
  },
  {
    question: "Would an executive believe this?",
    principle: "Evidence over assertion",
    severity: "critical" as const,
    description:
      "Can the reader see evidence for every claim? Or are you asking them to trust you on your word alone?",
  },
  {
    question: "Does restraint appear naturally?",
    principle: "Never manufacture trust signals",
    severity: "warning" as const,
    description:
      "Does the restraint feel like it comes from genuine confidence? Or does it feel inserted for effect? (Example: Is 'You probably don't need us' genuinely true or just a tactic?)",
  },
  {
    question: "Would we still send this if they never bought?",
    principle: "Reader persuades themselves",
    severity: "critical" as const,
    description:
      "If this prospect never purchased anything, would this email still be valuable to them? Or is it purely sales-focused?",
  },
  {
    question: "Does this sound like marketing?",
    principle: "Sound like a human, not a writer",
    severity: "warning" as const,
    description:
      "Does this sound written, or does it sound like one person talking to another? Are there any phrases that feel formulaic?",
  },
  {
    question: "Is every claim supported by visible evidence?",
    principle: "Evidence over assertion",
    severity: "critical" as const,
    description:
      "When you say 'We work with similar companies,' can the reader see evidence? Or are you just claiming expertise?",
  },
  {
    question: "Does this show observation, not explanation?",
    principle: "Observation before explanation",
    severity: "warning" as const,
    description:
      "Are you showing what they experience, or explaining your product? Does this prove understanding through what you notice?",
  },
  {
    question: "Could this have been said more simply?",
    principle: "Every sentence earns its existence",
    severity: "warning" as const,
    description:
      "Is there any unnecessary complexity? Any sentence that doesn't do psychological work?",
  },
  {
    question: "Does this respect their intelligence?",
    principle: "Respect before attention",
    severity: "critical" as const,
    description:
      "Are you over-explaining? Would an intelligent reader feel talked down to? Or do you trust them to understand context?",
  },
];

/**
 * Validate an email for trust and authenticity
 */
export function validateEmailForTrust(emailBody: string): TrustValidationResult {
  const findings: ValidationFinding[] = [];
  let trustScore = 100;
  const criticalFailures: string[] = [];

  // Check each validation criterion
  const analysis = analyzeEmailContent(emailBody);

  // 1. Does this feel like we want something?
  if (analysis.feelsLikeNeed || analysis.urgencyLanguage > 2) {
    findings.push({
      question: "Does this feel like we want something?",
      answer: "yes",
      severity: "critical",
      suggestion:
        "Remove language that creates urgency or need. Replace with neutral observation. Example: Change 'We'd love to help' to 'We handle overflow deliveries.'",
    });
    criticalFailures.push("Feels like we want something");
    trustScore -= 25;
  }

  // 2. Are we helping before selling?
  if (!analysis.helpsBeforeSelling) {
    findings.push({
      question: "Are we helping before selling?",
      answer: "no",
      severity: "critical",
      suggestion:
        "Start with what the reader experiences, not what you offer. Lead with observation, not solution.",
    });
    criticalFailures.push("Does not help before selling");
    trustScore -= 25;
  }

  // 3. Would an executive believe this?
  if (analysis.hasUnsupportedClaims) {
    findings.push({
      question: "Would an executive believe this?",
      answer: "partial",
      severity: "critical",
      suggestion:
        "Every claim needs evidence the reader can see. Don't say 'We're trusted by logistics teams.' Say 'We worked with 12 London facilities companies. Not because we're cheapest, but because we show up when logistics gets messy.'",
    });
    criticalFailures.push("Contains unsupported claims");
    trustScore -= 20;
  }

  // 4. Does restraint appear naturally?
  if (analysis.manufacturedRestraint) {
    findings.push({
      question: "Does restraint appear naturally?",
      answer: "no",
      severity: "warning",
      suggestion:
        "Remove restraint phrases that feel inserted (like 'I'm not trying to convince you'). Only use restraint that genuinely comes from the situation.",
    });
    trustScore -= 15;
  }

  // 5. Would we still send this if they never bought?
  if (analysis.purelyTransactional) {
    findings.push({
      question: "Would we still send this if they never bought?",
      answer: "no",
      severity: "critical",
      suggestion:
        "This email is focused purely on conversion. Rewrite to provide value whether or not they purchase. Focus on what they're experiencing, not what you want.",
    });
    criticalFailures.push("Purely transactional");
    trustScore -= 25;
  }

  // 6. Does this sound like marketing?
  if (analysis.soundsLikeMarketing) {
    findings.push({
      question: "Does this sound like marketing?",
      answer: "yes",
      severity: "warning",
      suggestion:
        "Remove marketing language. Replace with conversational observation. Remove: 'cutting-edge,' 'innovative,' 'partner,' 'solution,' 'ecosystem.' Use: action verbs (pick up, deliver, handle) and simple statements.",
    });
    trustScore -= 15;
  }

  // 7. Is every claim supported by visible evidence?
  if (analysis.claimsWithoutEvidence > 0) {
    findings.push({
      question: "Is every claim supported by visible evidence?",
      answer: "no",
      severity: "critical",
      suggestion: `Found ${analysis.claimsWithoutEvidence} claim(s) without evidence. For each claim, ask: 'Can the reader see this evidence?' If no, either remove the claim or provide evidence.`,
    });
    criticalFailures.push("Unsupported claims");
    trustScore -= 20;
  }

  // 8. Does this show observation, not explanation?
  if (analysis.explainsMoreThanObserves) {
    findings.push({
      question: "Does this show observation, not explanation?",
      answer: "no",
      severity: "warning",
      suggestion:
        "This leans toward explanation of your service. Shift to observation of their situation. Don't explain what you do; show what they experience.",
    });
    trustScore -= 10;
  }

  // 9. Could this have been said more simply?
  if (analysis.complexityScore > 6) {
    findings.push({
      question: "Could this have been said more simply?",
      answer: "yes",
      severity: "warning",
      suggestion:
        "Simplify complex sentences. Aim for grade-10 reading level. Remove multi-clause sentences. One idea per sentence.",
    });
    trustScore -= 10;
  }

  // 10. Does this respect their intelligence?
  if (analysis.overExplains) {
    findings.push({
      question: "Does this respect their intelligence?",
      answer: "no",
      severity: "warning",
      suggestion:
        "This over-explains basic concepts. Trust the reader to understand context. Remove explanatory sentences that state the obvious.",
    });
    trustScore -= 10;
  }

  // Determine recommendation
  let recommendation: "approve" | "rewrite" | "reject" = "approve";
  if (criticalFailures.length > 0) {
    recommendation = "rewrite";
  }
  if (criticalFailures.length >= 3) {
    recommendation = "reject";
  }

  return {
    trustScore: Math.max(0, trustScore),
    isValid: criticalFailures.length === 0,
    findings,
    recommendation,
    focusAreas: criticalFailures,
  };
}

/**
 * Analyze email content for trust violations
 */
function analyzeEmailContent(emailBody: string): Record<string, any> {
  const lower = emailBody.toLowerCase();

  return {
    // Pressure detection
    feelsLikeNeed:
      /need|must|urgent|limited|hurry|act now|exclusive|today|asap/i.test(emailBody),
    urgencyLanguage: (emailBody.match(
      /\b(now|today|urgent|act|limited|exclusive|asap)\b/gi
    ) || []).length,

    // Helping before selling
    helpsBeforeSelling: !/(pitch|offer|product|service|solution|buy|purchase)/i.test(
      emailBody.split("\n")[0]
    ),

    // Unsupported claims
    hasUnsupportedClaims: /\b(we provide|we offer|we help|we understand|we specialize|we're trusted)\b/i.test(
      emailBody
    ),
    claimsWithoutEvidence: (emailBody.match(
      /\b(we provide|we offer|we help|we're|best|leading|expert|proven)\b/gi
    ) || []).length,

    // Manufactured restraint
    manufacturedRestraint: /i'm not|i'm not trying|no pressure|no obligation|feel free to ignore|if interested/i.test(
      emailBody
    ),

    // Transactional focus
    purelyTransactional: /reply|click|call|schedule|book|purchase|buy/i.test(
      emailBody.split("\n").pop() || ""
    ),

    // Marketing language
    soundsLikeMarketing: /cutting[- ]edge|innovative|synergy|partner|ecosystem|paradigm|leverage|optimize|solution|best[- ]in[- ]class/i.test(
      emailBody
    ),

    // Explanation vs observation
    explainsMoreThanObserves: /^(our|we|this|the solution)/im.test(emailBody),

    // Complexity
    complexityScore:
      emailBody.split(".").reduce((sum, sentence) => {
        const words = sentence.split(/\s+/).length;
        return sum + (words > 15 ? 1 : 0);
      }, 0) / (emailBody.split(".").length || 1),

    // Over-explanation
    overExplains: /this is|this means|in other words|essentially|basically|as you can see/i.test(
      emailBody
    ),
  };
}

/**
 * Format validation result for operator
 */
export function formatValidationReport(result: TrustValidationResult): string {
  let report = `\nTRUST VALIDATION REPORT\n`;
  report += `═══════════════════════════════════════\n\n`;
  report += `Trust Score: ${result.trustScore}/100\n`;
  report += `Status: ${result.isValid ? "✓ VALID" : "✗ NEEDS REVIEW"}\n`;
  report += `Recommendation: ${result.recommendation.toUpperCase()}\n\n`;

  if (result.focusAreas.length > 0) {
    report += `Critical Issues:\n`;
    result.focusAreas.forEach((area) => {
      report += `  • ${area}\n`;
    });
    report += `\n`;
  }

  report += `Findings:\n`;
  result.findings.forEach((finding) => {
    const icon = finding.severity === "critical" ? "🔴" : "⚠️";
    report += `${icon} ${finding.question}\n`;
    report += `   Answer: ${finding.answer}\n`;
    report += `   → ${finding.suggestion}\n\n`;
  });

  return report;
}
