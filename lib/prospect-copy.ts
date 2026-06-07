/**
 * Landing Page Copy Configuration
 *
 * Defines personalized brief descriptions for each industry + movement combination.
 * This system allows copy updates without modifying prospect-pages.ts
 *
 * Structure: industry → movement type → { description, solution }
 */

export interface MovementCopy {
  description: string;
  solution: string;
}

export type IndustryCopyMap = Record<string, Record<string, MovementCopy>>;

export const PROSPECT_PAGE_COPY: IndustryCopyMap = {
  legal: {
    "Court Filing Documents": {
      description:
        "When documents must reach court before a specific deadline, timing becomes critical.",
      solution:
        "Saint & Story provides same-day collection, delivery and proof of delivery.",
    },
    "Signed Legal Contracts": {
      description:
        "When signatures are obtained, counterparties typically expect documents to arrive promptly.",
      solution: "We handle contract transfers the same day they are signed.",
    },
    "Property Completion Documents": {
      description:
        "Completion days often involve keys, signed documents and strict timelines.",
      solution:
        "Saint & Story supports these transfers with real-time updates and driver confirmation.",
    },
  },

  "estate agent": {
    "Property Completion Keys": {
      description:
        "Completion days often involve keys, signed documents and strict timelines.",
      solution:
        "Saint & Story supports completion-day movements with 15-minute driver confirmation and tracking.",
    },
    "Urgent Valuation Documents": {
      description: "When clients need valuations urgently, delays cost viewings and sales.",
      solution: "We deliver valuation documents same-day so clients get immediate feedback.",
    },
    "Mortgage & Contract Documents": {
      description:
        "During transactions, documents are constantly moving between offices and clients.",
      solution: "Fixed price, same-day movement keeps your sales pipeline moving.",
    },
  },

  construction: {
    "Emergency Site Materials": {
      description:
        "When a critical component doesn't arrive and a crew is standing idle, costs mount quickly.",
      solution:
        "Saint & Story provides rapid site rescue deliveries to prevent crew downtime.",
    },
    "Revised Specifications": {
      description:
        "When site changes occur, updated drawings and specifications must reach crews immediately.",
      solution: "We deliver updated specs same-day to keep projects on track.",
    },
    "Safety Certificates": {
      description:
        "Compliance documents often have tight deadlines and inspection windows.",
      solution: "We ensure safety certificates reach inspection sites on deadline.",
    },
  },

  medical: {
    "Prescription & Medication Transfers": {
      description:
        "Patient emergencies require immediate medication transfers between locations.",
      solution:
        "Saint & Story provides same-day emergency medication transfers with tracking.",
    },
    "Medical Specimens": {
      description: "Specimens degrade over time; urgent transfers are critical for test accuracy.",
      solution:
        "We handle time-sensitive specimen movement with chain-of-custody documentation.",
    },
    "Medical Records": {
      description: "Patient transfers and consultations require medical records to arrive quickly.",
      solution: "Same-day record transfers support continuity of care.",
    },
  },
};

/**
 * Get copy for a specific industry + movement combination
 * Falls back to generic copy if specific combination not found
 */
export function getMovementCopy(
  industry: string,
  movementType: string
): MovementCopy {
  const categoryKey = industry.toLowerCase();
  const industryMap = PROSPECT_PAGE_COPY[categoryKey];

  if (industryMap && industryMap[movementType]) {
    return industryMap[movementType];
  }

  // Generic fallback
  return {
    description: "This delivery situation is likely common within your business.",
    solution: "Saint & Story provides same-day delivery with real-time tracking and confirmation.",
  };
}

/**
 * Get all available industries in the copy system
 */
export function getAvailableIndustries(): string[] {
  return Object.keys(PROSPECT_PAGE_COPY);
}

/**
 * Get all movement types for an industry
 */
export function getMovementTypesForIndustry(industry: string): string[] {
  const categoryKey = industry.toLowerCase();
  const industryMap = PROSPECT_PAGE_COPY[categoryKey];
  return industryMap ? Object.keys(industryMap) : [];
}
