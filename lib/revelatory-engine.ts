import { BusinessEvidence, ReviewSnippet } from './evidence-types';

export interface Hypothesis {
  statement: string;
  evidence: ReviewSnippet[];
  confidence: 'low' | 'medium' | 'high';
  howToValidate: string;
}

export interface ConversationHypotheses {
  pressureHypotheses: Hypothesis[];
  constraintHypotheses: Hypothesis[];
  opportunityHypotheses: Hypothesis[];
}

export interface RevelatoryAnalysis {
  hypotheses: ConversationHypotheses;
  conversationPotential: 'high' | 'medium' | 'low';
  whyThisRanking: string;
  firstQuestion: string;
}

// Build hypotheses from evidence without false precision
function buildPressureHypotheses(reviews: ReviewSnippet[]): Hypothesis[] {
  const hypotheses: Hypothesis[] = [];

  // PRESSURE HYPOTHESIS 1: Seasonal peaks create operational load
  const seasonalMentions = reviews.filter(r => {
    const text = r.text.toLowerCase();
    return /valentine|mother[\s']?s|easter|christmas|holiday|seasonal/i.test(text);
  });

  if (seasonalMentions.length > 0) {
    hypotheses.push({
      statement: 'Seasonal peaks (Valentine\'s, Mother\'s Day, Christmas) create significant operational load.',
      evidence: seasonalMentions,
      confidence: seasonalMentions.length >= 2 ? 'high' : 'medium',
      howToValidate: 'What becomes hardest to keep consistent when Mother\'s Day volume hits?',
    });
  }

  // PRESSURE HYPOTHESIS 2: Wedding work is complex and multi-component
  const weddingMentions = reviews.filter(r => {
    const text = r.text.toLowerCase();
    const hasWedding = text.includes('wedding');
    const hasComplexity = /bouquet|bridesmaids?|buttonhole|arch|table|centrepiece|arrangement|design/i.test(text);
    return hasWedding && hasComplexity;
  });

  if (weddingMentions.length > 0) {
    hypotheses.push({
      statement: 'Wedding orders require high coordination across multiple components and deliveries.',
      evidence: weddingMentions,
      confidence: weddingMentions.length >= 2 ? 'high' : 'medium',
      howToValidate: 'If you doubled wedding bookings next year, which parts would you need to outsource?',
    });
  }

  // PRESSURE HYPOTHESIS 3: Last-minute requests are common
  const lastMinuteMentions = reviews.filter(r => {
    const text = r.text.toLowerCase();
    return /last minute|same.day|rush|urgent|emergency|speedy|quick turnaround|within.*hour/i.test(text);
  });

  if (lastMinuteMentions.length > 0) {
    hypotheses.push({
      statement: 'Customers frequently request last-minute or same-day service.',
      evidence: lastMinuteMentions,
      confidence: 'medium',
      howToValidate: 'What percentage of your orders come in with less than 48 hours notice?',
    });
  }

  return hypotheses;
}

// Build constraint hypotheses
function buildConstraintHypotheses(reviews: ReviewSnippet[]): Hypothesis[] {
  const hypotheses: Hypothesis[] = [];

  // CONSTRAINT HYPOTHESIS 1: Owner is heavily involved
  const ownerMentions = reviews.filter(r => {
    const text = r.text;
    return /hannah|emma|laura|daisy|sian|natalie|steve|tom|mikey|ahmad|owner|founder/i.test(text);
  });

  if (ownerMentions.length >= 2) {
    hypotheses.push({
      statement: 'The owner is personally involved in most customer interactions and project delivery.',
      evidence: ownerMentions.slice(0, 3),
      confidence: 'high',
      howToValidate: 'Which parts of the business still require your involvement every single day?',
    });
  }

  // CONSTRAINT HYPOTHESIS 2: Work is manually coordinated
  const manualMentions = reviews.filter(r => {
    const text = r.text.toLowerCase();
    return /email|coordinate|communicated|stayed in touch|kept.*updated|consultation|discussed/i.test(text);
  });

  if (manualMentions.length >= 2) {
    hypotheses.push({
      statement: 'Order coordination happens manually (email, phone, meetings) rather than through systems.',
      evidence: manualMentions.slice(0, 3),
      confidence: 'medium',
      howToValidate: 'Walk me through how you coordinate a typical wedding order from booking to delivery. How many emails/calls does that take?',
    });
  }

  // CONSTRAINT HYPOTHESIS 3: Work is hard to standardize
  const workaroundMentions = reviews.filter(r => {
    const text = r.text.toLowerCase();
    return /creative|managed to|figured out|created|designed|couldn't find|out of season/i.test(text);
  });

  if (workaroundMentions.length >= 2) {
    hypotheses.push({
      statement: 'Each order requires custom problem-solving and creative workarounds.',
      evidence: workaroundMentions.slice(0, 3),
      confidence: 'medium',
      howToValidate: 'How often do you have to say "no" to a customer request because it doesn\'t fit your standard process?',
    });
  }

  return hypotheses;
}

// Build opportunity hypotheses
function buildOpportunityHypotheses(reviews: ReviewSnippet[]): Hypothesis[] {
  const hypotheses: Hypothesis[] = [];

  // OPPORTUNITY HYPOTHESIS 1: Delivery logistics is a recurring challenge
  const deliveryMentions = reviews.filter(r => {
    const text = r.text.toLowerCase();
    return /delivery|courier|driver|transport|logistics|dropped off|picked up/i.test(text);
  });

  if (deliveryMentions.length > 0) {
    hypotheses.push({
      statement: 'Delivery and logistics are mentioned frequently enough that they\'re likely a recurring operational concern.',
      evidence: deliveryMentions.slice(0, 2),
      confidence: 'medium',
      howToValidate: 'What part of your operation takes the most time relative to the profit it generates?',
    });
  }

  // OPPORTUNITY HYPOTHESIS 2: Standing orders could reduce owner workload
  const highVolumeEvidence = reviews.length > 100 ? [reviews[0]] : [];
  if (reviews.length > 100) {
    hypotheses.push({
      statement: 'High review volume (100+) suggests significant order throughput that could be partially pre-scheduled.',
      evidence: highVolumeEvidence,
      confidence: 'high',
      howToValidate: 'If 30% of your orders were predictable standing orders, how would that change your business?',
    });
  }

  return hypotheses;
}

// Determine conversation potential based on evidence quality
function rateConversationPotential(
  pressure: Hypothesis[],
  constraints: Hypothesis[],
  opportunities: Hypothesis[],
  reviewCount: number
): { potential: 'high' | 'medium' | 'low'; reasoning: string } {
  let score = 0;
  const reasons: string[] = [];

  // Quality of evidence
  if (reviewCount >= 100) {
    score += 2;
    reasons.push('Strong evidence base (100+ reviews)');
  } else if (reviewCount >= 50) {
    score += 1;
    reasons.push('Moderate evidence base');
  } else {
    reasons.push('Small evidence base (may be unreliable)');
  }

  // Multiple pressure signals
  const highConfidencePressure = pressure.filter(h => h.confidence === 'high').length;
  if (highConfidencePressure >= 2) {
    score += 2;
    reasons.push('Multiple confirmed pressure signals');
  } else if (highConfidencePressure === 1) {
    score += 1;
    reasons.push('One confirmed pressure signal');
  }

  // Constraints that matter
  const ownerConstraint = constraints.some(h => h.statement.includes('owner is personally'));
  const manualConstraint = constraints.some(h => h.statement.includes('manually'));
  if (ownerConstraint && manualConstraint) {
    score += 2;
    reasons.push('Owner bottleneck + manual work = clear opportunity');
  } else if (ownerConstraint || manualConstraint) {
    score += 1;
    reasons.push('Some operational constraint detected');
  }

  // Determine potential
  let potential: 'high' | 'medium' | 'low';
  if (score >= 5) {
    potential = 'high';
    reasons.push('→ Worth calling first');
  } else if (score >= 3) {
    potential = 'medium';
    reasons.push('→ Worth adding to conversation list');
  } else {
    potential = 'low';
    reasons.push('→ Not enough evidence to start a conversation');
  }

  return {
    potential,
    reasoning: reasons.join('. ') + '.',
  };
}

// Generate the first valuable question to ask
function generateFirstQuestion(hypotheses: ConversationHypotheses): string {
  const allHypotheses = [
    ...hypotheses.pressureHypotheses,
    ...hypotheses.constraintHypotheses,
    ...hypotheses.opportunityHypotheses,
  ];

  // Prioritize questions about owner involvement + pressure
  const ownerPressure = allHypotheses.find(
    h => h.statement.includes('owner is personally') && h.confidence === 'high'
  );
  if (ownerPressure) {
    return ownerPressure.howToValidate;
  }

  // Then prioritize confirmed high-confidence questions
  const confirmed = allHypotheses.find(h => h.confidence === 'high');
  if (confirmed) {
    return confirmed.howToValidate;
  }

  // Fall back to any validation question
  return allHypotheses[0]?.howToValidate || 'What\'s your biggest operational challenge right now?';
}

// Main analysis
export function generateRevelatoryAnalysis(evidence: BusinessEvidence): RevelatoryAnalysis {
  const pressure = buildPressureHypotheses(evidence.reviews);
  const constraints = buildConstraintHypotheses(evidence.reviews);
  const opportunities = buildOpportunityHypotheses(evidence.reviews);

  const hypotheses: ConversationHypotheses = {
    pressureHypotheses: pressure,
    constraintHypotheses: constraints,
    opportunityHypotheses: opportunities,
  };

  const { potential, reasoning } = rateConversationPotential(
    pressure,
    constraints,
    opportunities,
    evidence.review_count
  );

  const firstQuestion = generateFirstQuestion(hypotheses);

  return {
    hypotheses,
    conversationPotential: potential,
    whyThisRanking: reasoning,
    firstQuestion,
  };
}
