/**
 * BUSINESS PAIN & PROMISE MAP WITH CONSEQUENCE HIERARCHY
 *
 * Maps business types to:
 * - Specific pain they recognize
 * - Specific promise we make
 * - Consequence level (ULTRA_MOTIVATED, HIGHLY_MOTIVATED, MOTIVATED)
 * - Tier (1=Ultra, 2=Premium, 3=Operational)
 * - Subject line variation based on consequence
 *
 * Used by email generation engine to create dynamic,
 * business-specific emails with consequence-based prioritization.
 *
 * Consequence Hierarchy:
 * TIER 1 (ULTRA_MOTIVATED): Legal/Compliance/Health - Highest urgency + highest LTV
 * TIER 2 (HIGHLY_MOTIVATED): Premium/High-Value - High urgency + premium pricing
 * TIER 3 (MOTIVATED): Operational - Standard urgency + standard pricing
 */

export type ConsequenceLevel = "ULTRA_MOTIVATED" | "HIGHLY_MOTIVATED" | "MOTIVATED";
export type ConsequenceTier = 1 | 2 | 3;

export interface BusinessPainPromise {
  pain: string;
  promise: string;
  consequenceLevel: ConsequenceLevel;
  tier: ConsequenceTier;
  subjectLineVariation: string; // Consequence-based subject line
  description?: string; // Internal note about why this tier
}

/**
 * PAIN & PROMISE BY BUSINESS TYPE WITH CONSEQUENCE TIERS
 * Consequence Hierarchy drives lead prioritization and email strategy
 */
export const BUSINESS_PAIN_PROMISE_MAP: Record<string, BusinessPainPromise> = {
  // ═══════════════════════════════════════════════════════════════════
  // TIER 1: ULTRA MOTIVATED (Legal/Compliance/Health Consequences)
  // ═══════════════════════════════════════════════════════════════════

  // COURTS & LEGAL SERVICES
  court: {
    pain: "You operate on hard court deadlines. One missed service = case dismissed. Full stop.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Legal deadline protection",
    description: "Court services have highest consequence: litigation failure",
  },
  bailiff: {
    pain: "You have strict court-mandated service deadlines. One missed service = case collapses.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Service delivery guarantee",
    description: "Bailiffs need guaranteed service by court deadline",
  },
  process_server: {
    pain: "Your service deadlines determine whether prosecutions move forward. One miss = case delayed indefinitely.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Service delivery guarantee",
    description: "Process servers have zero tolerance for missed deliveries",
  },

  // INSURANCE & COMPLIANCE
  insurance_company: {
    pain: "You operate under regulatory oversight. One missed compliance deadline = fines. That's unacceptable.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Regulatory deadline protection",
    description: "Insurance companies face regulatory fines for missed deadlines",
  },
  insurance_broker: {
    pain: "Your clients depend on timely policy delivery. One missed deadline = lost client + compliance risk.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Compliance deadline protection",
    description: "Insurance brokers need guaranteed delivery for regulatory compliance",
  },

  // MEDICAL & SURGICAL
  hospital: {
    pain: "Your operating theatres run on strict schedules. One missed supply delivery = cancelled surgery.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Surgical delivery guarantee",
    description: "Hospitals cannot tolerate surgical supply delays (patient impact)",
  },
  surgical_supplies: {
    pain: "Your hospitals depend on you. One missed delivery = operating theatre sits idle.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Surgical delivery guarantee",
    description: "Surgical supply companies serve hospitals with zero tolerance",
  },
  medical_devices: {
    pain: "You supply hospitals and clinics with life-critical equipment. One missed delivery = procedure delayed.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Medical delivery guarantee",
    description: "Medical device companies have highest stakes (patient care)",
  },
  clinic: {
    pain: "Your patients need urgent care. One delayed delivery = patient suffering + liability.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Urgent medical delivery",
    description: "Clinics need guaranteed urgent delivery for patient care",
  },
  pharmacy: {
    pain: "Your customers need prescriptions immediately. One delayed delivery = patient in pain + liability.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Urgent prescription delivery",
    description: "Pharmacies face patient impact and liability for delayed prescriptions",
  },

  // LEGAL SERVICES (Existing - recategorize to Tier 1)
  legal: {
    pain: "You operate on strict court deadlines. One missed document delivery = case collapses.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Legal deadline protection",
    description: "Legal firms face case dismissal for missed deadlines",
  },
  lawyer: {
    pain: "Your court filings have hard deadlines. One missed delivery = case dismissed.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Legal deadline protection",
    description: "Lawyers face compliance violations for missed filings",
  },
  solicitor: {
    pain: "You operate on thin margins. One missed document deadline = lost client.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Legal deadline protection",
    description: "Solicitors lose clients over missed deadlines",
  },
  attorney: {
    pain: "You handle time-sensitive cases. One missed deadline = case delayed, client frustrated.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Legal deadline protection",
    description: "Attorneys face case dismissal for missed deadlines",
  },

  // ═══════════════════════════════════════════════════════════════════
  // TIER 2: HIGHLY MOTIVATED (Premium/High-Value Consequences)
  // ═══════════════════════════════════════════════════════════════════

  // FILM & TV PRODUCTION
  film_production: {
    pain: "Your budgets are tight. One missed equipment delivery costs $10k+ in crew idle time.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLineVariation: "Premium production delivery guarantee",
    description: "Film production has extreme daily costs for delays",
  },
  tv_production: {
    pain: "Your shooting schedules are strict. One missed delivery = expensive crew sitting idle.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLineVariation: "Premium production delivery guarantee",
    description: "TV production budgets cannot absorb delivery delays",
  },

  // UNIVERSITIES & RESEARCH
  university_research: {
    pain: "Your research samples can't be repeated. One missed delivery = months of work lost.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLineVariation: "Research delivery guarantee",
    description: "Universities cannot repeat experiments; samples are irreplaceable",
  },

  // LUXURY & AUCTION HOUSES
  auction_house: {
    pain: "Your high-value lots have auction windows. One missed delivery = deal lost forever.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLineVariation: "Premium luxury delivery",
    description: "Auction houses lose entire transactions over missed deliveries",
  },
  jewelry_store: {
    pain: "You handle premium items. One missed delivery = customer lost + reputation risk.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLineVariation: "Premium jewelry delivery",
    description: "Jewelry stores need guaranteed secure delivery for high-value items",
  },
  luxury_goods: {
    pain: "Your VIP customers expect perfection. One missed delivery = premium client lost.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLineVariation: "Premium luxury delivery",
    description: "Luxury goods retailers have premium pricing; cannot lose clients",
  },

  // FASHION & DESIGN
  fashion_design: {
    pain: "Your buyer meetings are tight windows. One missed sample delivery = order never happens.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLineVariation: "Fashion sample delivery",
    description: "Fashion designers lose orders over missed sample deadlines",
  },

  // ═══════════════════════════════════════════════════════════════════
  // TIER 3: MOTIVATED (Operational Consequences)
  // ═══════════════════════════════════════════════════════════════════

  // REAL ESTATE / LETTINGS
  estate_agent: {
    pain: "Your completion deadlines are hard dates. One delayed document = sale collapses.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your completions",
    description: "Estate agents have standard operational delays",
  },
  realtor: {
    pain: "Your closing window is limited. One missed document delivery = deal dies.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your closings",
    description: "Realtors handle standard real estate deadlines",
  },
  lettings: {
    pain: "Your tenancy timelines matter. One delayed document = late tenancy start.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your tenancy deadlines",
    description: "Lettings companies handle standard tenancy paperwork",
  },
  property: {
    pain: "Your transaction deadlines are fixed. One missed document = delayed closing.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your transactions",
    description: "Property companies handle standard transaction deadlines",
  },

  // ACCOUNTING / TAX (Recategorize: Tax has compliance consequences = Tier 1)
  accounting: {
    pain: "Tax season means tight deadlines. One missed filing = penalties for your clients.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your tax deadlines",
    description: "Accountants handle standard tax season deadlines",
  },
  accountant: {
    pain: "Your tax deadlines are April 15. One missed delivery = penalties + angry clients.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your tax deadlines",
    description: "Accountants handle standard tax filing deadlines",
  },
  tax: {
    pain: "Your filing deadlines are strict. One missed document = client audit risk.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your tax deadlines",
    description: "Tax services handle standard tax compliance",
  },
  bookkeeper: {
    pain: "Month-end is chaos. One missed deadline = financial reporting delayed.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your month-end deadlines",
    description: "Bookkeepers handle standard monthly deadlines",
  },

  // CONSTRUCTION / TRADES
  construction: {
    pain: "Your project timelines are locked. One delayed material delivery = whole site falls behind.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your project schedule",
    description: "Construction has operational delays (not mission-critical)",
  },
  builder: {
    pain: "Your build schedules are tight. One missed material delivery = cost overruns.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your build schedule",
    description: "Builders handle standard material delivery schedules",
  },
  contractor: {
    pain: "Your site depends on supplies arriving on time. One delay = whole crew idle.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your site schedule",
    description: "Contractors manage standard supply chain delays",
  },
  plumber: {
    pain: "Your appointments are booked tight. One missed pickup = schedule chaos.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your job schedule",
    description: "Plumbers handle standard job schedules",
  },
  electrician: {
    pain: "Your installation dates are fixed. One delayed equipment = client waiting.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your installation schedule",
    description: "Electricians handle standard equipment schedules",
  },

  // ARCHITECTURE / ENGINEERING
  architecture: {
    pain: "Your project plans drive construction schedules. One late delivery = site crew waits.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your project timeline",
    description: "Architects handle standard plan delivery schedules",
  },
  architect: {
    pain: "Your drawings have tight delivery windows. One missed deadline = construction delayed.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "We're expanding to {{city}}",
    description: "Architects manage standard drawing deadlines",
  },
  engineering: {
    pain: "Your specifications drive build timelines. One late delivery = crews sit idle.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "We're expanding to {{city}}",
    description: "Engineers handle standard specification delivery",
  },

  // E-COMMERCE / RETAIL
  ecommerce: {
    pain: "Your customers expect fast delivery. One delayed order = bad review + lost customer.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "We're expanding to {{city}}",
    description: "E-commerce handles standard order fulfillment",
  },
  retailer: {
    pain: "Your inventory windows are tight. One missed delivery = empty shelves.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "We're expanding to {{city}}",
    description: "Retailers manage standard inventory delivery",
  },
  retail: {
    pain: "Peak season is chaos. One missed delivery = lost sales + unhappy customers.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your inventory",
    description: "Retail businesses handle seasonal inventory peaks",
  },

  // HOSPITALITY / FOOD SERVICE
  florist: {
    pain: "Wedding day has a delivery window. One late flower delivery = wedding looks wrong.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your event deliveries",
    description: "Florists have tight event-day windows",
  },
  event_planning: {
    pain: "Event setup is timing-critical. One late decoration delivery = chaos.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your event deliveries",
    description: "Event planners depend on precise timing",
  },
  hospitality: {
    pain: "Friday dinner service is sacred. One late supply delivery = service disrupted.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your service",
    description: "Hospitality venues depend on consistent supply timing",
  },
  restaurant: {
    pain: "Service starts at 6pm. One late ingredient delivery = you can't open.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your service",
    description: "Restaurants cannot open without ingredients",
  },
  cafe: {
    pain: "Opening time is 7am. One late delivery = you open late and lose customers.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your opening",
    description: "Cafes need stock before opening",
  },
};

/**
 * Detect business type from name and return pain + promise + consequence
 * Looks for keywords in business name, returns best match
 */
export function detectBusinessType(businessName: string): BusinessPainPromise {
  // Strip postcode/postal code patterns (UK: XXXX XXX, US: XXXXX, etc)
  let cleanName = businessName
    .toLowerCase()
    // Remove UK postcodes (e.g., EC4Y 0HA)
    .replace(/\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/gi, "")
    // Remove US zipcode (e.g., 12345)
    .replace(/\b\d{5}(?:-\d{4})?\b/g, "")
    // Remove line breaks and extra spaces
    .replace(/\s+/g, " ")
    .trim();

  // Exact matches first
  for (const [key, value] of Object.entries(BUSINESS_PAIN_PROMISE_MAP)) {
    if (cleanName.includes(key.replace(/_/g, " "))) {
      return value;
    }
  }

  // Partial matches as fallback
  for (const [key, value] of Object.entries(BUSINESS_PAIN_PROMISE_MAP)) {
    const keywords = key.split("_");
    if (keywords.some((kw) => cleanName.includes(kw))) {
      return value;
    }
  }

  // Default fallback (Tier 3, operational)
  return {
    pain: "Your deliveries matter to your operation. One missed delivery = everything stops.",
    promise: "built our courier service to stop that permanently—if it ever fails on us, we own the re-delivery. No cost.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "We're expanding to {{city}}",
    description: "Unknown business type - using default tier 3",
  };
}

/**
 * Get consequence tier for a business name
 * Returns 1, 2, or 3
 */
export function getConsequenceTier(businessName: string): ConsequenceTier {
  return detectBusinessType(businessName).tier;
}

/**
 * Get consequence level for a business name
 */
export function getConsequenceLevel(businessName: string): ConsequenceLevel {
  return detectBusinessType(businessName).consequenceLevel;
}

/**
 * Get all Tier 1 (ULTRA_MOTIVATED) business types
 */
export function getTier1Businesses(): string[] {
  return Object.entries(BUSINESS_PAIN_PROMISE_MAP)
    .filter(([_, value]) => value.tier === 1)
    .map(([key, _]) => key);
}

/**
 * Get all Tier 2 (HIGHLY_MOTIVATED) business types
 */
export function getTier2Businesses(): string[] {
  return Object.entries(BUSINESS_PAIN_PROMISE_MAP)
    .filter(([_, value]) => value.tier === 2)
    .map(([key, _]) => key);
}

/**
 * Check if business is Tier 1 (ULTRA_MOTIVATED)
 */
export function isTier1(businessName: string): boolean {
  return getConsequenceTier(businessName) === 1;
}
