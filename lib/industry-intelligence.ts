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
    triggerEvents: ["completion date today, documents missing", "signed paperwork missing from client", "key exchange imminent"],
  },
  "litigation firms": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["court deadline in hours", "evidence documents missing", "filing deadline today"],
  },
  notaries: {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["documents need notarizing before deadline", "document verification deadline", "client meeting with documents needed"],
  },

  // HEALTHCARE
  pharmacies: {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["prescription stock critical, patient waiting", "supplier failed, backup needed", "medication supply emergency"],
  },
  "private hospitals": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["surgical supplies missing before surgery", "blood products urgent delivery", "operating room blocked"],
  },
  "dental practices": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["patient in chair, materials missing", "bracket supplies urgent", "equipment failure during treatment"],
  },
  orthodontists: {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["patient appointment today, materials missing", "bracket supplies urgent", "appointment must be rescheduled"],
  },
  "gp surgeries": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["medication supply critical, clinic at risk", "vaccines missing before clinic", "patient waiting, prescription supplies needed"],
  },
  "veterinary clinics": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["animal suffering, medication urgent", "surgical supplies missing before procedure", "emergency pet owner waiting"],
  },
  "care homes": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["resident medication stock critical", "medical supplies missing", "emergency transfer needed"],
  },
  "medical laboratories": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["urgent test results needed by hospital", "specimen collection deadline missed", "equipment failure, replacement urgent"],
  },
  "fertility clinics": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["temperature-sensitive samples urgent transport", "treatment window closing", "temperature-sensitive samples urgent"],
  },
  "private healthcare providers": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["patient treatment blocked, supplies needed", "emergency equipment transfer", "medication supply critical"],
  },

  // PROPERTY & CONSTRUCTION
  "estate agents": {
    behaviourGroup: "Completion Driven",
    triggerEvents: ["completion date today, keys missing", "completion date today, documents missing", "buyer waiting for paperwork"],
  },
  "letting agents": {
    behaviourGroup: "Completion Driven",
    triggerEvents: ["tenancy starts today, keys not ready", "tenant waiting, documents unsigned", "access needed for move-in inspection"],
  },
  "property management companies": {
    behaviourGroup: "Completion Driven",
    triggerEvents: ["inspection deadline today, inventory incomplete", "tenancy deadline, documents missing", "compliance paperwork urgent"],
  },
  surveyors: {
    behaviourGroup: "Completion Driven",
    triggerEvents: ["valuation report needed before completion", "mortgage lender needs valuation today", "completion deadline approaching"],
  },
  architects: {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["planning deadline submission today", "building control approval needed urgently", "contractor waiting for plans"],
  },
  "construction firms": {
    behaviourGroup: "Site Continuity",
    triggerEvents: ["crew waiting, materials not arrived", "delivery failed, schedule breaks", "site halted, materials missing"],
  },
  "building contractors": {
    behaviourGroup: "Site Continuity",
    triggerEvents: ["weather window closing, scaffold missing", "delivery failed, crew idle on site", "crew on site, materials missing"],
  },
  "facilities management companies": {
    behaviourGroup: "Site Continuity",
    triggerEvents: ["heating system broken, building unusable", "building system failure, business stops", "maintenance emergency at multiple sites"],
  },

  // AUTOMOTIVE
  garages: {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["customer waiting, parts missing from warehouse", "repair deadline for customer collection", "parts shortage delaying service"],
  },
  "mot centres": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["vehicle inspection appointment booked, parts missing", "parts missing before scheduled inspection", "failed MOT, urgent repairs needed"],
  },
  "vehicle repair centres": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["customer collection date, repair incomplete", "repair waiting for parts", "warranty parts urgent"],
  },
  "accident repair centres": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["insurance deadline approaching, repair not finished", "customer collection date, repair incomplete", "rare parts urgent"],
  },
  "vehicle dealerships": {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["customer waiting, vehicle from warehouse", "test drive car breakdown, recovery urgent", "popular model out of stock"],
  },
  "fleet operators": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["vehicle breakdown, fleet grounded", "lorry breaks down, fleet grounded", "maintenance deadline approaching"],
  },
  "commercial vehicle workshops": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["urgent repair parts needed", "heavy commercial vehicle waiting for repair", "customer delivery deadline at risk"],
  },

  // MANUFACTURING & ENGINEERING
  "engineering companies": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["planning deadline approaching", "design approval deadline", "project submission deadline"],
  },
  "precision manufacturers": {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["component urgently needed for client", "custom component needed by client", "client deadline approaching"],
  },
  "electronics manufacturers": {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["component stock critical, order deadline", "production halted waiting for parts", "customer deadline approaching"],
  },
  "industrial suppliers": {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["customer production halted, parts urgent", "customer production line stopped", "just-in-time delivery failed"],
  },
  "machine shops": {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["custom part due for collection", "deadline approaching, work incomplete", "customer deadline missed"],
  },

  // FINANCE
  accountants: {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["tax deadline tomorrow", "year-end filing deadline today", "audit documents missing"],
  },
  "financial advisers": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["client meeting today, documents needed", "investment papers needed urgently", "regulatory filing deadline today"],
  },
  "mortgage brokers": {
    behaviourGroup: "Completion Driven",
    triggerEvents: ["mortgage completion, documents missing", "mortgage deed needed before property completion", "completion deadline today, documents missing"],
  },
  "insurance brokers": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["policy deadline, documents needed", "claim paperwork deadline today", "renewal deadline approaching"],
  },

  // EVENTS & MEDIA
  "event organisers": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["event today, setup materials missing", "event happening, materials missing", "contractor arriving, permits missing"],
  },
  "exhibition companies": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["exhibition opens today, materials missing", "display not installed, exhibition opening", "stand materials not arrived"],
  },
  "wedding planners": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["wedding day today, vendor missing", "decoration materials missing hours before", "contracts missing from client"],
  },
  "av suppliers": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["event today, AV equipment missing", "event happening, equipment missing", "last-minute equipment installation"],
  },
  "tv production": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["broadcast deadline approaching", "footage missing before edit deadline", "equipment needed for shoot today"],
  },
  "film production": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["production equipment missing for shoot", "filming schedule halted waiting for equipment", "location permits missing"],
  },
  "photography studios": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["event today, backup equipment needed", "equipment failure on event day", "print deadline for wedding album"],
  },
  "marketing agencies": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["campaign launch deadline today", "client assets missing for deployment", "approved designs missing from client"],
  },
  "print companies": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["print deadline approaching, artwork missing", "final artwork missing from client", "proofs needed for approval"],
  },

  // TECHNOLOGY
  "it support companies": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["client system emergency", "onsite support needed urgently", "equipment failure, replacement urgent"],
  },
  "data centres": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["cooling failure, emergency", "servers overheating, business stops", "power backup urgent"],
  },
  "telecom providers": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["network outage, emergency repair", "customers cannot operate", "infrastructure failure"],
  },
  "hardware resellers": {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["customer waiting, stock missing", "competitor has stock, restock needed", "urgent order from client"],
  },
  "managed service providers": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["client system emergency", "onsite emergency support needed", "client system emergency"],
  },

  // EDUCATION
  universities: {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["exam today, test papers missing", "submission deadline, documents needed", "graduation date approaching"],
  },
  colleges: {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["course deadline approaching", "assessment date, materials missing", "enrollment deadline approaching"],
  },
  "private schools": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["exam today, test papers missing", "parent meeting documents needed", "school event, materials missing"],
  },
  "training providers": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["course deadline approaching", "certification deadline approaching", "student assessment deadline"],
  },

  // RECRUITMENT
  "recruitment agencies": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["interview today, documents missing", "placement deadline, paperwork urgent", "client documents needed for review"],
  },
  "staffing agencies": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["assignment date, documents not ready", "client request urgent, staff needed", "payroll deadline approaching"],
  },

  // AVIATION
  "aircraft maintenance": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["aircraft grounded, spare parts urgent", "spare parts critical, cannot fly", "maintenance window closing"],
  },
  airports: {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["maintenance window closing, equipment needed", "runway maintenance urgent", "flight schedule delayed"],
  },
  "flight operators": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["flight departure today, docs missing", "aircraft parts urgent", "crew documentation missing"],
  },

  // MARITIME
  "shipping agents": {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["cargo deadline, documents missing", "documentation missing for customs", "vessel departure imminent"],
  },
  "port operators": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["vessel deadline, equipment needed", "vessel in port with limited time window", "operations blocked"],
  },
  "marine engineering": {
    behaviourGroup: "Operational Continuity",
    triggerEvents: ["vessel breakdown, parts urgent", "emergency repair needed", "safety inspection urgent"],
  },

  // SECURITY
  "security companies": {
    behaviourGroup: "Emergency Response",
    triggerEvents: ["security breach emergency", "immediate response needed", "incident evidence transport"],
  },
  "alarm installers": {
    behaviourGroup: "Emergency Response",
    triggerEvents: ["alarm system failure", "property vulnerable, emergency service call", "repair visit urgent"],
  },
  locksmiths: {
    behaviourGroup: "Emergency Response",
    triggerEvents: ["property access emergency", "emergency locksmith visit needed", "security installation emergency"],
  },

  // LUXURY & SPECIALIST
  jewellers: {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["customer collection date, item incomplete", "collection date approaching", "urgent repair for customer"],
  },
  "watch specialists": {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["customer collection date, repair incomplete", "collection appointment today", "specialist part needed urgently"],
  },
  "fashion houses": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["fashion show deadline approaching", "collection deadline, materials urgent", "customer order urgent"],
  },
  tailors: {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["customer collection date, alterations incomplete", "wedding dress due today", "special event outfit needed urgently"],
  },
  "luxury retailers": {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["VIP customer waiting, stock missing", "high-value item transfer between locations", "exclusive delivery deadline"],
  },
  "art galleries": {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["exhibition opens, artwork not arrived", "client viewing scheduled, piece needed", "artwork transfer between galleries"],
  },
  "auction houses": {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["auction day, lots missing", "lot transport urgent", "item authentication deadline"],
  },
  museums: {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["exhibition opening, artifacts missing", "loan deadline approaching", "insurance documentation urgent"],
  },

  // FUNERAL SERVICES
  "funeral directors": {
    behaviourGroup: "Emergency Response",
    triggerEvents: ["funeral date approaching, body transfer", "body transfer urgent", "cremation deadline approaching"],
  },
  "crematorium services": {
    behaviourGroup: "Emergency Response",
    triggerEvents: ["cremation scheduled, paperwork urgent", "cremation scheduled, documentation missing", "certification deadline today"],
  },
  "memorial companies": {
    behaviourGroup: "Emergency Response",
    triggerEvents: ["memorial installation urgent", "family gathering, memorial not ready", "engraving deadline"],
  },

  // INFRASTRUCTURE & UTILITIES
  "electricity contractors": {
    behaviourGroup: "Site Continuity",
    triggerEvents: ["power outage emergency", "building cannot operate", "inspection deadline today"],
  },
  "gas contractors": {
    behaviourGroup: "Site Continuity",
    triggerEvents: ["boiler failure, emergency", "gas supply emergency", "safety inspection deadline"],
  },
  "water contractors": {
    behaviourGroup: "Site Continuity",
    triggerEvents: ["pipe burst, emergency repair", "water supply emergency", "maintenance deadline urgent"],
  },
  "fibre installers": {
    behaviourGroup: "Deadline Driven",
    triggerEvents: ["installation deadline, equipment missing", "connection deadline for customer", "repair needed, parts urgent"],
  },
  "rail contractors": {
    behaviourGroup: "Site Continuity",
    triggerEvents: ["track work deadline, equipment needed", "safety equipment missing", "inspection paperwork urgent"],
  },
  "rail maintenance": {
    behaviourGroup: "Site Continuity",
    triggerEvents: ["track damage, urgent repair", "maintenance window closing", "safety inspection materials needed"],
  },

  // RESTAURANTS & FOOD
  restaurants: {
    behaviourGroup: "Supply Chain",
    triggerEvents: ["service in 2 hours, supplier failed", "ingredient stock critical, emergency run", "key ingredient missing"],
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
    triggerEvents: ["event today, flowers missing", "wedding delivery tomorrow", "market collection missed, stock depleted"],
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
