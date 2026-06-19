/**
 * Observation Engine - External Adapters (Wave 1.1)
 *
 * Integration with Google Places API
 * Fetches raw data only. No processing. No interpretation.
 */

export interface GooglePlacesDetails {
  name: string;
  formatted_address: string;
  website?: string;
  formatted_phone_number?: string;
  opening_hours?: {
    weekday_text: string[];
  };
  types: string[];
  rating?: number;
  user_ratings_total?: number;
  reviews?: Array<{
    text: string;
    rating: number;
    time: number;
    author_name: string;
  }>;
  place_id: string;
}

/**
 * Fetch business details from Google Places API
 * Returns raw data only
 */
export async function fetchGooglePlacesDetails(
  placeId: string,
  apiKey: string
): Promise<GooglePlacesDetails | null> {
  if (!apiKey || !placeId) {
    throw new Error('Missing Google Places API key or place ID');
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.append('place_id', placeId);
    url.searchParams.append('key', apiKey);
    url.searchParams.append('fields', [
      'name',
      'formatted_address',
      'website',
      'formatted_phone_number',
      'opening_hours',
      'types',
      'rating',
      'user_ratings_total',
      'reviews',
      'place_id',
    ].join(','));

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== 'OK') {
      throw new Error(`Google Places status: ${data.status}`);
    }

    return data.result;
  } catch (error) {
    console.error('[observation-adapter] Google Places fetch failed:', error);
    throw error;
  }
}

/**
 * Extract data from Google Places details
 * Returns structured data only (no Evidence objects)
 */
export function extractGooglePlacesData(details: GooglePlacesDetails) {
  return {
    business_name: details.name,
    address: details.formatted_address,
    google_place_id: details.place_id,
    phone_number: details.formatted_phone_number,
    website_url: details.website,
    google_rating: details.rating,
    review_count: details.user_ratings_total,
    operating_hours: details.opening_hours?.weekday_text,
    industry_category: details.types?.[0],
    reviews: details.reviews || [],
  };
}

/**
 * Extract raw review data from Google Places
 * Returns array of review objects (no processing)
 */
export function extractReviewsFromGooglePlaces(
  details: GooglePlacesDetails
): Array<{ text: string; rating: number; author: string; date: number }> {
  if (!details.reviews || details.reviews.length === 0) {
    return [];
  }

  return details.reviews.map(review => ({
    text: review.text,
    rating: review.rating,
    author: review.author_name,
    date: review.time,
  }));
}

/**
 * Fetch and parse website for operational keywords
 * Returns raw text content (no processing)
 */
export async function fetchWebsiteContent(
  url: string | undefined
): Promise<string | null> {
  if (!url) return null;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SignalOS/1.0)',
      },
      timeout: 5000,
    });

    if (!response.ok) {
      return null;
    }

    const text = await response.text();
    return text;
  } catch (error) {
    console.error('[observation-adapter] Website fetch failed:', error);
    return null;
  }
}

/**
 * Extract postcode from address string (UK format)
 * Heuristic: last 6-8 chars after last comma
 */
export function extractPostcodeFromAddress(address: string): string {
  const parts = address.split(',');
  if (parts.length === 0) return '';

  const lastPart = parts[parts.length - 1].trim();

  // UK postcode regex: loose match for space in middle
  const match = lastPart.match(/([A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2})/i);
  return match ? match[0] : lastPart;
}
