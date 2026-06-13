/**
 * Phase 5: Intelligence Layer - Feature Flags
 *
 * All Phase 5 intelligence systems are DORMANT by default.
 * Enable each module independently as you validate them.
 *
 * CRITICAL: This file controls all autonomous behavior.
 * DO NOT enable "auto_" flags without explicit testing.
 */

export const PHASE5_FEATURE_FLAGS = {
  // ──────────────────────────────────────────────────────────
  // ENGAGEMENT TRACKING (ACTIVE - Data collection)
  // ──────────────────────────────────────────────────────────
  ENGAGEMENT_TRACKING_ENABLED: true,
  // Captures: opens, clicks, bounces, complaints from Resend webhooks
  // Status: ACTIVE - collecting data in production
  // Risk: None - additive only, no behavior changes

  ENGAGEMENT_SCORE_DISPLAY: true,
  // Shows engagement score in lead card UI
  // Status: ACTIVE - visible in UI
  // Risk: None - display only

  // ──────────────────────────────────────────────────────────
  // HEAT SCORE (DORMANT - Display only)
  // ──────────────────────────────────────────────────────────
  HEAT_SCORE_CALCULATION_ENABLED: true,
  // Calculates heat score = business fit + engagement + intent
  // Status: DORMANT - calculated but not used for ranking
  // Risk: None - data collection only
  // To activate: Set HEAT_SCORE_RANKING_ENABLED = true

  HEAT_SCORE_RANKING_ENABLED: true,
  // Ranks prospects by heat score instead of creation date
  // Status: ACTIVE
  // Risk: NONE - display only, no behavior changes
  // Activated: 2026-06-13 with full visibility layer

  HEAT_SCORE_API_ENABLED: true,
  // /api/b2b/intelligence/heat-score endpoint available
  // Status: DORMANT - endpoint available for manual queries only
  // Risk: None - read-only API

  // ──────────────────────────────────────────────────────────
  // ADAPTIVE FOLLOW-UP ENGINE (DORMANT)
  // ──────────────────────────────────────────────────────────
  ADAPTIVE_FOLLOWUP_ANALYSIS_ENABLED: true,
  // Analyzes engagement patterns and recommends follow-up type
  // Status: DORMANT - analysis available, not sent
  // Risk: None - data collection only

  ADAPTIVE_FOLLOWUP_AUTO_SEND: false,
  // DANGEROUS: Automatically sends follow-ups based on rules
  // Status: DORMANT
  // Risk: HIGH - sends emails automatically
  // NEVER enable without extensive validation

  ADAPTIVE_FOLLOWUP_SUGGESTIONS: true,
  // Shows follow-up recommendations in UI for manual approval
  // Status: DORMANT
  // Risk: NONE - suggestions only
  // To activate: Display API results in UI component

  // ──────────────────────────────────────────────────────────
  // AI PROSPECT BRIEF 2.0 (DORMANT)
  // ──────────────────────────────────────────────────────────
  AI_BRIEF_GENERATION_ENABLED: true,
  // Generates AI conversation brief for prospects
  // Includes: why they need it, objections, conversion probability
  // Status: DORMANT - on-demand generation only
  // Risk: None - read-only API, generates on request

  AI_BRIEF_DISPLAY_IN_UI: false,
  // Shows AI brief in prospect detail view
  // Status: DORMANT
  // Risk: MEDIUM - displays AI-generated content to operator
  // To activate: Add UI component in prospect card

  AI_BRIEF_COST_WARNING: true,
  // Warns that generating briefs costs Claude API calls
  // Status: ACTIVE
  // Risk: None - informational only

  // ──────────────────────────────────────────────────────────
  // DISCOVERY LEARNING & CATEGORY ANALYTICS (DORMANT)
  // ──────────────────────────────────────────────────────────
  CATEGORY_ANALYTICS_ENABLED: true,
  // Tracks which categories convert best
  // Status: DORMANT - data collection only
  // Risk: None - analysis only

  CATEGORY_INSIGHTS_API_ENABLED: true,
  // /api/b2b/intelligence/category-analytics endpoint
  // Status: DORMANT - read-only API
  // Risk: None - data collection and display

  AUTO_DEPRIORITIZE_LOW_CONVERTING: false,
  // DANGEROUS: Automatically pauses discovery for low-converting categories
  // Status: DORMANT
  // Risk: HIGH - changes discovery behavior
  // NEVER enable without explicit business approval

  AUTO_PRIORITIZE_HIGH_CONVERTING: false,
  // DANGEROUS: Automatically increases discovery for high-converting categories
  // Status: DORMANT
  // Risk: HIGH - changes discovery strategy
  // NEVER enable without explicit business approval

  // ──────────────────────────────────────────────────────────
  // MISSION ROI TRACKING (DORMANT)
  // ──────────────────────────────────────────────────────────
  MISSION_ROI_ENABLED: true,
  // Calculates ROI for each discovery mission
  // Status: DORMANT - data collection only
  // Risk: None - analysis only

  MISSION_ROI_API_ENABLED: true,
  // /api/b2b/intelligence/mission-roi endpoint
  // Status: DORMANT - read-only API
  // Risk: None - data collection and display

  AUTO_PAUSE_UNDERPERFORMING_MISSIONS: false,
  // DANGEROUS: Automatically pauses missions with negative ROI
  // Status: DORMANT
  // Risk: HIGH - disables discovery missions
  // NEVER enable without explicit business approval

  // ──────────────────────────────────────────────────────────
  // REVENUE ATTRIBUTION (DORMANT)
  // ──────────────────────────────────────────────────────────
  REVENUE_ATTRIBUTION_ENABLED: true,
  // Tracks full customer journey from discovery to revenue
  // Status: DORMANT - data collection only
  // Risk: None - tracking only

  REVENUE_ATTRIBUTION_API_ENABLED: true,
  // /api/b2b/intelligence/revenue-attribution endpoint
  // Status: DORMANT - read-only API
  // Risk: None - data collection and display

  // ──────────────────────────────────────────────────────────
  // DASHBOARD INTELLIGENCE / COMMAND CENTER (DORMANT)
  // ──────────────────────────────────────────────────────────
  COMMAND_CENTER_API_ENABLED: true,
  // Aggregates all intelligence into operator recommendations
  // Status: DORMANT - API available, no UI component yet
  // Risk: None - read-only aggregation

  COMMAND_CENTER_UI_ENABLED: false,
  // Shows command center in dashboard
  // Status: DORMANT
  // Risk: NONE - display only
  // To activate: Add UI component in admin dashboard

  // ──────────────────────────────────────────────────────────
  // MASTER CONTROLS
  // ──────────────────────────────────────────────────────────
  PHASE5_ENABLED: true,
  // Master switch for all Phase 5 features
  // Set to false to disable all Phase 5 functionality
  // Status: ACTIVE for data collection
  // Risk: None - only controls dormant/active status

  PHASE5_PRODUCTION_SAFE: true,
  // When true: Only safe (display-only) features are active
  // When false: Can enable autonomous features
  // Status: TRUE in production
  // NEVER set to false without explicit approval

  PHASE5_AUTO_FEATURES_ALLOWED: false,
  // Master switch for all "auto_" flags
  // Prevents accidental autonomous behavior
  // Status: FALSE in production
  // NEVER set to true without documented approval process
};

/**
 * Validation function - ensures safe feature flag combinations
 */
export function validatePhase5Flags(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Safety rule 1: No auto features in production
  if (
    PHASE5_FEATURE_FLAGS.PHASE5_PRODUCTION_SAFE &&
    PHASE5_FEATURE_FLAGS.AUTO_DEPRIORITIZE_LOW_CONVERTING
  ) {
    errors.push(
      "AUTO_DEPRIORITIZE_LOW_CONVERTING enabled in production mode"
    );
  }

  if (
    PHASE5_FEATURE_FLAGS.PHASE5_PRODUCTION_SAFE &&
    PHASE5_FEATURE_FLAGS.AUTO_PRIORITIZE_HIGH_CONVERTING
  ) {
    errors.push(
      "AUTO_PRIORITIZE_HIGH_CONVERTING enabled in production mode"
    );
  }

  if (
    PHASE5_FEATURE_FLAGS.PHASE5_PRODUCTION_SAFE &&
    PHASE5_FEATURE_FLAGS.AUTO_PAUSE_UNDERPERFORMING_MISSIONS
  ) {
    errors.push(
      "AUTO_PAUSE_UNDERPERFORMING_MISSIONS enabled in production mode"
    );
  }

  if (
    PHASE5_FEATURE_FLAGS.PHASE5_PRODUCTION_SAFE &&
    PHASE5_FEATURE_FLAGS.ADAPTIVE_FOLLOWUP_AUTO_SEND
  ) {
    errors.push("ADAPTIVE_FOLLOWUP_AUTO_SEND enabled in production mode");
  }

  // Safety rule 2: Auto features require master enable
  if (
    (PHASE5_FEATURE_FLAGS.AUTO_DEPRIORITIZE_LOW_CONVERTING ||
      PHASE5_FEATURE_FLAGS.AUTO_PRIORITIZE_HIGH_CONVERTING ||
      PHASE5_FEATURE_FLAGS.AUTO_PAUSE_UNDERPERFORMING_MISSIONS ||
      PHASE5_FEATURE_FLAGS.ADAPTIVE_FOLLOWUP_AUTO_SEND) &&
    !PHASE5_FEATURE_FLAGS.PHASE5_AUTO_FEATURES_ALLOWED
  ) {
    errors.push(
      "Auto features enabled but PHASE5_AUTO_FEATURES_ALLOWED is false"
    );
  }

  // Warning: UI without feature enabled
  if (
    PHASE5_FEATURE_FLAGS.COMMAND_CENTER_UI_ENABLED &&
    !PHASE5_FEATURE_FLAGS.COMMAND_CENTER_API_ENABLED
  ) {
    warnings.push("COMMAND_CENTER_UI_ENABLED but API is disabled");
  }

  if (
    PHASE5_FEATURE_FLAGS.AI_BRIEF_DISPLAY_IN_UI &&
    !PHASE5_FEATURE_FLAGS.AI_BRIEF_GENERATION_ENABLED
  ) {
    warnings.push("AI_BRIEF_DISPLAY_IN_UI but generation is disabled");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if a specific feature is safe to use
 */
export function isFeatureSafe(featureName: string): boolean {
  const key = featureName as keyof typeof PHASE5_FEATURE_FLAGS;
  const flag = PHASE5_FEATURE_FLAGS[key];

  if (typeof flag !== "boolean") return false;

  // Auto features are never safe in production
  if (key.startsWith("AUTO_") && PHASE5_FEATURE_FLAGS.PHASE5_PRODUCTION_SAFE) {
    return false;
  }

  return flag;
}
