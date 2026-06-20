/**
 * PRESSURE TYPE SCHEMA
 *
 * Defines the structure for all 9 pressure types
 * Each pressure type contains:
 * - Recognition signals (what we observe)
 * - Relief message (operational burden named)
 * - Alternative angles (different approaches)
 * - Proof pattern (case study structure)
 * - Validation question (what we ask)
 * - Brief page copy (personalized to this pressure)
 * - Follow-up sequence (4 different escalations)
 */

export interface FollowUpAngle {
  number: 1 | 2 | 3 | 4;
  name: string;
  description: string;
  trigger_gate: number;
  type: 'angle_change' | 'scarcity' | 'call' | 'offer';
  delay_hours: number;
  template: string; // Email body template
}

export interface PressureTypePlaybook {
  id: string;
  name: string;
  category: string; // estate-agents, pharmacy, removals, etc.
  description: string;

  // RECOGNITION: How do we identify this pressure?
  recognition: {
    signals: string[]; // 3-5 observable signals
    example_company: string;
    example_situation: string;
  };

  // RELIEF: What operational burden are we naming?
  relief: {
    burden_description: string; // "You're managing quality personally"
    emotional_cost: string; // "It's consuming your mental energy"
  };

  // TONE & VOICE
  tone: {
    guidance: string; // How should operator sound?
    words_to_avoid: string[];
    emphasis: string; // "Methodical, specific, honest"
  };

  // ANGLES: Different approaches to this pressure
  angles: {
    primary: {
      name: string;
      description: string;
      position_statement: string; // "We build systems that work independently"
    };
    alternatives: {
      name: string;
      description: string;
      position_statement: string;
    }[];
  };

  // PROOF: How do we build credibility?
  proof_pattern: {
    structure: string; // "Company X had Y problem, now Z result"
    metrics_to_include: string[];
    outcome_example: string;
  };

  // VALIDATION: What do we ask?
  validation_question: {
    primary: string; // "Does this match your experience?"
    followup: string; // "What's the one thing holding you back?"
  };

  // BRIEF PAGE: Personalized copy for this pressure
  brief_page: {
    headline: string; // "We help multi-location businesses achieve consistent quality"
    subheadline: string;
    section_1: string; // The Problem (specific to pressure)
    section_2: string; // Our Methodology (specific to pressure)
    section_3: string; // Proof (specific case study)
    cta: string; // Call to action (specific to pressure)
  };

  // FOLLOW-UPS: 4 different angles/escalations
  follow_ups: FollowUpAngle[];

  // OPERATOR CONTEXT: What data should we ask for?
  context_variables: {
    field_name: string;
    label: string;
    type: 'text' | 'number' | 'percentage' | 'currency' | 'date';
    importance: 'critical' | 'important' | 'useful';
  }[];

  // EFFECTIVENESS TRACKING: How do we measure this type?
  tracking: {
    metric_1: string; // "Open rate by angle"
    metric_2: string; // "Reply rate by angle"
    metric_3: string; // "Conversion rate"
  };
}

/**
 * Empty playbook template for creating new pressure types
 */
export function createEmptyPlaybook(id: string): PressureTypePlaybook {
  return {
    id,
    name: '',
    category: '',
    description: '',

    recognition: {
      signals: [],
      example_company: '',
      example_situation: '',
    },

    relief: {
      burden_description: '',
      emotional_cost: '',
    },

    tone: {
      guidance: '',
      words_to_avoid: [],
      emphasis: '',
    },

    angles: {
      primary: {
        name: '',
        description: '',
        position_statement: '',
      },
      alternatives: [],
    },

    proof_pattern: {
      structure: '',
      metrics_to_include: [],
      outcome_example: '',
    },

    validation_question: {
      primary: '',
      followup: '',
    },

    brief_page: {
      headline: '',
      subheadline: '',
      section_1: '',
      section_2: '',
      section_3: '',
      cta: '',
    },

    follow_ups: [],

    context_variables: [],

    tracking: {
      metric_1: '',
      metric_2: '',
      metric_3: '',
    },
  };
}

/**
 * Register all pressure types
 */
export const PRESSURE_TYPES: Record<string, PressureTypePlaybook> = {};

export function registerPressureType(playbook: PressureTypePlaybook) {
  PRESSURE_TYPES[playbook.id] = playbook;
}

export function getPressureType(id: string): PressureTypePlaybook | undefined {
  return PRESSURE_TYPES[id];
}

export function getAllPressureTypes(): PressureTypePlaybook[] {
  return Object.values(PRESSURE_TYPES);
}

export function getPressureTypesByCategory(
  category: string
): PressureTypePlaybook[] {
  return Object.values(PRESSURE_TYPES).filter((p) => p.category === category);
}
