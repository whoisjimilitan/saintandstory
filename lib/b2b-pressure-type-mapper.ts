/**
 * PRESSURE TYPE MAPPER
 *
 * Maps categories to pressure types
 * Provides email context for each pressure type
 */

export function mapCategoryToPressureType(category: string): string {
  const categoryMap: Record<string, string> = {
    'removals': 'service-quality-inconsistency',
    'moving': 'time-critical-movement',
    'logistics': 'capacity-overflow',
    'cleaning': 'service-quality-inconsistency',
    'pharmacy': 'capacity-overflow',
    'healthcare': 'delivery-reliability',
    'real-estate': 'service-quality-inconsistency',
    'estate-agents': 'service-quality-inconsistency',
  };

  return categoryMap[category.toLowerCase()] || 'service-quality-inconsistency';
}

export interface PressureEmailContext {
  pressure_type: string;
  category: string;
  location?: string;
  recognition_angle: string;
  burden_statement: string;
  proof_pattern: string;
  follow_up_template: string;
}

export function getPressureEmailContext(
  pressure_type: string,
  category: string,
  location?: string | null
): PressureEmailContext {
  const contexts: Record<string, PressureEmailContext> = {
    'service-quality-inconsistency': {
      pressure_type: 'service-quality-inconsistency',
      category,
      location: location || undefined,
      recognition_angle: 'Star rating variance across locations',
      burden_statement: "You're managing quality variance personally across locations",
      proof_pattern: 'Multi-location consistency case study',
      follow_up_template: 'Share specific locations and their ratings',
    },
    'time-critical-movement': {
      pressure_type: 'time-critical-movement',
      category,
      location: location || undefined,
      recognition_angle: 'Urgent deadline detected',
      burden_statement: "You need systems operational before your move, not after",
      proof_pattern: 'Fast implementation case study',
      follow_up_template: 'Confirm exact timeline and current readiness',
    },
    'capacity-overflow': {
      pressure_type: 'capacity-overflow',
      category,
      location: location || undefined,
      recognition_angle: 'Demand exceeds capacity',
      burden_statement: 'Your processes aren\'t scaling with your growth',
      proof_pattern: 'Automation case study with growth metrics',
      follow_up_template: 'Clarify current volume and growth projections',
    },
    'geographic-service-gaps': {
      pressure_type: 'geographic-service-gaps',
      category,
      location: location || undefined,
      recognition_angle: 'Unserved geographic demand',
      burden_statement: 'You have demand outside your service area',
      proof_pattern: 'Geographic expansion case study',
      follow_up_template: 'Confirm service area limitations and target expansion zones',
    },
    'customer-acquisition-friction': {
      pressure_type: 'customer-acquisition-friction',
      category,
      location: location || undefined,
      recognition_angle: 'Lead generation gap',
      burden_statement: 'Getting leads is inconsistent and time-consuming',
      proof_pattern: 'Lead generation improvement case study',
      follow_up_template: 'Share current lead sources and target volume',
    },
    'customer-churn': {
      pressure_type: 'customer-churn',
      category,
      location: location || undefined,
      recognition_angle: 'Above-average churn rate',
      burden_statement: 'One-time customers aren\'t becoming repeat clients',
      proof_pattern: 'Retention improvement case study',
      follow_up_template: 'Discuss current churn patterns and retention challenges',
    },
    'delivery-reliability': {
      pressure_type: 'delivery-reliability',
      category,
      location: location || undefined,
      recognition_angle: 'On-time delivery below 90%',
      burden_statement: 'Unreliable delivery is damaging trust',
      proof_pattern: 'Reliability improvement case study',
      follow_up_template: 'Share current delivery performance metrics',
    },
    'appointment-scheduling-friction': {
      pressure_type: 'appointment-scheduling-friction',
      category,
      location: location || undefined,
      recognition_angle: 'Scheduling bottleneck detected',
      burden_statement: 'Scheduling is manual and time-consuming',
      proof_pattern: 'Scheduling automation case study',
      follow_up_template: 'Clarify current scheduling challenges and volume',
    },
    'communication-breakdown': {
      pressure_type: 'communication-breakdown',
      category,
      location: location || undefined,
      recognition_angle: 'Communication failures logged',
      burden_statement: 'Information is falling through the cracks',
      proof_pattern: 'Communication system improvement case study',
      follow_up_template: 'Discuss specific communication failure patterns',
    },
  };

  return contexts[pressure_type] || contexts['service-quality-inconsistency'];
}
