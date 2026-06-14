/**
 * Email Attribution & UTM Parameter Management
 *
 * Adds traceable parameters to all outbound email links
 * Enables attribution from email send → landing page → conversion
 */

interface AttributionContext {
  campaignId: string;
  leadId: string;
  emailType?: string;
}

/**
 * Add UTM parameters to any URL
 * Preserves existing query parameters and fragments
 */
export function addUtmParams(
  url: string,
  context: AttributionContext
): string {
  if (!url || url.length === 0) return url;

  const params = new URLSearchParams();
  params.set("utm_source", "saintandstory");
  params.set("utm_medium", "email");
  params.set("utm_campaign", context.campaignId);
  params.set("utm_lead", context.leadId);

  if (context.emailType) {
    params.set("utm_content", context.emailType);
  }

  // Parse URL to preserve fragments
  try {
    const urlObj = new URL(url);
    // Add parameters to existing query string
    for (const [key, value] of params) {
      urlObj.searchParams.set(key, value);
    }
    return urlObj.toString();
  } catch {
    // If URL parsing fails, append params as query string
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}${params.toString()}`;
  }
}

/**
 * Wrap email body text with UTM parameters
 * Finds links and adds tracking while preserving format
 */
export function addUtmToEmailBody(
  body: string,
  context: AttributionContext
): string {
  // Match URLs in text (basic pattern for common patterns)
  const urlPattern = /(https?:\/\/[^\s)>\]]+)/g;

  return body.replace(urlPattern, (url) => {
    // Don't re-process already tracked URLs
    if (url.includes("utm_")) {
      return url;
    }
    return addUtmParams(url, context);
  });
}

/**
 * Add UTM parameters to email subject line meta tags (if needed)
 */
export function addUtmToHtmlEmail(
  html: string,
  context: AttributionContext
): string {
  // Find all href attributes and add UTM params
  const hrefPattern = /href=["']([^"']+)["']/g;

  return html.replace(hrefPattern, (match, url) => {
    // Skip email addresses and already tracked URLs
    if (url.startsWith("mailto:") || url.includes("utm_")) {
      return match;
    }
    const trackedUrl = addUtmParams(url, context);
    return `href="${trackedUrl}"`;
  });
}

/**
 * Generate tracking pixel URL for email opens
 * Returns 1x1 transparent pixel with tracking params
 */
export function generateTrackingPixel(
  context: AttributionContext
): string {
  const params = new URLSearchParams({
    utm_source: "saintandstory",
    utm_medium: "email",
    utm_campaign: context.campaignId,
    utm_lead: context.leadId,
  });

  return `https://saintandstory.com/api/pixel/track?${params.toString()}`;
}

/**
 * Parse UTM parameters from URL
 * Used when processing landing page visits
 */
export function parseUtmParams(url: string): Record<string, string> {
  try {
    const urlObj = new URL(url);
    const params: Record<string, string> = {};

    for (const [key, value] of urlObj.searchParams) {
      if (key.startsWith("utm_")) {
        params[key] = value;
      }
    }

    return params;
  } catch {
    return {};
  }
}

/**
 * Verify attribution integrity
 * Ensure URL has required UTM parameters
 */
export function verifyAttributionUrl(
  url: string,
  requiredParams: string[] = ["utm_source", "utm_medium", "utm_campaign", "utm_lead"]
): boolean {
  const params = parseUtmParams(url);
  return requiredParams.every((param) => param in params && params[param]);
}
