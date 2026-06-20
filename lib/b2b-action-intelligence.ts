/**
 * ACTION INTELLIGENCE ENGINE
 *
 * Calculates impact score for each action
 * Sorts by impact (not just urgency)
 * Predicts expected outcome for each action
 */

export interface ActionItem {
  prospect_id: string;
  prospect_name: string;
  pressure_type: string;
  action_type: 'brief' | 'followup_1' | 'followup_2' | 'followup_3' | 'followup_4' | 'call' | 'offer';
  current_gate: number;
  days_in_gate: number;
}

export interface ActionIntelligence {
  prospect_id: string;
  prospect_name: string;
  pressure_type: string;
  action: string;
  impact_score: number; // 0-100
  expected_outcome: string; // "35% likely to convert", "+12% reply rate"
  success_rate_pct: number; // Historical success for this action on this type
  time_estimate_min: number;
  urgency: 'high' | 'medium' | 'low';
  priority_rank: number;
  reasoning: string;
}

/**
 * Calculate impact score for an action
 */
export function calculateImpactScore(
  action: ActionItem,
  pressure_type_stats: {
    avg_conversion_rate: number;
    angle_effectiveness?: Record<string, number>;
  }
): number {
  let score = 0;

  // Impact factors:

  // 1. Gate progression impact (highest impact = earlier gate)
  // Responding to brief (Gate 4) = highest impact
  // Following up at gate 2-3 = medium impact
  // Following up at gate 5+ = lower impact
  const gateImpact = {
    4: 40, // Prospect replied, respond now = highest
    2: 25, // First follow-up = medium
    3: 20, // Second follow-up = medium
    5: 15, // Late follow-up = lower
    1: 5, // Email just sent = no action yet
  };
  score += gateImpact[action.current_gate as keyof typeof gateImpact] || 10;

  // 2. Success rate for this action on this pressure type
  // If angle has 40% success vs 30% baseline, that's +10% impact
  const actionSuccessRate = getActionSuccessRate(action.action_type, action.pressure_type);
  const baseline = 0.15; // Assume 15% baseline
  const uplift = (actionSuccessRate - baseline) * 100;
  score += Math.min(uplift * 2, 30); // Cap at 30 points

  // 3. Stall duration (longer stalled = more urgent, but with diminishing returns)
  // 72h+ stalled = high impact, 48h = medium, <24h = low
  if (action.days_in_gate > 3) score += 10;
  else if (action.days_in_gate > 2) score += 5;

  // 4. Position in funnel (earlier = higher priority)
  // Cold prospects (gate 1-2) = easier to influence
  // Hot prospects (gate 5+) = highest conversion value
  if (action.current_gate >= 4) score += 15; // Late stage = high value

  // Cap at 100
  score = Math.min(score, 100);

  return score;
}

/**
 * Get historical success rate for action on pressure type
 */
function getActionSuccessRate(action_type: string, pressure_type: string): number {
  // In production, lookup from historical data
  // For now, return typical rates

  const rates: Record<string, Record<string, number>> = {
    'brief': {
      'service-quality-inconsistency': 0.42,
      'time-critical-movement': 0.47,
      'capacity-overflow': 0.38,
      'default': 0.40,
    },
    'followup_1': {
      'service-quality-inconsistency': 0.35,
      'time-critical-movement': 0.42,
      'capacity-overflow': 0.38,
      'default': 0.38,
    },
    'followup_2': {
      'service-quality-inconsistency': 0.25,
      'time-critical-movement': 0.35,
      'capacity-overflow': 0.32,
      'default': 0.30,
    },
    'followup_3': {
      'service-quality-inconsistency': 0.15,
      'time-critical-movement': 0.20,
      'capacity-overflow': 0.18,
      'default': 0.18,
    },
    'default': { 'default': 0.15 },
  };

  return rates[action_type]?.[pressure_type] || rates[action_type]?.['default'] || rates['default']['default'];
}

/**
 * Generate action intelligence for an action
 */
export function generateActionIntelligence(
  action: ActionItem,
  impact_score: number,
  pressure_type_stats: { name: string; avg_conversion: number }
): ActionIntelligence {
  const success_rate = getActionSuccessRate(action.action_type, action.pressure_type);

  // Map action to description
  const actionMap = {
    'brief': 'Send operator brief',
    'followup_1': 'Send Follow-up 1 (different angle)',
    'followup_2': 'Send Follow-up 2 (scarcity)',
    'followup_3': 'Operator phone call',
    'followup_4': 'Send offer + economics',
    'call': 'Schedule call',
    'offer': 'Send offer',
  };

  const timeMap = {
    'brief': 15,
    'followup_1': 5,
    'followup_2': 5,
    'followup_3': 20,
    'followup_4': 5,
    'call': 20,
    'offer': 5,
  };

  // Calculate expected outcome
  const expectedUpside = success_rate * 100;
  const expected_outcome = `${expectedUpside.toFixed(0)}% success rate`;

  // Determine urgency
  let urgency: 'high' | 'medium' | 'low' = 'low';
  if (impact_score > 70) urgency = 'high';
  else if (impact_score > 40) urgency = 'medium';

  return {
    prospect_id: action.prospect_id,
    prospect_name: action.prospect_name,
    pressure_type: action.pressure_type,
    action: actionMap[action.action_type as keyof typeof actionMap],
    impact_score,
    expected_outcome,
    success_rate_pct: success_rate * 100,
    time_estimate_min: timeMap[action.action_type as keyof typeof timeMap],
    urgency,
    priority_rank: 0, // Will be set when sorted
    reasoning: getReasoning(action.action_type, action.current_gate, impact_score),
  };
}

function getReasoning(action_type: string, current_gate: number, impact_score: number): string {
  if (current_gate === 4 && action_type === 'brief') {
    return 'Prospect replied - respond now while engaged';
  }
  if (current_gate === 2) {
    return 'First follow-up window - highest impact point';
  }
  if (impact_score > 70) {
    return 'High-impact action - focus energy here';
  }
  return 'Routine follow-up action';
}

/**
 * Sort actions by impact score
 */
export function sortActionsByImpact(actions: ActionIntelligence[]): ActionIntelligence[] {
  return actions
    .sort((a, b) => b.impact_score - a.impact_score)
    .map((action, index) => ({
      ...action,
      priority_rank: index + 1,
    }));
}

/**
 * Generate action intelligence for batch of actions
 */
export function generateActionIntelligenceBatch(
  actions: ActionItem[],
  pressure_type_stats: Record<string, { name: string; avg_conversion: number }>
): ActionIntelligence[] {
  const intelligence = actions
    .map((action) => {
      const impact_score = calculateImpactScore(action, {
        avg_conversion_rate: pressure_type_stats[action.pressure_type]?.avg_conversion || 0.18,
      });
      return generateActionIntelligence(action, impact_score, pressure_type_stats[action.pressure_type] || { name: action.pressure_type, avg_conversion: 0.18 });
    });

  return sortActionsByImpact(intelligence);
}
