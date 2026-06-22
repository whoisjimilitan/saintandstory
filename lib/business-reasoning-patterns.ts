/**
 * BUSINESS REASONING PATTERNS
 *
 * Maps business categories to:
 * - What moves in their business (core deliverable/asset)
 * - When it peaks (predictable timing)
 * - What the gap costs (consequence of unpredictability)
 * - Industry keywords (for categorization)
 *
 * NOT templates. REASONING RULES applied per-business.
 * Every email generated is unique based on this reasoning.
 */

export interface BusinessPattern {
  keywords: string[];
  whatMoves: string; // What they deliver/move/manage
  peakTiming: string; // When peak happens
  peakDescription: string; // How to describe the peak
  gapCost: string; // What they lose when predictability fails
  industryContext: string; // Industry insight for value generation
  alternativePeakTimings: string[]; // Other potential peaks for this category
}

export const BUSINESS_REASONING_DATABASE: Record<string, BusinessPattern> = {
  // LEGAL & PROFESSIONAL SERVICES
  "law-firm": {
    keywords: ["lawyer", "solicitor", "legal", "law firm", "attorney", "barrister", "legal services"],
    whatMoves: "documents and legal filings",
    peakTiming: "deadline hours",
    peakDescription: "When court deadlines approach",
    gapCost: "missed filings, case delays, client trust erosion",
    industryContext: "Law operates on strict deadlines. A single missed filing creates professional liability.",
    alternativePeakTimings: ["client meeting times", "discovery deadlines", "court appearance dates"]
  },

  "accounting-firm": {
    keywords: ["accountant", "bookkeeper", "accounting", "tax advisor", "cpa", "financial advisor"],
    whatMoves: "financial documents and tax filings",
    peakTiming: "tax season deadlines",
    peakDescription: "When tax deadlines hit",
    gapCost: "missed filing deadlines, penalty exposure, client frustration",
    industryContext: "Tax deadlines are non-negotiable. Each year creates seasonal pressure.",
    alternativePeakTimings: ["month-end closing", "client quarterly reviews", "audit periods"]
  },

  "consulting-firm": {
    keywords: ["consultant", "consulting", "management consultant", "strategy", "advisory"],
    whatMoves: "client documents and meeting materials",
    peakTiming: "before client presentations",
    peakDescription: "When client meetings are scheduled",
    gapCost: "unprepared presentations, lost credibility, project delays",
    industryContext: "Consulting lives on meeting readiness. One unprepared meeting damages reputation.",
    alternativePeakTimings: ["proposal deadlines", "report submissions", "presentation days"]
  },

  "insurance": {
    keywords: ["insurance", "insurer", "insurance broker", "claims", "underwriting"],
    whatMoves: "claims documents and policy files",
    peakTiming: "claim submission windows",
    peakDescription: "When claims pile up",
    gapCost: "slow claims processing, customer dissatisfaction, regulatory pressure",
    industryContext: "Insurance processing speed affects customer satisfaction and compliance.",
    alternativePeakTimings: ["renewal periods", "policy issuance dates", "underwriting reviews"]
  },

  // HEALTHCARE & PHARMACY
  "pharmacy": {
    keywords: ["pharmacy", "chemist", "pharmacist", "prescription", "drug store", "pharma"],
    whatMoves: "prescriptions and medications",
    peakTiming: "afternoon/evening patient needs",
    peakDescription: "When urgent prescription requests come in",
    gapCost: "patient service failures, lost customers, reputation damage",
    industryContext: "Pharmacy success depends on urgent prescription reliability.",
    alternativePeakTimings: ["after-hours emergency requests", "weekend demand", "seasonal flu season"]
  },

  "dental-practice": {
    keywords: ["dentist", "dental", "orthodontist", "dental practice", "dental clinic", "dentistry"],
    whatMoves: "lab work and patient appointments",
    peakTiming: "afternoon cancellation gaps or lab delivery times",
    peakDescription: "When lab work arrives or schedule gaps appear",
    gapCost: "lost appointment revenue, delayed patient treatment, lab backlog",
    industryContext: "Dental practices operate on appointment precision. Every gap is lost revenue.",
    alternativePeakTimings: ["morning prep times", "end-of-day emergency requests", "weekend coverage"]
  },

  "hospital": {
    keywords: ["hospital", "clinic", "medical center", "healthcare facility", "emergency room"],
    whatMoves: "patient specimens and medical equipment",
    peakTiming: "between departments and overnight",
    peakDescription: "When specimens need urgent transport",
    gapCost: "delayed diagnoses, patient outcomes at risk, workflow disruption",
    industryContext: "Hospital operations depend on rapid specimen movement.",
    alternativePeakTimings: ["emergency calls", "shift changes", "critical care needs"]
  },

  "veterinary": {
    keywords: ["veterinary", "vet", "animal clinic", "pet hospital", "veterinarian"],
    whatMoves: "medical supplies and lab samples",
    peakTiming: "emergency cases and supply needs",
    peakDescription: "When emergency animals arrive",
    gapCost: "delayed treatment, animal suffering, client trust loss",
    industryContext: "Vet clinics face unpredictable emergency peaks.",
    alternativePeakTimings: ["supplier delivery times", "lab result returns", "end-of-day supply runs"]
  },

  // RETAIL & E-COMMERCE
  "ecommerce": {
    keywords: ["ecommerce", "online store", "shopify", "woocommerce", "order fulfillment", "dropship"],
    whatMoves: "orders and inventory",
    peakTiming: "end-of-day order surge",
    peakDescription: "When orders pile up faster than fulfillment capacity",
    gapCost: "missed shipping promises, negative reviews, lost repeat customers",
    industryContext: "E-commerce lives on fulfillment speed. Delayed shipping kills reviews.",
    alternativePeakTimings: ["flash sales", "seasonal peaks", "marketing campaign spikes"]
  },

  "retail-store": {
    keywords: ["retail", "store", "shop", "boutique", "general merchandise", "department store"],
    whatMoves: "inventory and restocking supplies",
    peakTiming: "end-of-day or weekly",
    peakDescription: "When inventory needs rapid restocking",
    gapCost: "stockouts, lost sales, customer frustration",
    industryContext: "Retail success depends on inventory availability.",
    alternativePeakTimings: ["seasonal peaks", "promotional periods", "new store openings"]
  },

  "salon-beauty": {
    keywords: ["salon", "hair salon", "barber", "beautician", "hairdresser", "beauty spa"],
    whatMoves: "products and supplies",
    peakTiming: "mid-day during peak hours",
    peakDescription: "When popular products run out during peak business",
    gapCost: "turned-away customers, lost revenue, reputation damage",
    industryContext: "Salons operate on appointment precision and product availability.",
    alternativePeakTimings: ["weekend demand", "promotional events", "seasonal trends"]
  },

  "restaurant": {
    keywords: ["restaurant", "cafe", "diner", "food service", "catering", "bar"],
    whatMoves: "food supplies and ingredients",
    peakTiming: "morning prep or lunch rush",
    peakDescription: "When meal prep deadlines hit",
    gapCost: "menu items unavailable, service delays, customer disappointment",
    industryContext: "Restaurants operate on split-second timing during service.",
    alternativePeakTimings: ["dinner prep", "weekend events", "holiday periods"]
  },

  // LOGISTICS & TRANSPORTATION
  "removals": {
    keywords: ["removal", "removals", "moving", "house move", "van hire", "logistics", "mover"],
    whatMoves: "furniture and household goods",
    peakTiming: "weekend schedules",
    peakDescription: "When back-to-back weekend moves create scheduling pressure",
    gapCost: "delayed customer moves, cascade delays, customer dissatisfaction",
    industryContext: "Moving companies operate on tight weekend schedules.",
    alternativePeakTimings: ["month-end", "seasonal moves", "emergency relocations"]
  },

  "taxi-rideshare": {
    keywords: ["taxi", "rideshare", "uber", "lyft", "transportation", "car service", "chauffeur"],
    whatMoves: "passenger transport capacity",
    peakTiming: "peak hours (rush hour, evenings)",
    peakDescription: "When demand exceeds available drivers",
    gapCost: "missed pickups, customer wait times, negative ratings",
    industryContext: "Rideshare success depends on driver availability during peaks.",
    alternativePeakTimings: ["weekend nights", "event times", "airport demand"]
  },

  "courier-delivery": {
    keywords: ["courier", "delivery", "parcel", "shipping", "express delivery", "logistics company"],
    whatMoves: "packages and documents",
    peakTiming: "end-of-day deadline windows",
    peakDescription: "When same-day delivery deadlines approach",
    gapCost: "missed delivery windows, customer expectations unmet, reputation damage",
    industryContext: "Courier services live on deadline reliability.",
    alternativePeakTimings: ["peak season (holidays)", "business day closes", "international deadlines"]
  },

  // SKILLED TRADES
  "plumbing": {
    keywords: ["plumber", "plumbing", "emergency plumber", "pipework", "water leak", "hvac"],
    whatMoves: "emergency parts and service capacity",
    peakTiming: "after-hours emergency calls",
    peakDescription: "When emergency calls come in after-hours",
    gapCost: "customer emergency unresolved, reputation risk, lost business",
    industryContext: "Emergency plumbers operate 24/7. After-hours capacity is critical.",
    alternativePeakTimings: ["winter freezing periods", "weekend emergencies", "business hours peaks"]
  },

  "electrician": {
    keywords: ["electrician", "electrical", "electric", "wiring", "electrical contractor"],
    whatMoves: "electrical parts and service availability",
    peakTiming: "emergency outages",
    peakDescription: "When electrical emergencies occur",
    gapCost: "downtime costs, customer business interrupted, safety risk",
    industryContext: "Electrical emergencies demand rapid response.",
    alternativePeakTimings: ["commercial outages", "storm damage", "construction deadlines"]
  },

  "construction": {
    keywords: ["construction", "contractor", "builder", "general contractor", "renovation", "remodel"],
    whatMoves: "materials and equipment",
    peakTiming: "job site delivery windows",
    peakDescription: "When materials need to arrive before crew arrives",
    gapCost: "crew idle time, project delays, budget overruns",
    industryContext: "Construction runs on material timing. Late deliveries cascade.",
    alternativePeakTimings: ["weather-dependent periods", "project milestone dates", "seasonal peaks"]
  },

  // AUTOMOTIVE
  "car-dealership": {
    keywords: ["dealership", "car dealer", "auto dealer", "used cars", "car sales"],
    whatMoves: "vehicles and delivery logistics",
    peakTiming: "month-end or delivery deadlines",
    peakDescription: "When vehicle deliveries are due",
    gapCost: "delivery delays, customer dissatisfaction, lost sales",
    industryContext: "Car sales operate on delivery commitments.",
    alternativePeakTimings: ["quarter-end targets", "promotional periods", "seasonal peaks"]
  },

  "auto-repair": {
    keywords: ["auto repair", "mechanic", "repair shop", "automotive", "car service"],
    whatMoves: "parts and service capacity",
    peakTiming: "emergency repairs or diagnostic runs",
    peakDescription: "When customers need urgent repairs",
    gapCost: "customer wait times, lost business to competitors, reputation damage",
    industryContext: "Auto repair shops depend on parts availability and service speed.",
    alternativePeakTimings: ["seasonal maintenance", "weather-related damage", "fleet maintenance"]
  },

  // MANUFACTURING & INDUSTRIAL
  "manufacturing": {
    keywords: ["manufacturing", "factory", "production", "industrial", "fabrication", "machining"],
    whatMoves: "raw materials and components",
    peakTiming: "production cycle deadlines",
    peakDescription: "When production schedules demand materials",
    gapCost: "production line halts, missed delivery deadlines, revenue loss",
    industryContext: "Manufacturing lives on supply chain predictability.",
    alternativePeakTimings: ["order fulfillment dates", "equipment repairs", "seasonal production"]
  },

  // EDUCATION
  "school-university": {
    keywords: ["school", "university", "college", "education", "academy", "institution"],
    whatMoves: "educational materials and equipment",
    peakTiming: "semester starts or exam periods",
    peakDescription: "When students arrive or exams approach",
    gapCost: "unprepared facilities, student dissatisfaction, accreditation issues",
    industryContext: "Educational institutions operate on calendar deadlines.",
    alternativePeakTimings: ["orientation periods", "graduation events", "facility renovations"]
  },

  // HOSPITALITY
  "hotel-lodging": {
    keywords: ["hotel", "motel", "lodge", "bed and breakfast", "hospitality", "vacation rental"],
    whatMoves: "guest services and supplies",
    peakTiming: "check-in times or busy seasons",
    peakDescription: "When guest arrivals create operational pressure",
    gapCost: "poor guest experience, negative reviews, lost bookings",
    industryContext: "Hospitality success depends on service reliability.",
    alternativePeakTimings: ["event hosting dates", "seasonal peaks", "emergency repairs"]
  },

  // MANUFACTURING & LOGISTICS (General)
  "warehouse-logistics": {
    keywords: ["warehouse", "distribution center", "logistics hub", "inventory management"],
    whatMoves: "inventory and pallets",
    peakTiming: "seasonal peaks or order surges",
    peakDescription: "When order volume exceeds normal handling capacity",
    gapCost: "shipping delays, customer dissatisfaction, revenue impact",
    industryContext: "Warehouse operations depend on efficient material flow.",
    alternativePeakTimings: ["holiday seasons", "flash sales", "clearance periods"]
  },

  // DEFAULT FALLBACK (Unknown category)
  "default": {
    keywords: ["business", "company", "service", "operations"],
    whatMoves: "critical business operations",
    peakTiming: "peak business hours or deadline periods",
    peakDescription: "When operational demands spike",
    gapCost: "missed opportunities, customer dissatisfaction, revenue impact",
    industryContext: "All businesses face unpredictable demand peaks.",
    alternativePeakTimings: ["end-of-month", "seasonal peaks", "promotional periods"]
  }
};

/**
 * Find business pattern by category
 */
export function getBusinessPattern(category?: string): BusinessPattern {
  if (!category) return BUSINESS_REASONING_DATABASE["default"];

  const normalized = category.toLowerCase().trim();

  // Exact match
  if (BUSINESS_REASONING_DATABASE[normalized]) {
    return BUSINESS_REASONING_DATABASE[normalized];
  }

  // Keyword match
  for (const [key, pattern] of Object.entries(BUSINESS_REASONING_DATABASE)) {
    if (pattern.keywords.some(kw => normalized.includes(kw))) {
      return pattern;
    }
  }

  // Fallback
  return BUSINESS_REASONING_DATABASE["default"];
}

/**
 * Analyze business category and return reasoning data
 */
export function analyzeBusinessType(businessCategory?: string, businessDescription?: string) {
  const pattern = getBusinessPattern(businessCategory);

  return {
    category: businessCategory || "unknown",
    pattern,
    whatMoves: pattern.whatMoves,
    peakTiming: pattern.peakTiming,
    peakDescription: pattern.peakDescription,
    gapCost: pattern.gapCost,
    industryContext: pattern.industryContext,
    alternativePeaks: pattern.alternativePeakTimings,
  };
}
