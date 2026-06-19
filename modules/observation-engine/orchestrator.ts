/**
 * Observation Engine - Orchestrator (Wave 1.2)
 *
 * Coordinates evidence extraction and generates individual Observation records.
 * Each observation is immutable, traceable, and sourced.
 * observation_id is UUID v4 for global uniqueness and safety.
 * No interpretation. No summarization. No themes.
 * Entry point for Wave 1.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Observation,
  ObservationBatch,
  ObservationType,
} from './schema';
import {
  fetchGooglePlacesDetails,
  extractGooglePlacesData,
  extractReviewsFromGooglePlaces,
  fetchWebsiteContent,
  extractPostcodeFromAddress,
} from './adapter';
import {
  createObservation,
  findAnyPhrase,
  calculateObservationCoverage,
  deduplicateObservations,
  resetObservationCounter,
} from './core';

export interface ObservationInput {
  candidate_id: string; // UUID
  business_name: string;
  google_place_id: string;
  address: string;
  google_api_key: string;
}

/**
 * Main entry point: Generate all observations for a discovered business
 * Returns a batch of individual Observation records
 * Each observation is immutable and traceable
 */
export async function generateObservations(
  input: ObservationInput
): Promise<ObservationBatch> {
  const startTime = Date.now();

  const observations: Observation[] = [];
  const warnings: string[] = [];
  const sourcesUsed = new Set<string>();
  const typesCollected = new Set<ObservationType>();

  try {
    // Stage 1: Google Places Data
    let googlePlacesDetails: any = null;
    try {
      googlePlacesDetails = await fetchGooglePlacesDetails(
        input.google_place_id,
        input.google_api_key
      );

      if (googlePlacesDetails) {
        const data = extractGooglePlacesData(googlePlacesDetails);
        sourcesUsed.add('google_places');

        // Create observation for each piece of data
        if (data.business_name) {
          observations.push(
            createObservation(
              input.candidate_id,
              ObservationType.BUSINESS_NAME,
              data.business_name,
              'google_places'
            )
          );
          typesCollected.add(ObservationType.BUSINESS_NAME);
        }

        if (data.address) {
          observations.push(
            createObservation(
              input.candidate_id,
              ObservationType.ADDRESS,
              data.address,
              'google_places'
            )
          );
          typesCollected.add(ObservationType.ADDRESS);

          // Extract postcode from address
          const postcode = extractPostcodeFromAddress(data.address);
          if (postcode) {
            observations.push(
              createObservation(
                input.candidate_id,
                ObservationType.POSTCODE,
                postcode,
                'metadata'
              )
            );
            typesCollected.add(ObservationType.POSTCODE);
          }
        }

        if (data.google_place_id) {
          observations.push(
            createObservation(
              input.candidate_id,
              ObservationType.GOOGLE_PLACE_ID,
              data.google_place_id,
              'google_places'
            )
          );
          typesCollected.add(ObservationType.GOOGLE_PLACE_ID);
        }

        if (data.phone_number) {
          observations.push(
            createObservation(
              input.candidate_id,
              ObservationType.PHONE,
              data.phone_number,
              'google_places'
            )
          );
          typesCollected.add(ObservationType.PHONE);
        }

        if (data.website_url) {
          observations.push(
            createObservation(
              input.candidate_id,
              ObservationType.WEBSITE,
              data.website_url,
              'google_places'
            )
          );
          typesCollected.add(ObservationType.WEBSITE);
        }

        if (data.google_rating) {
          observations.push(
            createObservation(
              input.candidate_id,
              ObservationType.GOOGLE_RATING,
              String(data.google_rating),
              'google_places'
            )
          );
          typesCollected.add(ObservationType.GOOGLE_RATING);
        }

        if (data.review_count) {
          observations.push(
            createObservation(
              input.candidate_id,
              ObservationType.GOOGLE_REVIEW_COUNT,
              String(data.review_count),
              'google_places'
            )
          );
          typesCollected.add(ObservationType.GOOGLE_REVIEW_COUNT);
        }

        if (data.operating_hours && data.operating_hours.length > 0) {
          observations.push(
            createObservation(
              input.candidate_id,
              ObservationType.OPENING_HOURS,
              data.operating_hours.join('; '),
              'google_places'
            )
          );
          typesCollected.add(ObservationType.OPENING_HOURS);
        }

        if (data.industry_category) {
          observations.push(
            createObservation(
              input.candidate_id,
              ObservationType.BUSINESS_CATEGORY,
              data.industry_category,
              'metadata'
            )
          );
          typesCollected.add(ObservationType.BUSINESS_CATEGORY);
        }

        // Extract reviews (raw text only, no analysis)
        const reviews = extractReviewsFromGooglePlaces(googlePlacesDetails);
        sourcesUsed.add('review');

        for (const review of reviews) {
          // Review text
          observations.push(
            createObservation(
              input.candidate_id,
              ObservationType.REVIEW_TEXT,
              review.text,
              'review',
              undefined,
              new Date(review.date * 1000).toISOString(),
              review.author
            )
          );
          typesCollected.add(ObservationType.REVIEW_TEXT);

          // Review rating
          observations.push(
            createObservation(
              input.candidate_id,
              ObservationType.REVIEW_RATING,
              String(review.rating),
              'review',
              undefined,
              new Date(review.date * 1000).toISOString(),
              review.author
            )
          );
          typesCollected.add(ObservationType.REVIEW_RATING);

          // Review date
          observations.push(
            createObservation(
              input.candidate_id,
              ObservationType.REVIEW_DATE,
              new Date(review.date * 1000).toISOString(),
              'review',
              undefined,
              new Date(review.date * 1000).toISOString(),
              review.author
            )
          );
          typesCollected.add(ObservationType.REVIEW_DATE);
        }
      }
    } catch (err) {
      warnings.push(`google_places_fetch_failed: ${err instanceof Error ? err.message : 'unknown error'}`);
    }

    // Stage 2: Website Content (no keyword searching, just raw evidence)
    const websiteUrl = observations.find(o => o.observation_type === ObservationType.WEBSITE)?.evidence_text;
    if (websiteUrl) {
      try {
        const websiteContent = await fetchWebsiteContent(websiteUrl);

        if (websiteContent) {
          sourcesUsed.add('website');

          // Look for common operational phrases and store them exactly as found
          const phrases = [
            'same day',
            'same-day',
            'next day',
            'next-day',
            'delivery',
            'collect',
            'collection',
            'click and collect',
            'booking',
            'appointment',
            'emergency',
            'urgent',
            'asap',
            '24/7',
            'trade account',
            'commercial',
            'b2b',
            'wholesale',
          ];

          for (const phrase of phrases) {
            const result = findAnyPhrase(websiteContent, [phrase]);
            if (result) {
              observations.push(
                createObservation(
                  input.candidate_id,
                  ObservationType.OPERATIONAL_PHRASE,
                  result.context,
                  'website',
                  websiteUrl
                )
              );
              typesCollected.add(ObservationType.OPERATIONAL_PHRASE);
            }
          }
        }
      } catch (err) {
        warnings.push(`website_fetch_failed: ${err instanceof Error ? err.message : 'unknown error'}`);
      }
    }

    // Deduplicate identical observations
    const deduplicated = deduplicateObservations(observations);

    // Calculate coverage
    const coverage = calculateObservationCoverage(typesCollected);

    return {
      candidate_id: input.candidate_id,
      observations: deduplicated,
      observation_coverage: coverage,
      sources_used: Array.from(sourcesUsed) as any[],
      warnings,
      execution_time_ms: Date.now() - startTime,
    };
  } catch (error) {
    console.error('[observation-orchestrator] Unexpected error:', error);

    return {
      candidate_id: input.candidate_id,
      observations: [],
      observation_coverage: 0,
      sources_used: [],
      warnings: [
        `critical_error: ${error instanceof Error ? error.message : 'unknown'}`,
      ],
      execution_time_ms: Date.now() - startTime,
    };
  }
}

/**
 * Batch observation generation
 * Process multiple candidates and return all observations for each
 */
export async function generateObservationsBatch(
  inputs: ObservationInput[]
): Promise<ObservationBatch[]> {
  const results = await Promise.all(
    inputs.map(input => generateObservations(input))
  );

  return results;
}
