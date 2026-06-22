/**
 * SMART CAMPAIGN PREP
 *
 * Phase 5A: When operator qualifies prospects, suggest:
 * "Ready to email these similar prospects too?"
 *
 * This is the smart suggestion workflow that appears AFTER qualification
 * Automatically identifies similar prospects and prepares them for batch email
 */

import { analyzeBusinessType } from "./business-reasoning-patterns";

export interface ProspectForCampaign {
  id: string;
  businessName: string;
  businessCategory?: string;
  city?: string;
}

export interface SmartCampaignSuggestion {
  isAvailable: boolean;
  qualifiedProspectId: string;
  suggestedProspectsCount: number;
  suggestedProspects: ProspectForCampaign[];
  reason: string;
  suggestedAction: string;
  readyForBatchEmail: boolean;
}

/**
 * FIND SIMILAR PROSPECTS FOR BATCH EMAIL PREP
 *
 * When operator qualifies 1 prospect, find similar ones
 * Similar = same industry + same/nearby city
 */
export function findSimilarProspectsForCampaign(
  qualifiedProspect: ProspectForCampaign,
  allProspects: ProspectForCampaign[]
): SmartCampaignSuggestion {
  const analysis = analyzeBusinessType(qualifiedProspect.businessCategory);

  // Filter for similar prospects
  const similar = allProspects.filter((prospect) => {
    if (prospect.id === qualifiedProspect.id) return false; // Exclude self

    // Match: same industry pattern
    const prospectAnalysis = analyzeBusinessType(prospect.businessCategory);
    const sameIndustryPattern =
      prospectAnalysis.pattern.whatMoves === analysis.pattern.whatMoves;

    // Match: same city or nearby (for relevance)
    const sameCity =
      prospect.city?.toLowerCase() === qualifiedProspect.city?.toLowerCase();

    return sameIndustryPattern && sameCity;
  });

  // Build the suggestion
  const hasSmartSuggestion = similar.length > 0;

  if (hasSmartSuggestion) {
    const industryName = analysis.pattern.whatMoves;
    const cityName = qualifiedProspect.city || "your region";

    return {
      isAvailable: true,
      qualifiedProspectId: qualifiedProspect.id,
      suggestedProspectsCount: similar.length,
      suggestedProspects: similar,
      reason: `We found ${similar.length} other businesses in ${cityName} with the same ${industryName} needs as ${qualifiedProspect.businessName}.`,
      suggestedAction: `Ready to send emails to these ${similar.length} similar prospects?`,
      readyForBatchEmail: true,
    };
  }

  return {
    isAvailable: false,
    qualifiedProspectId: qualifiedProspect.id,
    suggestedProspectsCount: 0,
    suggestedProspects: [],
    reason: "No similar prospects found for batch email.",
    suggestedAction: "Continue discovering new prospects.",
    readyForBatchEmail: false,
  };
}

/**
 * PREPARE BATCH EMAIL CAMPAIGN
 *
 * Takes suggested prospects and prepares them for batch email
 * Returns: ready-to-send email generation task
 */
export function prepareBatchEmailCampaign(
  qualifiedProspect: ProspectForCampaign,
  suggestedProspects: ProspectForCampaign[]
): {
  campaignReady: boolean;
  prospectsToPrepare: ProspectForCampaign[];
  estimatedEmailsToGenerate: number;
  nextStep: string;
} {
  return {
    campaignReady: suggestedProspects.length > 0,
    prospectsToPrepare: suggestedProspects,
    estimatedEmailsToGenerate: suggestedProspects.length,
    nextStep: suggestedProspects.length > 0
      ? `Generate and review ${suggestedProspects.length} emails for similar prospects`
      : "Continue discovering new prospects",
  };
}
