/**
 * Confession Scraper — Multi-source harvester of business needs.
 *
 * Fetches confessions (real people expressing problems) from:
 * - Reddit (r/business, r/startups, r/smallbusiness)
 * - Twitter (keyword searches)
 * - LinkedIn (posts with keywords)
 * - Google Alerts (forwarded to email, parsed)
 * - Facebook Groups (business owner groups)
 * - YouTube (comments on competitor videos)
 * - Trustpilot (negative reviews)
 * - Quora (business questions)
 * - News (scraped articles mentioning logistics issues)
 *
 * Returns list of confessions with source, timestamp, contact info.
 * Does NOT process yet — just collects raw text.
 */

export interface Confession {
  id: string;
  text: string;
  source: "reddit" | "twitter" | "linkedin" | "google_alerts" | "facebook" | "youtube" | "trustpilot" | "quora" | "news";
  source_url?: string;
  posted_date: Date;
  author_name?: string;
  author_email?: string;
  author_phone?: string;
  author_linkedin?: string;
  company_name?: string;
  company_website?: string;
  location?: string;
  raw_payload: Record<string, unknown>;
}

/**
 * Scrape confessions from all available sources.
 *
 * For MVP, returns mock data.
 * In production, would call actual APIs (Reddit, Twitter, etc.)
 */
export async function scrapeConfessions(): Promise<Confession[]> {
  const confessions: Confession[] = [];

  // In production, this would call:
  // - Reddit API via PRAW or similar
  // - Twitter API v2
  // - LinkedIn API (limited)
  // - Google Alerts (manual CSV upload)
  // - Facebook Graph API
  // - YouTube Data API
  // - Trustpilot API
  // - Quora scraping (if allowed)
  // - News RSS feeds

  // For now, return empty array — integration happens in routes
  return confessions;
}

/**
 * Filter confession for legitimacy.
 *
 * Rejects:
 * - Service providers selling solutions
 * - Spam / bot posts
 * - Irrelevant content
 *
 * Accepts:
 * - Real problems stated directly
 * - Questions asking for help
 * - Complaints about current provider
 * - Pain point confessions
 */
export function filterLegitimateConfession(text: string): {
  is_legitimate: boolean;
  confidence: number;
  reason: string;
} {
  const lowerText = text.toLowerCase();

  // Reject if selling something
  const sellerIndicators = [
    "we offer",
    "we provide",
    "get a quote",
    "contact us",
    "pricing",
    "call today",
    "message me",
    "click here to",
    "learn more at",
    "check out",
    "visit our site"
  ];

  for (const indicator of sellerIndicators) {
    if (lowerText.includes(indicator)) {
      return {
        is_legitimate: false,
        confidence: 0.95,
        reason: `Detected seller language: "${indicator}"`
      };
    }
  }

  // Accept if asking for help
  const needIndicators = [
    "need",
    "looking for",
    "anyone know",
    "does anyone",
    "struggling with",
    "can't seem to",
    "urgent",
    "emergency",
    "problem",
    "issue",
    "failing",
    "broken",
    "delay",
    "frustrated",
    "help"
  ];

  let needScore = 0;
  for (const indicator of needIndicators) {
    if (lowerText.includes(indicator)) {
      needScore += 0.2;
    }
  }

  if (needScore > 0.4) {
    return {
      is_legitimate: true,
      confidence: Math.min(0.95, needScore),
      reason: "Detected genuine need language"
    };
  }

  // Default: suspicious
  return {
    is_legitimate: false,
    confidence: 0.5,
    reason: "Unclear if genuine need"
  };
}

/**
 * Extract contact information from confession text and metadata.
 */
export function extractContactInfo(confession: Confession): {
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  company?: string;
  website?: string;
  location?: string;
} {
  return {
    name: confession.author_name,
    email: confession.author_email,
    phone: confession.author_phone,
    linkedin: confession.author_linkedin,
    company: confession.company_name,
    website: confession.company_website,
    location: confession.location
  };
}

/**
 * Calculate contact info completeness (0 = nothing, 1 = fully populated).
 */
export function getContactCompleteness(contact: ReturnType<typeof extractContactInfo>): number {
  const fields = [contact.name, contact.email, contact.phone, contact.linkedin, contact.company];
  const populated = fields.filter(f => f && f.trim()).length;
  return populated / fields.length;
}
