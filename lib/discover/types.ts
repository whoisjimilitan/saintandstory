/**
 * Canonical Business Model
 * Unified representation across all discovery providers
 */

export interface Business {
  // Identifiers
  id: string;
  businessName: string;
  tradingName?: string;

  // Location
  address?: string;
  postcode?: string;
  city?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };

  // Contact
  website?: string;
  telephone?: string;
  email?: string;

  // Classification
  industry?: string;
  categories?: string[];
  sicCodes?: string[];

  // Intelligence from providers
  googleRating?: number;
  reviewCount?: number;
  companyNumber?: string;
  directors?: string[];
  estimatedEmployees?: number;

  // CRM Integration
  crmStatus: "existing_customer" | "previous_customer" | "lead" | "opportunity" | "unknown";
  crmCustomerId?: string;
  crmOrderCount?: number;
  crmLastOrder?: string;

  // Scoring
  opportunityScore: number; // 0-100
  confidenceScore: number; // 0-100

  // Source tracking
  sources: ProviderSource[];
  lastEnriched: Date;
}

export interface ProviderSource {
  provider: "crm" | "google_places" | "companies_house";
  confidence: number; // 0-100
  fields: string[]; // Which fields this provider contributed
  timestamp: Date;
}

export interface SearchQuery {
  keyword?: string;
  postcode?: string;
  city?: string;
  radius?: number;
  category?: string;
  limit?: number;
}

export interface ProviderResult {
  businesses: Business[];
  totalAvailable: number;
  processingTimeMs: number;
  errors: ProviderError[];
}

export interface ProviderError {
  provider: string;
  message: string;
  recoverable: boolean;
}

export interface OrchestratorResult {
  businesses: Business[];
  totalCount: number;
  sources: {
    crm: number;
    google_places: number;
    companies_house: number;
  };
  errors: ProviderError[];
  processingTimeMs: number;
}
