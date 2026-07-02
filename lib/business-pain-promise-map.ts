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
  signatureName?: string; // Signature name (e.g., "James" or "Saint & Story")
}

export interface BusinessPainPromise {
  pain: string; // Legacy field (kept for backwards compatibility)
  promise: string; // Legacy field (kept for backwards compatibility)

  // REFINED: Narrative story layers (final version - every sentence earns its place)
  bridge?: string; // Bridge into shared reality (e.g., "Helping solicitors with time-critical legal deliveries has taught me one thing.")
  sharedReality?: string; // What's universally true (e.g., "Filing deadlines rarely become stressful because of the legal work itself.")
  rootCause?: string; // The hidden dependency (e.g., "They're usually missed when one small dependency becomes the biggest risk.")
  dependencyReveal?: string; // The reveal of what dependency matters (e.g., "For many firms, that's the delivery.")
  businessPhilosophy?: string; // Why we built this (e.g., "We built Saint & Story around that reality.")
  promiseStatement?: string; // The guarantee (e.g., "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.")

  consequenceLevel: ConsequenceLevel;
  tier: ConsequenceTier;
  subjectLines: string[]; // Trust-first subject line options (Human, Observation, Shared World, Zero-Marketing)
  identity: BusinessIdentity;
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
    bridge: "Helping courts with time-critical service of documents has taught me one thing.",
    sharedReality: "Court cases rarely get stalled because of the legal work itself.",
    rootCause: "They're usually delayed when one small dependency becomes the biggest risk.",
    dependencyReveal: "For many courts, that's the service of documents.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLines: ["One thing I've learnt", "Quick question", "When deadlines matter"],
    identity: {
      tagline: "Keeping Justice on Schedule"
    },
    description: "Court services have highest consequence: litigation failure",
    closingQuestion: "Out of curiosity, when deadlines get tight, does your team ever need a same-day backup courier?",
  },
  bailiff: {
    pain: "Enforcement actions rarely fail because of the legal work itself. The real problem is when service—like those with specific date requirements—has to happen on schedule.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    bridge: "Helping bailiffs with time-critical enforcement has taught me one thing.",
    sharedReality: "Enforcement actions rarely fail because of the legal work itself.",
    rootCause: "The real problem is when service needs to happen on schedule.",
    businessPhilosophy: "That's exactly why we built Saint & Story to take responsibility when enforcement matters.",
    promiseStatement: "If a delivery ever fails with us, we'll cover the re-delivery at no cost to you.",
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
    bridge: "Helping process servers with time-critical service has taught me one thing.",
    sharedReality: "Prosecutions rarely stall because of the process itself.",
    rootCause: "The real problem is when service of documents needs to happen on time.",
    businessPhilosophy: "That's exactly why we built Saint & Story to take responsibility when service matters.",
    promiseStatement: "If a delivery ever fails with us, we'll cover the re-delivery at no cost to you.",
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
    bridge: "Helping insurance companies with compliance deadlines has taught me one thing.",
    sharedReality: "Compliance rarely fails because of the policies themselves.",
    rootCause: "It fails when one small deadline becomes the regulatory liability.",
    dependencyReveal: "For many insurers, that's compliance documents arriving on deadline.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping insurance brokers with compliance deadlines has taught me one thing.",
    sharedReality: "Client relationships rarely break because of the insurance itself.",
    rootCause: "They break when one small delivery becomes the trust issue.",
    dependencyReveal: "For many brokers, that's policy documentation reaching clients.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Supporting healthcare teams with urgent deliveries has taught me one thing.",
    sharedReality: "Patient care rarely gets delayed because of the procedure itself.",
    rootCause: "It's delayed when one small dependency becomes the critical path.",
    dependencyReveal: "For many hospitals, that's when supplies arrive.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Supporting surgical teams with urgent supplies has taught me one thing.",
    sharedReality: "Operating schedules rarely slip because of supply planning itself.",
    rootCause: "They slip when one small dependency becomes the bottleneck.",
    dependencyReveal: "For many hospitals, that's the critical supplies arriving exactly on time.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Supporting hospitals with time-critical device deliveries has taught me one thing.",
    sharedReality: "Procedures rarely get postponed because of the equipment itself.",
    rootCause: "They're postponed when one small delivery window becomes the constraint.",
    dependencyReveal: "For many hospitals, that's equipment arriving before procedures start.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Supporting clinics with urgent deliveries has taught me one thing.",
    sharedReality: "Patient care rarely suffers because of the treatment plan itself.",
    rootCause: "It suffers when one small dependency becomes the bottleneck.",
    dependencyReveal: "For many clinics, that's urgent supplies when patients arrive.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we'll cover the re-delivery at no cost to you.",
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
    bridge: "Supporting pharmacies with time-critical orders has taught me one thing.",
    sharedReality: "Patient relief rarely gets delayed because of the medicine itself.",
    rootCause: "It's delayed when one small delivery becomes the critical path.",
    dependencyReveal: "For many pharmacies, that's prescription fulfillment on time.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we'll cover the re-delivery at no cost to you.",
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
    bridge: "Helping legal teams with time-critical deliveries has taught me one thing.",
    sharedReality: "Cases rarely collapse because of the legal strategy.",
    rootCause: "They collapse when one small dependency becomes the deciding factor.",
    dependencyReveal: "For many law firms, that's document delivery when it matters.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping lawyers with time-critical filings has taught me one thing.",
    sharedReality: "Case deadlines rarely slip because of the legal preparation.",
    rootCause: "They slip when one small deadline becomes the biggest risk.",
    dependencyReveal: "For many practices, that's documents reaching courts by deadline.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping solicitors with time-critical legal deliveries has taught me one thing.",
    sharedReality: "Filing deadlines rarely become stressful because of the legal work itself.",
    rootCause: "They're usually missed when one small dependency becomes the biggest risk.",
    dependencyReveal: "For many firms, that's the delivery.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLines: ["One thing I've learnt", "Quick question", "When deadlines get tight"],
    identity: {
      tagline: "Keeping Legal Deadlines Moving"
    },
    description: "Solicitors lose clients over missed deadlines",
    closingQuestion: "Out of curiosity, when deadlines get tight, does your team ever need a same-day backup courier?",
  },
  attorney: {
    pain: "One thing I've learnt is that cases rarely stall because of the legal preparation. The real problem is when document delivery becomes unreliable.",
    promise: "If a delivery ever fails, we take responsibility and cover the re-delivery ourselves.",
    bridge: "Helping attorneys with time-critical document delivery has taught me one thing.",
    sharedReality: "Cases rarely stall because of the legal preparation.",
    rootCause: "They stall when one small delivery becomes unreliable.",
    dependencyReveal: "For many law practices, that's reliable document delivery.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Working with production teams on time-critical deliveries has taught me one thing.",
    sharedReality: "Shoots rarely run over budget because of the creative work itself.",
    rootCause: "They do when one small delivery window becomes the daily cost.",
    dependencyReveal: "For many productions, that's equipment arriving when shooting starts.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Working with TV production on time-critical deliveries has taught me one thing.",
    sharedReality: "Shooting schedules rarely slip because of the production planning.",
    rootCause: "They slip when one small delivery becomes the production constraint.",
    dependencyReveal: "For many shoots, that's equipment delivered before the clock starts.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Supporting research teams with time-critical sample delivery has taught me one thing.",
    sharedReality: "Research rarely fails because of the methodology.",
    rootCause: "It fails when one small delivery window becomes the experiment.",
    dependencyReveal: "For many experiments, that's time-sensitive samples arriving on schedule.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping auction houses meet delivery windows has taught me one thing.",
    sharedReality: "Auction sales rarely fall through because of the lots themselves.",
    rootCause: "They fall through when one small timeline becomes the transaction.",
    dependencyReveal: "For many auctions, that's items reaching cataloging on time.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping jewelry stores with time-critical deliveries has taught me one thing.",
    sharedReality: "Customer satisfaction rarely drops because of the jewelry itself.",
    rootCause: "It drops when one small delivery becomes the customer experience.",
    dependencyReveal: "For many boutiques, that's luxury items arriving when promised.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping luxury retailers meet delivery expectations has taught me one thing.",
    sharedReality: "Premium clients rarely disappear because of the products.",
    rootCause: "They disappear when one small delivery becomes the breaking point.",
    dependencyReveal: "For many high-end retailers, that's meeting premium delivery expectations.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping fashion designers with time-critical sample delivery has taught me one thing.",
    sharedReality: "Orders rarely fall through because of the designs themselves.",
    rootCause: "They fall through when one small delivery timeline becomes the deal.",
    dependencyReveal: "For many designers, that's samples reaching buyers before meetings.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping estate agents prevent delayed completions has taught me one thing.",
    sharedReality: "Property sales rarely collapse because of the properties themselves.",
    rootCause: "They collapse when one small timeline becomes the lost transaction.",
    dependencyReveal: "For many transactions, that's completion documents arriving on time.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping realtors meet closing deadlines has taught me one thing.",
    sharedReality: "Deals rarely die because of the negotiation.",
    rootCause: "They die when one small delay becomes the lost commission.",
    dependencyReveal: "For many deals, that's closing documents reaching all parties.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping lettings companies with tenancy paperwork has taught me one thing.",
    sharedReality: "Tenancies rarely fail to start because of the agreement itself.",
    rootCause: "They fail when one small delivery holds up the whole move.",
    dependencyReveal: "For many lettings, that's paperwork ready before tenants move in.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping property teams with time-critical documentation has taught me one thing.",
    sharedReality: "Transactions rarely stall because of the legal work.",
    rootCause: "They stall when one small delivery becomes the bottleneck.",
    dependencyReveal: "For many transactions, that's document delivery becoming predictable.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping accounting firms with tax deadlines has taught me one thing.",
    sharedReality: "Tax deadlines rarely cause problems because of the accounting work itself.",
    rootCause: "They cause problems when one small delivery becomes the regulatory liability.",
    dependencyReveal: "For many firms, that's filings reaching authorities by deadline.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping accountants meet time-sensitive deadlines has taught me one thing.",
    sharedReality: "Tax deadlines rarely stress you because of the accounting itself.",
    rootCause: "They stress you when one small delivery becomes the deadline crisis.",
    dependencyReveal: "For many clients, that's documents ready for tax time.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping tax professionals with time-critical filings has taught me one thing.",
    sharedReality: "Audit risk rarely increases because of the filings themselves.",
    rootCause: "It increases when one small delivery becomes the compliance gap.",
    dependencyReveal: "For many practices, that's compliance documents submitted on schedule.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping bookkeepers with financial close deadlines has taught me one thing.",
    sharedReality: "Month-end rarely becomes chaotic because of the data itself.",
    rootCause: "It becomes chaotic when one small delivery becomes the close.",
    dependencyReveal: "For many businesses, that's month-end reports arriving when needed.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping construction teams keep projects on schedule has taught me one thing.",
    sharedReality: "Projects rarely slip because of the building plans themselves.",
    rootCause: "They slip when one small delivery becomes the critical path.",
    dependencyReveal: "For many projects, that's materials arriving before the crew.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping builders with time-critical material delivery has taught me one thing.",
    sharedReality: "Build timelines rarely blow out because of the construction itself.",
    rootCause: "They blow out when one small delivery becomes the constraint.",
    dependencyReveal: "For many builds, that's material delivery staying predictable.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping contractors with supply delivery has taught me one thing.",
    sharedReality: "Site work rarely stalls because of the labour itself.",
    rootCause: "It stalls when one small delivery becomes the bottleneck.",
    dependencyReveal: "For many jobs, that's supplies reaching the site when needed.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping plumbers with supply pickups has taught me one thing.",
    sharedReality: "Appointment schedules rarely break because of the plumbing itself.",
    rootCause: "They break when one small delivery becomes the appointment.",
    dependencyReveal: "For many plumbers, that's stock available for same-day appointments.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping electricians with time-critical equipment delivery has taught me one thing.",
    sharedReality: "Installation dates rarely slip because of the electrical work itself.",
    rootCause: "They slip when one small delivery becomes the schedule.",
    dependencyReveal: "For many electricians, that's equipment arriving before installation.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping architects keep projects moving has taught me one thing.",
    sharedReality: "Construction rarely stalls because of the plans themselves.",
    rootCause: "It stalls when one small delivery becomes the project.",
    dependencyReveal: "For many projects, that's drawings delivered to keep work moving.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping architects with time-critical drawing delivery has taught me one thing.",
    sharedReality: "Projects rarely get delayed because of the drawings themselves.",
    rootCause: "They get delayed when one small delivery becomes outside your control.",
    dependencyReveal: "For many firms, that's deliverables reaching construction teams.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping engineers with time-critical specification delivery has taught me one thing.",
    sharedReality: "Builds rarely fall behind because of the specs themselves.",
    rootCause: "They fall behind when one small delivery becomes the constraint.",
    dependencyReveal: "For many projects, that's specifications reaching manufacturers on time.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping e-commerce businesses meet delivery promises has taught me one thing.",
    sharedReality: "Customer satisfaction rarely drops because of the products.",
    rootCause: "It drops when one small delivery becomes the customer experience.",
    dependencyReveal: "For many e-commerce teams, that's consistent delivery performance.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping retailers with time-critical inventory delivery has taught me one thing.",
    sharedReality: "Inventory rarely runs out because of the ordering itself.",
    rootCause: "It runs out when one small delivery becomes the shelf.",
    dependencyReveal: "For many stores, that's inventory arriving when inventory runs low.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping retail businesses with seasonal inventory delivery has taught me one thing.",
    sharedReality: "Peak season rarely becomes chaotic because of the products themselves.",
    rootCause: "It becomes chaotic when one small delivery becomes the season.",
    dependencyReveal: "For many retailers, that's stock delivered before peak season.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping florists meet event-day timelines has taught me one thing.",
    sharedReality: "Weddings rarely look wrong because of the flowers themselves.",
    rootCause: "They look wrong when one small delivery becomes the wedding.",
    dependencyReveal: "For many events, that's arrangements arriving exactly on time.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping event planners with time-critical supplier delivery has taught me one thing.",
    sharedReality: "Events rarely fall apart because of the planning itself.",
    rootCause: "They fall apart when one small delivery becomes the event.",
    dependencyReveal: "For many planners, that's supplier deliveries arriving on event day.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Helping hospitality venues with supply delivery has taught me one thing.",
    sharedReality: "Service quality rarely suffers because of the food itself.",
    rootCause: "It suffers when one small delivery becomes unreliable.",
    dependencyReveal: "For many venues, that's supply delivery staying reliable.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Working with restaurants on critical supply delivery has taught me one thing.",
    sharedReality: "Service quality rarely fails because of the food itself.",
    rootCause: "It fails when one small delivery becomes the opening.",
    dependencyReveal: "For many restaurants, that's stock arriving before doors open.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
    bridge: "Working with cafes on morning stock delivery has taught me one thing.",
    sharedReality: "Morning service rarely fails because of the coffee itself.",
    rootCause: "It fails when one small delivery becomes the morning.",
    dependencyReveal: "For many cafes, that's morning deliveries completing before opening.",
    businessPhilosophy: "We built Saint & Story around that reality.",
    promiseStatement: "If a delivery ever fails with us, we take responsibility and cover the re-delivery at no cost to you.",
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
