/**
 * Discovery source interface.
 *
 * Implementations: GooglePlacesSource, YelpSource, CsvSource, etc.
 * All sources must return the same payload format.
 */

export interface RawBusinessPayload {
  sourceType: string              // "google_places" | "yelp" | "csv"
  sourceEntityId: string          // placeId or external ID
  sourceUrl: string | undefined
  name: string
  address: string | undefined
  phone: string | undefined
  website: string | undefined
  reviews: Array<{
    author: string
    rating: number
    text: string
    time: number
  }>
  rawPayload: Record<string, unknown>  // Full original API response, never discarded
}

export interface IDiscoverySource {
  discover(query: string, location: string): Promise<RawBusinessPayload[]>
}
