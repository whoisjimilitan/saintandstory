/**
 * FOLLOW-UP SEQUENCE GENERATOR
 *
 * Generates follow-ups using DIFFERENT pressure angles
 * Each follow-up escalates via different mechanism
 * Never repeats same pressure type twice
 */

export type FollowUpNumber = 1 | 2 | 3 | 4;

export interface FollowUpOutput {
  prospect_id: string;
  prospect_name: string;
  followup_number: FollowUpNumber;
  trigger_gate: number; // Which gate stalled to trigger this
  email_subject: string;
  email_body: string;
  original_pressure_type: string;
  alternative_pressure_type: string; // Different angle
  delay_hours: number;
  type: string; // 'angle_change' | 'scarcity' | 'call' | 'offer'
}

/**
 * Generate follow-up sequence based on which gate stalled
 * Each follow-up uses different approach
 */
export async function generateFollowUp(input: {
  prospect_id: string;
  prospect_name: string;
  followup_number: FollowUpNumber;
  original_pressure_type: string;
  observations: string;
  category: string;
}): Promise<FollowUpOutput> {
  // Map pressure types to alternatives for follow-up 1
  const pressure_alternatives: { [key: string]: string } = {
    'Service Quality Inconsistency': 'Operational Independence',
    'Time-Critical Movement': 'Capacity Efficiency',
    'Capacity Overflow': 'Process Automation',
    'Geographic Service Gaps': 'Market Expansion',
    'Customer Acquisition Friction': 'Lead Quality',
    'Customer Churn': 'Retention Strategy',
    'Delivery Reliability': 'Risk Mitigation',
    'Appointment Scheduling Friction': 'Time Management',
    'Communication Breakdown': 'Visibility',
  };

  const alt_pressure = pressure_alternatives[input.original_pressure_type] || 'Process Optimization';

  // Follow-up 1: Different pressure angle (if Gate 2 failed)
  if (input.followup_number === 1) {
    return {
      prospect_id: input.prospect_id,
      prospect_name: input.prospect_name,
      followup_number: 1,
      trigger_gate: 2,
      email_subject: `${input.prospect_name}: Different angle on ${input.category}`,
      email_body: `Hi ${input.prospect_name},

Earlier we talked about ${input.original_pressure_type.toLowerCase()}.

But I think the bigger opportunity might be ${alt_pressure.toLowerCase()}.

What if instead of managing the problem, your system made the problem irrelevant?

That's actually how we approach this—we build systems that work independently, so you're not personally managing anything.

Worth a conversation?`,
      original_pressure_type: input.original_pressure_type,
      alternative_pressure_type: alt_pressure,
      delay_hours: 72,
      type: 'angle_change',
    };
  }

  // Follow-up 2: Scarcity + Urgency (if Gate 3 failed)
  if (input.followup_number === 2) {
    return {
      prospect_id: input.prospect_id,
      prospect_name: input.prospect_name,
      followup_number: 2,
      trigger_gate: 3,
      email_subject: `Implementation timeline for ${input.prospect_name}`,
      email_body: `Hi ${input.prospect_name},

We're currently supporting 5 other ${input.category} businesses in your market.

Our implementation process requires a 4-week discovery window to tune everything to your specific setup.

Next available slot: July 15-19
After that: August 5-9

When would work for you?`,
      original_pressure_type: input.original_pressure_type,
      alternative_pressure_type: 'Scarcity + Timing',
      delay_hours: 24,
      type: 'scarcity',
    };
  }

  // Follow-up 3: Escalation to operator call (if Gate 5 failed)
  if (input.followup_number === 3) {
    return {
      prospect_id: input.prospect_id,
      prospect_name: input.prospect_name,
      followup_number: 3,
      trigger_gate: 5,
      email_subject: `Let's talk directly - ${input.prospect_name}`,
      email_body: `Hi ${input.prospect_name},

I know we've sent a few emails. Rather than keep doing that, let me understand what you're thinking.

Is it:
- Budget concerns?
- Timing questions?
- How it actually works?
- Something else?

Let's have a real conversation. I'm calling Tuesday at 10am. If that doesn't work, shoot back a time.

Looking forward to clearing this up.`,
      original_pressure_type: input.original_pressure_type,
      alternative_pressure_type: 'Direct Conversation',
      delay_hours: 48,
      type: 'call',
    };
  }

  // Follow-up 4: Offer + Economics (if Gate 5 still stalled)
  if (input.followup_number === 4) {
    return {
      prospect_id: input.prospect_id,
      prospect_name: input.prospect_name,
      followup_number: 4,
      trigger_gate: 5,
      email_subject: `Here's exactly what this looks like - ${input.prospect_name}`,
      email_body: `Hi ${input.prospect_name},

Here's what you're looking at:

Investment: $2,500/month (implementation: $1,500)
Typical ROI: Your team saves 12-16 hours/week = $4,800/month back in your pocket
Payback: Under 1 month

Start date: We can begin within 5 business days of agreement.

Does this pencil out for you? Or is there a different objection we haven't addressed?

Let's solve this.`,
      original_pressure_type: input.original_pressure_type,
      alternative_pressure_type: 'Economics + Timeline',
      delay_hours: 72,
      type: 'offer',
    };
  }

  throw new Error(`Invalid follow-up number: ${input.followup_number}`);
}

/**
 * Determine which follow-up should be generated based on gate status
 */
export function getFollowUpTrigger(gate_status: {
  stalled: boolean;
  stalled_at_gate?: number;
  days_in_current_gate: number;
}): FollowUpNumber | null {
  if (!gate_status.stalled) return null;

  // Gate 2 stalled (72h, email opened but page not visited)
  if (gate_status.stalled_at_gate === 2) return 1;

  // Gate 3 stalled (24h, page not visited after opening)
  if (gate_status.stalled_at_gate === 3) return 2;

  // Gate 5 stalled (48h, conversation not advancing)
  // After 48h → follow-up 3 (operator call)
  // After another 48h (96h total) → follow-up 4 (offer)
  if (gate_status.stalled_at_gate === 5) {
    if (gate_status.days_in_current_gate > 4) return 4; // Over 4 days = second escalation
    return 3;
  }

  return null;
}
