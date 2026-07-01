/**
 * BUSINESS PAIN & PROMISE MAP - TRUST-FIRST EDITION
 *
 * Maps business types to trust-first observations that demonstrate
 * understanding without claiming or asserting.
 *
 * Structure:
 * - observation: "One thing I've learnt is that [X] rarely fail because of [Y].
 *                 It's usually when something outside your control gets in the way."
 * - promise: Our guarantee (constant across all categories)
 * - Tier-based consequences for lead prioritization
 *
 * Consequence Hierarchy:
 * TIER 1 (ULTRA_MOTIVATED): Legal/Compliance/Health - Highest urgency + highest LTV
 * TIER 2 (HIGHLY_MOTIVATED): Premium/High-Value - High urgency + premium pricing
 * TIER 3 (MOTIVATED): Operational - Standard urgency + standard pricing
 */

export type ConsequenceLevel = "ULTRA_MOTIVATED" | "HIGHLY_MOTIVATED" | "MOTIVATED";
export type ConsequenceTier = 1 | 2 | 3;

export interface BusinessPainPromise {
  pain: string; // Trust-first observation (demonstrates understanding)
  promise: string; // Our guarantee (constant across all)
  consequenceLevel: ConsequenceLevel;
  tier: ConsequenceTier;
  subjectLineVariation: string;
  description?: string;
  closingQuestion?: string; // Genuine curiosity question (mostly constant)
}

export const BUSINESS_PAIN_PROMISE_MAP: Record<string, BusinessPainPromise> = {
  // ═══════════════════════════════════════════════════════════════════
  // TIER 1: ULTRA MOTIVATED (Legal/Compliance/Health)
  // ═══════════════════════════════════════════════════════════════════

  court: {
    pain: "One thing I've learnt is that court cases rarely stall because of the legal arguments themselves. It's usually when service deadlines get missed outside your control.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "One deadline",
    description: "Court services have highest consequence: litigation failure",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  bailiff: {
    pain: "One thing I've learnt is that bailiff services rarely fail because of the legal documentation. It's usually when service deadlines slip outside your control.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Service timing",
    description: "Bailiffs need guaranteed service by court deadline",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  process_server: {
    pain: "One thing I've learnt is that prosecutions rarely stall because of the process itself. It's usually when service deadlines become impossible to meet.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "One deadline. Case stalls.",
    description: "Process servers have zero tolerance for missed deliveries",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  insurance_company: {
    pain: "One thing I've learnt is that regulatory compliance rarely fails because of the policies themselves. It's usually when deadline requirements slip outside your control.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Regulatory deadline",
    description: "Insurance companies face regulatory fines for missed deadlines",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  insurance_broker: {
    pain: "One thing I've learnt is that client relationships rarely break because of the insurance itself. It's usually when policy delivery gets delayed outside your control.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Policy timing",
    description: "Insurance brokers need guaranteed delivery for regulatory compliance",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  hospital: {
    pain: "One thing I've learnt is that surgery schedules rarely slip because of the procedure itself. It's usually when supplies or equipment arrive late.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Surgery scheduled",
    description: "Hospitals cannot tolerate surgical supply delays",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  surgical_supplies: {
    pain: "One thing I've learnt is that operating theatres rarely sit idle because of the supply chain planning. It's usually when critical deliveries get delayed.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "OR timing",
    description: "Surgical supply companies serve hospitals with zero tolerance",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  medical_devices: {
    pain: "One thing I've learnt is that procedures rarely get postponed because of the equipment itself. It's usually when delivery timelines get disrupted.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Surgery scheduled. Can't be late.",
    description: "Medical device companies have highest stakes",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  clinic: {
    pain: "One thing I've learnt is that patient care rarely suffers because of the treatment plan. It's usually when urgent supplies don't arrive on time.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Patient care timing",
    description: "Clinics need guaranteed urgent delivery for patient care",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  pharmacy: {
    pain: "One thing I've learnt is that patient relief rarely gets delayed because of the medicine itself. It's usually when urgent prescriptions get held up in delivery.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Relief timing",
    description: "Pharmacies face patient impact for delayed prescriptions",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  legal: {
    pain: "One thing I've learnt is that cases rarely collapse because of the legal strategy. It's usually when document delivery gets in the way.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Document deadline",
    description: "Legal firms face case dismissal for missed deadlines",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  lawyer: {
    pain: "One thing I've learnt is that filings rarely miss deadlines because of the legal work itself. It's usually when courier logistics slip outside your control.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Brief timing",
    description: "Lawyers face compliance violations for missed filings",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  solicitor: {
    pain: "One thing I've learnt is that filing deadlines rarely become stressful because of the legal work itself. It's usually when something outside your control gets in the way.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Brief timing",
    description: "Solicitors lose clients over missed deadlines",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  attorney: {
    pain: "One thing I've learnt is that cases rarely stall because of the legal preparation. It's usually when document delivery becomes unreliable.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Case timeline",
    description: "Attorneys face case dismissal for missed deadlines",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  // ═══════════════════════════════════════════════════════════════════
  // TIER 2: HIGHLY MOTIVATED (Premium/High-Value)
  // ═══════════════════════════════════════════════════════════════════

  film_production: {
    pain: "One thing I've learnt is that film shoots rarely run over budget because of the creative work. It's usually when equipment doesn't arrive on set when it's needed.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLineVariation: "Equipment delay",
    description: "Film production has extreme daily costs for delays",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  tv_production: {
    pain: "One thing I've learnt is that shooting schedules rarely slip because of the production planning. It's usually when equipment delivery gets delayed.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLineVariation: "Equipment delay",
    description: "TV production budgets cannot absorb delivery delays",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  university_research: {
    pain: "One thing I've learnt is that research rarely fails because of the methodology. It's usually when time-sensitive samples don't arrive on schedule.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLineVariation: "Sample timing",
    description: "Universities cannot repeat experiments; samples are irreplaceable",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  auction_house: {
    pain: "One thing I've learnt is that auction sales rarely fall through because of the lots themselves. It's usually when delivery windows get missed.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLineVariation: "Delivery timing",
    description: "Auction houses lose entire transactions over missed deliveries",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  jewelry_store: {
    pain: "One thing I've learnt is that customer satisfaction rarely drops because of the jewelry itself. It's usually when delivery timing becomes unpredictable.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLineVariation: "Customer timing",
    description: "Jewelry stores need guaranteed secure delivery for high-value items",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  luxury_goods: {
    pain: "One thing I've learnt is that premium clients rarely disappear because of the products. It's usually when delivery expectations don't get met.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLineVariation: "Delivery timing",
    description: "Luxury goods retailers have premium pricing; cannot lose clients",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  fashion_design: {
    pain: "One thing I've learnt is that orders rarely fall through because of the designs themselves. It's usually when sample deliveries get delayed past buyer meetings.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLineVariation: "Fashion sample delivery",
    description: "Fashion designers lose orders over missed sample deadlines",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  // ═══════════════════════════════════════════════════════════════════
  // TIER 3: MOTIVATED (Operational)
  // ═══════════════════════════════════════════════════════════════════

  estate_agent: {
    pain: "One thing I've learnt is that property sales rarely collapse because of the properties themselves. It's usually when completion documents don't arrive on time.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Completion timing",
    description: "Estate agents have standard operational delays",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  realtor: {
    pain: "One thing I've learnt is that deals rarely die because of the negotiation. It's usually when closing documents get delayed.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Closing window",
    description: "Realtors handle standard real estate deadlines",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  lettings: {
    pain: "One thing I've learnt is that tenancies rarely fail to start because of the agreement itself. It's usually when paperwork delivery gets held up.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Tenancy timing",
    description: "Lettings companies handle standard tenancy paperwork",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  property: {
    pain: "One thing I've learnt is that transactions rarely stall because of the legal work. It's usually when document delivery becomes unpredictable.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Transaction timing",
    description: "Property companies handle standard transaction deadlines",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  accounting: {
    pain: "One thing I've learnt is that tax season rarely causes problems because of the accounting itself. It's usually when filing deadlines slip outside your control.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Tax deadline",
    description: "Accountants handle standard tax season deadlines",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  accountant: {
    pain: "One thing I've learnt is that tax deadlines rarely stress you because of the accounting work itself. It's usually when document delivery gets delayed.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Tax deadline",
    description: "Accountants handle standard tax filing deadlines",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  tax: {
    pain: "One thing I've learnt is that audit risk rarely increases because of the filings themselves. It's usually when deadline deliveries become unreliable.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Tax deadline",
    description: "Tax services handle standard tax compliance",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  bookkeeper: {
    pain: "One thing I've learnt is that month-end rarely becomes chaotic because of the data itself. It's usually when document delivery holds up financial reporting.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your month-end deadlines",
    description: "Bookkeepers handle standard monthly deadlines",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  construction: {
    pain: "One thing I've learnt is that project delays rarely happen because of the planning itself. It's usually when material delivery gets disrupted.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Project timing",
    description: "Construction has operational delays",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  builder: {
    pain: "One thing I've learnt is that build timelines rarely blow out because of the construction itself. It's usually when material delivery becomes unpredictable.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Build timing",
    description: "Builders handle standard material delivery schedules",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  contractor: {
    pain: "One thing I've learnt is that site work rarely stalls because of the labour itself. It's usually when supply delivery gets delayed.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Site timing",
    description: "Contractors manage standard supply chain delays",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  plumber: {
    pain: "One thing I've learnt is that appointment schedules rarely break because of the plumbing itself. It's usually when supply pickups get held up.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Job timing",
    description: "Plumbers handle standard job schedules",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  electrician: {
    pain: "One thing I've learnt is that installation dates rarely slip because of the electrical work itself. It's usually when equipment delivery gets delayed.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Install timing",
    description: "Electricians handle standard equipment schedules",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  architecture: {
    pain: "One thing I've learnt is that construction rarely stalls because of the plans themselves. It's usually when drawing delivery gets held up.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Timeline timing",
    description: "Architects handle standard plan delivery schedules",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  architect: {
    pain: "One thing I've learnt is that projects rarely get delayed because of the drawings themselves. It's usually when delivery timelines slip outside your control.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Delivery timing",
    description: "Architects manage standard drawing deadlines",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  engineering: {
    pain: "One thing I've learnt is that builds rarely fall behind because of the specs themselves. It's usually when specification delivery gets delayed.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Delivery timing",
    description: "Engineers handle standard specification delivery",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  ecommerce: {
    pain: "One thing I've learnt is that customer satisfaction rarely drops because of the products. It's usually when delivery speed becomes unpredictable.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Delivery timing",
    description: "E-commerce handles standard order fulfillment",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  retailer: {
    pain: "One thing I've learnt is that inventory rarely runs out because of the ordering itself. It's usually when delivery windows get missed.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Delivery timing",
    description: "Retailers manage standard inventory delivery",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  retail: {
    pain: "One thing I've learnt is that peak season rarely becomes chaotic because of the products themselves. It's usually when inventory delivery gets disrupted.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your inventory",
    description: "Retail businesses handle seasonal inventory peaks",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  florist: {
    pain: "One thing I've learnt is that weddings rarely look wrong because of the flowers themselves. It's usually when delivery timing slips on the day.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your event deliveries",
    description: "Florists have tight event-day windows",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  event_planning: {
    pain: "One thing I've learnt is that events rarely fall apart because of the planning itself. It's usually when supplier deliveries get delayed.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your event deliveries",
    description: "Event planners depend on precise timing",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  hospitality: {
    pain: "One thing I've learnt is that service quality rarely suffers because of the food itself. It's usually when supply delivery becomes unreliable.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your service",
    description: "Hospitality venues depend on consistent supply timing",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  restaurant: {
    pain: "One thing I've learnt is that service quality rarely fails because of the food itself. It's usually when critical supplies show up after doors open.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your service",
    description: "Restaurants cannot open without ingredients",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  cafe: {
    pain: "One thing I've learnt is that morning service rarely fails because of the coffee itself. It's usually when stock delivery doesn't arrive before opening.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your opening",
    description: "Cafes need stock before opening",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
};

export function detectBusinessCategory(businessName: string): string {
  let cleanName = businessName
    .toLowerCase()
    .replace(/\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/gi, "")
    .replace(/\b\d{5}(?:-\d{4})?\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  for (const key of Object.keys(BUSINESS_PAIN_PROMISE_MAP)) {
    if (cleanName.includes(key.replace(/_/g, " "))) {
      return key;
    }
  }

  for (const key of Object.keys(BUSINESS_PAIN_PROMISE_MAP)) {
    const keywords = key.split("_");
    if (keywords.some((kw) => cleanName.includes(kw))) {
      return key;
    }
  }

  return "courier";
}

export function detectBusinessType(businessName: string): BusinessPainPromise {
  let cleanName = businessName
    .toLowerCase()
    .replace(/\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/gi, "")
    .replace(/\b\d{5}(?:-\d{4})?\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  for (const [key, value] of Object.entries(BUSINESS_PAIN_PROMISE_MAP)) {
    if (cleanName.includes(key.replace(/_/g, " "))) {
      return value;
    }
  }

  for (const [key, value] of Object.entries(BUSINESS_PAIN_PROMISE_MAP)) {
    const keywords = key.split("_");
    if (keywords.some((kw) => cleanName.includes(kw))) {
      return value;
    }
  }

  return {
    pain: "One thing I've learnt is that deliveries rarely fail because of the work itself. It's usually when something outside your control gets in the way.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Delivery timing",
    description: "Unknown business type - using default tier 3",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  };
}

export function getConsequenceTier(businessName: string) {
  return detectBusinessType(businessName).tier;
}

export function getConsequenceLevel(businessName: string) {
  return detectBusinessType(businessName).consequenceLevel;
}

export function getTier1Businesses(): string[] {
  return Object.entries(BUSINESS_PAIN_PROMISE_MAP)
    .filter(([_, value]) => value.tier === 1)
    .map(([key, _]) => key);
}

export function getTier2Businesses(): string[] {
  return Object.entries(BUSINESS_PAIN_PROMISE_MAP)
    .filter(([_, value]) => value.tier === 2)
    .map(([key, _]) => key);
}

export function getTier3Businesses(): string[] {
  return Object.entries(BUSINESS_PAIN_PROMISE_MAP)
    .filter(([_, value]) => value.tier === 3)
    .map(([key, _]) => key);
}

export function isTier1(businessName: string): boolean {
  return getConsequenceTier(businessName) === 1;
}
