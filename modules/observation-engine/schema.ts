/**
 * Observation Engine - Type Definitions (Wave 1.2)
 *
 * All types represent FACTS ONLY.
 * No reasoning. No hypotheses. No interpretation.
 * No theme extraction. No summarization. No grouping.
 *
 * Each observation is an immutable record of a single piece of evidence.
 * Traceability chain: Source → Evidence → Observation ID → Future reasoning
 */

export type EvidenceSource = 'google_places' | 'website' | 'review' | 'metadata';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'UNKNOWN';

/**
 * Controlled enumeration of observation types
 * Extensible but not free-text
 * Allows deterministic querying while preserving raw evidence
 */
export enum ObservationType {
  BUSINESS_NAME = 'BUSINESS_NAME',
  BUSINESS_CATEGORY = 'BUSINESS_CATEGORY',
  WEBSITE = 'WEBSITE',
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  ADDRESS = 'ADDRESS',
  POSTCODE = 'POSTCODE',
  GOOGLE_PLACE_ID = 'GOOGLE_PLACE_ID',
  GOOGLE_RATING = 'GOOGLE_RATING',
  GOOGLE_REVIEW_COUNT = 'GOOGLE_REVIEW_COUNT',
  OPENING_HOURS = 'OPENING_HOURS',
  OPERATIONAL_PHRASE = 'OPERATIONAL_PHRASE',
  REVIEW_TEXT = 'REVIEW_TEXT',
  REVIEW_RATING = 'REVIEW_RATING',
  REVIEW_DATE = 'REVIEW_DATE',
  BOOKING = 'BOOKING',
  DELIVERY = 'DELIVERY',
  COLLECTION = 'COLLECTION',
  PAYMENT = 'PAYMENT',
  SOCIAL_PROFILE = 'SOCIAL_PROFILE',
  CUSTOMER_LANGUAGE = 'CUSTOMER_LANGUAGE',
  OTHER = 'OTHER',
}

/**
 * Individual Observation Record
 *
 * Each observation is a single piece of evidence about a business.
 * Immutable. Traceable. Timestamped. Sourced.
 *
 * observation_id is globally unique (UUID) and immutable.
 * Never changes, always traceable.
 *
 * Example:
 * {
 *   observation_id: "550e8400-e29b-41d4-a716-446655440000",
 *   candidate_id: "c-123",
 *   observation_type: OPERATIONAL_PHRASE,
 *   evidence_text: "Order before 3pm for same-day delivery",
 *   source: "website",
 *   confidence: "HIGH",
 *   source_url: "https://example.com/services",
 *   extracted_at: "2026-06-19T14:32:45Z"
 * }
 */
export interface Observation {
  // Identity (globally unique, immutable)
  observation_id: string; // UUID (v4) - unique across all instances
  candidate_id: string; // UUID of discovered business

  // What was observed (controlled enum)
  observation_type: ObservationType;

  // The raw evidence (no interpretation)
  evidence_text: string; // Exact text found (or structured value if not text)

  // Source metadata
  source: EvidenceSource;
  confidence: ConfidenceLevel; // Based on source type only

  // Context (for traceability)
  source_url?: string; // URL where evidence found (website, review link)
  source_date?: string; // ISO8601 - when source was created (review date, page update)
  source_author?: string; // If available (review author)

  // Timing
  extracted_at: string; // ISO8601 - when this observation was extracted
  cached_until?: string; // ISO8601 - when cache expires (24h from extracted)
}

/**
 * Batch observation result
 * Multiple observations for a single candidate
 */
export interface ObservationBatch {
  candidate_id: string;
  observations: Observation[];
  observation_coverage: number; // 0.0-1.0, percentage of observable fields collected
  sources_used: EvidenceSource[];
  warnings: string[];
  execution_time_ms: number;
}

/**
 * Single observation result (for API)
 */
export interface ObservationResult {
  success: true;
  observation: Observation;
  warnings: string[];
  execution_time_ms: number;
}
