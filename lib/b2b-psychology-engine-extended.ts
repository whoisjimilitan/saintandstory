/**
 * PSYCHOLOGY ENGINE EXTENDED
 *
 * Generates psychology emails for all 9 pressure types
 * Each type has unique recognition, relief, proof, and validation
 * Uses pressure type playbook to customize output
 */

import { getPressureType, getAllPressureTypes } from './pressure-types/pressure-type-schema';

export interface PsychologyEmailOutput {
  prospect_id: string;
  prospect_name: string;
  pressure_type: string;
  email_subject: string;
  recognition: string;
  relief: string;
  trust: string;
  action: string;
  email_body: string;
  brief_page_url: string;
  brief_page_headline: string;
}

/**
 * Generate psychology email for prospect based on their pressure type
 */
export async function generatePsychologyEmailByType(input: {
  prospect_id: string;
  prospect_name: string;
  company_name: string;
  pressure_type: string;
  observations: string;
  context_variables?: Record<string, any>;
}): Promise<PsychologyEmailOutput> {
  const playbook = getPressureType(input.pressure_type);

  if (!playbook) {
    throw new Error(`Pressure type not found: ${input.pressure_type}`);
  }

  // RECOGNITION: Specific observation from playbook
  const recognition = `${input.observations} — ${playbook.recognition.signals[0]}`;

  // RELIEF: Named burden from playbook
  const relief = playbook.relief.burden_description;

  // TRUST: Proof pattern customized to pressure type
  const trust = `We've worked with similar companies in your sector. ${playbook.proof_pattern.outcome_example}`;

  // ACTION: Validation question specific to pressure type
  const action = playbook.validation_question.primary;

  // EMAIL BODY: Assembled with tone from playbook
  const email_body = `Hi ${input.prospect_name},

${recognition}

That's a real challenge. Here's why: ${relief}

How do we know? ${trust}

So here's the question: ${action}

Let's talk.`;

  // EMAIL SUBJECT: Tailored to pressure type
  const subject_map = {
    'service-quality-inconsistency': `${input.prospect_name}: Consistent quality across all your locations`,
    'time-critical-movement': `${input.prospect_name}: Making your ${input.observations.includes('75') ? '75' : 'deadline'}-day deadline work`,
    'capacity-overflow': `${input.prospect_name}: Serving more clients without hiring more staff`,
    'geographic-service-gaps': `${input.prospect_name}: Expanding beyond your current service area`,
    'customer-acquisition-friction': `${input.prospect_name}: Getting more leads consistently`,
    'customer-churn': `${input.prospect_name}: Turning one-time customers into repeat clients`,
    'delivery-reliability': `${input.prospect_name}: Improving your on-time delivery`,
    'appointment-scheduling-friction': `${input.prospect_name}: Scheduling without the bottleneck`,
    'communication-breakdown': `${input.prospect_name}: Information flowing instead of falling through cracks`,
  };

  return {
    prospect_id: input.prospect_id,
    prospect_name: input.prospect_name,
    pressure_type: input.pressure_type,
    email_subject: subject_map[input.pressure_type] || `${input.prospect_name}: Solution for ${playbook.name}`,
    recognition,
    relief,
    trust,
    action,
    email_body,
    brief_page_url: `/brief/${input.pressure_type}?prospect=${input.prospect_id}`,
    brief_page_headline: playbook.brief_page.headline,
  };
}

/**
 * Generate all psychology emails for a batch of prospects with auto-detected types
 */
export async function generatePsychologyEmailBatch(prospects: Array<{
  prospect_id: string;
  prospect_name: string;
  company_name: string;
  pressure_type: string;
  observations: string;
}>): Promise<PsychologyEmailOutput[]> {
  return Promise.all(
    prospects.map((p) =>
      generatePsychologyEmailByType({
        prospect_id: p.prospect_id,
        prospect_name: p.prospect_name,
        company_name: p.company_name,
        pressure_type: p.pressure_type,
        observations: p.observations,
      })
    )
  );
}

/**
 * Validate psychology email meets RRAT standards for this pressure type
 */
export async function validatePsychologyEmailByType(
  email: PsychologyEmailOutput,
  pressure_type: string
): Promise<{ pass: boolean; score: number; reason: string }> {
  const playbook = getPressureType(pressure_type);
  if (!playbook) return { pass: false, score: 0, reason: 'Pressure type not found' };

  let score = 0;

  // Check recognition is specific to their pressure
  if (email.recognition.includes(playbook.recognition.signals[0])) score += 2;

  // Check relief matches playbook
  if (email.relief === playbook.relief.burden_description) score += 2;

  // Check trust uses proof pattern from playbook
  if (email.trust.includes('worked with similar')) score += 2;

  // Check action is their validation question
  if (email.action === playbook.validation_question.primary) score += 2;

  // Check no corporate language
  const corporateWords = ['leverage', 'empower', 'optimize', 'synergy', 'paradigm'];
  const hasCorporate = corporateWords.some((w) => email.email_body.toLowerCase().includes(w));
  if (!hasCorporate) score += 2;

  const pass = score >= 8;

  return {
    pass,
    score,
    reason: pass
      ? `Valid psychology email for ${playbook.name}`
      : `Email needs revision for ${playbook.name} (score: ${score}/10)`,
  };
}

/**
 * Generate all 9 pressure type examples
 */
export async function generateAllPressureTypeExamples(): Promise<PsychologyEmailOutput[]> {
  const examples = [
    {
      prospect_id: 'haart-001',
      prospect_name: 'haart',
      company_name: 'haart Leeds',
      pressure_type: 'service-quality-inconsistency',
      observations: 'Your best branch 4.8★, newest branch 3.2★',
    },
    {
      prospect_id: 'cornerstone-001',
      prospect_name: 'Cornerstone',
      company_name: 'Cornerstone Logistics',
      pressure_type: 'time-critical-movement',
      observations: 'Warehouse moving in 75 days, standard process takes 16 weeks',
    },
    {
      prospect_id: 'westpoint-001',
      prospect_name: 'Westpoint Pharmacy',
      company_name: 'Westpoint',
      pressure_type: 'capacity-overflow',
      observations: 'Can handle 250 scripts/day, demand is 400+',
    },
    {
      prospect_id: 'pharmacy-geo-001',
      prospect_name: 'LocalPharm',
      company_name: 'LocalPharm',
      pressure_type: 'geographic-service-gaps',
      observations: 'Only serve 3-mile radius, customers 5+ miles away unserved',
    },
    {
      prospect_id: 'estate-acq-001',
      prospect_name: 'GreenFields',
      company_name: 'GreenFields Estate Agents',
      pressure_type: 'customer-acquisition-friction',
      observations: 'Getting 3 seller leads/week, need 8-10',
    },
    {
      prospect_id: 'removals-churn-001',
      prospect_name: 'MoveRight',
      company_name: 'MoveRight Removals',
      pressure_type: 'customer-churn',
      observations: '40% customers don\'t return after first job',
    },
    {
      prospect_id: 'logistics-reliable-001',
      prospect_name: 'FastDelivery',
      company_name: 'FastDelivery Logistics',
      pressure_type: 'delivery-reliability',
      observations: '80% on-time delivery, 20% delayed, complaints growing',
    },
    {
      prospect_id: 'pharmacy-scheduling-001',
      prospect_name: 'QuickPharm',
      company_name: 'QuickPharm',
      pressure_type: 'appointment-scheduling-friction',
      observations: 'Scheduling takes 45 min, 10% no-shows',
    },
    {
      prospect_id: 'removals-comm-001',
      prospect_name: 'ProMove',
      company_name: 'ProMove Removals',
      pressure_type: 'communication-breakdown',
      observations: 'Quotes lost in email, customer confusion, repeat calls',
    },
  ];

  return generatePsychologyEmailBatch(examples);
}
