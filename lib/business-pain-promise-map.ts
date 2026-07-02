/**
 * BUSINESS PAIN & PROMISE MAP - TRUST-FIRST EDITION
 *
 * Maps business types to trust-first observations that demonstrate
 * understanding without claiming or asserting.
 *
 * Structure:
 * - observation: "One thing I've learnt is that [X] rarely fail because of [Y].
 *                 The real problem is when something outside your control gets in the way."
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

/**
 * Generate industry-specific bridge for credibility
 * Pattern: "Helping [industry] with [their challenge] has taught me that..."
 * Only used if bridge not manually set in BusinessPainPromise
 */
export function generateBridge(businessType: string): string {
  // Map of industry patterns to bridge templates
  const bridgeMap: Record<string, string> = {
    // Legal
    solicitor: "Helping solicitors with time-critical legal deadlines has taught me that",
    lawyer: "Helping law firms with time-critical deliveries has taught me that",
    court: "Helping courts with time-critical service of documents has taught me that",
    bailiff: "Helping bailiffs with time-critical enforcement has taught me that",
    process_server: "Helping process servers with time-critical service has taught me that",
    legal: "Helping legal teams with time-critical deadlines has taught me that",

    // Healthcare
    hospital: "Supporting healthcare teams with urgent deliveries has taught me that",
    pharmacy: "Supporting pharmacies with time-critical orders has taught me that",
    clinic: "Supporting clinics with urgent deliveries has taught me that",
    health: "Supporting healthcare providers with urgent deliveries has taught me that",
    medical: "Supporting medical facilities with time-critical supplies has taught me that",

    // Food & Hospitality
    restaurant: "Working with restaurants on last-minute deliveries has taught me that",
    cafe: "Working with cafes on morning deliveries has taught me that",
    pub: "Working with pubs on supply runs has taught me that",
    food: "Working with food businesses on time-critical deliveries has taught me that",
    hospitality: "Working with hospitality teams on urgent orders has taught me that",

    // Finance & Accounting
    accountant: "Helping accountants meet time-sensitive financial deadlines has taught me that",
    accounting: "Helping accounting firms with deadline-critical deliveries has taught me that",
    tax: "Helping tax professionals with time-critical filings has taught me that",
    insurance: "Helping insurance teams with compliance deadlines has taught me that",

    // Real Estate & Property
    estate_agent: "Helping estate agents prevent delayed completions has taught me that",
    property: "Helping property teams with time-critical documentation has taught me that",
    real_estate: "Helping real estate professionals with deadline-critical deliveries has taught me that",

    // Construction & Manufacturing
    construction: "Helping construction teams avoid site delays has taught me that",
    architect: "Helping architects keep projects on schedule has taught me that",
    engineering: "Helping engineering firms with time-critical deliveries has taught me that",

    // Retail & E-commerce
    retail: "Helping retail teams meet customer delivery promises has taught me that",
    ecommerce: "Helping e-commerce businesses meet promised delivery windows has taught me that",
  };

  // Find matching bridge
  const lowerType = businessType.toLowerCase().replace(/[^a-z0-9_]/g, "");
  for (const [pattern, bridge] of Object.entries(bridgeMap)) {
    if (lowerType.includes(pattern)) {
      return bridge;
    }
  }

  // Fallback: generic but defensible bridge
  return "Working in same-day logistics, one thing I've learnt is that";
}

/**
 * Get tagline for email signature
 * Outcome-focused: speaks to business value, not brand philosophy
 */
export function selectSignature(identity: BusinessIdentity): string {
  return identity.tagline || "Simplifying Logistics";
}

export interface BusinessIdentity {
  tagline: string;   // Outcome-focused tagline (e.g., "Keeping Legal Deadlines Moving")
}

export interface BusinessPainPromise {
  pain: string; // Trust-first observation (demonstrates understanding)
  promise: string; // Our guarantee (constant across all)
  bridge?: string; // Industry-specific credibility bridge (e.g., "Helping solicitors with time-critical deadlines has taught me that...")
  consequenceLevel: ConsequenceLevel;
  tier: ConsequenceTier;
  subjectLines: string[]; // Trust-first subject line options (Human, Observation, Shared World, Zero-Marketing)
  identity: BusinessIdentity; // NEW: Hierarchical identity (principle > outcome > positioning)
  description?: string;
  closingQuestion?: string; // Genuine curiosity question (mostly constant)
}

export const BUSINESS_PAIN_PROMISE_MAP: Record<string, BusinessPainPromise> = {
  // ═══════════════════════════════════════════════════════════════════
  // TIER 1: ULTRA MOTIVATED (Legal/Compliance/Health)
  // ═══════════════════════════════════════════════════════════════════

  court: {
    pain: "Court cases rarely get stalled because of the legal work itself. The real problem is when service of documents doesn't happen on time.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLines: ["One thing I've learnt", "Quick question", "When deadlines matter"],
    identity: {
      tagline: "Keeping Justice on Schedule"
    },
    description: "Court services have highest consequence: litigation failure",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  bailiff: {
    pain: "Enforcement actions rarely fail because of the legal work itself. The real problem is when service—like those with specific date requirements—has to happen on schedule.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLines: ["One thing I've learnt", "Quick question", "When service matters"],
    identity: {
      tagline: "Keeping Enforcement on Time"
    },
    description: "Bailiffs need guaranteed service by court deadline",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  process_server: {
    pain: "Prosecutions rarely stall because of the process itself. The real problem is when service of documents—like those with court-ordered deadlines—needs to happen on time.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLines: ["One thing I've learnt", "Out of curiosity", "Things outside your control"],
    identity: {
      tagline: "Keeping Service on Schedule"
    },
    description: "Process servers have zero tolerance for missed deliveries",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  insurance_company: {
    pain: "Compliance rarely fails because of the policies themselves. The real problem is when regulatory filings—like those with fixed deadlines—need to be submitted on time.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLines: ["One thing I've learnt", "A thought", "When compliance matters"],
    identity: {
      tagline: "Keeping Compliance on Schedule"
    },
    description: "Insurance companies face regulatory fines for missed deadlines",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  insurance_broker: {
    pain: "Client relationships rarely break because of the insurance itself. The real problem is when policy documents—like those needed for coverage—don't arrive when promised.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLines: ["One thing I've learnt", "Quick question", "When deadlines matter"],
    identity: {
      tagline: "Keeping Coverage Moving"
    },
    description: "Insurance brokers need guaranteed delivery for regulatory compliance",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  hospital: {
    pain: "Patient care rarely gets delayed because of the procedure itself. The real problem is when supplies or equipment don't arrive exactly when scheduled.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLines: ["One thing I've noticed", "Out of curiosity", "When supplies matter"],
    identity: {
      tagline: "Keeping Surgery on Schedule"
    },
    description: "Hospitals cannot tolerate surgical supply delays",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  surgical_supplies: {
    pain: "Operating schedules rarely slip because of supply planning itself. The real problem is when critical supplies—like those for the scheduled procedure—don't arrive on time.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLines: ["One thing I've learnt", "Quick question", "When OR time matters"],
    identity: {
      tagline: "Keeping Surgery on Track"
    },
    description: "Surgical supply companies serve hospitals with zero tolerance",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  medical_devices: {
    pain: "Procedures rarely get postponed because of the equipment itself. The real problem is when devices—like those needed for the scheduled procedure—don't arrive on the scheduled date.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLines: ["One thing I've noticed", "A thought", "When procedures matter"],
    identity: {
      tagline: "Keeping Procedures on Time"
    },
    description: "Medical device companies have highest stakes",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  clinic: {
    pain: "Patient care rarely suffers because of the treatment plan itself. The real problem is when supplies—like those needed for urgent care—don't arrive when the patient does.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLines: ["One thing I've learnt", "Out of curiosity", "When urgency matters"],
    identity: {
      tagline: "Keeping Care Moving"
    },
    description: "Clinics need guaranteed urgent delivery for patient care",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  pharmacy: {
    pain: "Patient relief rarely gets delayed because of the medicine itself. The real problem is when prescriptions need to be filled and delivered on time.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLines: ["One thing I've learnt", "A thought", "When relief matters"],
    identity: {
      tagline: "Keeping Relief Moving"
    },
    description: "Pharmacies face patient impact for delayed prescriptions",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  legal: {
    pain: "One thing I've learnt is that cases rarely collapse because of the legal strategy. The real problem is when document delivery gets in the way.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLines: ["One thing I've learnt", "Quick question", "When cases matter"],
    identity: {
      tagline: "Keeping Cases Moving"
    },
    description: "Legal firms face case dismissal for missed deadlines",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  lawyer: {
    pain: "Case deadlines rarely slip because of the legal preparation. The real problem is when documents need to be filed and timing becomes critical.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLines: ["One thing I've learnt", "Out of curiosity", "When briefs matter"],
    identity: {
      tagline: "Keeping Filings on Time"
    },
    description: "Lawyers face compliance violations for missed filings",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  solicitor: {
    pain: "Filing deadlines rarely become stressful because of the legal work itself. The real problem is when delivery becomes the variable you can't control.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLines: ["One thing I've learnt", "Quick question", "When deadlines get tight"],
    identity: {
      tagline: "Keeping Deadlines Moving"
    },
    description: "Solicitors lose clients over missed deadlines",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  attorney: {
    pain: "One thing I've learnt is that cases rarely stall because of the legal preparation. The real problem is when document delivery becomes unreliable.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLines: ["One thing I've learnt", "A thought", "When cases matter"],
    identity: {
      tagline: "Keeping Cases on Schedule"
    },
    description: "Attorneys face case dismissal for missed deadlines",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  // ═══════════════════════════════════════════════════════════════════
  // TIER 2: HIGHLY MOTIVATED (Premium/High-Value)
  // ═══════════════════════════════════════════════════════════════════

  film_production: {
    pain: "Shoots rarely run over budget because of the creative work itself. The real problem is when equipment doesn't arrive exactly when filming starts.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLines: ["One thing I've learnt", "Quick question", "When equipment arrives"],
    identity: {
      tagline: "Keeping Sets on Schedule"
    },
    description: "Film production has extreme daily costs for delays",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  tv_production: {
    pain: "One thing I've learnt is that shooting schedules rarely slip because of the production planning. The real problem is when equipment delivery gets delayed.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLines: ["One thing I've noticed", "A thought", "When schedules matter"],
    identity: {
      tagline: "Keeping Production on Time"
    },
    description: "TV production budgets cannot absorb delivery delays",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  university_research: {
    pain: "One thing I've learnt is that research rarely fails because of the methodology. The real problem is when time-sensitive samples don't arrive on schedule.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLines: ["One thing I've learnt", "Out of curiosity", "When samples matter"],
    identity: {
      tagline: "Keeping Research on Timeline"
    },
    description: "Universities cannot repeat experiments; samples are irreplaceable",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  auction_house: {
    pain: "One thing I've learnt is that auction sales rarely fall through because of the lots themselves. The real problem is when delivery windows get missed.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLines: ["One thing I've noticed", "Quick question", "When deadlines matter"],
    identity: {
      tagline: "Keeping Auctions on Time"
    },
    description: "Auction houses lose entire transactions over missed deliveries",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  jewelry_store: {
    pain: "One thing I've learnt is that customer satisfaction rarely drops because of the jewelry itself. The real problem is when delivery timing becomes unpredictable.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLines: ["One thing I've learnt", "A thought", "When timing matters"],
    identity: {
      tagline: "Keeping Deliveries on Time"
    },
    description: "Jewelry stores need guaranteed secure delivery for high-value items",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  luxury_goods: {
    pain: "One thing I've learnt is that premium clients rarely disappear because of the products. The real problem is when delivery expectations don't get met.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLines: ["One thing I've learnt", "Quick question", "When customers matter"],
    identity: {
      tagline: "Keeping Premium Service Moving"
    },
    description: "Luxury goods retailers have premium pricing; cannot lose clients",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  fashion_design: {
    pain: "One thing I've learnt is that orders rarely fall through because of the designs themselves. The real problem is when sample deliveries get delayed past buyer meetings.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLines: ["One thing I've noticed", "Out of curiosity", "When samples matter"],
    identity: {
      tagline: "Keeping Collections Moving"
    },
    description: "Fashion designers lose orders over missed sample deadlines",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  // ═══════════════════════════════════════════════════════════════════
  // TIER 3: MOTIVATED (Operational)
  // ═══════════════════════════════════════════════════════════════════

  estate_agent: {
    pain: "Property sales rarely collapse because of the properties themselves. The real problem is when completion documents don't arrive on the agreed date.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLines: ["One thing I've learnt", "Quick question", "When completions matter"],
    identity: {
      tagline: "Keeping Completions on Time"
    },
    description: "Estate agents have standard operational delays",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  realtor: {
    pain: "One thing I've learnt is that deals rarely die because of the negotiation. The real problem is when closing documents get delayed.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLines: ["One thing I've noticed", "A thought", "When closings matter"],
    identity: {
      tagline: "Keeping Closings on Time"
    },
    description: "Realtors handle standard real estate deadlines",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  lettings: {
    pain: "One thing I've learnt is that tenancies rarely fail to start because of the agreement itself. The real problem is when paperwork delivery gets held up.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLines: ["One thing I've learnt", "Quick question", "When tenancies matter"],
    identity: {
      tagline: "Keeping Lettings on Time"
    },
    description: "Lettings companies handle standard tenancy paperwork",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  property: {
    pain: "One thing I've learnt is that transactions rarely stall because of the legal work. The real problem is when document delivery becomes unpredictable.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLines: ["One thing I've learnt", "Out of curiosity", "When transactions matter"],
    identity: {
      tagline: "Keeping Transactions Moving"
    },
    description: "Property companies handle standard transaction deadlines",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  accounting: {
    pain: "Tax deadlines rarely cause problems because of the accounting work itself. The real problem is when filings need to be submitted on the deadline.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLines: ["One thing I've learnt", "A thought", "When tax season arrives"],
    identity: {
      tagline: "Keeping Tax Filings on Time"
    },
    description: "Accountants handle standard tax season deadlines",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  accountant: {
    pain: "Tax deadlines rarely stress you because of the accounting itself. The real problem is when documents—like those needed for filing—don't arrive when they're due.",
    promise: "If that ever happens with us, we'll take responsibility and cover the re-delivery at no cost to you.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLines: ["One thing I've noticed", "Quick question", "When deadlines matter"],
    identity: {
      tagline: "Keeping Tax Deadlines on Time"
    },
    description: "Accountants handle standard tax filing deadlines",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  tax: {
    pain: "Audit risk rarely increases because of the filings themselves. The real problem is when compliance documents—like those for regulatory deadlines—don't arrive on time.",
    promise: "If that ever happens with us, we'll take responsibility and cover the re-delivery at no cost to you.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLines: ["One thing I've learnt", "A thought", "When filings matter"],
    identity: {
      tagline: "Keeping Filings on Schedule"
    },
    description: "Tax services handle standard tax compliance",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  bookkeeper: {
    pain: "Month-end rarely becomes chaotic because of the data itself. The real problem is when reports—like those needed for financial close—don't arrive on schedule.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLines: ["One thing I've learnt", "Quick question", "When month-end matters"],
    identity: {
      tagline: "Keeping Month-End on Time"
    },
    description: "Bookkeepers handle standard monthly deadlines",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  construction: {
    pain: "Projects rarely slip because of the building plans themselves. The real problem is when materials don't arrive on schedule.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLines: ["One thing I've learnt", "Out of curiosity", "When projects matter"],
    identity: {
      tagline: "Keeping Projects on Time"
    },
    description: "Construction has operational delays",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  builder: {
    pain: "One thing I've learnt is that build timelines rarely blow out because of the construction itself. The real problem is when material delivery becomes unpredictable.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLines: ["One thing I've noticed", "Quick question", "When materials arrive"],
    identity: {
      tagline: "Keeping Builds on Time"
    },
    description: "Builders handle standard material delivery schedules",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  contractor: {
    pain: "One thing I've learnt is that site work rarely stalls because of the labour itself. The real problem is when supply delivery gets delayed.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLines: ["One thing I've learnt", "A thought", "When supplies matter"],
    identity: {
      tagline: "Keeping Schedules on Time"
    },
    description: "Contractors manage standard supply chain delays",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  plumber: {
    pain: "One thing I've learnt is that appointment schedules rarely break because of the plumbing itself. The real problem is when supply pickups get held up.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLines: ["One thing I've learnt", "Quick question", "When pickups matter"],
    identity: {
      tagline: "Keeping Appointments on Schedule"
    },
    description: "Plumbers handle standard job schedules",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  electrician: {
    pain: "One thing I've learnt is that installation dates rarely slip because of the electrical work itself. The real problem is when equipment delivery gets delayed.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLines: ["One thing I've noticed", "A thought", "When installations matter"],
    identity: {
      tagline: "Keeping Installations on Time"
    },
    description: "Electricians handle standard equipment schedules",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  architecture: {
    pain: "One thing I've learnt is that construction rarely stalls because of the plans themselves. The real problem is when drawing delivery gets held up.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLines: ["One thing I've learnt", "Quick question", "When drawings matter"],
    identity: {
      tagline: "Keeping Projects Moving"
    },
    description: "Architects handle standard plan delivery schedules",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  architect: {
    pain: "One thing I've learnt is that projects rarely get delayed because of the drawings themselves. The real problem is when delivery timelines slip outside your control.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLines: ["One thing I've learnt", "Out of curiosity", "When deadlines matter"],
    identity: {
      tagline: "Keeping Drawings on Schedule"
    },
    description: "Architects manage standard drawing deadlines",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  engineering: {
    pain: "One thing I've learnt is that builds rarely fall behind because of the specs themselves. The real problem is when specification delivery gets delayed.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLines: ["One thing I've noticed", "Quick question", "When specs matter"],
    identity: {
      tagline: "Keeping Specs on Schedule"
    },
    description: "Engineers handle standard specification delivery",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  ecommerce: {
    pain: "One thing I've learnt is that customer satisfaction rarely drops because of the products. The real problem is when delivery speed becomes unpredictable.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLines: ["One thing I've learnt", "A thought", "When deliveries matter"],
    identity: {
      tagline: "Keeping Orders on Time"
    },
    description: "E-commerce handles standard order fulfillment",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  retailer: {
    pain: "One thing I've learnt is that inventory rarely runs out because of the ordering itself. The real problem is when delivery windows get missed.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLines: ["One thing I've noticed", "Quick question", "When inventory arrives"],
    identity: {
      tagline: "Keeping Inventory on Schedule"
    },
    description: "Retailers manage standard inventory delivery",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  retail: {
    pain: "One thing I've learnt is that peak season rarely becomes chaotic because of the products themselves. The real problem is when inventory delivery gets disrupted.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLines: ["One thing I've learnt", "Out of curiosity", "When season peaks"],
    identity: {
      tagline: "Keeping Seasons on Schedule"
    },
    description: "Retail businesses handle seasonal inventory peaks",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },

  florist: {
    pain: "Weddings rarely look wrong because of the flowers themselves. The real problem is when arrangements don't arrive exactly on time.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLines: ["One thing I've learnt", "Quick question", "When events matter"],
    identity: {
      tagline: "Keeping Events on Time"
    },
    description: "Florists have tight event-day windows",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  event_planning: {
    pain: "Events rarely fall apart because of the planning itself. The real problem is when supplier deliveries don't arrive on event day.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLines: ["One thing I've noticed", "A thought", "When timing matters"],
    identity: {
      tagline: "Keeping Events on Schedule"
    },
    description: "Event planners depend on precise timing",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  hospitality: {
    pain: "One thing I've learnt is that service quality rarely suffers because of the food itself. The real problem is when supply delivery becomes unreliable.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLines: ["One thing I've learnt", "Quick question", "When service matters"],
    identity: {
      tagline: "Keeping Service Moving"
    },
    description: "Hospitality venues depend on consistent supply timing",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  restaurant: {
    pain: "Service quality rarely fails because of the food itself. The real problem is when critical supplies don't arrive before doors open.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLines: ["One thing I've learnt", "A thought", "When timing matters"],
    identity: {
      tagline: "Keeping Restaurants on Time"
    },
    description: "Restaurants cannot open without ingredients",
    closingQuestion: "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?",
  },
  cafe: {
    pain: "One thing I've learnt is that morning service rarely fails because of the coffee itself. The real problem is when stock delivery doesn't arrive before opening.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLines: ["One thing I've noticed", "Quick question", "When opening matters"],
    identity: {
      tagline: "Keeping Cafes on Schedule"
    },
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
    pain: "One thing I've learnt is that deliveries rarely fail because of the work itself. The real problem is when something outside your control gets in the way.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLines: ["One thing I've learnt", "A thought"],
    identity: {
      principle: undefined,
      outcome: "Keeping Deliveries on Time",
      positioning: "Simplifying Logistics"
    },
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
