/**
 * Observation Engine - Core Extraction Logic (Wave 1.2)
 *
 * Pure functions for extracting factual evidence.
 * Deterministic. No external calls. No reasoning. No interpretation.
 * No theme extraction. No summarization.
 */

import { v4 as uuidv4 } from 'uuid';
import { Observation, ObservationType, EvidenceSource, ConfidenceLevel } from './schema';

/**
 * Generate globally unique observation ID
 * Uses UUID v4 for:
 * - Uniqueness across all instances (no collision)
 * - No sequential counter (works with distributed workers)
 * - Immutability (never changes)
 * - Idempotency (safe for retries)
 */
export function generateObservationId(): string {
  return uuidv4();
}

/**
 * Create an individual observation
 * Each observation is a single piece of evidence
 */
export function createObservation(
  candidateId: string,
  observationType: ObservationType,
  evidenceText: string,
  source: EvidenceSource,
  sourceUrl?: string,
  sourceDate?: string,
  sourceAuthor?: string
): Observation {
  const confidenceMap: Record<EvidenceSource, ConfidenceLevel> = {
    google_places: 'HIGH',
    website: 'HIGH',
    review: 'MEDIUM',
    metadata: 'MEDIUM',
  };

  return {
    observation_id: generateObservationId(),
    candidate_id: candidateId,
    observation_type: observationType,
    evidence_text: evidenceText,
    source,
    confidence: confidenceMap[source],
    source_url: sourceUrl,
    source_date: sourceDate,
    source_author: sourceAuthor,
    extracted_at: new Date().toISOString(),
    cached_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Find phrase in text (case-insensitive)
 * Returns the phrase with surrounding context, or null if not found
 */
export function findPhrase(
  text: string | null | undefined,
  phrase: string
): string | null {
  if (!text) return null;

  const lowerText = text.toLowerCase();
  const lowerPhrase = phrase.toLowerCase();
  const index = lowerText.indexOf(lowerPhrase);

  if (index === -1) return null;

  // Extract phrase with context (up to 100 chars on each side)
  const start = Math.max(0, index - 100);
  const end = Math.min(text.length, index + phrase.length + 100);

  return text.substring(start, end).trim();
}

/**
 * Find any phrase from a list in text
 * Returns the found phrase with context, or null if none found
 */
export function findAnyPhrase(
  text: string | null | undefined,
  phrases: string[]
): { phrase: string; context: string } | null {
  if (!text) return null;

  for (const phrase of phrases) {
    const context = findPhrase(text, phrase);
    if (context) {
      return { phrase, context };
    }
  }

  return null;
}

/**
 * Extract postcode from address string (UK format)
 * Heuristic: last 6-8 chars after last comma
 */
export function extractPostcodeFromAddress(address: string): string {
  const parts = address.split(',');
  if (parts.length === 0) return '';

  const lastPart = parts[parts.length - 1].trim();

  // UK postcode regex: loose match for space in middle
  const match = lastPart.match(/([A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2})/i);
  return match ? match[0] : lastPart;
}

/**
 * Calculate observation coverage
 * Percentage of expected observation types that were successfully collected
 */
export function calculateObservationCoverage(
  collectedTypes: Set<ObservationType>
): number {
  const allTypes: ObservationType[] = [
    ObservationType.BUSINESS_NAME,
    ObservationType.BUSINESS_CATEGORY,
    ObservationType.WEBSITE,
    ObservationType.PHONE,
    ObservationType.EMAIL,
    ObservationType.ADDRESS,
    ObservationType.POSTCODE,
    ObservationType.GOOGLE_PLACE_ID,
    ObservationType.GOOGLE_RATING,
    ObservationType.GOOGLE_REVIEW_COUNT,
    ObservationType.OPENING_HOURS,
    ObservationType.OPERATIONAL_PHRASE,
    ObservationType.REVIEW_TEXT,
  ];

  const collected = allTypes.filter(t => collectedTypes.has(t)).length;
  return allTypes.length > 0 ? collected / allTypes.length : 0;
}

/**
 * Deduplicate observations by evidence text
 */
export function deduplicateObservations(observations: Observation[]): Observation[] {
  const seen = new Set<string>();
  return observations.filter(obs => {
    const key = `${obs.observation_type}:${obs.evidence_text}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
