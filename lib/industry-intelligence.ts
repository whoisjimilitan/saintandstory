/**
 * Industry Intelligence Reference Layer
 *
 * Maps all 85 industries to their behavioural group and trigger events.
 *
 * This is a reference-only knowledge layer for future integration.
 * It does not modify the database. It does not predict outcomes.
 *
 * A business rarely buys a courier.
 * A business buys relief from a trigger event.
 *
 * Correctness is determined by real conversion behaviour, not logic.
 */

export interface IndustryIntelligence {
  behaviourGroup: string;
  triggerEvents: string[];
}

export const INDUSTRY_INTELLIGENCE: Record<string, IndustryIntelligence> = {
  // LEGAL
  solicitors: {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["court filing deadline today", "documents missing before hearing", "signed paperwork needed urgently"],
  },
  "barristers' chambers": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["brief needed before court appearance", "documents missing for hearing", "court appearance imminent"],
  },
  "conveyancing firms": {
    behaviourGroup: "Completion Driven",
    triggerEvents: ["completion documents needed today", "signed paperwork missing from client", "key exchange imminent"],
  },
  "litigation firms": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["court deadline in hours", "evidence documents missing", "filing deadline today"],
  },
  notaries: {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["notarized documents needed urgently", "document verification deadline", "client meeting with documents needed"],
  },

  // HEALTHCARE
  pharmacies: {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["prescription stock critical", "patient waiting for medication", "supplier failed, backup needed"],
  },
  "private hospitals": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["surgical supplies missing before surgery", "blood products urgent delivery", "equipment failure during procedure"],
  },
  "dental practices": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["surgical supplies missing before patient", "dental materials stock critical", "equipment failure during treatment"],
  },
  orthodontists: {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["patient appointment today, materials missing", "bracket supplies urgent", "equipment failure during treatment"],
  },
  "gp surgeries": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["medication supply critical", "vaccines missing before clinic", "patient waiting, prescription supplies needed"],
  },
  "veterinary clinics": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["animal in distress, medication urgent", "surgical supplies missing before procedure", "emergency pet owner waiting"],
  },
  "care homes": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["resident medication critical", "medical supplies missing", "emergency transfer needed"],
  },
  "medical laboratories": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["urgent test results needed by hospital", "specimen collection deadline missed", "equipment failure, replacement urgent"],
  },
  "fertility clinics": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["temperature-sensitive samples urgent transport", "treatment window closing", "laboratory equipment failure"],
  },
  "private healthcare providers": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["patient treatment delayed, supplies needed", "emergency equipment transfer", "medication supply critical"],
  },

  // PROPERTY & CONSTRUCTION
  "estate agents": {
    behaviourGroup: "Completion Driven",
    triggerEvents: ["completion date today, keys missing", "documents not signed by completion", "buyer waiting for paperwork"],
  },
  "letting agents": {
    behaviourGroup: "Completion Driven",
    triggerEvents: ["tenancy start date today, keys missing", "tenant waiting, documents unsigned", "access needed for move-in inspection"],
  },
  "property management companies": {
    behaviourGroup: "Completion Driven",
    triggerEvents: ["tenant arrival today, keys needed", "inspection deadline missed", "compliance paperwork urgent"],
  },
  surveyors: {
    behaviourGroup: "Completion Driven",
    triggerEvents: ["valuation report needed before completion", "survey report deadline", "mortgage lender needs valuation today"],
  },
  architects: {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["planning deadline submission today", "building control approval needed urgently", "contractor waiting for plans"],
  },
  "construction firms": {
    behaviourGroup: "Site Continuity",
    triggerEvents: ["site halted, materials missing", "crew waiting, equipment not arrived", "delivery failed, replacement urgent"],
  },
  "building contractors": {
    behaviourGroup: "Site Continuity",
    triggerEvents: ["crew on site, materials missing", "scaffold delivery failed, urgent replacement", "tool shortage halting work"],
  },
  "facilities management companies": {
    behaviourGroup: "Site Continuity",
    triggerEvents: ["building system broken, parts urgent", "maintenance emergency at multiple sites", "equipment failure, replacement urgent"],
  },

  // AUTOMOTIVE
  garages: {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["customer waiting, parts missing from warehouse", "repair deadline for customer collection", "parts shortage delaying service"],
  },
  "mot centres": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["vehicle collection date approaching, repair incomplete", "parts missing for repair", "failed MOT, urgent repairs needed"],
  },
  "vehicle repair centres": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["customer waiting, parts missing", "repair deadline today", "warranty parts urgent"],
  },
  "accident repair centres": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["insurance deadline approaching, parts missing", "customer collection date, repair incomplete", "rare parts urgent"],
  },
  "vehicle dealerships": {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["customer collection date, vehicle not ready", "test drive car breakdown, recovery urgent", "parts shortage delaying sale"],
  },
  "fleet operators": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["vehicle breakdown, fleet grounded", "parts shortage halting operations", "maintenance deadline approaching"],
  },
  "commercial vehicle workshops": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["lorry breakdown, urgent repairs", "maintenance deadline, parts missing", "customer delivery deadline at risk"],
  },

  // MANUFACTURING & ENGINEERING
  "engineering companies": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["project deadline approaching, designs missing", "client site visit, documents needed", "approval deadline today"],
  },
  "precision manufacturers": {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["component shortage halting production", "order deadline approaching, materials missing", "client deadline, delivery urgent"],
  },
  "electronics manufacturers": {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["component stock critical", "production halted waiting for parts", "customer deadline approaching"],
  },
  "industrial suppliers": {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["customer production halted, parts missing", "emergency order urgent", "just-in-time delivery failed"],
  },
  "machine shops": {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["custom part deadline approaching", "client collection date, work incomplete", "urgent machine repair needed"],
  },

  // FINANCE
  accountants: {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["tax deadline tomorrow", "audit documents missing", "year-end filing deadline today"],
  },
  "financial advisers": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["client meeting documents missing", "investment papers needed urgently", "regulatory filing deadline today"],
  },
  "mortgage brokers": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["mortgage deed missing before completion", "document exchange deadline today", "client meeting urgent, papers needed"],
  },
  "insurance brokers": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["policy documents needed urgently", "claim paperwork deadline today", "renewal documents missing"],
  },

  // EVENTS & MEDIA
  "event organisers": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["event materials missing hours before event", "setup documents needed urgently", "contractor arriving, permits missing"],
  },
  "exhibition companies": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["exhibition opening today, display missing", "stand materials not arrived", "installation documents missing"],
  },
  "wedding planners": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["wedding day is today, vendor missing", "decoration materials missing hours before", "contracts missing from client"],
  },
  "av suppliers": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["event today, AV equipment needed", "event happening, equipment missing", "last-minute equipment installation"],
  },
  "tv production": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["broadcast deadline approaching", "footage missing before edit deadline", "equipment needed for shoot today"],
  },
  "film production": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["production materials missing", "filming schedule halted waiting for equipment", "location permits missing"],
  },
  "photography studios": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["event happening today, equipment needed", "client proofs missing for approval", "print deadline for wedding album"],
  },
  "marketing agencies": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["campaign launch deadline today", "client assets missing for deployment", "approved designs missing from client"],
  },
  "print companies": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["print deadline approaching", "final artwork missing from client", "proofs needed for approval"],
  },

  // TECHNOLOGY
  "it support companies": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["client system emergency", "onsite support needed urgently", "equipment failure, urgent replacement"],
  },
  "data centres": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["cooling system failure, emergency", "power backup urgent", "equipment failure, replacement needed"],
  },
  "telecom providers": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["network outage, emergency repair", "infrastructure failure", "customer service disruption"],
  },
  "hardware resellers": {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["customer waiting, stock missing", "urgent order from client", "competitor has stock, restock needed"],
  },
  "managed service providers": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["client system emergency", "onsite support needed urgently", "equipment failure, urgent replacement"],
  },

  // EDUCATION
  universities: {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["exam deadline approaching", "student event today, supplies needed", "submission deadline, documents needed"],
  },
  colleges: {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["course deadline approaching", "student assessment materials missing", "enrollment documents urgent"],
  },
  "private schools": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["exam today, test papers missing", "parent meeting documents needed", "school event, materials missing"],
  },
  "training providers": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["course deadline approaching", "certification documents missing", "training materials needed urgently"],
  },

  // RECRUITMENT
  "recruitment agencies": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["candidate interview today, documents missing", "placement deadline, paperwork urgent", "client documents needed for review"],
  },
  "staffing agencies": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["worker assignment today, documentation missing", "client request urgent, staff needed", "payroll deadline approaching"],
  },

  // AVIATION
  "aircraft maintenance": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["aircraft grounded, spare parts urgent", "maintenance window closing", "flight schedule at risk"],
  },
  airports: {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["runway maintenance urgent", "safety equipment missing", "passenger facility failure"],
  },
  "flight operators": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["flight cancelled, passenger rebook documents", "aircraft parts urgent", "crew documentation missing"],
  },

  // MARITIME
  "shipping agents": {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["cargo deadline approaching", "documentation missing for customs", "vessel departure imminent"],
  },
  "port operators": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["vessel loading delayed, equipment urgent", "cargo documentation missing", "port closure imminent"],
  },
  "marine engineering": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["vessel breakdown, emergency parts", "maintenance deadline approaching", "safety inspection urgent"],
  },

  // SECURITY
  "security companies": {
    behaviourGroup: "Emergency Response",
    triggerEvents: ["security breach emergency response", "armed guard needed urgently", "incident evidence transport"],
  },
  "alarm installers": {
    behaviourGroup: "Emergency Response",
    triggerEvents: ["alarm failure, emergency service needed", "installation deadline", "repair visit urgent"],
  },
  locksmiths: {
    behaviourGroup: "Emergency Response",
    triggerEvents: ["property locked down, emergency access", "key loss, urgent locksmith visit", "security installation emergency"],
  },

  // LUXURY & SPECIALIST
  jewellers: {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["customer waiting, item from workshop", "repair urgent for customer collection", "stock transfer between locations"],
  },
  "watch specialists": {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["watch repair deadline for customer", "specialist part needed urgently", "collection appointment today"],
  },
  "fashion houses": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["fashion show in days, samples missing", "collection deadline, materials urgent", "customer order urgent"],
  },
  tailors: {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["customer collection date today, alterations incomplete", "special event outfit needed urgently", "wedding dress collection imminent"],
  },
  "luxury retailers": {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["vip customer waiting, item from warehouse", "high-value item transfer between locations", "exclusive delivery deadline"],
  },
  "art galleries": {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["exhibition opening today, artwork missing", "client viewing scheduled, piece needed", "artwork transfer between galleries"],
  },
  "auction houses": {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["auction day today, items missing", "lot transport urgent", "item authentication deadline"],
  },
  museums: {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["exhibition opening, artifacts transport", "loan deadline approaching", "insurance documentation urgent"],
  },

  // FUNERAL SERVICES
  "funeral directors": {
    behaviourGroup: "Emergency Response",
    triggerEvents: ["body transfer urgent", "cremation deadline approaching", "family waiting, flowers needed"],
  },
  "crematorium services": {
    behaviourGroup: "Emergency Response",
    triggerEvents: ["cremation scheduled, documents missing", "ashes delivery urgent", "certification deadline today"],
  },
  "memorial companies": {
    behaviourGroup: "Emergency Response",
    triggerEvents: ["memorial stone installation urgent", "engraving deadline", "family gathering, materials needed"],
  },

  // INFRASTRUCTURE & UTILITIES
  "electricity contractors": {
    behaviourGroup: "Site Continuity",
    triggerEvents: ["power outage, emergency response needed", "installation scheduled, equipment missing", "inspection deadline today"],
  },
  "gas contractors": {
    behaviourGroup: "Site Continuity",
    triggerEvents: ["gas supply emergency", "boiler failure, urgent replacement parts", "safety inspection deadline"],
  },
  "water contractors": {
    behaviourGroup: "Site Continuity",
    triggerEvents: ["water supply emergency", "pipe burst, emergency repair materials", "maintenance deadline urgent"],
  },
  "fibre installers": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["installation scheduled, equipment missing", "connection deadline for customer", "repair needed, parts urgent"],
  },
  "rail contractors": {
    behaviourGroup: "Site Continuity",
    triggerEvents: ["track work deadline approaching", "safety equipment missing", "inspection paperwork urgent"],
  },
  "rail maintenance": {
    behaviourGroup: "Site Continuity",
    triggerEvents: ["track damage, emergency repair", "maintenance deadline approaching", "safety inspection materials needed"],
  },

  // RESTAURANTS & FOOD
  restaurants: {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["service in 2 hours, supplier failed", "ingredient stock critical, emergency run", "market collection missed"],
  },
  cafes: {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["morning rush starting, supplies missing", "inventory critical, emergency restock", "supplier no-show, backup needed"],
  },
  bistros: {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["evening service, key ingredient missing", "supplier failed, replacement urgent", "reservation for 50 tonight"],
  },
  eateries: {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["lunch rush approaching, supplies missing", "menu item out of stock, customer waiting", "emergency ingredient run"],
  },

  // RETAIL
  "retail stores": {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["stock out, customer waiting", "delivery failure, urgent restock", "inter-branch transfer urgent"],
  },
  shops: {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["popular item out of stock, customer waiting", "supplier delivery failed", "competitor has stock, urgent restock"],
  },
  boutiques: {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["customer waiting for item from warehouse", "inter-location transfer urgent", "stock rotation needed before close"],
  },
  florists: {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["event today, flowers missing", "market collection missed, stock depleted", "wedding delivery tomorrow"],
  },
};

/**
 * Helper functions for accessing intelligence
 */
export function getIndustryIntelligence(industry: string): IndustryIntelligence | null {
  const normalized = industry.toLowerCase().replace(/-/g, ' ');
  return INDUSTRY_INTELLIGENCE[normalized] ?? null;
}

export function getTriggerEvents(industry: string): string[] {
  const normalized = industry.toLowerCase().replace(/-/g, ' ');
  return INDUSTRY_INTELLIGENCE[normalized]?.triggerEvents ?? [];
}

export function getBehaviourGroup(industry: string): string | null {
  const normalized = industry.toLowerCase().replace(/-/g, ' ');
  return INDUSTRY_INTELLIGENCE[normalized]?.behaviourGroup ?? null;
}

export function getIndustriesByBehaviourGroup(group: string): string[] {
  return Object.entries(INDUSTRY_INTELLIGENCE)
    .filter(([_, intel]) => intel.behaviourGroup === group)
    .map(([industry, _]) => industry);
}

export function getAllBehaviourGroups(): string[] {
  const groups = new Set(Object.values(INDUSTRY_INTELLIGENCE).map(i => i.behaviourGroup));
  return Array.from(groups).sort();
}

export function getBehaviourGroupStats(): Record<string, number> {
  const stats: Record<string, number> = {};
  for (const intel of Object.values(INDUSTRY_INTELLIGENCE)) {
    stats[intel.behaviourGroup] = (stats[intel.behaviourGroup] ?? 0) + 1;
  }
  return stats;
}
