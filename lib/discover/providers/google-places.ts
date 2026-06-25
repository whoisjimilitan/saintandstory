/**
 * Google Places Provider
 * Discovers businesses using Google Places API
 */

import { Business, SearchQuery, ProviderSource } from "../types";
import { BusinessProvider, ProviderResult } from "../provider";

interface GooglePlacesResult {
  results: GooglePlace[];
  status?: string;
  next_page_token?: string;
}

interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  business_status: string;
  rating?: number;
  user_ratings_total?: number;
  types: string[];
  website?: string;
  formatted_phone_number?: string;
}

export class GooglePlacesProvider extends BusinessProvider {
  name: "google_places" = "google_places";
  private apiKey: string;

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  async search(query: SearchQuery): Promise<ProviderResult> {
    const startTime = Date.now();

    try {
      if (!query.postcode && !query.keyword && !query.city) {
        return {
          businesses: [],
          totalAvailable: 0,
          processingTimeMs: Date.now() - startTime,
          error: {
            provider: "google_places",
            message: "At least postcode or keyword required",
            recoverable: true,
          },
        };
      }

      this.log("Starting Google Places search");

      // Build search query
      let searchQuery = query.keyword || "";
      if (query.postcode) {
        searchQuery = searchQuery
          ? `${searchQuery} ${query.postcode}`
          : query.postcode;
      } else if (query.city) {
        searchQuery = searchQuery ? `${searchQuery} ${query.city}` : query.city;
      }

      // Google Places requires a business type for textSearch
      // If only location provided (no keyword), add default business type
      if (!query.keyword && (query.postcode || query.city)) {
        searchQuery = `business ${searchQuery}`;
      }

      if (!searchQuery.trim()) {
        searchQuery = query.city || "business";
      }

      this.log(`Searching: "${searchQuery}"`);

      // Call Google Places API
      const results = await this.callGooglePlacesAPI(
        searchQuery,
        query.postcode,
        query.radius,
        query.limit
      );

      const businesses: Business[] = results
        .filter((place) => place.business_status === "OPERATIONAL")
        .filter((place) => this.isUKLocation(place.formatted_address))
        .slice(0, query.limit || 100)
        .map((place) => this.normalizePlaceResult(place));

      this.log(`Found ${businesses.length} UK businesses`);

      return {
        businesses,
        totalAvailable: businesses.length,
        processingTimeMs: Date.now() - startTime,
        error: undefined,
      };
    } catch (error) {
      this.logError("Search failed", error);

      return {
        businesses: [],
        totalAvailable: 0,
        processingTimeMs: Date.now() - startTime,
        error: {
          provider: "google_places",
          message: error instanceof Error ? error.message : "Unknown error",
          recoverable: true,
        },
      };
    }
  }

  private async callGooglePlacesAPI(
    query: string,
    postcode?: string,
    radius?: number,
    limit?: number
  ): Promise<GooglePlace[]> {
    const endpoint = "https://maps.googleapis.com/maps/api/place/textsearch/json";
    const allResults: GooglePlace[] = [];
    let nextPageToken: string | undefined;
    const maxLimit = Math.min(limit || 1000, 1000); // Cap at 1000

    this.log(`Calling API: ${endpoint} (limit: ${maxLimit})`);

    // Pagination loop - Google Places returns 20 results per page
    let pageCount = 0;
    while (allResults.length < maxLimit) {
      pageCount++;
      this.log(`Fetching page ${pageCount} (have ${allResults.length}/${maxLimit} results)`);

      const params = new URLSearchParams({
        query,
        key: this.apiKey,
        language: "en",
      });

      // Add location bias if postcode provided
      if (postcode && radius) {
        params.append("region", "gb");
      }

      // Add next page token if we have one
      if (nextPageToken) {
        params.append("pagetoken", nextPageToken);
        // Google requires a small delay between pagination requests
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const url = `${endpoint}?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Google Places API error: ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as GooglePlacesResult;

      if (data.status && data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        throw new Error(`Google Places API status: ${data.status}`);
      }

      if (!data.results || data.results.length === 0) {
        this.log(`No more results (got ${allResults.length} total)`);
        break;
      }

      allResults.push(...data.results);
      this.log(`Page ${pageCount}: got ${data.results.length} results (total: ${allResults.length})`);

      // Check if there's a next page
      if (data.next_page_token) {
        nextPageToken = data.next_page_token;
      } else {
        this.log(`No next_page_token, pagination complete`);
        break;
      }

      // Stop if we've reached or exceeded the limit
      if (allResults.length >= maxLimit) {
        break;
      }
    }

    this.log(`API returned total: ${allResults.length} results`);
    return allResults;
  }

  private normalizePlaceResult(place: GooglePlace): Business {
    // Extract business category from types
    const category = this.categorizePlace(place.types);

    // Extract phone and remove country code for consistency
    const phone = place.formatted_phone_number
      ? place.formatted_phone_number.replace(/^\+44\s?/, "0")
      : undefined;

    return {
      id: this.generateId(place.place_id),
      businessName: place.name,
      tradingName: place.name,
      address: place.formatted_address,
      postcode: this.extractPostcode(place.formatted_address),
      city: this.extractCity(place.formatted_address),
      coordinates: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
      },
      website: place.website,
      telephone: phone,
      googleRating: place.rating,
      reviewCount: place.user_ratings_total,
      industry: category,
      categories: [category],
      crmStatus: "unknown",
      opportunityScore: this.calculateOpportunityScore(place),
      confidenceScore: this.calculateConfidenceScore(place),
      sources: [
        {
          provider: "google_places",
          confidence: this.calculateConfidenceScore(place),
          fields: [
            "businessName",
            "address",
            "postcode",
            "city",
            "coordinates",
            "website",
            "telephone",
            "googleRating",
            "reviewCount",
          ],
          timestamp: new Date(),
        } as ProviderSource,
      ],
      lastEnriched: new Date(),
    };
  }

  private categorizePlace(types: string[]): string {
    // Map Google place types to business categories
    const categoryMap: Record<string, string> = {
      restaurant: "Restaurants",
      cafe: "Cafes",
      bank: "Banking",
      store: "Retail",
      doctor: "Healthcare",
      hospital: "Healthcare",
      gym: "Fitness",
      hotel: "Hospitality",
      shopping_mall: "Retail",
      office: "Business Services",
      accounting: "Professional Services",
      lawyer: "Legal Services",
      real_estate_agency: "Real Estate",
    };

    for (const type of types) {
      if (categoryMap[type]) {
        return categoryMap[type];
      }
    }

    return "Business Services";
  }

  private isUKLocation(address: string | undefined): boolean {
    if (!address) return false;
    const upperAddress = address.toUpperCase();

    // REJECT: US state abbreviations and ZIP codes
    const usStates = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'];

    // Check for US state abbreviations (usually after comma: "City, OR 97302")
    for (const state of usStates) {
      if (upperAddress.includes(`, ${state}`) || upperAddress.includes(` ${state} `)) {
        return false;
      }
    }

    // Reject ZIP code pattern (5 digits or 5+4)
    if (/\s\d{5}(-\d{4})?\s*$/.test(address.trim())) {
      return false;
    }

    // ACCEPT: Contains UK indicators
    const ukIndicators = ['UNITED KINGDOM', 'UK', 'ENGLAND', 'SCOTLAND', 'WALES', 'NORTHERN IRELAND', 'LONDON', 'MANCHESTER', 'BIRMINGHAM', 'LEEDS', 'BRISTOL', 'EDINBURGH', 'CARDIFF', 'BELFAST'];
    if (ukIndicators.some(indicator => upperAddress.includes(indicator))) {
      return true;
    }

    // Check for UK postcode format (e.g., SW1A 1AA, E1 6AN)
    if (/[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}|[A-Z]{1,2}\d[A-Z]\s?\d[A-Z]{2}/i.test(address)) {
      return true;
    }

    return false;
  }

  private extractPostcode(address: string): string | undefined {
    const postcodeMatch = address.match(
      /([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})/i
    );
    return postcodeMatch ? postcodeMatch[1] : undefined;
  }

  private extractCity(address: string): string | undefined {
    const parts = address.split(",");
    if (parts.length >= 2) {
      const cityWithPostcode = parts[parts.length - 2].trim();
      // Remove UK postcode from city (e.g., "London EC4Y 0HA" → "London")
      const cityOnly = cityWithPostcode
        .replace(/\s[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}/i, "")
        .trim();
      return cityOnly || undefined;
    }
    return undefined;
  }

  private calculateConfidenceScore(place: GooglePlace): number {
    let score = 70; // Base score for Google Places data

    // Higher confidence if has reviews (social proof)
    if (place.user_ratings_total && place.user_ratings_total > 10) {
      score = Math.min(100, score + 20);
    } else if (place.user_ratings_total && place.user_ratings_total > 0) {
      score = Math.min(100, score + 10);
    }

    // Higher confidence if has high rating
    if (place.rating && place.rating >= 4.0) {
      score = Math.min(100, score + 5);
    }

    // Higher confidence if OPERATIONAL
    if (place.business_status === "OPERATIONAL") {
      score = Math.min(100, score + 5);
    }

    return Math.round(score);
  }

  private calculateOpportunityScore(place: GooglePlace): number {
    let score = 50; // Base opportunity score

    // Score based on review count (more reviews = more established)
    if (place.user_ratings_total) {
      score += Math.min(30, place.user_ratings_total / 10);
    }

    // Score based on rating (quality indicator)
    if (place.rating) {
      score += (place.rating / 5) * 20;
    }

    return Math.round(Math.min(100, score));
  }
}
