/**
 * Google Places Provider
 * Discovers businesses using Google Places API
 * Tries multiple keyword variations to maximize results
 */

import { Business, SearchQuery, ProviderSource } from "../types";
import { BusinessProvider, ProviderResult } from "../provider";
import { getKeywordVariations } from "../keyword-normalizer";

interface GooglePlacesResult {
  results: GooglePlace[];
  status?: string;
  next_page_token?: string;
}

interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  business_status?: string;
  rating?: number;
  user_ratings_total?: number;
  types: string[];
  website?: string;
  formatted_phone_number?: string;
  vicinity?: string;
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

      let results: GooglePlace[] = [];

      // POSTCODE-ONLY search: Use Nearby Search with geocoding
      if (query.postcode && !query.keyword) {
        this.log(`Postcode-only search: "${query.postcode}"`);
        const coordinates = await this.geocodePostcode(query.postcode);

        if (coordinates) {
          this.log(`Postcode geocoded to: ${coordinates.lat}, ${coordinates.lng}`);
          results = await this.nearbySearch(
            coordinates.lat,
            coordinates.lng,
            query.radius || 5,
            query.limit || 100
          );
          this.log(`Nearby search returned ${results.length} results`);
        } else {
          this.log(`Failed to geocode postcode: ${query.postcode}`);
        }
      } else {
        // KEYWORD search: Use text search (original logic)
        const keywordVariations = query.keyword ? getKeywordVariations(query.keyword) : [];

        // Try each keyword variation until we get results
        for (const keyword of keywordVariations) {
          if (results.length > 0) {
            this.log(`Got ${results.length} results with "${keyword}", skipping remaining variations`);
            break;
          }

          // Build search query with this keyword variation
          let searchQuery = keyword || "";
          if (query.postcode) {
            searchQuery = searchQuery
              ? `${searchQuery} ${query.postcode}`
              : query.postcode;
          } else if (query.city) {
            searchQuery = searchQuery ? `${searchQuery} ${query.city}` : query.city;
          }

          if (!keyword && (query.postcode || query.city)) {
            searchQuery = `business ${searchQuery}`;
          }

          if (!searchQuery.trim()) {
            searchQuery = query.city || "business";
          }

          this.log(`Trying keyword variation: "${keyword}" → full query: "${searchQuery}"`);

          // Call Google Places API with this variation
          const variationResults = await this.callGooglePlacesAPI(
            searchQuery,
            query.postcode,
            query.radius,
            query.limit
          );

          results = variationResults;
          this.log(`  → Got ${results.length} results`);
        }

        // If no keyword was provided, do a single search with location-only query
        if (keywordVariations.length === 0 && (query.postcode || query.city)) {
          let searchQuery = query.postcode || query.city || "business";
          if (query.postcode && query.city) {
            searchQuery = `${query.city} ${query.postcode}`;
          }

          this.log(`Location-only search: "${searchQuery}"`);
          results = await this.callGooglePlacesAPI(
            searchQuery,
            query.postcode,
            query.radius,
            query.limit
          );
        }
      }

      // Process results: filter THEN slice
      // For postcode-only search (Nearby Search), skip business_status check
      // For keyword search (Text Search), apply full filtering
      const targetLimit = query.limit || 1000;

      let filteredResults = results;
      if (query.postcode && !query.keyword) {
        // Nearby Search results - already UK-based by coordinates, don't filter by status
        this.log(`Using Nearby Search results (no status filter)`);
        filteredResults = results.slice(0, targetLimit);
      } else {
        // Text Search results - apply full filtering
        filteredResults = results
          .filter((place) => place.business_status === "OPERATIONAL")
          .filter((place) => this.isUKLocation(place.formatted_address || ""))
          .slice(0, targetLimit);
      }

      const businesses: Business[] = filteredResults.map((place) =>
        this.normalizePlaceResult(place)
      );

      this.log(`Found ${businesses.length} businesses`);

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

  private async geocodePostcode(postcode: string): Promise<{ lat: number; lng: number } | null> {
    const endpoint = "https://maps.googleapis.com/maps/api/geocode/json";

    try {
      this.log(`Geocoding postcode: ${postcode}`);

      // Extract outward code (first 1-2 chars before numbers) to find city
      const outwardCode = postcode.split(/\d/)[0].toUpperCase();
      const city = this.postcodeAreaToCity[outwardCode];

      // Format address with city if available for better geocoding accuracy
      let fullAddress = postcode;
      if (city) {
        fullAddress = `${postcode} ${city}`;
        this.log(`  Postcode area ${outwardCode} → ${city}`);
      }

      const params = new URLSearchParams({
        address: fullAddress,
        region: "gb",
        key: this.apiKey,
      });

      const url = `${endpoint}?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        this.log(`Geocoding failed: ${response.status}`);
        return null;
      }

      const data = (await response.json()) as { results?: Array<{ geometry?: { location?: { lat: number; lng: number } } }>; status?: string };

      if (data.status !== "OK" || !data.results || data.results.length === 0) {
        this.log(`Geocoding returned no results for: ${fullAddress}`);
        return null;
      }

      const location = data.results[0].geometry?.location;
      if (location) {
        this.log(`✓ Geocoded ${postcode} to ${location.lat}, ${location.lng}`);
        return location;
      }

      return null;
    } catch (error) {
      this.log(`Geocoding error: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  private async nearbySearch(
    lat: number,
    lng: number,
    radiusKm: number,
    limit: number
  ): Promise<GooglePlace[]> {
    const endpoint = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
    const radiusMeters = (radiusKm || 5) * 1000; // Convert km to meters
    const allResults: GooglePlace[] = [];

    try {
      this.log(`Nearby search: lat=${lat}, lng=${lng}, radius=${radiusKm}km`);

      let nextPageToken: string | undefined;
      let pageCount = 0;

      while (allResults.length < limit && pageCount < 3) {
        pageCount++;
        this.log(`Fetching nearby page ${pageCount}`);

        const params = new URLSearchParams({
          location: `${lat},${lng}`,
          radius: radiusMeters.toString(),
          key: this.apiKey,
          language: "en",
          type: "establishment",
        });

        if (nextPageToken) {
          params.append("pagetoken", nextPageToken);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        const url = `${endpoint}?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
          this.log(`Nearby search failed: ${response.status}`);
          break;
        }

        const data = (await response.json()) as { results?: GooglePlace[]; status?: string; next_page_token?: string };

        if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
          this.log(`Nearby search status: ${data.status}`);
          break;
        }

        if (!data.results || data.results.length === 0) {
          this.log(`Page ${pageCount}: no results`);
          break;
        }

        allResults.push(...data.results);
        this.log(`Page ${pageCount}: got ${data.results.length} results (total: ${allResults.length})`);

        if (data.next_page_token) {
          nextPageToken = data.next_page_token;
        } else {
          break;
        }
      }

      this.log(`Total nearby results: ${allResults.length}`);

      // Filter out generic places (localities, political boundaries) - keep only actual businesses
      const businesses = allResults.filter((place) => {
        // Exclude generic place types
        const hasGenericType = place.types.some((t) =>
          ["locality", "political", "administrative_area_level_1", "administrative_area_level_2", "country"].includes(t)
        );

        // Include if it has specific business types
        const hasBusinessType = place.types.some((t) =>
          !["locality", "political", "administrative_area_level_1", "administrative_area_level_2", "country", "point_of_interest"].includes(t)
        );

        return !hasGenericType && hasBusinessType;
      });

      this.log(`After filtering generic places: ${businesses.length}/${allResults.length}`);
      return businesses.slice(0, limit);
    } catch (error) {
      this.log(`Nearby search error: ${error instanceof Error ? error.message : String(error)}`);
      return [];
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
    const maxLimit = Math.min(limit || 1000, 1000); // Cap at 1000

    try {
      this.log(`Calling API: ${endpoint} (limit: ${maxLimit})`);

      // Fetch all pages up to limit
      let nextPageToken: string | undefined;
      let pageCount = 0;

      while (allResults.length < maxLimit && pageCount < 5) {
        pageCount++;
        this.log(`Fetching page ${pageCount} (have ${allResults.length}/${maxLimit} results)`);

        const params = new URLSearchParams({
          query,
          key: this.apiKey,
          language: "en",
          region: "gb",
          location: "53.4084,-2.9916", // UK center (Birmingham area)
          radius: "200000", // 200km radius covers all UK
        });

        // Add next page token if available
        if (nextPageToken) {
          params.append("pagetoken", nextPageToken);
          // Google requires ~2 second delay between pagination requests
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        const url = `${endpoint}?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
          this.log(`API call failed: ${response.status}`);
          break;
        }

        const data = (await response.json()) as GooglePlacesResult;

        if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
          this.log(`API status: ${data.status}`);
          break;
        }

        if (!data.results || data.results.length === 0) {
          this.log(`Page ${pageCount}: no results`);
          break;
        }

        allResults.push(...data.results);
        this.log(`Page ${pageCount}: got ${data.results.length} results (total: ${allResults.length})`);

        // Check for next page
        if (data.next_page_token) {
          nextPageToken = data.next_page_token;
        } else {
          this.log(`No more pages available`);
          break;
        }
      }

      this.log(`Total results from API: ${allResults.length}`);
      return allResults;
    } catch (error) {
      this.log(`Pagination error: ${error instanceof Error ? error.message : String(error)}`);
      // If pagination fails, return empty array and let caller handle it
      return [];
    }
  }

  private normalizePlaceResult(place: GooglePlace): Business {
    // Extract business category from types
    const category = this.categorizePlace(place.types);

    // Extract phone and remove country code for consistency
    const phone = place.formatted_phone_number
      ? place.formatted_phone_number.replace(/^\+44\s?/, "0")
      : undefined;

    // Use formatted_address if available, otherwise use vicinity (from Nearby Search)
    const address = place.formatted_address || place.vicinity || place.name;

    return {
      id: this.generateId(place.place_id),
      businessName: place.name,
      tradingName: place.name,
      address: address,
      postcode: this.extractPostcode(address),
      city: this.extractCity(address),
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

  // UK postcode area to city mapping (outward code → city)
  private postcodeAreaToCity: Record<string, string> = {
    // London
    "E": "London", "EC": "London", "N": "London", "NW": "London",
    "SE": "London", "SW": "London", "W": "London", "WC": "London",
    // Major cities
    "B": "Birmingham", "M": "Manchester", "L": "Liverpool",
    "LS": "Leeds", "S": "Sheffield", "C": "Cardiff", "EH": "Edinburgh",
    "G": "Glasgow", "BT": "Belfast", "B": "Bristol", "E": "Nottingham",
    "NG": "Nottingham", "ST": "Stoke-on-Trent", "CV": "Coventry",
    "WV": "Wolverhampton", "DY": "Dudley", "B": "Solihull",
    "PE": "Peterborough", "CB": "Cambridge", "NR": "Norwich",
    "OX": "Oxford", "RG": "Reading", "SL": "Slough", "UB": "Uxbridge",
    "TW": "Twickenham", "KT": "Kingston", "SM": "Sutton",
    "CR": "Croydon", "DA": "Dartford", "BR": "Bromley",
    "TN": "Tunbridge Wells", "BN": "Brighton", "PO": "Portsmouth",
    "SO": "Southampton", "SP": "Salisbury", "BA": "Bath",
    "BS": "Bristol", "GL": "Gloucester", "HR": "Hereford",
    "LD": "Llandrindod Wells", "SY": "Shrewsbury", "WR": "Worcester",
    "DT": "Dorchester", "EX": "Exeter", "PL": "Plymouth",
    "TR": "Truro", "TA": "Taunton", "EX": "Exeter",
    "BD": "Bradford", "HD": "Huddersfield", "OL": "Oldham",
    "SK": "Stockport", "CH": "Chester", "WA": "Warrington",
    "CW": "Crewe", "ST": "Stoke", "DE": "Derby", "NG": "Nottingham",
    "LE": "Leicester", "LN": "Lincoln", "NN": "Northampton",
    "MK": "Milton Keynes", "HP": "Hemel Hempstead",
  };

  private extractCity(address: string): string | undefined {
    // First, try to extract postcode and use it to determine city
    const postcodeMatch = address.match(/([A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2})/i);
    if (postcodeMatch) {
      const postcode = postcodeMatch[1].toUpperCase();
      // Extract outward code (first 1-2 characters before numbers)
      const outwardCode = postcode.split(/\d/)[0];

      if (this.postcodeAreaToCity[outwardCode]) {
        return this.postcodeAreaToCity[outwardCode];
      }
    }

    // Fallback: parse from address if postcode lookup fails
    const parts = address.split(",").map(p => p.trim());
    if (parts.length < 2) return undefined;

    const removePostcode = (text: string) =>
      text.replace(/\s[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}/i, "").trim();

    for (let i = parts.length - 2; i >= 1; i--) {
      const part = parts[i];
      const cleanPart = removePostcode(part);

      if (/^\d/.test(cleanPart)) continue;
      if (!/\d/.test(cleanPart) && cleanPart.length > 2) {
        return cleanPart || undefined;
      }
      if (cleanPart.length > 2) {
        return cleanPart;
      }
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
