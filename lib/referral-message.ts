/**
 * Referral Message Generator
 * Creates consistent, clickable referral messages for all referral pages
 * Includes link and discount messaging for better conversion
 */

export function generateReferralMessage(code: string, link?: string): string {
  const message = `Whenever we have urgent deliveries, collections, or moves, we use Saint & Story. They're reliable, professional, and transparent with pricing. Use my code ${code} for £10 off your order.`;

  if (link) {
    return `${message} Book at ${link}`;
  }

  return message;
}

/**
 * Get the recommended link for a referral based on city
 * Maps each city to its specific landing page for better conversion
 */
const cityToLandingPage: Record<string, string> = {
  London: "london-home-moves",
  Manchester: "manchester-office-moves",
  Birmingham: "birmingham-removals",
  Leeds: "leeds-removals",
  // Add more city mappings as landing pages are created
};

export function getReferralLink(city?: string): string {
  if (!city) {
    return "https://saintandstoryltd.co.uk/services";
  }

  const landingPage = cityToLandingPage[city];
  if (landingPage) {
    return `https://saintandstoryltd.co.uk/${landingPage}`;
  }

  // Fallback for unmapped cities
  return "https://saintandstoryltd.co.uk/services";
}
