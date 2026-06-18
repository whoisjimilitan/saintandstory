/**
 * PIPELINE GUARD
 *
 * This prevents architectural drift and "Claude random changes".
 *
 * CRITICAL RULES:
 * - No bypassing ingestion with sendEmailOnly
 * - No skipping enrichment
 * - No merging ingestion + email sending
 * - No removing lead intake methods
 */

import { IngestionSource } from "../B2B_PIPELINE_CONTRACT";

interface GuardPayload {
  [key: string]: any;
  sendEmailOnly?: boolean;
  skipEnrichment?: boolean;
  mergeIngestionAndSend?: boolean;
  source?: string;
}

/**
 * ENFORCE CONTRACT COMPLIANCE
 *
 * Throws if payload violates pipeline contract
 */
export function enforcePipelineContract(
  payload: GuardPayload,
  source: IngestionSource
): true {
  // Rule 1: Validate ingestion source
  const allowedSources: IngestionSource[] = ["discover", "csv", "manual"];
  if (!allowedSources.includes(source)) {
    throw new Error(`GUARD VIOLATION: Invalid ingestion source "${source}"`);
  }

  // Rule 2: CRITICAL - prevent sendEmailOnly bypass
  // This would skip enrichment and validation
  if (payload.sendEmailOnly === true) {
    throw new Error(
      "GUARD VIOLATION: Cannot send email without enrichment. Pipeline step ENRICH is mandatory."
    );
  }

  // Rule 3: CRITICAL - prevent skipEnrichment
  // This would create "raw" leads that never get intelligence
  if (payload.skipEnrichment === true) {
    throw new Error(
      "GUARD VIOLATION: Enrichment is mandatory. Cannot skip ENRICH step."
    );
  }

  // Rule 4: CRITICAL - prevent merging ingestion and email sending
  // This would break the separation of concerns
  if (payload.mergeIngestionAndSend === true) {
    throw new Error(
      "GUARD VIOLATION: Ingestion (INGEST) and email sending (SEND_EMAIL) must remain separate pipeline steps."
    );
  }

  // Rule 5: Prevent removing ingestion methods
  // The system MUST support discover, csv, manual
  if (payload.removeDiscovery || payload.removeCSV || payload.removeManual) {
    throw new Error(
      "GUARD VIOLATION: All three ingestion methods (discover, csv, manual) are mandatory."
    );
  }

  // Rule 6: Prevent renaming core navigation items
  // "Add Lead" cannot become "Send Email" or other names
  if (
    payload.renameSidebarItem &&
    payload.renameSidebarItem === "renameManualToEmail"
  ) {
    throw new Error(
      "GUARD VIOLATION: Manual lead entry sidebar label must remain 'Add Lead'. Cannot rename to 'Send Email'."
    );
  }

  return true;
}

/**
 * STRUCTURAL COMPLIANCE CHECK
 *
 * Verifies that the system maintains all three ingestion methods
 */
export function verifyIngestionMethods(
  discoverExists: boolean,
  csvExists: boolean,
  manualExists: boolean
): void {
  if (!discoverExists) {
    throw new Error(
      "STRUCTURAL VIOLATION: Discover ingestion method is missing"
    );
  }

  if (!csvExists) {
    throw new Error(
      "STRUCTURAL VIOLATION: CSV ingestion method is missing"
    );
  }

  if (!manualExists) {
    throw new Error(
      "STRUCTURAL VIOLATION: Manual lead entry ingestion method is missing"
    );
  }
}
