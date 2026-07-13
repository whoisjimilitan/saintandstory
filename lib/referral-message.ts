/**
 * Referral Message Generator
 * Creates consistent, clickable referral messages for all referral pages
 * Supports optional link for better conversion
 */

export function generateReferralMessage(code: string, link?: string): string {
  const baseMessage = `For urgent deliveries, I recommend Saint & Story. Use code ${code}.`;

  if (link) {
    return `${baseMessage} Check this out: ${link}`;
  }

  return baseMessage;
}

/**
 * Get the recommended link for a referral based on context
 * Can be customized per city or use a general landing page
 */
export function getReferralLink(city?: string): string {
  // Default to homepage. Can expand to city-specific pages if needed
  // Example: https://saintandstoryltd.co.uk/london-home-moves
  // For now, use a generic service page that works for all cities
  return "https://saintandstoryltd.co.uk/services";
}
