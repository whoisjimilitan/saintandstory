/**
 * PRESSURE TYPE DETECTOR
 *
 * Auto-detects pressure type from CSV data
 * Analyzes prospect data and assigns most likely pressure type
 * Returns confidence score (operator can override)
 */

export interface DetectionResult {
  pressure_type: string;
  confidence: number; // 0-1
  reasoning: string;
  matched_fields: string[];
}

/**
 * Analyze prospect data and detect pressure type
 */
export async function detectPressureType(prospectData: {
  prospect_name?: string;
  company_name?: string;
  category?: string;
  location_count?: number;
  star_rating_best?: number;
  star_rating_worst?: number;
  move_date?: string;
  days_until_deadline?: number;
  scripts_per_day_capacity?: number;
  scripts_per_day_demand?: number;
  service_radius_miles?: number;
  unserved_customers_miles?: number;
  leads_per_week?: number;
  target_leads_per_week?: number;
  churn_rate?: number;
  industry_churn_rate?: number;
  on_time_delivery_rate?: number;
  scheduling_time_minutes?: number;
  no_show_rate?: number;
  communication_failures_count?: number;
  [key: string]: any;
}): Promise<DetectionResult> {
  const scores: { [key: string]: { score: number; matched_fields: string[] } } = {
    'service-quality-inconsistency': { score: 0, matched_fields: [] },
    'time-critical-movement': { score: 0, matched_fields: [] },
    'capacity-overflow': { score: 0, matched_fields: [] },
    'geographic-service-gaps': { score: 0, matched_fields: [] },
    'customer-acquisition-friction': { score: 0, matched_fields: [] },
    'customer-churn': { score: 0, matched_fields: [] },
    'delivery-reliability': { score: 0, matched_fields: [] },
    'appointment-scheduling-friction': { score: 0, matched_fields: [] },
    'communication-breakdown': { score: 0, matched_fields: [] },
  };

  // SERVICE QUALITY INCONSISTENCY: Star rating variance
  if (prospectData.star_rating_best && prospectData.star_rating_worst) {
    const variance = prospectData.star_rating_best - prospectData.star_rating_worst;
    if (variance > 1.0) {
      scores['service-quality-inconsistency'].score += variance * 25;
      scores['service-quality-inconsistency'].matched_fields.push('star_rating_variance');
    }
  }

  if (prospectData.location_count && prospectData.location_count > 2) {
    scores['service-quality-inconsistency'].score += 15;
    scores['service-quality-inconsistency'].matched_fields.push('multiple_locations');
  }

  // TIME-CRITICAL MOVEMENT: Has deadline
  if (prospectData.days_until_deadline) {
    if (prospectData.days_until_deadline < 120) {
      scores['time-critical-movement'].score += Math.max(50 - prospectData.days_until_deadline * 0.2, 20);
      scores['time-critical-movement'].matched_fields.push('urgent_deadline');
    }
  }

  if (prospectData.move_date) {
    scores['time-critical-movement'].score += 30;
    scores['time-critical-movement'].matched_fields.push('move_date_provided');
  }

  // CAPACITY OVERFLOW: Demand exceeds capacity
  if (
    prospectData.scripts_per_day_capacity &&
    prospectData.scripts_per_day_demand &&
    prospectData.scripts_per_day_demand > prospectData.scripts_per_day_capacity
  ) {
    const overflow_ratio = prospectData.scripts_per_day_demand / prospectData.scripts_per_day_capacity;
    scores['capacity-overflow'].score += overflow_ratio * 40;
    scores['capacity-overflow'].matched_fields.push('demand_exceeds_capacity');
  }

  // GEOGRAPHIC SERVICE GAPS: Limited service area
  if (
    prospectData.service_radius_miles &&
    prospectData.unserved_customers_miles &&
    prospectData.unserved_customers_miles > prospectData.service_radius_miles
  ) {
    scores['geographic-service-gaps'].score += 40;
    scores['geographic-service-gaps'].matched_fields.push('unserved_geographic_demand');
  }

  // CUSTOMER ACQUISITION FRICTION: Gap between actual and target leads
  if (prospectData.leads_per_week && prospectData.target_leads_per_week) {
    const gap = prospectData.target_leads_per_week - prospectData.leads_per_week;
    if (gap > 0) {
      scores['customer-acquisition-friction'].score += Math.min(gap * 15, 50);
      scores['customer-acquisition-friction'].matched_fields.push('lead_generation_gap');
    }
  }

  // CUSTOMER CHURN: High churn vs industry
  if (prospectData.churn_rate && prospectData.industry_churn_rate) {
    if (prospectData.churn_rate > prospectData.industry_churn_rate) {
      const churn_diff = (prospectData.churn_rate - prospectData.industry_churn_rate) * 10;
      scores['customer-churn'].score += Math.min(churn_diff, 50);
      scores['customer-churn'].matched_fields.push('above_average_churn');
    }
  }

  // DELIVERY RELIABILITY: Low on-time rate
  if (prospectData.on_time_delivery_rate) {
    if (prospectData.on_time_delivery_rate < 0.9) {
      scores['delivery-reliability'].score += (0.9 - prospectData.on_time_delivery_rate) * 100;
      scores['delivery-reliability'].matched_fields.push('low_on_time_rate');
    }
  }

  // APPOINTMENT SCHEDULING FRICTION: Long scheduling time
  if (prospectData.scheduling_time_minutes) {
    if (prospectData.scheduling_time_minutes > 30) {
      scores['appointment-scheduling-friction'].score += Math.min((prospectData.scheduling_time_minutes - 30) * 1.5, 50);
      scores['appointment-scheduling-friction'].matched_fields.push('slow_scheduling');
    }
  }

  if (prospectData.no_show_rate && prospectData.no_show_rate > 0.05) {
    scores['appointment-scheduling-friction'].score += prospectData.no_show_rate * 50;
    scores['appointment-scheduling-friction'].matched_fields.push('high_no_show_rate');
  }

  // COMMUNICATION BREAKDOWN: Communication failures logged
  if (prospectData.communication_failures_count && prospectData.communication_failures_count > 0) {
    scores['communication-breakdown'].score += prospectData.communication_failures_count * 20;
    scores['communication-breakdown'].matched_fields.push('communication_failures');
  }

  // Find highest score
  let maxType = 'service-quality-inconsistency';
  let maxScore = 0;

  for (const [type, data] of Object.entries(scores)) {
    if (data.score > maxScore) {
      maxScore = data.score;
      maxType = type;
    }
  }

  // Calculate confidence (0-1)
  // Higher score = higher confidence, cap at 0.95
  const confidence = Math.min(maxScore / 100, 0.95);

  const reasoning_map = {
    'service-quality-inconsistency': 'Star rating variance detected across locations',
    'time-critical-movement': 'Urgent deadline detected in data',
    'capacity-overflow': 'Demand exceeds current capacity significantly',
    'geographic-service-gaps': 'Unserved customers outside service area',
    'customer-acquisition-friction': 'Gap between current and target lead generation',
    'customer-churn': 'Churn rate above industry average',
    'delivery-reliability': 'On-time delivery rate below 90%',
    'appointment-scheduling-friction': 'Scheduling bottleneck detected',
    'communication-breakdown': 'Multiple communication failures logged',
  };

  return {
    pressure_type: maxType,
    confidence,
    reasoning: reasoning_map[maxType] || 'Type detected from data analysis',
    matched_fields: scores[maxType].matched_fields,
  };
}

/**
 * Detect types for batch of prospects
 */
export async function detectPressureTypesBatch(
  prospects: Array<{ prospect_id: string; [key: string]: any }>
): Promise<Array<{ prospect_id: string; detection: DetectionResult }>> {
  return Promise.all(
    prospects.map(async (p) => ({
      prospect_id: p.prospect_id,
      detection: await detectPressureType(p),
    }))
  );
}
