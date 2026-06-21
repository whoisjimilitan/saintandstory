/**
 * Provider Interface
 * Every discovery provider must implement this contract
 */

import { Business, SearchQuery, ProviderError } from "./types";

export interface IBusinessProvider {
  name: "crm" | "google_places" | "companies_house";
  search(query: SearchQuery): Promise<ProviderResult>;
}

export interface ProviderResult {
  businesses: Business[];
  totalAvailable: number;
  processingTimeMs: number;
  error?: ProviderError;
}

/**
 * Base provider class for shared utilities
 */
export abstract class BusinessProvider implements IBusinessProvider {
  abstract name: "crm" | "google_places" | "companies_house";

  abstract search(query: SearchQuery): Promise<ProviderResult>;

  /**
   * Return raw business ID for database lookups
   * ID contract: raw UUID only, no provider prefix
   * Provider attribution tracked in sources array
   */
  protected generateId(providerId: string): string {
    return providerId;
  }

  /**
   * Log provider activity
   */
  protected log(message: string): void {
    console.log(`[PROVIDER:${this.name.toUpperCase()}] ${message}`);
  }

  /**
   * Log provider error
   */
  protected logError(message: string, error?: any): void {
    console.error(
      `[PROVIDER:${this.name.toUpperCase()}] ERROR: ${message}`,
      error || ""
    );
  }
}
