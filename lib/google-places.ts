// Google Places API integration

export interface PlacesSearchResult {
  place_id: string;
  name: string;
  rating: number;
  review_count: number;
  types: string[];
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface PlacesReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
}

export interface PlacesDetails {
  place_id: string;
  name: string;
  rating: number;
  review_count: number;
  reviews: PlacesReview[];
  formatted_address: string;
  website?: string;
  formatted_phone_number?: string;
  types: string[];
}

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const BASE_URL = 'https://maps.googleapis.com/maps/api/place';

// Search for businesses by type and location
export async function searchPlaces(
  query: string,
  location: string,
  radius: number = 5000
): Promise<PlacesSearchResult[]> {
  if (!API_KEY) {
    throw new Error('[Google Places] No API key found. Set GOOGLE_MAPS_API_KEY environment variable.');
  }

  try {
    const searchQuery = `${query} in ${location}`;
    const response = await fetch(
      `${BASE_URL}/textsearch/json?query=${encodeURIComponent(
        searchQuery
      )}&radius=${radius}&key=${API_KEY}`
    );

    const data = (await response.json()) as { results: PlacesSearchResult[] };
    console.log(`[Google Places] Found ${data.results?.length || 0} results for "${searchQuery}"`);
    return data.results || [];
  } catch (error) {
    console.error('[Google Places] Search error:', error);
    throw error;
  }
}

// Get detailed information about a place including reviews
export async function getPlaceDetails(placeId: string): Promise<PlacesDetails | null> {
  if (!API_KEY) {
    throw new Error('[Google Places] No API key found. Set GOOGLE_MAPS_API_KEY environment variable.');
  }

  try {
    const response = await fetch(
      `${BASE_URL}/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,formatted_address,website,formatted_phone_number,types&key=${API_KEY}`
    );

    const data = (await response.json()) as { result: PlacesDetails & { user_ratings_total: number } };
    if (!data.result) {
      console.warn(`[Google Places] No details found for place_id: ${placeId}`);
      return null;
    }

    const result = data.result;
    return {
      place_id: result.place_id,
      name: result.name,
      rating: result.rating || 0,
      review_count: result.user_ratings_total || 0,
      reviews: result.reviews || [],
      formatted_address: result.formatted_address,
      website: result.website,
      formatted_phone_number: result.formatted_phone_number,
      types: result.types,
    };
  } catch (error) {
    console.error('[Google Places] Details error:', error);
    throw error;
  }
}

