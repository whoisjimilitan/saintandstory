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
        "Court deadlines don't negotiate. If documents don't arrive, hearings stall. Entire cases hinge on timing.",
      solution:
        "We collect and deliver court documents the same day. Proof of delivery included. No excuses.",
    },
    "Signed Legal Contracts": {
      description:
        "Once signatures are on the page, counterparties expect the document to arrive that day. Delays create friction and suspicion.",
      solution: "We move signed contracts between offices same-day. Both parties get confirmation when it arrives.",
    },
    "Property Completion Documents": {
      description:
        "Completion day is orchestrated down to the minute. Keys, documents, funds — everything moves at once. One delay derails the whole transaction.",
      solution:
        "We handle completion-day movements. Driver confirms arrival in minutes. You close on time.",
    },
  },

  "estate agent": {
    "Property Completion Keys": {
      description:
        "Completion days move fast. Keys, contracts, funds — all on the same day. A missed window can kill a sale.",
      solution:
        "We collect and deliver all completion documents and keys same-day. Real-time updates. Confirmed delivery within 15 minutes.",
    },
    "Urgent Valuation Documents": {
      description: "Buyers want valuations immediately. If the valuation report doesn't reach them today, they'll find another agent.",
      solution: "Same-day valuation delivery. Your clients get feedback immediately. That's how you win viewings.",
    },
    "Mortgage & Contract Documents": {
      description:
        "During a transaction, documents move constantly between offices and clients. Every day something's in transit. Every delay kills momentum.",
      solution: "Fixed price movements. Same-day delivery. Your transaction keeps moving forward.",
    },
  },

  construction: {
    "Emergency Site Materials": {
      description:
        "A critical component doesn't arrive and your crew stands idle. Costs spiral. Other jobs slip. One delayed delivery cascades into lost days.",
      solution:
        "We collect and deliver site materials same-day. You stay on schedule. Your crew keeps working.",
    },
    "Revised Specifications": {
      description:
        "Site changes happen. New drawings and specs need to reach the crew immediately or they're working from old plans.",
      solution: "Updated specs delivered same-day. Crew gets the changes before the morning shift.",
    },
    "Safety Certificates": {
      description:
        "Inspection windows are tight. Certificate doesn't arrive before inspection time and you fail. That's a costly rework.",
      solution: "We ensure safety certificates reach the inspector before the deadline. Compliance met. Project moves on.",
    },
  },

  medical: {
    "Prescription & Medication Transfers": {
      description:
        "Patient emergencies don't wait. Medication transfers between hospitals or clinics need to happen now, not tomorrow.",
      solution:
        "Same-day emergency medication transfers with full tracking and chain-of-custody. Patient care continues without gaps.",
    },
    "Medical Specimens": {
      description: "Specimens degrade. Every hour without movement reduces test accuracy. Delays mean retests, delays, costs.",
      solution:
        "Time-sensitive specimen movement with proper handling and documentation. Results ready on time.",
    },
    "Medical Records": {
      description: "Patient transfers require records to arrive same-day or treatment continuity breaks. Information gaps = patient risk.",
      solution: "Records delivered same-day. No information gaps. Continuity of care maintained.",
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
