/**
 * PROBLEMS_MAP — Canonical source for all problem types in the Operator system.
 *
 * Each problem is keyed by specific operational need, NOT business category.
 * Psychology is embedded in narrative_framing for use by the Claude engine.
 */

export type ProblemTier = 1 | 2 | 3;

export interface ProblemType {
  tier: ProblemTier;
  brief_opening: string;
  inverse_incentive: string;
  loss_aversion_daily: string;
  authority_proof: string;
  solution_points: string[];
  pre_populated_reply: string;
  psychology_keywords: string[];
  urgency_multiplier: number;
}

export const PROBLEMS_MAP: Record<string, ProblemType> = {
  court_deadline_delivery: {
    tier: 1,
    brief_opening: "Your court deadlines shouldn't create anxiety.",
    inverse_incentive: "Missed court filings get dismissed. Cases collapse. Clients leave.",
    loss_aversion_daily: "3-4 hours managing courier logistics. Constant stress about delivery failures.",
    authority_proof: "We know how one missed deadline creates cascade failures across your caseload.",
    solution_points: [
      "Same-day pickup from your offices",
      "Real-time tracking to court",
      "Backup driver on standby"
    ],
    pre_populated_reply: "Let's talk about this.",
    psychology_keywords: ["deadline", "court", "filing", "legal", "dispatch"],
    urgency_multiplier: 1.0
  },

  hospital_supply_delivery: {
    tier: 1,
    brief_opening: "Urgent supplies shouldn't create patient delays.",
    inverse_incentive: "Surgery delays compound. Patient outcomes worsen. Staff morale drops.",
    loss_aversion_daily: "2-3 hours coordinating supply runs. Risk of care delays on every shift.",
    authority_proof: "We understand how supply logistics directly impact patient care pathways.",
    solution_points: [
      "Same-day urgent supply collection",
      "Medical-trained drivers",
      "Temperature-controlled delivery"
    ],
    pre_populated_reply: "Let's talk about this.",
    psychology_keywords: ["hospital", "surgery", "urgent", "supply", "delivery"],
    urgency_multiplier: 1.0
  },

  pharmacy_prescription_delivery: {
    tier: 1,
    brief_opening: "Prescription delays affect patient health.",
    inverse_incentive: "Delayed prescriptions create patient complaints. Reputation damage. Regulatory scrutiny.",
    loss_aversion_daily: "Multiple couriers per day. Inconsistent timing. Patient frustration.",
    authority_proof: "We know how reliable delivery becomes part of your pharmacy's reputation.",
    solution_points: [
      "Same-day prescription collection and delivery",
      "Compliant handling procedures",
      "Scheduled or ad-hoc service"
    ],
    pre_populated_reply: "Let's talk about this.",
    psychology_keywords: ["pharmacy", "prescription", "delivery", "medication", "patient"],
    urgency_multiplier: 1.0
  },

  construction_material_delivery: {
    tier: 2,
    brief_opening: "Site delays compound costs daily.",
    inverse_incentive: "Materials arrive late. Crews sit idle. Project timelines slip.",
    loss_aversion_daily: "Hundreds per day in crew idle time. Project reputation at risk.",
    authority_proof: "We understand how material delivery is the backbone of construction scheduling.",
    solution_points: [
      "Same-day material pickup and delivery",
      "Heavy load capability",
      "Site coordination with your team"
    ],
    pre_populated_reply: "Let's talk about this.",
    psychology_keywords: ["construction", "material", "site", "delivery", "schedule"],
    urgency_multiplier: 0.9
  },

  restaurant_supply_delivery: {
    tier: 2,
    brief_opening: "Stock-outs create customer disappointment.",
    inverse_incentive: "Missing ingredients mean cancelled dishes. Customers leave bad reviews. Revenue drops.",
    loss_aversion_daily: "Constant supplier coordination. Risk of running out during service.",
    authority_proof: "We know how reliable supply directly impacts your menu and customer experience.",
    solution_points: [
      "Same-day supplier collections",
      "Regular or ad-hoc service",
      "Early morning delivery windows"
    ],
    pre_populated_reply: "Let's talk about this.",
    psychology_keywords: ["restaurant", "supply", "stock", "delivery", "food"],
    urgency_multiplier: 0.85
  },

  estate_agent_document_delivery: {
    tier: 2,
    brief_opening: "Delayed completions cost real money.",
    inverse_incentive: "Completion dates slip. Buyers get frustrated. Deals fall through.",
    loss_aversion_daily: "Document courier coordination takes time. Completion delays cost thousands.",
    authority_proof: "We understand how document delivery is critical to completion day success.",
    solution_points: [
      "Same-day conveyancing document delivery",
      "Completion day specialist service",
      "Solicitor coordination"
    ],
    pre_populated_reply: "Let's talk about this.",
    psychology_keywords: ["estate", "completion", "document", "solicitor", "delivery"],
    urgency_multiplier: 0.9
  },

  architecture_drawing_delivery: {
    tier: 2,
    brief_opening: "Delayed drawings stall projects.",
    inverse_incentive: "Builders wait for plans. Projects pause. Budgets stretch.",
    loss_aversion_daily: "Coordinating drawing distribution. Risk of versions getting mixed up.",
    authority_proof: "We know how plans and amendments are the lifeblood of project timing.",
    solution_points: [
      "Same-day drawing and amendment delivery",
      "Secure document handling",
      "Site coordination"
    ],
    pre_populated_reply: "Let's talk about this.",
    psychology_keywords: ["architecture", "drawing", "plans", "site", "delivery"],
    urgency_multiplier: 0.85
  },

  film_production_equipment: {
    tier: 2,
    brief_opening: "Equipment delays stop production.",
    inverse_incentive: "Missing gear shuts down shoot. Crew costs accumulate. Schedule slips.",
    loss_aversion_daily: "Last-minute equipment runs. Risk of missing critical gear.",
    authority_proof: "We understand how production timelines depend on equipment being where it needs to be.",
    solution_points: [
      "Same-day equipment collection and delivery",
      "Secure handling for high-value gear",
      "On-location support"
    ],
    pre_populated_reply: "Let's talk about this.",
    psychology_keywords: ["film", "production", "equipment", "shoot", "delivery"],
    urgency_multiplier: 0.9
  },

  accounting_file_delivery: {
    tier: 2,
    brief_opening: "Tax deadline pressure shouldn't involve delivery stress.",
    inverse_incentive: "Missing documents at filing deadline. Penalties. Compliance issues.",
    loss_aversion_daily: "Tax season coordination chaos. Manual file management.",
    authority_proof: "We know how document delivery affects your end-of-year timelines.",
    solution_points: [
      "Same-day document delivery during tax season",
      "Secure handling for confidential files",
      "Deadline-aware scheduling"
    ],
    pre_populated_reply: "Let's talk about this.",
    psychology_keywords: ["accounting", "tax", "deadline", "file", "delivery"],
    urgency_multiplier: 0.95
  },

  retail_stock_delivery: {
    tier: 3,
    brief_opening: "Stock timing affects sales floor readiness.",
    inverse_incentive: "Stock arrives after opening. Display setup takes longer. Shelves look incomplete.",
    loss_aversion_daily: "Early morning coordination. Risk of late arrivals affecting store appearance.",
    authority_proof: "We understand how timely stock delivery supports your store operations.",
    solution_points: [
      "Early morning stock delivery",
      "Multiple pickup locations",
      "Flexible scheduling"
    ],
    pre_populated_reply: "Let's talk about this.",
    psychology_keywords: ["retail", "stock", "delivery", "store", "inventory"],
    urgency_multiplier: 0.7
  },

  beauty_supply_delivery: {
    tier: 3,
    brief_opening: "Product availability drives customer satisfaction.",
    inverse_incentive: "Running out of products creates client disappointment. Revenue lost.",
    loss_aversion_daily: "Supplier coordination takes time. Risk of gaps in product availability.",
    authority_proof: "We know how product delivery supports your client experience.",
    solution_points: [
      "Same-day supplier collections",
      "Regular delivery schedule",
      "Flexible ad-hoc service"
    ],
    pre_populated_reply: "Let's talk about this.",
    psychology_keywords: ["beauty", "supply", "salon", "delivery", "product"],
    urgency_multiplier: 0.75
  },

  veterinary_supply_delivery: {
    tier: 2,
    brief_opening: "Animal care shouldn't be delayed by supply issues.",
    inverse_incentive: "Missing medications or supplies affects patient care. Procedures get postponed.",
    loss_aversion_daily: "Supply coordination across multiple vendors. Risk of care delays.",
    authority_proof: "We understand how supply reliability directly impacts animal health outcomes.",
    solution_points: [
      "Same-day pharmaceutical and supply delivery",
      "Medical-compliant handling",
      "Emergency service available"
    ],
    pre_populated_reply: "Let's talk about this.",
    psychology_keywords: ["veterinary", "animal", "supply", "medication", "delivery"],
    urgency_multiplier: 0.95
  },

  dental_supply_delivery: {
    tier: 2,
    brief_opening: "Delayed supplies affect patient scheduling.",
    inverse_incentive: "Missing materials cancel appointments. Patient goodwill decreases. Revenue drops.",
    loss_aversion_daily: "Daily supply logistics. Risk of running out mid-procedure.",
    authority_proof: "We know how supply delivery impacts your scheduling and patient experience.",
    solution_points: [
      "Same-day lab and supplier collections",
      "Secure compliant delivery",
      "Regular or on-demand service"
    ],
    pre_populated_reply: "Let's talk about this.",
    psychology_keywords: ["dental", "supply", "lab", "delivery", "appointment"],
    urgency_multiplier: 0.9
  },

  legal_document_delivery: {
    tier: 1,
    brief_opening: "Document deadlines shouldn't create legal risk.",
    inverse_incentive: "Missed filing deadlines lose cases. Client claims. Reputation damage.",
    loss_aversion_daily: "Managing multiple court deadlines simultaneously. Constant delivery coordination.",
    authority_proof: "We understand how document delivery is embedded in your legal timeline.",
    solution_points: [
      "Same-day court and solicitor delivery",
      "Court filing service coordination",
      "Deadline-aware tracking"
    ],
    pre_populated_reply: "Let's talk about this.",
    psychology_keywords: ["legal", "court", "deadline", "document", "filing"],
    urgency_multiplier: 1.0
  },

  office_supply_delivery: {
    tier: 3,
    brief_opening: "Running out of essentials creates workflow disruption.",
    inverse_incentive: "Missing supplies interrupt operations. Productivity drops. Team frustration.",
    loss_aversion_daily: "Manual supply ordering and delivery coordination.",
    authority_proof: "We understand how reliable supply supports operational continuity.",
    solution_points: [
      "Regular supply collection from vendors",
      "Same-day emergency restocking",
      "Scheduled delivery windows"
    ],
    pre_populated_reply: "Let's talk about this.",
    psychology_keywords: ["office", "supply", "delivery", "stock", "urgent"],
    urgency_multiplier: 0.65
  },

  art_gallery_artwork_delivery: {
    tier: 2,
    brief_opening: "Delayed artwork affects exhibition timing.",
    inverse_incentive: "Missing pieces delay opening. Insurance issues. Gallery reputation at risk.",
    loss_aversion_daily: "Coordinating multiple artwork pickups. Risk of damage or delay.",
    authority_proof: "We know how secure, timely delivery is essential to exhibition success.",
    solution_points: [
      "Secure artwork collection and delivery",
      "White-glove handling service",
      "Installation coordination"
    ],
    pre_populated_reply: "Let's talk about this.",
    psychology_keywords: ["art", "gallery", "exhibition", "artwork", "delivery"],
    urgency_multiplier: 0.85
  },

  catering_supply_delivery: {
    tier: 2,
    brief_opening: "Event timing depends on supply reliability.",
    inverse_incentive: "Missing catering supplies ruin events. Client relationships damage. Future bookings lost.",
    loss_aversion_daily: "Coordinating multiple supplier pickups. Risk of incomplete orders.",
    authority_proof: "We understand how reliable supply delivery is essential to event success.",
    solution_points: [
      "Same-day catering supply collection",
      "Temperature-controlled transport",
      "Event-day support available"
    ],
    pre_populated_reply: "Let's talk about this.",
    psychology_keywords: ["catering", "event", "supply", "delivery", "food"],
    urgency_multiplier: 0.9
  },

  manufacturing_part_delivery: {
    tier: 2,
    brief_opening: "Production delays compound quickly.",
    inverse_incentive: "Missing parts halt assembly. Production quotas slip. Customer deadlines threatened.",
    loss_aversion_daily: "Multiple supplier coordination. Risk of production stoppages.",
    authority_proof: "We know how parts delivery is critical to manufacturing schedules.",
    solution_points: [
      "Same-day parts collection and delivery",
      "Just-in-time delivery capability",
      "Production floor coordination"
    ],
    pre_populated_reply: "Let's talk about this.",
    psychology_keywords: ["manufacturing", "parts", "production", "delivery", "schedule"],
    urgency_multiplier: 0.95
  }
};

/**
 * Get problem type definition by key.
 * Returns null if not found.
 */
export function getProblemType(key: string): ProblemType | null {
  return PROBLEMS_MAP[key] || null;
}

/**
 * Get all problems of a specific tier.
 */
export function getProblemsByTier(tier: ProblemTier): Array<[string, ProblemType]> {
  return Object.entries(PROBLEMS_MAP).filter(([_, problem]) => problem.tier === tier);
}

/**
 * Extract problem type from confession text.
 * Uses keyword matching against psychology_keywords.
 * Returns matching problem key or null.
 */
export function extractProblemTypeFromConfession(confessionText: string): string | null {
  const lowerText = confessionText.toLowerCase();

  // Find matching problem by keywords
  for (const [problemKey, problem] of Object.entries(PROBLEMS_MAP)) {
    for (const keyword of problem.psychology_keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return problemKey;
      }
    }
  }

  return null;
}
