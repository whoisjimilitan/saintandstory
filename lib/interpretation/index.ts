/**
 * Phase 2.5: Query Interpretation Layer
 *
 * Read-only analytics over immutable events.
 * No mutations. No scoring. No judgment.
 *
 * This layer provides:
 * - Event fetchers (raw data access)
 * - Pattern extractors (count-based observations)
 * - Timeline builders (chronological views)
 *
 * Interpretation is external to the database.
 * All views are reversible and re-queryable.
 */

export * from "./events";
export * from "./patterns";
