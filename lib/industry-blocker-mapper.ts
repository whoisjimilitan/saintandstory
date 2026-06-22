/**
 * Industry Blocker Mapper
 *
 * Maps each industry to:
 * - What gets stuck (blocker)
 * - When it happens (timing/urgency)
 * - Why it matters (pain point)
 * - What solution helps (logistics type)
 * - Email reference (what to mention in first line)
 *
 * This is the SOURCE OF TRUTH for industry-specific context
 */

export type LogisticsSolution =
  | "same-day-delivery"
  | "urgent-courier"
  | "scheduled-pickup"
  | "van-and-driver"
  | "backup-vehicle"
  | "express-service"
  | "access-delivery"
  | "fulfillment";

export interface Blocker {
  name: string; // "documents stuck", "prescriptions stuck", etc
  urgency: "immediate" | "same-day" | "scheduled"; // How urgent
  timeWindow?: string; // "2 hours", "before 1pm", etc
  painPoint: string; // Why it matters to them
  solution: LogisticsSolution;
  emailReference: string; // What to mention in first line
  confidence: number; // How confident we are they have this blocker (0-1)
}

export interface IndustryProfile {
  industry: string;
  keywords: string[]; // Keywords to match in Dork search
  primaryBlocker: Blocker;
  secondaryBlockers?: Blocker[];
  industryInsight: string; // Context for understanding this industry
}

export const INDUSTRY_BLOCKERS: Record<string, IndustryProfile> = {
  // LEGAL
  lawyers: {
    industry: "Lawyers & Law Firms",
    keywords: ["lawyer", "solicitor", "legal", "law firm", "attorney", "law", "barrister"],
    primaryBlocker: {
      name: "documents-stuck",
      urgency: "immediate",
      timeWindow: "before court deadline (usually 1-3 hours)",
      painPoint: "File must reach courthouse before deadline or case is delayed/dismissed",
      solution: "urgent-courier",
      emailReference: "Documents need to reach courthouse by [time], not tomorrow",
      confidence: 0.96
    },
    secondaryBlockers: [
      {
        name: "client-meeting-access",
        urgency: "same-day",
        timeWindow: "before client meeting",
        painPoint: "Need documents or files delivered before client arrives",
        solution: "express-service",
        emailReference: "Client coming at 2pm but files still in storage?",
        confidence: 0.75
      }
    ],
    industryInsight: "Lawyers operate on strict court deadlines. A missed deadline = case delay = professional liability. They'll pay premium for guaranteed same-day delivery."
  },

  // PHARMACY
  pharmacy: {
    industry: "Pharmacies & Chemists",
    keywords: ["pharmacy", "chemist", "pharmacist", "prescription", "drug store", "pharma"],
    primaryBlocker: {
      name: "urgent-prescriptions",
      urgency: "immediate",
      timeWindow: "same-day patient need",
      painPoint: "Patient needs medication urgently; delayed delivery = poor service, lost customer",
      solution: "same-day-delivery",
      emailReference: "Urgent prescription needs to reach patient today, not next week?",
      confidence: 0.94
    },
    secondaryBlockers: [
      {
        name: "stock-delivery-backlog",
        urgency: "scheduled",
        timeWindow: "daily restocking",
        painPoint: "Need daily inventory deliveries from wholesaler",
        solution: "scheduled-pickup",
        emailReference: "Daily stock orders piling up without delivery?",
        confidence: 0.82
      }
    ],
    industryInsight: "Pharmacies have strict patient delivery windows. Miss a window = lost customer + reputation damage. They need reliable, same-day logistics."
  },

  // DENTISTRY
  dentistry: {
    industry: "Dental Practices",
    keywords: ["dentist", "dental", "orthodontist", "dental practice", "dental clinic", "dentistry"],
    primaryBlocker: {
      name: "cancellation-gaps",
      urgency: "immediate",
      timeWindow: "2-4pm afternoon gaps",
      painPoint: "Last-minute cancellation = empty chair = lost revenue per minute",
      solution: "backup-vehicle",
      emailReference: "Cancellation just freed up 2 hours this afternoon—lost revenue opportunity?",
      confidence: 0.88
    },
    secondaryBlockers: [
      {
        name: "lab-delivery-delay",
        urgency: "same-day",
        timeWindow: "before closing (6pm usual)",
        painPoint: "Crowns/dentures from lab need urgent delivery to keep patient appointment",
        solution: "express-service",
        emailReference: "Lab delivery stuck in traffic—patient waiting at 5pm?",
        confidence: 0.80
      }
    ],
    industryInsight: "Dentists operate on appointment schedules. Every gap = lost revenue. They respond to immediate same-day solutions that fill capacity or deliver time-sensitive lab work."
  },

  // MOVING & REMOVAL
  removals: {
    industry: "Moving & Removal Companies",
    keywords: ["removal", "removals", "moving", "house move", "van hire", "logistics", "mover"],
    primaryBlocker: {
      name: "weekend-overflow",
      urgency: "immediate",
      timeWindow: "Saturday 2-6pm typical peak",
      painPoint: "Double-booked Saturday = vehicle stuck + next job delayed = customer unhappy",
      solution: "van-and-driver",
      emailReference: "Saturday double-booking at 2pm—need backup van + driver within 1 hour?",
      confidence: 0.91
    },
    secondaryBlockers: [
      {
        name: "equipment-delivery",
        urgency: "same-day",
        timeWindow: "before job start (8am typical)",
        painPoint: "Specialized equipment needs to reach site before first job starts",
        solution: "express-service",
        emailReference: "Moving equipment stuck at depot—first job starts in 2 hours?",
        confidence: 0.83
      }
    ],
    industryInsight: "Removal companies operate on tight Saturday schedules. Peak times = bottlenecks = customer complaints. They desperately need backup capacity during peak hours."
  },

  // E-COMMERCE
  ecommerce: {
    industry: "E-Commerce & Online Stores",
    keywords: ["ecommerce", "online store", "shopify", "woocommerce", "order fulfillment", "dropship"],
    primaryBlocker: {
      name: "fulfillment-backlog",
      urgency: "same-day",
      timeWindow: "next-day shipping promise",
      painPoint: "30+ orders stuck in warehouse = breach of 'ships within 24h' promise = customer reviews tank",
      solution: "fulfillment",
      emailReference: "50 orders in warehouse need to ship today to hit your 24h promise?",
      confidence: 0.89
    },
    secondaryBlockers: [
      {
        name: "last-minute-rush",
        urgency: "immediate",
        timeWindow: "same-day",
        painPoint: "Flash sale or viral post = 10x normal orders, warehouse overwhelmed",
        solution: "van-and-driver",
        emailReference: "Flash sale just hit 200+ orders—warehouse staff at breaking point?",
        confidence: 0.76
      }
    ],
    industryInsight: "E-commerce businesses live by fulfillment speed. Late shipments = negative reviews = lost repeat customers. They'll pay for same-day fulfillment during peak times."
  },

  // PLUMBING & EMERGENCY SERVICES
  plumbing: {
    industry: "Plumbing & Emergency Services",
    keywords: ["plumber", "plumbing", "emergency plumber", "pipework", "water leak"],
    primaryBlocker: {
      name: "after-hours-access",
      urgency: "immediate",
      timeWindow: "9pm-6am emergency calls",
      painPoint: "Customer emergency call at 11pm needs urgent parts delivery to finish job tonight",
      solution: "urgent-courier",
      emailReference: "Customer emergency at 11pm—urgent parts delivery or job fails until morning?",
      confidence: 0.87
    },
    secondaryBlockers: [
      {
        name: "equipment-delivery",
        urgency: "same-day",
        timeWindow: "before job appointment",
        painPoint: "Specialized tools/materials needed for morning appointment",
        solution: "express-service",
        emailReference: "Job tomorrow morning but tools stuck at supplier?",
        confidence: 0.81
      }
    ],
    industryInsight: "Emergency plumbers operate 24/7. After-hours calls need urgent solution delivery or the job fails and customer is angry. They pay premium for midnight delivery."
  },

  // SALONS & BEAUTY
  salon: {
    industry: "Hair Salons & Beauty",
    keywords: ["salon", "hair salon", "barber", "beautician", "hairdresser", "beauty spa"],
    primaryBlocker: {
      name: "product-stock-out",
      urgency: "same-day",
      timeWindow: "during business hours (10am-6pm)",
      painPoint: "Run out of popular color/product mid-day = turn away customers = lost sales",
      solution: "same-day-delivery",
      emailReference: "Out of stock during peak hours—can't serve waiting customers?",
      confidence: 0.84
    },
    secondaryBlockers: [
      {
        name: "appointment-cancellation-gap",
        urgency: "immediate",
        timeWindow: "2pm-4pm afternoon",
        painPoint: "Last-minute cancellation = empty chair during peak hours",
        solution: "backup-vehicle",
        emailReference: "Cancellation freed 2 hours at peak time—mobile service opportunity?",
        confidence: 0.72
      }
    ],
    industryInsight: "Salons operate on appointment-based revenue. Stock-outs during peak hours = direct revenue loss. They'll pay for same-day product delivery during busy times."
  },

  // ACCOUNTANTS & BOOKKEEPERS
  accountants: {
    industry: "Accountants & Bookkeepers",
    keywords: ["accountant", "bookkeeper", "accounting", "tax advisor", "financial advisor"],
    primaryBlocker: {
      name: "deadline-documents",
      urgency: "immediate",
      timeWindow: "tax deadline (31st Jan, 14th Feb, etc)",
      painPoint: "Missing document delivery = missed tax deadline = penalty + professional liability",
      solution: "urgent-courier",
      emailReference: "Documents needed before tax filing deadline in 24 hours?",
      confidence: 0.93
    },
    secondaryBlockers: [
      {
        name: "client-meeting-prep",
        urgency: "same-day",
        timeWindow: "before meeting (usually morning)",
        painPoint: "Need financial documents organized before client meeting",
        solution: "express-service",
        emailReference: "Client meeting at 10am but documents still at archive?",
        confidence: 0.78
      }
    ],
    industryInsight: "Accountants work on strict regulatory deadlines. Miss a deadline = financial penalties + professional consequences. They'll pay premium for guaranteed delivery."
  }
};

/**
 * Get industry profile by business category
 */
export function getIndustryProfile(businessCategory?: string): IndustryProfile | null {
  if (!businessCategory) return null;

  const lower = businessCategory.toLowerCase();

  for (const [, profile] of Object.entries(INDUSTRY_BLOCKERS)) {
    for (const keyword of profile.keywords) {
      if (lower.includes(keyword)) {
        return profile;
      }
    }
  }

  return null;
}

/**
 * Get blocker from industry profile
 */
export function getBlockerForIndustry(businessCategory?: string): Blocker | null {
  const profile = getIndustryProfile(businessCategory);
  return profile?.primaryBlocker || null;
}

/**
 * Get email reference from blocker
 */
export function getEmailReference(businessCategory?: string): string | null {
  const blocker = getBlockerForIndustry(businessCategory);
  return blocker?.emailReference || null;
}

/**
 * Get confidence score for blocker match
 */
export function getBlockerConfidence(businessCategory?: string): number {
  const blocker = getBlockerForIndustry(businessCategory);
  return blocker?.confidence || 0;
}
