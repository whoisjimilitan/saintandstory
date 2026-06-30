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
    pain: "One missed legal service deadline = case dismissed, litigation failure.",
    promise: "if service delivery gets missed, we guarantee re-delivery at no charge.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Legal deadline protection",
    description: "Court services have highest consequence: litigation failure",
  },
  bailiff: {
    pain: "One missed service delivery = case dismissed, defendant escapes.",
    promise: "if service gets missed, we guarantee re-service at no charge.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Service delivery guarantee",
    description: "Bailiffs need guaranteed service by court deadline",
  },
  process_server: {
    pain: "One missed service = case dismissed, prosecution fails.",
    promise: "if service gets missed, we guarantee re-service at no charge.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Service delivery guarantee",
    description: "Process servers have zero tolerance for missed deliveries",
  },

  // INSURANCE & COMPLIANCE
  insurance_company: {
    pain: "One missed audit delivery = regulatory violation + fines + compliance failure.",
    promise: "if audit delivery gets missed, we cover the next delivery at no charge.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Regulatory deadline protection",
    description: "Insurance companies face regulatory fines for missed deadlines",
  },
  insurance_broker: {
    pain: "One missed policy delivery = compliance violation + client loss.",
    promise: "if policy delivery gets missed, we cover the next delivery at no charge.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Compliance deadline protection",
    description: "Insurance brokers need guaranteed delivery for regulatory compliance",
  },

  // MEDICAL & SURGICAL
  hospital: {
    pain: "One missed surgical supply = operation delayed, patient suffering.",
    promise: "if surgical supply gets missed, we cover the re-delivery at no charge.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Surgical delivery guarantee",
    description: "Hospitals cannot tolerate surgical supply delays (patient impact)",
  },
  surgical_supplies: {
    pain: "One missed delivery = operating theatre delayed, patient waiting.",
    promise: "if delivery gets missed, we cover the re-delivery at no charge.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Surgical delivery guarantee",
    description: "Surgical supply companies serve hospitals with zero tolerance",
  },
  medical_devices: {
    pain: "One missed device delivery = medical procedure delayed, patient harmed.",
    promise: "if device delivery gets missed, we cover the re-delivery at no charge.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Medical delivery guarantee",
    description: "Medical device companies have highest stakes (patient care)",
  },
  clinic: {
    pain: "One missed urgent delivery = patient care delayed, clinic liability.",
    promise: "if urgent delivery gets missed, we cover the re-delivery at no charge.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Urgent medical delivery",
    description: "Clinics need guaranteed urgent delivery for patient care",
  },
  pharmacy: {
    pain: "One delayed prescription = patient in pain, pharmacy liability.",
    promise: "if urgent prescriptions get delayed, we cover the next delivery.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Urgent prescription delivery",
    description: "Pharmacies face patient impact and liability for delayed prescriptions",
  },

  // LEGAL SERVICES (Existing - recategorize to Tier 1)
  legal: {
    pain: "One missed document deadline cascades into a lost case.",
    promise: "if a deadline gets missed, we cover the next delivery.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Legal deadline protection",
    description: "Legal firms face case dismissal for missed deadlines",
  },
  lawyer: {
    pain: "One missed filing deadline cascades into compliance issues.",
    promise: "if a filing deadline gets missed, we cover the next delivery.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Legal deadline protection",
    description: "Lawyers face compliance violations for missed filings",
  },
  solicitor: {
    pain: "One missed document deadline means one lost client.",
    promise: "if a deadline gets missed, we cover the next delivery.",
    consequenceLevel: "ULTRA_MOTIVATED",
    tier: 1,
    subjectLineVariation: "Legal deadline protection",
    description: "Solicitors lose clients over missed deadlines",
  },
  attorney: {
    pain: "One missed deadline cascades into case delays and client frustration.",
    promise: "if a deadline gets missed, we cover the next delivery.",
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
    pain: "One missed equipment delivery = production stops ($10k+/day cost).",
    promise: "if equipment delivery gets missed, we guarantee re-delivery same-day.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLineVariation: "Premium production delivery guarantee",
    description: "Film production has extreme daily costs for delays",
  },
  tv_production: {
    pain: "One missed set delivery = shoot delayed, expensive crew idle.",
    promise: "if set delivery gets missed, we guarantee re-delivery same-day.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLineVariation: "Premium production delivery guarantee",
    description: "TV production budgets cannot absorb delivery delays",
  },

  // UNIVERSITIES & RESEARCH
  university_research: {
    pain: "One missed research sample = experiment fails, grant deadline slips.",
    promise: "if sample delivery gets missed, we guarantee re-delivery same-day.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLineVariation: "Research delivery guarantee",
    description: "Universities cannot repeat experiments; samples are irreplaceable",
  },

  // LUXURY & AUCTION HOUSES
  auction_house: {
    pain: "One missed delivery = high-value deal lost, revenue opportunity gone.",
    promise: "if delivery gets missed, we cover the next delivery at no charge.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLineVariation: "Premium luxury delivery",
    description: "Auction houses lose entire transactions over missed deliveries",
  },
  jewelry_store: {
    pain: "One missed delivery = security risk + client loss + reputation damage.",
    promise: "if jewelry delivery gets missed, we cover the next delivery at no charge.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLineVariation: "Premium jewelry delivery",
    description: "Jewelry stores need guaranteed secure delivery for high-value items",
  },
  luxury_goods: {
    pain: "One missed delivery = premium client lost, reputation damage.",
    promise: "if luxury delivery gets missed, we cover the next delivery at no charge.",
    consequenceLevel: "HIGHLY_MOTIVATED",
    tier: 2,
    subjectLineVariation: "Premium luxury delivery",
    description: "Luxury goods retailers have premium pricing; cannot lose clients",
  },

  // FASHION & DESIGN
  fashion_design: {
    pain: "One missed sample delivery = missed pitch opportunity, lost order.",
    promise: "if sample delivery gets missed, we cover the next delivery at no charge.",
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
    pain: "One delayed completion cascades into lost deals and unhappy clients.",
    promise: "if documents get delayed, we cover the next delivery.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your completions",
    description: "Estate agents have standard operational delays",
  },
  realtor: {
    pain: "One missed deadline means one lost closing.",
    promise: "if closing documents get delayed, we cover the next delivery.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your closings",
    description: "Realtors handle standard real estate deadlines",
  },
  lettings: {
    pain: "One delayed paperwork means one late tenancy start.",
    promise: "if lettings documents get delayed, we cover the next delivery.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your tenancy deadlines",
    description: "Lettings companies handle standard tenancy paperwork",
  },
  property: {
    pain: "One missed deadline cascades into delayed transactions.",
    promise: "if transaction documents get delayed, we cover the next delivery.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your transactions",
    description: "Property companies handle standard transaction deadlines",
  },

  // ACCOUNTING / TAX (Recategorize: Tax has compliance consequences = Tier 1)
  accounting: {
    pain: "Tax season means everything moves at once. One missed deadline cascades.",
    promise: "if a tax deadline gets missed, we cover the next delivery.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your tax deadlines",
    description: "Accountants handle standard tax season deadlines",
  },
  accountant: {
    pain: "One missed tax filing deadline means penalties and angry clients.",
    promise: "if a tax deadline gets missed, we cover the next delivery.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your tax deadlines",
    description: "Accountants handle standard tax filing deadlines",
  },
  tax: {
    pain: "One missed tax deadline cascades into penalties and compliance issues.",
    promise: "if a tax deadline gets missed, we cover the next delivery.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your tax deadlines",
    description: "Tax services handle standard tax compliance",
  },
  bookkeeper: {
    pain: "End of month means deadline chaos. One missed delivery cascades.",
    promise: "if an end-of-month deadline gets missed, we cover the next delivery.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your month-end deadlines",
    description: "Bookkeepers handle standard monthly deadlines",
  },

  // CONSTRUCTION / TRADES
  construction: {
    pain: "One delayed material delivery cascades your whole project timeline.",
    promise: "if materials get delayed, we cover the next delivery.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your project schedule",
    description: "Construction has operational delays (not mission-critical)",
  },
  builder: {
    pain: "One missed material delivery means site delays and cost overruns.",
    promise: "if materials get delayed, we cover the next delivery.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your build schedule",
    description: "Builders handle standard material delivery schedules",
  },
  contractor: {
    pain: "One delayed supply means your whole site falls behind.",
    promise: "if supplies get delayed, we cover the next delivery.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your site schedule",
    description: "Contractors manage standard supply chain delays",
  },
  plumber: {
    pain: "One missed job pickup cascades into appointment delays.",
    promise: "if a job pickup gets missed, we cover the next delivery.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your job schedule",
    description: "Plumbers handle standard job schedules",
  },
  electrician: {
    pain: "One delayed equipment delivery cascades into schedule chaos.",
    promise: "if equipment gets delayed, we cover the next delivery.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your installation schedule",
    description: "Electricians handle standard equipment schedules",
  },

  // ARCHITECTURE / ENGINEERING
  architecture: {
    pain: "One missed plan delivery cascades project timelines.",
    promise: "if plans get delayed, we cover the next delivery.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your project timeline",
    description: "Architects handle standard plan delivery schedules",
  },
  architect: {
    pain: "One delayed drawing delivery means project delays.",
    promise: "if drawings get delayed, we cover the next delivery.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "We're expanding to {{city}}",
    description: "Architects manage standard drawing deadlines",
  },
  engineering: {
    pain: "One delayed specification cascades into build delays.",
    promise: "if specs get delayed, we cover the next delivery.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "We're expanding to {{city}}",
    description: "Engineers handle standard specification delivery",
  },

  // E-COMMERCE / RETAIL
  ecommerce: {
    pain: "One delayed order means one bad review and lost customer.",
    promise: "if orders get delayed, we cover the next delivery.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "We're expanding to {{city}}",
    description: "E-commerce handles standard order fulfillment",
  },
  retailer: {
    pain: "One missed inventory delivery cascades into empty shelves.",
    promise: "if inventory gets delayed, we cover the next delivery.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "We're expanding to {{city}}",
    description: "Retailers manage standard inventory delivery",
  },
  retail: {
    pain: "Peak season means everything moves at once. One missed delivery cascades.",
    promise: "if inventory gets delayed, we cover the next delivery.",
    consequenceLevel: "MOTIVATED",
    tier: 3,
    subjectLineVariation: "Protecting your inventory",
    description: "Retail businesses handle seasonal inventory peaks",
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
    pain: "One missed delivery cascades your whole operation.",
    promise: "if delivery gets missed, we cover the next one.",
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
