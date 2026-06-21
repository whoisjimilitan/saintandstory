/**
 * Provider Orchestrator
 * Executes multiple providers in parallel
 * Handles failures gracefully
 * Returns unified, deduplicated results
 */

import { Business, SearchQuery, OrchestratorResult, ProviderError } from "./types";
import { IBusinessProvider } from "./provider";

export class DiscoverOrchestrator {
  private providers: IBusinessProvider[];

  constructor(providers: IBusinessProvider[]) {
    this.providers = providers;
  }

  async search(query: SearchQuery): Promise<OrchestratorResult> {
    const startTime = Date.now();
    const allErrors: ProviderError[] = [];
    const allBusinesses: Map<string, Business> = new Map();
    const providerCounts = {
      crm: 0,
      google_places: 0,
      companies_house: 0,
    };

    console.log("[ORCHESTRATOR] Starting parallel provider execution");
    console.log("[ORCHESTRATOR] Query:", query);

    // Execute all providers in parallel
    const results = await Promise.allSettled(
      this.providers.map((provider) =>
        provider.search(query).catch((error) => {
          console.error(
            `[ORCHESTRATOR] Provider ${provider.name} failed:`,
            error
          );
          return {
            businesses: [],
            totalAvailable: 0,
            processingTimeMs: 0,
            error: {
              provider: provider.name,
              message: error.message || "Unknown error",
              recoverable: true,
            },
          };
        })
      )
    );

    // Aggregate results
    results.forEach((result, index) => {
      const providerName = this.providers[index].name;

      if (result.status === "fulfilled") {
        const providerResult = result.value;

        if (providerResult.error) {
          allErrors.push(providerResult.error);
          console.log(
            `[ORCHESTRATOR] Provider ${providerName} returned error:`,
            providerResult.error.message
          );
        }

        // Add businesses from this provider
        providerResult.businesses.forEach((business) => {
          // Use business ID as key to deduplicate later
          if (!allBusinesses.has(business.id)) {
            allBusinesses.set(business.id, business);
            providerCounts[providerName as keyof typeof providerCounts]++;
          }
        });

        console.log(
          `[ORCHESTRATOR] ${providerName}: ${providerResult.businesses.length} businesses`
        );
      } else {
        console.error(
          `[ORCHESTRATOR] Provider ${providerName} promise rejected:`,
          result.reason
        );
        allErrors.push({
          provider: providerName,
          message: result.reason?.message || "Promise rejected",
          recoverable: true,
        });
      }
    });

    // Convert map to array and deduplicate
    const deduplicated = this.deduplicateBusinesses(Array.from(allBusinesses.values()));

    // Sort by opportunity score
    deduplicated.sort((a, b) => b.opportunityScore - a.opportunityScore);

    const processingTimeMs = Date.now() - startTime;

    console.log(
      `[ORCHESTRATOR] Complete: ${deduplicated.length} businesses, ${processingTimeMs}ms`
    );

    return {
      businesses: deduplicated,
      totalCount: deduplicated.length,
      sources: providerCounts,
      errors: allErrors,
      processingTimeMs,
    };
  }

  /**
   * Deduplicate businesses across providers
   * Merge businesses that represent the same organisation
   */
  private deduplicateBusinesses(businesses: Business[]): Business[] {
    const merged: Map<string, Business> = new Map();

    // Sort by confidence so we merge into the highest-confidence record
    businesses.sort((a, b) => b.confidenceScore - a.confidenceScore);

    for (const business of businesses) {
      const existingKey = this.findDuplicateKey(business, merged);

      if (existingKey) {
        // Merge into existing business
        const existing = merged.get(existingKey)!;
        this.mergeBusiness(existing, business);
      } else {
        // Add as new business
        const key = this.generateBusinessKey(business);
        merged.set(key, business);
      }
    }

    return Array.from(merged.values());
  }

  /**
   * Check if business is a duplicate of any existing business
   */
  private findDuplicateKey(
    business: Business,
    existing: Map<string, Business>
  ): string | null {
    for (const [key, existingBusiness] of existing) {
      // Company number exact match (highest confidence)
      if (
        business.companyNumber &&
        existingBusiness.companyNumber &&
        business.companyNumber === existingBusiness.companyNumber
      ) {
        return key;
      }

      // Website domain match (very high confidence)
      if (business.website && existingBusiness.website) {
        const domain1 = this.extractDomain(business.website);
        const domain2 = this.extractDomain(existingBusiness.website);
        if (domain1 && domain2 && domain1 === domain2) {
          return key;
        }
      }

      // Telephone exact match (high confidence)
      if (
        business.telephone &&
        existingBusiness.telephone &&
        this.normalizePhone(business.telephone) ===
          this.normalizePhone(existingBusiness.telephone)
      ) {
        return key;
      }

      // Name similarity + address match (medium-high confidence)
      if (
        this.isSimilarName(business.businessName, existingBusiness.businessName) &&
        business.postcode &&
        existingBusiness.postcode &&
        business.postcode === existingBusiness.postcode
      ) {
        return key;
      }
    }

    return null;
  }

  /**
   * Generate unique key for a business for deduplication
   */
  private generateBusinessKey(business: Business): string {
    if (business.companyNumber) {
      return `companies_house:${business.companyNumber}`;
    }
    if (business.website) {
      const domain = this.extractDomain(business.website);
      if (domain) {
        return `website:${domain}`;
      }
    }
    if (business.telephone) {
      return `phone:${this.normalizePhone(business.telephone)}`;
    }
    return `business:${business.businessName}:${business.postcode || "unknown"}`;
  }

  /**
   * Merge business data (keep highest confidence for each field)
   */
  private mergeBusiness(existing: Business, incoming: Business): void {
    // Add incoming sources
    incoming.sources.forEach((source) => {
      if (!existing.sources.some((s) => s.provider === source.provider)) {
        existing.sources.push(source);
      }
    });

    // Update overall confidence (average of all sources)
    existing.confidenceScore = Math.round(
      existing.sources.reduce((sum, s) => sum + s.confidence, 0) /
        existing.sources.length
    );

    // Merge in missing fields from incoming
    if (!existing.email && incoming.email) existing.email = incoming.email;
    if (!existing.website && incoming.website) existing.website = incoming.website;
    if (!existing.telephone && incoming.telephone)
      existing.telephone = incoming.telephone;
    if (!existing.directors && incoming.directors)
      existing.directors = incoming.directors;
    if (!existing.sicCodes && incoming.sicCodes) existing.sicCodes = incoming.sicCodes;

    // Update timestamp
    existing.lastEnriched = new Date();
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string | null {
    try {
      const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
      return urlObj.hostname.replace("www.", "");
    } catch {
      return null;
    }
  }

  /**
   * Normalize phone number for comparison
   */
  private normalizePhone(phone: string): string {
    return phone.replace(/\D/g, "");
  }

  /**
   * Check if business names are similar (>85% match)
   */
  private isSimilarName(name1: string, name2: string): boolean {
    const n1 = name1.toLowerCase().trim();
    const n2 = name2.toLowerCase().trim();

    if (n1 === n2) return true;

    // Simple similarity: levenshtein-like check
    const maxLen = Math.max(n1.length, n2.length);
    const minLen = Math.min(n1.length, n2.length);

    if (minLen < maxLen * 0.7) return false; // Too different in length

    // Check if one contains the other
    if (n1.includes(n2) || n2.includes(n1)) return true;

    return false;
  }
}
