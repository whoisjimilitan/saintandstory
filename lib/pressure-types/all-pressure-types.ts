/**
 * ALL 9 PRESSURE TYPES - Complete Playbooks
 *
 * Each pressure type defines:
 * - How we recognize it
 * - What burden we're addressing
 * - How we talk about it
 * - Proof patterns specific to it
 * - Brief page copy customized to it
 * - Follow-ups with different angles
 */

import { PressureTypePlaybook, registerPressureType } from './pressure-type-schema';

// ─────────────────────────────────────────────────────────────────────────
// PRESSURE TYPE 1: Service Quality Inconsistency (Already working)
// ─────────────────────────────────────────────────────────────────────────

export const serviceQualityInconsistency: PressureTypePlaybook = {
  id: 'service-quality-inconsistency',
  name: 'Service Quality Inconsistency',
  category: 'estate-agents',
  description: 'Multi-location businesses with variance in review ratings and customer satisfaction',

  recognition: {
    signals: [
      'Best branch 4.8★, newest branch 3.2★',
      'High ratings on established locations, low on new ones',
      'Customer complaints about inconsistent experience',
    ],
    example_company: 'haart',
    example_situation: 'Leeds branch: 4.8★ vs Alwoodley branch: 3.2★. Same brand, different experience.',
  },

  relief: {
    burden_description: 'You\'re managing quality variance personally across locations',
    emotional_cost: 'It\'s consuming your energy and damaging brand reputation',
  },

  tone: {
    guidance: 'Specific, methodical, understanding of multi-location complexity',
    words_to_avoid: ['leverage', 'empower', 'optimize', 'synergy'],
    emphasis: 'Show HOW you make quality consistent, not WHAT the tool is',
  },

  angles: {
    primary: {
      name: 'Service Quality Consistency',
      description: 'Build systems where quality is consistent across all locations',
      position_statement: 'We build systems that work independently, so quality stays high everywhere',
    },
    alternatives: [
      {
        name: 'Operational Independence',
        description: 'Make each location self-sufficient without central oversight',
        position_statement: 'What if each location had the systems to deliver consistently on their own?',
      },
      {
        name: 'Reputation at Scale',
        description: 'Manage brand consistency across growing locations',
        position_statement: 'We help you grow without diluting what made you great',
      },
      {
        name: 'Staff Consistency',
        description: 'Train and support teams so they deliver consistent experience',
        position_statement: 'Better systems → better trained teams → consistent quality',
      },
    ],
  },

  proof_pattern: {
    structure: 'Company X had 4.5★ best location / 2.8★ worst, now all 4.2★+',
    metrics_to_include: ['Star rating variance', 'Customer satisfaction score', 'Complaint rate'],
    outcome_example: 'Estate agent had 1.7★ gap between best and worst branch. After 6 months: 0.4★ gap. Reviews improved 18%.',
  },

  validation_question: {
    primary: 'Does this variance across locations match what you\'re experiencing?',
    followup: 'What would it be worth to have consistent quality across all your locations?',
  },

  brief_page: {
    headline: 'We help multi-location businesses achieve consistent quality',
    subheadline: 'Stop managing quality inconsistency. Start building systems that deliver consistently.',
    section_1: 'The Problem: Your best branch is 1.5★ ahead of your newest. Same brand. Different experience. Your energy is consumed managing the difference.',
    section_2: 'Our Methodology: We map your best practices from top locations, codify them into systems, then deploy across all locations. Not new processes—your proven processes, systematized.',
    section_3: 'Proof: Estate agent network grew from 3 to 12 locations while maintaining 4.3★ average. Variance dropped from 1.8★ to 0.3★ in 8 months.',
    cta: 'Let\'s talk about making quality consistent everywhere.',
  },

  follow_ups: [
    {
      number: 1,
      name: 'Operational Independence Angle',
      description: 'Different angle: Move from central management to local systems',
      trigger_gate: 2,
      type: 'angle_change',
      delay_hours: 72,
      template: 'What if each location had the systems to deliver great service independently, without you personally managing everything?',
    },
    {
      number: 2,
      name: 'Scarcity + Timeline',
      description: 'Scarcity: Limited implementation slots this quarter',
      trigger_gate: 3,
      type: 'scarcity',
      delay_hours: 24,
      template: 'We\'re currently supporting 5 other multi-location businesses in your market. Implementation capacity fills fast. Next window: July 15-19.',
    },
    {
      number: 3,
      name: 'Operator Phone Call',
      description: 'Escalation: Operator calls to understand real concerns',
      trigger_gate: 5,
      type: 'call',
      delay_hours: 48,
      template: 'Rather than keep emailing, let\'s have a real conversation. I\'m calling Tuesday at 10am to understand what\'s holding you back.',
    },
    {
      number: 4,
      name: 'Offer + Economics',
      description: 'Final: Price and ROI',
      trigger_gate: 5,
      type: 'offer',
      delay_hours: 72,
      template: 'Investment: $2,500/month (implementation: $1,500). ROI: Your team saves 12-16h/week managing quality. Payback: Under 1 month.',
    },
  ],

  context_variables: [
    {
      field_name: 'location_count',
      label: 'Number of locations',
      type: 'number',
      importance: 'critical',
    },
    {
      field_name: 'star_rating_best',
      label: 'Best location star rating',
      type: 'number',
      importance: 'critical',
    },
    {
      field_name: 'star_rating_worst',
      label: 'Worst location star rating',
      type: 'number',
      importance: 'critical',
    },
    {
      field_name: 'complaint_rate',
      label: 'Complaint rate (%)',
      type: 'percentage',
      importance: 'important',
    },
  ],

  tracking: {
    metric_1: 'Open rate by angle',
    metric_2: 'Reply rate (Quality vs Independence vs Reputation)',
    metric_3: 'Conversion to standing order',
  },
};

// ─────────────────────────────────────────────────────────────────────────
// PRESSURE TYPE 2: Time-Critical Movement
// ─────────────────────────────────────────────────────────────────────────

export const timeCriticalMovement: PressureTypePlaybook = {
  id: 'time-critical-movement',
  name: 'Time-Critical Movement',
  category: 'removals',
  description: 'Deadline-driven operational need (relocation, expansion, renovation)',

  recognition: {
    signals: [
      'Facility moving in 60-90 days',
      'Expansion requires new location/capacity',
      'Renovation/refurbishment has hard deadline',
    ],
    example_company: 'Cornerstone Logistics',
    example_situation: 'Moving warehouse in 12 weeks. Current process takes 16 weeks. Gap problem.',
  },

  relief: {
    burden_description: 'You have a fixed deadline and traditional methods won\'t meet it',
    emotional_cost: 'Deadline anxiety, business continuity risk, lost revenue during transition',
  },

  tone: {
    guidance: 'Urgent but calm, solution-focused, action-oriented',
    words_to_avoid: ['eventually', 'consider', 'might', 'explore'],
    emphasis: 'Show WHEN and HOW implementation happens. Operator wants proof you can deliver on their timeline.',
  },

  angles: {
    primary: {
      name: 'Timeline Feasibility',
      description: 'Prove you can deliver within their deadline',
      position_statement: 'We\'ve successfully managed 47 moves with 60-90 day deadlines.',
    },
    alternatives: [
      {
        name: 'Risk Mitigation',
        description: 'Reduce business continuity risk during transition',
        position_statement: 'We help you move without losing revenue or customers during transition',
      },
      {
        name: 'Coordination Complexity',
        description: 'Manage multi-location coordination needed for moves',
        position_statement: 'We take the coordination chaos off your plate',
      },
      {
        name: 'Speed to ROI',
        description: 'Start earning value immediately after move',
        position_statement: 'Your new operation runs efficiently from day one',
      },
    ],
  },

  proof_pattern: {
    structure: 'Company X had 75-day deadline, we delivered in 68 days, no revenue loss',
    metrics_to_include: ['Days to implement', 'Revenue during transition', 'On-time completion rate'],
    outcome_example: 'Removals company: 90-day moving deadline. Implemented system in 72 days. Zero disruption during transition.',
  },

  validation_question: {
    primary: 'When does your move happen?',
    followup: 'What happens to your business if traditional implementation won\'t fit that timeline?',
  },

  brief_page: {
    headline: 'We deliver operational moves on deadline',
    subheadline: 'For time-critical operations, we cut implementation from 16 weeks to 6-8.',
    section_1: 'The Problem: Your facility moves in 90 days. Standard implementation takes 16 weeks. The gap means risk—revenue loss, service disruption, inefficiency.',
    section_2: 'Our Methodology: Rapid onboarding, parallel setup, hard-stop timeline. We\'ve done this 47 times. We know what can be parallelized and what needs sequence.',
    section_3: 'Proof: Logistics company relocating warehouse in 75 days. Implemented in 60 days. New facility running efficiently day one. Zero revenue loss.',
    cta: 'Let\'s talk about making your move without the risk.',
  },

  follow_ups: [
    {
      number: 1,
      name: 'Risk Mitigation Angle',
      description: 'Different angle: Business continuity during transition',
      trigger_gate: 2,
      type: 'angle_change',
      delay_hours: 72,
      template: 'Beyond just meeting your deadline—we minimize business disruption during the transition so you don\'t lose customers or revenue.',
    },
    {
      number: 2,
      name: 'Scarcity + Timeline',
      description: 'Scarcity: Implementation slots for Q3 filling',
      trigger_gate: 3,
      type: 'scarcity',
      delay_hours: 24,
      template: 'Q3 implementation slots are filling. For your 90-day deadline, we\'d need to start by July 1. After that: Q4 only.',
    },
    {
      number: 3,
      name: 'Operator Phone Call',
      description: 'Escalation: Walk through timeline concerns',
      trigger_gate: 5,
      type: 'call',
      delay_hours: 48,
      template: 'Your deadline is real. Let\'s talk through exactly how we\'d hit it. I\'m calling Tuesday to walk through the 8-week implementation plan.',
    },
    {
      number: 4,
      name: 'Offer + Timeline',
      description: 'Final: Price + proof of on-time delivery',
      trigger_gate: 5,
      type: 'offer',
      delay_hours: 72,
      template: 'Investment: $3,200/month. Guarantee: On-time completion or we refund implementation costs. For your 90-day move, we need to start July 1.',
    },
  ],

  context_variables: [
    {
      field_name: 'move_date',
      label: 'Move/deadline date',
      type: 'date',
      importance: 'critical',
    },
    {
      field_name: 'days_to_deadline',
      label: 'Days until deadline',
      type: 'number',
      importance: 'critical',
    },
    {
      field_name: 'revenue_at_risk',
      label: 'Estimated revenue at risk during transition',
      type: 'currency',
      importance: 'important',
    },
  ],

  tracking: {
    metric_1: 'Open rate by angle',
    metric_2: 'Reply rate (Timeline vs Risk vs ROI)',
    metric_3: 'Conversion to contract',
  },
};

// ─────────────────────────────────────────────────────────────────────────
// PRESSURE TYPE 3-9: Placeholder Definitions
// (Full definitions follow same pattern as above)
// ─────────────────────────────────────────────────────────────────────────

export const capacityOverflow: PressureTypePlaybook = {
  id: 'capacity-overflow',
  name: 'Capacity Overflow',
  category: 'pharmacy',
  description: 'System at max capacity, rejecting work',
  recognition: {
    signals: ['Can\'t accept more clients', 'Waiting list growing', 'Turning away revenue'],
    example_company: 'Westpoint Pharmacy',
    example_situation: 'Pharmacy rejecting 15-20 prescriptions/day due to processing bottleneck',
  },
  relief: {
    burden_description: 'You\'re leaving money on the table because you can\'t serve demand',
    emotional_cost: 'Frustration of turning away customers, lost revenue, staff overwhelmed',
  },
  tone: {
    guidance: 'Empathetic to capacity frustration, solution-focused on expansion',
    words_to_avoid: ['maybe', 'try', 'hopefully'],
    emphasis: 'Show how they can serve more without proportional cost increase',
  },
  angles: {
    primary: {
      name: 'Capacity Expansion',
      description: 'Serve more customers without proportional cost increase',
      position_statement: 'We help you serve 2-3x more without hiring proportionally',
    },
    alternatives: [
      {
        name: 'Process Automation',
        description: 'Automate bottlenecks to free up capacity',
        position_statement: 'Your team can do more with existing people',
      },
      {
        name: 'Revenue Growth Without Chaos',
        description: 'Grow revenue while keeping operations stable',
        position_statement: 'More customers, less chaos',
      },
    ],
  },
  proof_pattern: {
    structure: 'Pharmacy handling 200 scripts/day, now handles 500 with same team',
    metrics_to_include: ['Scripts/day before', 'Scripts/day after', 'Team size (no change)'],
    outcome_example: 'Pharmacy: 250 scripts/day max capacity. After implementation: 620/day. Same 3 pharmacists.',
  },
  validation_question: {
    primary: 'How much revenue are you currently leaving on the table?',
    followup: 'What\'s holding you back from serving that demand?',
  },
  brief_page: {
    headline: 'Pharmacy capacity solutions that don\'t require hiring more staff',
    subheadline: 'Serve 2-3x more scripts without proportional cost increase.',
    section_1: 'The Problem: You can handle 250 scripts/day. Demand is 400+. You\'re leaving money on the table. Your team is overwhelmed.',
    section_2: 'Our Methodology: We identify your bottlenecks (usually data entry, verification, coordination). We systematize and partially automate. Your team focuses on clinical work, not admin.',
    section_3: 'Proof: Pharmacy grew from 250 to 620 scripts/day in 4 months. Same 3 pharmacists. Staff satisfaction improved.',
    cta: 'Let\'s talk about capturing the demand you\'re currently turning away.',
  },
  follow_ups: [],
  context_variables: [],
  tracking: {
    metric_1: 'Open rate',
    metric_2: 'Reply rate',
    metric_3: 'Conversion rate',
  },
};

// Register all pressure types
registerPressureType(serviceQualityInconsistency);
registerPressureType(timeCriticalMovement);
registerPressureType(capacityOverflow);

// TODO: Register remaining 6 pressure types (Geographic Service Gaps, Customer Acquisition Friction, etc.)

export const allPressureTypesLoaded = [
  serviceQualityInconsistency,
  timeCriticalMovement,
  capacityOverflow,
];
