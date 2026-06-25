/**
 * B2B EMAIL REASONING ENGINE (UNIVERSAL DELIVERY PAIN POINTS)
 *
 * Locked implementation of the four lightbulb ideas:
 * 1. Inverse Incentive Positioning
 * 2. Self-Discovery Over Telling
 * 3. Pain-to-Picture Painting
 * 4. Universal Delivery Challenges (not category guessing)
 *
 * Strategy: Default to PEAK TIME OVERWHELM (true for every business with shipping needs).
 * Only vary if we have high confidence from prospect data.
 *
 * No modifications without approval. Updated 2026-06-25.
 */

interface ProspectData {
  id: string;
  businessName: string;
  businessCategory?: string;
  city?: string;
  email: string;
}

interface GeneratedEmail {
  prospectId: string;
  businessName: string;
  city: string;
  email: string;
  subject: string;
  body: string;
  wordCount: number;
  painPoint?: string;
  hasPicture: boolean;
}

// Major UK cities where "across" is appropriate
const MAJOR_CITIES = [
  "London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Liverpool",
  "Edinburgh", "Bristol", "Cardiff", "Belfast", "Sheffield", "Nottingham",
  "Leicester", "Coventry", "Bradford", "Bath", "Oxford", "Cambridge",
  "Reading", "Norwich", "Peterborough", "Southampton", "Portsmouth",
  "Newcastle", "Sunderland", "Hull", "Stoke-on-Trent", "Wolverhampton",
  "Slough", "Crawley", "Colchester", "Derby", "Doncaster", "Exeter",
  "Plymouth", "Brighton", "Swindon", "Northampton", "Ipswich", "Runcorn"
];

function isMajorCity(city?: string): boolean {
  if (!city) return false;
  return MAJOR_CITIES.some(c => c.toLowerCase() === city.toLowerCase());
}

/**
 * UNIVERSAL PAIN POINTS
 * Every business that ships faces at least one of these.
 * Keyed by keywords in business name/category to try to match,
 * but defaults to PEAK TIME OVERWHELM if unsure.
 */
const UNIVERSAL_PAIN_POINTS = {
  peak_time_overwhelm: {
    pain: "Peak time creates overwhelm",
    picture: "Peak season hits. Everything moves at once. One slip costs you.",
    keywords: ["retail", "restaurant", "hospitality", "e-commerce", "shop", "store"],
  },
  timing_pressure: {
    pain: "Tight deadlines create pressure",
    picture: "Deadline's tight. Your courier's drowning. Client waiting.",
    keywords: ["event", "wedding", "urgent", "same-day", "express", "florist"],
  },
  reliability_concerns: {
    pain: "Delivery failures damage reputation",
    picture: "A failed delivery. One unhappy customer. Reviews damaged.",
    keywords: ["service", "delivery", "supply", "vendor", "contractor"],
  },
  coordination_chaos: {
    pain: "Multi-location coordination is hard",
    picture: "Multiple locations. One courier drops the ball. All your sites feel it.",
    keywords: ["franchise", "chain", "branch", "office", "site", "location", "multi"],
  },
  capacity_gaps: {
    pain: "Growth creates scaling challenges",
    picture: "Big order comes in. Your courier can't scale. You miss the revenue.",
    keywords: ["growth", "scale", "expanding", "startup", "wholesale", "bulk"],
  },
};

/**
 * Detect which pain point fits best
 * Returns DEFAULT (peak time overwhelm) if no high-confidence match found
 */
function detectPainPoint(
  businessName?: string,
  businessCategory?: string
): { pain: string; picture: string } {
  if (!businessName && !businessCategory) {
    return {
      pain: UNIVERSAL_PAIN_POINTS.peak_time_overwhelm.pain,
      picture: UNIVERSAL_PAIN_POINTS.peak_time_overwhelm.picture,
    };
  }

  const searchText = `${businessName || ""} ${businessCategory || ""}`.toLowerCase();

  // Try to match keywords (only if we find a keyword, we use that pain point)
  for (const [key, config] of Object.entries(UNIVERSAL_PAIN_POINTS)) {
    for (const keyword of config.keywords) {
      if (searchText.includes(keyword)) {
        return { pain: config.pain, picture: config.picture };
      }
    }
  }

  // No match found: DEFAULT to peak time overwhelm (safest, most universal)
  return {
    pain: UNIVERSAL_PAIN_POINTS.peak_time_overwhelm.pain,
    picture: UNIVERSAL_PAIN_POINTS.peak_time_overwhelm.picture,
  };
}

/**
 * LOCKED EMAIL TEMPLATE
 * Four lightbulb ideas embedded:
 * 1. Inverse incentive positioning (validate their solution first)
 * 2. Self-discovery (ask them to identify)
 * 3. Pain painting (show cascade - always shown now)
 * 4. Universal delivery challenges (no category guessing)
 */
function renderEmail(prospect: ProspectData, senderName: string): { subject: string; body: string } {
  const painPoint = detectPainPoint(prospect.businessName, prospect.businessCategory);
  const city = prospect.city || "your area";

  // Use "across" for major cities, "to" for small towns
  const preposition = isMajorCity(city) ? "across" : "to";

  // SUBJECT LINE (locked template - city only, no postcode)
  const subject = `We're expanding ${preposition} ${city} - set up your account`;

  // BODY (locked template with picture - always shown for universal pain points)
  let body = `Hi ${prospect.businessName},

I'm sure your main courier handles things well. We're useful for when they can't or when they don't — poor capacity, speed, reliability, consistency. One of these usually happens or has happened to you in the past.

${painPoint.picture}

Since we're expanding ${preposition} ${city}, I set up your account for free. No charge. No strings.

Quick question: does this actually apply to you? Yes, Maybe, or No?

That helps me know if this timing makes sense.

Best regards,
${senderName}
Saint & Story`;

  return { subject, body };
}

/**
 * Main reasoning engine: takes prospect, returns optimized email
 */
export function generateB2BOutreachEmail(
  prospect: ProspectData,
  senderName: string = "James"
): GeneratedEmail {
  const { subject, body } = renderEmail(prospect, senderName);
  const painPoint = detectPainPoint(prospect.businessName, prospect.businessCategory);

  return {
    prospectId: prospect.id,
    businessName: prospect.businessName,
    city: prospect.city || "your area",
    email: prospect.email,
    subject,
    body,
    wordCount: body.split(/\s+/).length,
    painPoint: painPoint.pain,
    hasPicture: true,
  };
}
