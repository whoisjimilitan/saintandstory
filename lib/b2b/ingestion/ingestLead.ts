/**
 * INGESTION ENFORCEMENT GATE
 *
 * This function is the ONLY entry point for creating new leads.
 * It enforces the B2B_PIPELINE_CONTRACT.
 *
 * CRITICAL RULE: No lead can bypass this function.
 */

import { B2BLeadContract, IngestionSource } from "../B2B_PIPELINE_CONTRACT";

export function ingestLead(
  lead: Omit<B2BLeadContract, "id" | "createdAt">,
  source: IngestionSource
): B2BLeadContract {
  // HARD RULE: validate ingestion source
  const validSources: IngestionSource[] = ["discover", "csv", "manual"];
  if (!validSources.includes(source)) {
    throw new Error(`Invalid ingestion source: ${source}`);
  }

  // HARD RULE: no bypassing pipeline identity
  if (!lead.name || !lead.name.trim()) {
    throw new Error("Missing lead name");
  }

  if (!lead.email || !lead.email.includes("@")) {
    throw new Error("Invalid lead email");
  }

  // HARD RULE: mandatory enrichment field
  if (!lead.industry || !lead.industry.trim()) {
    throw new Error("Missing industry enrichment");
  }

  // ENFORCE PIPELINE STATE RESET
  // Every lead starts at the beginning, regardless of source
  return {
    ...lead,
    source,
    status: "new",
    leadState: "raw",
    createdAt: new Date(),
  };
}

/**
 * VALIDATION HELPER
 *
 * Check if a lead has been properly enriched
 */
export function isEnriched(lead: B2BLeadContract): boolean {
  return !!(
    lead.industry &&
    lead.postcode &&
    lead.pressureType &&
    lead.confidenceScore !== undefined
  );
}

/**
 * VALIDATION HELPER
 *
 * Check if a lead is ready for email generation
 */
export function isReadyForEmail(lead: B2BLeadContract): boolean {
  return lead.status === "new" && isEnriched(lead);
}
