/**
 * Outcome Case Engine
 *
 * Canonical intelligence object for Saint & Story.
 *
 * Every lead is diagnosed as an Outcome Case:
 * Desired Outcome → Blocked Outcome → Operational Cause → Logistics Friction → Relevance
 *
 * This is the SOURCE OF TRUTH for all intelligence layers.
 * Conversation Intelligence, Behavior Intelligence, Memory Intelligence, Commercial Intelligence
 * all operate on Outcome Cases, not on prospects/leads/industries.
 */

export interface OutcomeCase {
  // Business Context
  business_id: string;
  business_name: string;
  industry: string;

  // Outcome Diagnosis
  desired_outcome: string;
  blocked_outcome: string;
  operational_cause: string;
  logistics_friction: string;

  // Saint & Story Assessment
  saint_story_relevance: 'high' | 'medium' | 'low' | 'none';
  confidence: number; // 0-100

  // Relationship Context
  relationship_state: 'cold' | 'warm' | 'hot' | 'stalled' | 'replied' | 'conversation' | 'won';
  next_action: string;

  // Metadata
  generated_at: string;
  signals_used: string[];
}

/**
 * Industry-specific outcome case templates
 * Ensures diagnoses are grounded in real operational patterns
 */
const OUTCOME_PATTERNS: Record<string, {
  desired: string;
  blocked: string;
  causes: string[];
  friction: string[];
}> = {
  'estate-agents': {
    desired: 'Move completes smoothly on scheduled date',
    blocked: 'Move delayed or postponed',
    causes: [
      'Key handover not completed',
      'Documents not available at exchange',
      'Fixtures/fittings not ready',
      'Client communication delayed',
      'Third-party coordination missed'
    ],
    friction: [
      'Keys waiting for transfer to client',
      'Documents scattered across locations',
      'Items need collecting before move',
      'Information needs communicating before specific date',
      'Coordination requires last-minute logistics'
    ]
  },
  'pharmacies': {
    desired: 'Prescriptions fulfilled immediately when requested',
    blocked: 'Patient leaves without medication',
    causes: [
      'Stock unavailable at this location',
      'Inter-branch transfer too slow',
      'Inventory system not synchronized',
      'Stock ordered but not yet received',
      'Weekend/holiday staffing gaps'
    ],
    friction: [
      'Stock exists but at wrong location',
      'Transfer between branches takes too long',
      'Delivery from supplier too slow',
      'Manual checking creates delays',
      'No same-day access to network stock'
    ]
  },
  'care-providers': {
    desired: 'Care visits happen as scheduled',
    blocked: 'Visits cancelled or delayed',
    causes: [
      'Medication not available at location',
      'Medical equipment not ready',
      'Care worker not briefed',
      'Client paperwork incomplete',
      'Supplies not in place'
    ],
    friction: [
      'Items exist but not at visit location',
      'Equipment needs collecting',
      'Documentation needs delivering',
      'Supplies need restocking',
      'Communication needs synchronizing'
    ]
  },
  'removals': {
    desired: 'Move completed within agreed timeframe',
    blocked: 'Move delayed or incomplete',
    causes: [
      'Items not collected from origin',
      'Destination access delayed',
      'Equipment not available',
      'Team coordination missed',
      'Client not ready'
    ],
    friction: [
      'Items waiting for collection',
      'Destination preparation incomplete',
      'Equipment needs delivering to site',
      'Team needs coordinating across locations',
      'Client information needs finalizing'
    ]
  }
};

/**
 * Generate an Outcome Case for a lead
 *
 * This is the primary function—it creates the canonical diagnosis
 * that all other intelligence layers use.
 */
export async function generateOutcomeCase(
  businessId: string,
  businessName: string,
  industry: string,
  discoverySignals: string[],
  qualificationSignals: string[],
  conversationActivity?: {
    email_sent_at?: string;
    opened_count?: number;
    clicked_count?: number;
    replied?: boolean;
    relationship_state?: string;
  }
): Promise<OutcomeCase> {

  // Get industry pattern
  const pattern = OUTCOME_PATTERNS[industry.toLowerCase().replace(/\s+/g, '-')] ||
                  OUTCOME_PATTERNS['removals']; // fallback to removals pattern

  // Derive desired outcome
  const desired = deriveDesiredOutcome(industry, pattern);

  // Derive blocked outcome
  const blocked = deriveBlockedOutcome(industry, pattern);

  // Derive operational cause
  const cause = deriveOperationalCause(
    industry,
    pattern,
    discoverySignals,
    qualificationSignals
  );

  // Derive logistics friction
  const friction = deriveLogisticsFriction(industry, pattern, cause);

  // Calculate confidence
  const confidence = calculateConfidence(
    cause,
    discoverySignals,
    qualificationSignals,
    conversationActivity
  );

  // Determine relevance (only high/medium if logistics is truly involved)
  const relevance = determineRelevance(confidence, friction);

  // Determine relationship state
  const state = conversationActivity?.relationship_state ||
                (conversationActivity?.replied ? 'replied' :
                 conversationActivity?.clicked_count ? 'hot' :
                 conversationActivity?.opened_count ? 'warm' :
                 conversationActivity?.email_sent_at ? 'cold' : 'cold');

  // Recommend next action
  const action = recommendAction(relevance, state, blocked, cause);

  return {
    business_id: businessId,
    business_name: businessName,
    industry,
    desired_outcome: desired,
    blocked_outcome: blocked,
    operational_cause: cause,
    logistics_friction: friction,
    saint_story_relevance: relevance,
    confidence,
    relationship_state: state as any,
    next_action: action,
    generated_at: new Date().toISOString(),
    signals_used: [...discoverySignals, ...qualificationSignals]
  };
}

/**
 * Derive the desired outcome for this business
 * Industry-specific, grounded in real business goals
 */
function deriveDesiredOutcome(industry: string, pattern: any): string {
  return pattern.desired;
}

/**
 * Derive what's currently blocking that outcome
 * Industry-specific, grounded in real operational failures
 */
function deriveBlockedOutcome(industry: string, pattern: any): string {
  return pattern.blocked;
}

/**
 * Derive the operational cause of the blockage
 *
 * This is where diagnosis happens.
 * We pick the most likely cause based on the signals we see.
 */
function deriveOperationalCause(
  industry: string,
  pattern: any,
  discoverySignals: string[],
  qualificationSignals: string[]
): string {
  // Combine all signals
  const allSignals = [...discoverySignals, ...qualificationSignals].join(' ').toLowerCase();

  // Score each possible cause against the signals
  const causes = pattern.causes || [];

  let bestCause = causes[0];
  let bestScore = 0;

  for (const cause of causes) {
    const causeLower = cause.toLowerCase();

    // Count keyword matches
    const keywords = causeLower.split(/\s+/);
    let score = 0;

    for (const keyword of keywords) {
      if (allSignals.includes(keyword)) {
        score += 1;
      }
    }

    // If we found strong signal match, use it
    if (score > bestScore) {
      bestScore = score;
      bestCause = cause;
    }
  }

  // If no strong signal, use the first cause as baseline
  return bestCause;
}

/**
 * Derive the logistics friction causing the operational failure
 *
 * This is critical: it connects the operational cause to Saint & Story's solution.
 * Without clear logistics friction, there's no relevance.
 */
function deriveLogisticsFriction(
  industry: string,
  pattern: any,
  operationalCause: string
): string {
  const frictions = pattern.friction || [];

  // Try to find a friction that matches the cause
  const causeLower = operationalCause.toLowerCase();

  for (const friction of frictions) {
    // Simple heuristic: if key words overlap, it's a match
    const frictionLower = friction.toLowerCase();
    const causeWords = causeLower.split(/\s+/);

    for (const word of causeWords) {
      if (word.length > 3 && frictionLower.includes(word)) {
        return friction;
      }
    }
  }

  // Fallback: use first friction
  return frictions[0] || 'Movement of items or information to required location';
}

/**
 * Calculate confidence that this diagnosis is accurate
 *
 * Confidence is based on:
 * - How strong are the discovery signals?
 * - How strong are the qualification signals?
 * - What does conversation activity tell us?
 */
function calculateConfidence(
  operationalCause: string,
  discoverySignals: string[],
  qualificationSignals: string[],
  conversationActivity?: any
): number {
  let confidence = 40; // baseline

  // Strong discovery signals increase confidence
  if (discoverySignals.length >= 3) {
    confidence += 15;
  } else if (discoverySignals.length >= 1) {
    confidence += 8;
  }

  // Strong qualification signals increase confidence
  if (qualificationSignals.length >= 3) {
    confidence += 15;
  } else if (qualificationSignals.length >= 1) {
    confidence += 8;
  }

  // Conversation activity provides strong signal
  if (conversationActivity) {
    if (conversationActivity.replied) {
      confidence += 20; // They engaged enough to reply
    } else if (conversationActivity.clicked_count && conversationActivity.clicked_count > 1) {
      confidence += 15; // Multiple clicks show real interest
    } else if (conversationActivity.opened_count && conversationActivity.opened_count > 2) {
      confidence += 10; // Multiple opens show some interest
    }
  }

  return Math.min(confidence, 100); // cap at 100
}

/**
 * Determine Saint & Story relevance
 *
 * CRITICAL: Only high/medium if logistics friction is genuinely involved.
 * This prevents false positives and ensures we only reach out when we can help.
 */
function determineRelevance(confidence: number, logisticsFriction: string): 'high' | 'medium' | 'low' | 'none' {
  // If friction is unclear, it's low relevance
  if (!logisticsFriction || logisticsFriction.length < 10) {
    return 'low';
  }

  // Confidence determines relevance level
  if (confidence >= 80) {
    return 'high';
  } else if (confidence >= 60) {
    return 'medium';
  } else if (confidence >= 40) {
    return 'low';
  } else {
    return 'none';
  }
}

/**
 * Recommend next action
 *
 * Action depends on:
 * - Relevance (only act if high/medium)
 * - Relationship state (already contacted vs not)
 * - What's being blocked
 */
function recommendAction(
  relevance: string,
  state: string,
  blockedOutcome: string,
  operationalCause: string
): string {
  if (relevance === 'none' || relevance === 'low') {
    return 'Hold. Insufficient logistics signal.';
  }

  if (state === 'replied') {
    return 'Compare notes on the logistics blocker.';
  }

  if (state === 'hot' || state === 'clicked') {
    return 'Follow up. Reference the specific friction point.';
  }

  if (state === 'warm' || state === 'opened') {
    return 'Send follow-up emphasizing the commercial consequence.';
  }

  if (state === 'cold' || state === 'cold') {
    return 'Initial outreach. Mirror their situation.';
  }

  return 'Compare notes.';
}

/**
 * Helper: Get outcome case from a lead object
 * Wrapper function for convenience
 */
export async function generateOutcomeCaseFromLead(lead: any): Promise<OutcomeCase> {
  const discoverySignals = lead.discovery_signals || [];
  const qualificationSignals = lead.qualification_signals || [];

  return generateOutcomeCase(
    lead.id,
    lead.business_name,
    lead.business_category || lead.industry,
    discoverySignals,
    qualificationSignals,
    {
      email_sent_at: lead.email_sent_at,
      opened_count: lead.email_opened_count || 0,
      clicked_count: lead.email_clicked_count || 0,
      replied: lead.email_replied,
      relationship_state: lead.status
    }
  );
}
