/**
 * B2B INTELLIGENCE CORE CONTRACT
 *
 * This is the source of truth for all B2B pipeline operations.
 * DO NOT MODIFY without explicit authorization.
 *
 * Breaking this contract breaks the entire system.
 */

export type IngestionSource = "discover" | "csv" | "manual";

export type ResponseType = "YES" | "MAYBE" | "NO" | "PENDING";

export interface B2BLeadContract {
  id?: string;

  // identity
  name: string;
  email: string;
  website?: string;

  // system metadata (DO NOT REMOVE)
  source: IngestionSource;
  createdAt?: Date;

  // enrichment layer (mandatory)
  industry: string;
  postcode?: string;

  // intelligence layer
  pressureType?: string;
  confidenceScore?: number;

  // pipeline state
  status: "new" | "contacted" | "warm" | "cold";
  leadState: "raw" | "enriched" | "contacted" | "engaged";
}

/**
 * PIPELINE ORDER (ABSOLUTE RULE)
 *
 * Every lead must flow through these steps in sequence.
 * No shortcuts. No bypasses. No parallel paths.
 */
export const PIPELINE_STEPS = [
  "INGEST",
  "ENRICH",
  "GENERATE_EMAIL",
  "STORE_OUTREACH",
  "SEND_EMAIL",
  "WAIT_RESPONSE",
  "LEARN",
] as const;

export type PipelineStep = typeof PIPELINE_STEPS[number];

/**
 * INGESTION SOURCES (FIXED)
 *
 * Three and only three ways to create a lead.
 * All must feed into the same pipeline.
 */
export const INGESTION_SOURCES = {
  discover: "Automated postcode/radius/category discovery",
  csv: "Bulk CSV file import",
  manual: "Manual business entry",
} as const;
