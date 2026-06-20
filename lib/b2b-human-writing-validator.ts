/**
 * HUMAN WRITING ENGINE VALIDATOR
 *
 * Constitutional gates for all operator-generated copy
 * 4 Gates: Recognition, Relief, Trust, Action
 * Validates against Human Writing Engine standards
 */

export interface ValidationResult {
  email_subject: string;
  email_body: string;
  pressure_type: string;
  overall_confidence: number; // 0-100
  path: 'pass' | 'suggest' | 'fail';
  gates: {
    recognition: GateResult;
    relief: GateResult;
    trust: GateResult;
    action: GateResult;
  };
  pressure_type_rules: PressureTypeRuleResult[];
  suggestions: Suggestion[];
  can_send: boolean;
}

export interface GateResult {
  gate_name: string;
  passed: boolean;
  confidence: number; // 0-100
  checks: CheckResult[];
  summary: string;
}

export interface CheckResult {
  check_name: string;
  passed: boolean;
  reason: string;
}

export interface Suggestion {
  gate: string;
  title: string;
  current: string;
  suggested: string;
  why: string;
  impact: string; // "high" | "medium" | "low"
}

export interface PressureTypeRuleResult {
  rule_name: string;
  passed: boolean;
  reason: string;
}

// ─────────────────────────────────────────────────────────────────────────
// GATE 1: RECOGNITION
// ─────────────────────────────────────────────────────────────────────────

function validateRecognition(email: string, company_name: string): GateResult {
  const checks: CheckResult[] = [];
  let passCount = 0;
  const totalChecks = 5;

  // Check 1: Company name mentioned
  const companyMentioned = email.includes(company_name);
  checks.push({
    check_name: 'Company name mentioned',
    passed: companyMentioned,
    reason: companyMentioned ? `"${company_name}" explicitly named` : `Company name not found`,
  });
  if (companyMentioned) passCount++;

  // Check 2: Specific observation (metric, number, fact)
  const hasSpecificFact = /(\d+\.?\d*%|\d+\s*(location|branch|store|employee|year|week|month))/.test(email);
  checks.push({
    check_name: 'Specific observation mentioned',
    passed: hasSpecificFact,
    reason: hasSpecificFact ? 'Metric or specific fact found' : 'Too generic, add specific number or metric',
  });
  if (hasSpecificFact) passCount++;

  // Check 3: Shows research (not generic template)
  const genericOpeners = ['I noticed you', 'We found that', 'I came across'];
  const isGeneric = genericOpeners.some((opener) => email.toLowerCase().includes(opener.toLowerCase()));
  const isSpecific = !isGeneric;
  checks.push({
    check_name: 'Specific to their situation (not template)',
    passed: isSpecific,
    reason: isSpecific ? 'Personalized opening (good)' : 'Sounds like template (use specific facts)',
  });
  if (isSpecific) passCount++;

  // Check 4: Observation is verifiable
  const hasObservable = /((review|rating|star|★|location|branch|employee|revenue|growth))/i.test(email);
  checks.push({
    check_name: 'Observation is verifiable',
    passed: hasObservable,
    reason: hasObservable ? 'Uses observable facts' : 'Add verifiable facts (public data)',
  });
  if (hasObservable) passCount++;

  // Check 5: At least 2 specific facts mentioned
  const facts = email.match(/\d+\.?\d*%|\d+\s*\w+|reviewed|rated|located in|based in/g);
  const enoughFacts = facts && facts.length >= 2;
  checks.push({
    check_name: 'Multiple specific facts (2+)',
    passed: enoughFacts || false,
    reason: enoughFacts ? `${facts!.length} specific facts found` : 'Add 2+ specific facts about them',
  });
  if (enoughFacts) passCount++;

  return {
    gate_name: 'Recognition',
    passed: passCount >= 3,
    confidence: (passCount / totalChecks) * 100,
    checks,
    summary: `Recognition: ${passCount}/${totalChecks} checks passed. Shows understanding of their specific situation.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// GATE 2: RELIEF
// ─────────────────────────────────────────────────────────────────────────

function validateRelief(email: string, pressure_type: string): GateResult {
  const checks: CheckResult[] = [];
  let passCount = 0;
  const totalChecks = 5;

  // Check 1: Burden naming (challenge, struggle, etc.)
  const burdenWords = ['challenge', 'struggle', 'burden', 'managing', 'juggling', 'balancing', 'difficult'];
  const mentionsBurden = burdenWords.some((word) => email.toLowerCase().includes(word));
  checks.push({
    check_name: 'Burden explicitly named',
    passed: mentionsBurden,
    reason: mentionsBurden ? 'Uses empathy language' : 'Add "challenge" or "burden" (shows empathy)',
  });
  if (mentionsBurden) passCount++;

  // Check 2: Relief is specific (not "we can help")
  const hasSpecificRelief = !email.match(/\bwe can help\b|\bwe can solve\b|\bwe offer\b/i);
  const notGenericBenefit = hasSpecificRelief;
  checks.push({
    check_name: 'Relief specific to THEM (not generic "we help")',
    passed: notGenericBenefit,
    reason: notGenericBenefit ? 'Burden-focused (good)' : 'Remove "we can help" - focus on their burden',
  });
  if (notGenericBenefit) passCount++;

  // Check 3: Shows understanding (empathy signals)
  const empathySignals = /because|understand|managing|personally|difficult|struggle/i;
  const showsEmpathy = empathySignals.test(email);
  checks.push({
    check_name: 'Shows empathy/understanding',
    passed: showsEmpathy,
    reason: showsEmpathy ? 'Empathetic language detected' : 'Add empathy signal (e.g., "managing personally")',
  });
  if (showsEmpathy) passCount++;

  // Check 4: Relief proportionate to pressure type
  const hasPressureContext = getPressureTypeKeywords(pressure_type).some((keyword) =>
    email.toLowerCase().includes(keyword)
  );
  checks.push({
    check_name: `Relief matches ${pressure_type}`,
    passed: hasPressureContext,
    reason: hasPressureContext ? `Addresses ${pressure_type} context` : `Add context specific to ${pressure_type}`,
  });
  if (hasPressureContext) passCount++;

  // Check 5: Avoids clinical/harsh language
  const harshWords = /problem|issue|bad|poor|worst|failing|broken/i;
  const notHarsh = !harshWords.test(email);
  checks.push({
    check_name: 'Warm tone (not clinical)',
    passed: notHarsh,
    reason: notHarsh ? 'Warm, empathetic tone' : 'Replace harsh words with warm language',
  });
  if (notHarsh) passCount++;

  return {
    gate_name: 'Relief',
    passed: passCount >= 3,
    confidence: (passCount / totalChecks) * 100,
    checks,
    summary: `Relief: ${passCount}/${totalChecks} checks passed. Names their specific burden with empathy.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// GATE 3: TRUST
// ─────────────────────────────────────────────────────────────────────────

function validateTrust(email: string): GateResult {
  const checks: CheckResult[] = [];
  let passCount = 0;
  const totalChecks = 5;

  // Check 1: Proof is specific (numbers, outcomes)
  const hasNumbers = /\d+%|\d+\.\d+%|(\d+)\s*(location|branch|store|company|client|week|month|year|day)/.test(email);
  checks.push({
    check_name: 'Proof is specific (numbers, outcomes)',
    passed: hasNumbers,
    reason: hasNumbers ? 'Specific numbers/metrics provided' : 'Add specific numbers (%, count, timeline)',
  });
  if (hasNumbers) passCount++;

  // Check 2: Proof shows THEM benefiting (inverse incentive)
  const theyBenefit = /client|company|similar|network|they|achieved|results|improved|reduced/.test(email);
  const notAboutUs = !email.match(/\bwe\b.*\bproud|we.*award|we.*leader/i);
  const inverseIncentive = theyBenefit && notAboutUs;
  checks.push({
    check_name: 'Proof benefits THEM (inverse incentive)',
    passed: inverseIncentive,
    reason: inverseIncentive ? 'Shows what others achieved' : 'Focus on client results, not our credentials',
  });
  if (inverseIncentive) passCount++;

  // Check 3: Proof is verifiable/credible
  const hasCredibleProof =
    /similar|comparable|network|industry|company|like (your|their)/.test(email) || /from|in (\d+|\w+ years)/.test(email);
  checks.push({
    check_name: 'Proof is credible (similar company, timeline)',
    passed: hasCredibleProof,
    reason: hasCredibleProof
      ? 'Proof is credible (similar context, real data)'
      : 'Make proof credible (mention similar company type)',
  });
  if (hasCredibleProof) passCount++;

  // Check 4: Methodology shown (HOW they achieved it)
  const showsHow = /by|through|using|implemented|created|built|process|methodology|approach/.test(email);
  checks.push({
    check_name: 'Methodology shown (HOW they achieved it)',
    passed: showsHow,
    reason: showsHow ? 'Explains HOW proof was achieved' : 'Add methodology (how they achieved results)',
  });
  if (showsHow) passCount++;

  // Check 5: No "best" or "leader" claims without proof
  const noEmptySuperlatives = !/\bbest\b.*without|leading|#1|award|certified/.test(email);
  const orHasProof = /proof|data|metric|percentage|result|achieved/.test(email);
  const superlativesOK = noEmptySuperlatives || orHasProof;
  checks.push({
    check_name: 'No unsubstantiated claims',
    passed: superlativesOK,
    reason: superlativesOK ? 'Claims backed by proof' : 'Remove claims not backed by numbers/proof',
  });
  if (superlativesOK) passCount++;

  return {
    gate_name: 'Trust',
    passed: passCount >= 3,
    confidence: (passCount / totalChecks) * 100,
    checks,
    summary: `Trust: ${passCount}/${totalChecks} checks passed. Proof demonstrates inverse incentive (benefits THEM).`,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// GATE 4: ACTION
// ─────────────────────────────────────────────────────────────────────────

function validateAction(email: string): GateResult {
  const checks: CheckResult[] = [];
  let passCount = 0;
  const totalChecks = 5;

  // Check 1: Ends with question (not statement/demand)
  const endsWithQuestion = email.trim().endsWith('?');
  checks.push({
    check_name: 'Ends with question (not demand)',
    passed: endsWithQuestion,
    reason: endsWithQuestion ? 'Ends with open question' : 'Change ending to a question (invitation, not demand)',
  });
  if (endsWithQuestion) passCount++;

  // Check 2: Question is open (not yes/no)
  const openQuestions = /^(what|when|how|does|which|where|why)/i;
  const lastSentence = email.split(/[.!?]/).filter(Boolean).pop()?.trim() || '';
  const isOpenQuestion = openQuestions.test(lastSentence);
  checks.push({
    check_name: 'Question is open (not yes/no)',
    passed: isOpenQuestion,
    reason: isOpenQuestion
      ? 'Open question invites conversation'
      : 'Change "yes/no" question to "what/how/does" (opens dialogue)',
  });
  if (isOpenQuestion) passCount++;

  // Check 3: No false urgency
  const urgencyWords = /call now|limited|hurry|today|immediately|urgent|act now|don't wait|deadline is/i;
  const noFalseUrgency = !urgencyWords.test(email);
  checks.push({
    check_name: 'No false urgency',
    passed: noFalseUrgency,
    reason: noFalseUrgency
      ? 'No manipulative urgency'
      : 'Remove "call now", "limited", etc. (feels genuine without pressure)',
  });
  if (noFalseUrgency) passCount++;

  // Check 4: No manipulation tactics
  const manipulationWords = /exclusive|only|if you|before|scarcity|don't miss/i;
  const noManipulation = !manipulationWords.test(email);
  checks.push({
    check_name: 'No manipulation tactics',
    passed: noManipulation,
    reason: noManipulation ? 'Clean, honest ask' : 'Remove scarcity/FOMO language (feels authentic)',
  });
  if (noManipulation) passCount++;

  // Check 5: Clear next step (feels safe)
  const clearAction = /question|thoughts|interest|match|approach|working|experience/i.test(lastSentence);
  checks.push({
    check_name: 'Inviting next step (feels safe)',
    passed: clearAction,
    reason: clearAction ? 'Feels like genuine conversation' : 'Make action feel conversational, not sales-y',
  });
  if (clearAction) passCount++;

  return {
    gate_name: 'Action',
    passed: passCount >= 3,
    confidence: (passCount / totalChecks) * 100,
    checks,
    summary: `Action: ${passCount}/${totalChecks} checks passed. Invitation to conversation, not demand.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// PRESSURE TYPE SPECIFIC RULES
// ─────────────────────────────────────────────────────────────────────────

function getPressureTypeKeywords(pressure_type: string): string[] {
  const keywords: Record<string, string[]> = {
    'service-quality-inconsistency': ['quality', 'rating', 'star', 'variance', 'consistency', 'location', 'branch'],
    'time-critical-movement': ['deadline', 'timeline', 'move', 'implement', 'ready', 'week', 'month', 'day'],
    'capacity-overflow': ['capacity', 'scale', 'volume', 'growth', 'expansion', 'process', 'automation'],
    'geographic-service-gaps': ['location', 'region', 'coverage', 'expand', 'reach', 'area', 'territory'],
    'customer-acquisition-friction': ['lead', 'customer', 'acquisition', 'pipeline', 'volume', 'flow'],
    'customer-churn': ['churn', 'retention', 'loyalty', 'repeat', 'retention', 'keep', 'lose'],
    'delivery-reliability': ['delivery', 'reliable', 'timing', 'punctual', 'schedule', 'deadline'],
    'appointment-scheduling-friction': ['appointment', 'scheduling', 'calendar', 'booking', 'time', 'slot'],
    'communication-breakdown': ['communication', 'response', 'timing', 'coordination', 'clarity', 'message'],
  };
  return keywords[pressure_type] || [];
}

function validatePressureTypeRules(email: string, pressure_type: string): PressureTypeRuleResult[] {
  const rules: PressureTypeRuleResult[] = [];

  // Quality Inconsistency: Must mention specific variance/metric
  if (pressure_type === 'service-quality-inconsistency') {
    const hasVariance = /(\d+\.?\d*)\s*★|(\d+%)\s*(vs|versus|-)|variance|difference/.test(email);
    rules.push({
      rule_name: 'Mention specific variance metric',
      passed: hasVariance,
      reason: hasVariance ? '★ variance mentioned' : 'Add specific star rating or % difference',
    });
  }

  // Time-Critical: Must mention deadline
  if (pressure_type === 'time-critical-movement') {
    const hasDeadline = /\b(\d+)\s*(day|week|month|hour)s?\b|deadline|by\s+\w+|ready by|move on/.test(email);
    rules.push({
      rule_name: 'Mention specific timeline/deadline',
      passed: hasDeadline,
      reason: hasDeadline ? 'Timeline mentioned' : 'Add specific deadline (days, weeks)',
    });
  }

  // Capacity: Must mention scale/volume
  if (pressure_type === 'capacity-overflow') {
    const hasScale = /\b(\d+)\s*(location|branch|store|employee|order|volume)s?\b|scale|growth|expand|volume/.test(email);
    rules.push({
      rule_name: 'Mention scale/volume context',
      passed: hasScale,
      reason: hasScale ? 'Scale mentioned' : 'Add number of locations, employees, or volume',
    });
  }

  return rules;
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN VALIDATOR
// ─────────────────────────────────────────────────────────────────────────

export function validateEmail(
  email_subject: string,
  email_body: string,
  pressure_type: string,
  company_name: string
): ValidationResult {
  const fullEmail = `${email_subject}\n${email_body}`;

  // Run all 4 gates
  const recognition = validateRecognition(fullEmail, company_name);
  const relief = validateRelief(fullEmail, pressure_type);
  const trust = validateTrust(fullEmail);
  const action = validateAction(fullEmail);

  // Calculate overall confidence
  const allGateConfidence = [recognition.confidence, relief.confidence, trust.confidence, action.confidence];
  const gatesPassed = [recognition.passed, relief.passed, trust.passed, action.passed].filter(Boolean).length;
  const overall_confidence = (allGateConfidence.reduce((a, b) => a + b, 0) / 4 + gatesPassed * 15) / 1.25;

  // Pressure type rules
  const pressure_type_rules = validatePressureTypeRules(fullEmail, pressure_type);
  const pressureRulesPassed = pressure_type_rules.filter((r) => r.passed).length;

  // Determine path
  let path: 'pass' | 'suggest' | 'fail' = 'fail';
  if (gatesPassed === 4 && pressureRulesPassed === pressure_type_rules.length && overall_confidence > 85) {
    path = 'pass';
  } else if (gatesPassed >= 2 && overall_confidence > 50) {
    path = 'suggest';
  }

  // Generate suggestions
  const suggestions = generateSuggestions(recognition, relief, trust, action);

  return {
    email_subject,
    email_body,
    pressure_type,
    overall_confidence: Math.min(100, Math.max(0, overall_confidence)),
    path,
    gates: { recognition, relief, trust, action },
    pressure_type_rules,
    suggestions,
    can_send: path === 'pass',
  };
}

function generateSuggestions(
  recognition: GateResult,
  relief: GateResult,
  trust: GateResult,
  action: GateResult
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  if (!recognition.passed) {
    suggestions.push({
      gate: 'Recognition',
      title: 'Add specific observation about their company',
      current: 'Generic opening that could apply to any company',
      suggested: 'Mention specific metric: "Your best branch gets 4.8★ reviews, newest gets 3.2★"',
      why: 'Shows you did research, not a template',
      impact: 'high',
    });
  }

  if (!relief.passed) {
    suggestions.push({
      gate: 'Relief',
      title: 'Name their specific burden with empathy',
      current: 'Generic "we can help" or clinical problem statement',
      suggested: 'Show empathy: "That\'s a challenge because you\'re managing quality variance personally across locations"',
      why: 'Makes them feel understood before pitching solution',
      impact: 'high',
    });
  }

  if (!trust.passed) {
    suggestions.push({
      gate: 'Trust',
      title: 'Show proof with specific numbers and methodology',
      current: 'Vague claim ("we\'ve helped many", "clients love us")',
      suggested:
        'Specific proof: "Similar estate agent network grew to 12 locations while maintaining 4.3★ average. Variance dropped from 1.8★ to 0.3★ in 8 months."',
      why: 'Numbers and methodology build credibility better than claims',
      impact: 'high',
    });
  }

  if (!action.passed) {
    suggestions.push({
      gate: 'Action',
      title: 'End with an open question, not a demand',
      current: 'Pushy closing ("Call now", "Schedule a demo")',
      suggested: 'Conversational question: "Does this variance match what you\'re experiencing?"',
      why: 'Feels like conversation, not sales pitch. More likely to get reply.',
      impact: 'medium',
    });
  }

  return suggestions;
}
