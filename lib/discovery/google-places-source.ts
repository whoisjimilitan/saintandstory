/**
 * Google Places implementation of IDiscoverySource.
 *
 * Searches for businesses and fetches reviews.
 * Requires GOOGLE_MAPS_API_KEY environment variable.
 */

import { IDiscoverySource, RawBusinessPayload } from "./source";
import { searchPlaces, getPlaceDetails } from "../google-places";

export class GooglePlacesSource implements IDiscoverySource {
  async discover(
    query: string,
    location: string
  ): Promise<RawBusinessPayload[]> {
    console.log(`[discovery] Searching Google Places for "${query}" in "${location}"...`);

    // Search for businesses
    const results = await searchPlaces(query, location, 5000);
    console.log(`[discovery] Found ${results.length} results`);

    const payloads: RawBusinessPayload[] = [];

    // Fetch details for each result
    for (let i = 0; i < results.length; i++) {
      const result = results[i];

      // Rate limiting: 200ms between requests
      if (i > 0) {
        await new Promise((r) => setTimeout(r, 200));
      }

      try {
        const details = await getPlaceDetails(result.place_id);
        if (!details) continue;

        // Skip businesses with no reviews
        if (!details.reviews || details.reviews.length === 0) {
          console.log(
            `[discovery] Skipping ${details.name} — no reviews available`
          );
          continue;
        }

        const payload: RawBusinessPayload = {
          sourceType: "google_places",
          sourceEntityId: result.place_id,
          sourceUrl: `https://www.google.com/maps/place/?q=place_id:${result.place_id}`,
          name: details.name,
          address: details.formatted_address,
          phone: details.formatted_phone_number,
          website: details.website,
          reviews: details.reviews.map((r) => ({
            author: r.author_name,
            rating: r.rating,
            text: r.text,
            time: r.time,
          })),
          rawPayload: { ...details },  // Full details object as raw payload
        };

        payloads.push(payload);
        console.log(
          `[discovery] Added ${details.name} (${details.reviews.length} reviews)`
        );
      } catch (error) {
        console.error(
          `[discovery] Error fetching details for ${result.place_id}:`,
          error
        );
      }
    }

    console.log(
      `[discovery] Ready to store ${payloads.length} businesses with reviews`
    );
    return payloads;
  }
}
