/**
 * B2B EMAIL REASONING ENGINE
 *
 * Locked implementation of the four lightbulb ideas:
 * 1. Inverse Incentive Positioning
 * 2. Self-Discovery Over Telling
 * 3. Pain-to-Picture Painting
 * 4. Pattern-Based Observation
 *
 * Generates ONE optimized email per prospect following locked template.
 * No modifications without approval.
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

/**
 * PAIN IDENTIFICATION MAPPING
 * Universal pain points by business category (pattern-based, always true)
 */
const PAIN_IDENTIFICATION_MAP: Record<string, { pain: string; picture: string }> = {
  // Accounting / Tax / Legal
  "accounting": {
    pain: "Tax season creates chaos around deadlines",
    picture: "Tax season hits. A missed pickup becomes a missed deadline becomes an angry client."
  },
  "tax": {
    pain: "Tax season creates chaos around deadlines",
    picture: "Tax season hits. A missed pickup becomes a missed deadline becomes an angry client."
  },
  "legal": {
    pain: "Deadline pressure creates chaos",
    picture: "Deadline hits. A missed document becomes a missed filing becomes a compliance issue."
  },
  "tax services": {
    pain: "Tax season creates chaos around deadlines",
    picture: "Tax season hits. A missed pickup becomes a missed deadline becomes an angry client."
  },

  // Florist / Event Services
  "florist": {
    pain: "Event/same-day deadlines are unforgiving",
    picture: "Event delivery deadline. Your courier's drowning. Client waiting."
  },
  "event services": {
    pain: "Event/same-day deadlines are unforgiving",
    picture: "Event delivery deadline. Your courier's drowning. Client waiting."
  },
  "events": {
    pain: "Event/same-day deadlines are unforgiving",
    picture: "Event delivery deadline. Your courier's drowning. Client waiting."
  },
  "flowers": {
    pain: "Event/same-day deadlines are unforgiving",
    picture: "Event delivery deadline. Your courier's drowning. Client waiting."
  },

  // Logistics / Courier / Delivery
  "logistics": {
    pain: "Peak hours overwhelm capacity",
    picture: "Rush hour. Everything needs to move at once. One slip costs you."
  },
  "courier": {
    pain: "Peak hours overwhelm capacity",
    picture: "Rush hour. Everything needs to move at once. One slip costs you."
  },
  "delivery": {
    pain: "Peak hours overwhelm capacity",
    picture: "Rush hour. Everything needs to move at once. One slip costs you."
  },

  // Office Services / Facilities
  "office services": {
    pain: "Multiple locations mean coordination nightmares",
    picture: "Multiple offices. One courier drops the ball. All your sites feel it."
  },
  "facilities management": {
    pain: "Multiple locations mean coordination nightmares",
    picture: "Multiple offices. One courier drops the ball. All your sites feel it."
  },

  // Retail / Hospitality / Food
  "retail": {
    pain: "Seasonal volume spikes create chaos",
    picture: "Holiday season. Everything moves at once. One missed delivery tanks reviews."
  },
  "hospitality": {
    pain: "Seasonal volume spikes create chaos",
    picture: "Holiday season. Everything moves at once. One missed delivery tanks reviews."
  },
  "food service": {
    pain: "Seasonal volume spikes create chaos",
    picture: "Holiday season. Everything moves at once. One missed delivery tanks reviews."
  },
  "restaurant": {
    pain: "Seasonal volume spikes create chaos",
    picture: "Holiday season. Everything moves at once. One missed delivery tanks reviews."
  },
};

/**
 * Get pain point and picture for prospect category
 * Returns null if category not found (use base email)
 */
function getPainPoint(category?: string): { pain: string; picture: string } | null {
  if (!category) return null;

  const normalized = category.toLowerCase().trim();

  // Try exact match first
  if (PAIN_IDENTIFICATION_MAP[normalized]) {
    return PAIN_IDENTIFICATION_MAP[normalized];
  }

  // Try partial match (substring)
  for (const [key, value] of Object.entries(PAIN_IDENTIFICATION_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  return null;
}

/**
 * LOCKED EMAIL TEMPLATE
 * Four lightbulb ideas embedded:
 * 1. Inverse incentive positioning (validate their solution first)
 * 2. Self-discovery (ask them to identify)
 * 3. Pain painting (show cascade if applicable)
 * 4. Pattern-based observation (don't guess specifics)
 */
function renderEmail(prospect: ProspectData, senderName: string): { subject: string; body: string } {
  const painPoint = getPainPoint(prospect.businessCategory);
  const city = prospect.city || "your area";

  // SUBJECT LINE (locked template)
  const subject = `We're expanding across ${city} - set up your account`;

  // BODY (locked template with optional picture)
  let body = `Hi ${prospect.businessName},

I'm sure your main courier handles things well. We're useful for when they can't or when they don't — poor capacity, speed, reliability, consistency. One of these usually happens or has happened to you in the past.`;

  // Add picture if pain point exists
  if (painPoint) {
    body += `\n\n${painPoint.picture}`;
  }

  body += `\n\nSince we're expanding across ${city}, I set up your account for free. No charge. No strings.

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
  const painPoint = getPainPoint(prospect.businessCategory);

  return {
    prospectId: prospect.id,
    businessName: prospect.businessName,
    city: prospect.city || "your area",
    email: prospect.email,
    subject,
    body,
    wordCount: body.split(/\s+/).length,
    painPoint: painPoint?.pain,
    hasPicture: !!painPoint,
  };
}
