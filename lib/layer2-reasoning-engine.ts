/**
 * LAYER 2: REASONING ENGINE
 *
 * Consumes: RelationshipReasoning context from 8-step engine
 * Produces: Three ranked communication recommendations
 *
 * Process:
 * 1. Generate 10 opening formulations based on prospect context
 * 2. Score each for Communication Quality (PD × Trust × Authenticity)
 * 3. Rank top 3 by quality score
 * 4. Generate complete email body for #1
 * 5. Pass through Layer 3 (Trust Validation)
 * 6. Output three options to operator
 *
 * The engine is a DECISION SYSTEM, not a writer.
 * It reasons about which approach best fits the context and PD Operating System.
 */

import type { RelationshipReasoning, RelationshipStage } from "./business-relationship-engine";
import { calculateQualityScore } from "./communication-quality-score";
import { validateEmailForTrust } from "./trust-validation-engine";

export type OpeningFormulation =
  | "minimalist"
  | "permission"
  | "anti-pitch"
  | "shared-reality"
  | "observation"
  | "assumption-reversal"
  | "curiosity"
  | "self-qualification"
  | "pattern-recognition"
  | "tiny-observation";

export interface FormulationTemplate {
  name: OpeningFormulation;
  displayName: string;
  description: string;
  openingLine: (context: RelationshipReasoning) => string;
  fitScore: (context: RelationshipReasoning) => number; // 0-100: how well this fits this prospect
}

export interface ScoredFormulation {
  name: OpeningFormulation;
  displayName: string;
  description: string;
  openingLine: string;
  fitScore: number; // contextual fit (0-100)
  qualityScore: number; // PD × Trust × Authenticity (0-1000)
  qualityPercentile: number; // 0-100
  rank: number; // 1, 2, 3, etc.
}

export interface RecommendedEmail {
  formulation: ScoredFormulation;
  fullBody: string;
  trustValidation: {
    trustScore: number;
    isValid: boolean;
    criticalIssues: string[];
  };
  recommendation: "approve" | "rewrite" | "reject";
}

export interface CommunicationRecommendation {
  rank: 1 | 2 | 3;
  formulation: ScoredFormulation;
  email?: RecommendedEmail; // Only for #1
  preview?: string; // For #2 and #3
}

/**
 * Generate 10 opening formulations based on prospect context
 */
function generateOpeningFormulations(context: RelationshipReasoning): FormulationTemplate[] {
  return [
    {
      name: "minimalist",
      displayName: "Minimalist",
      description: "Permission-based. Ultra-simple. Pure permission to ignore.",
      openingLine: (ctx) => {
        if (ctx.qualificationContext.doTheyNeedUs) {
          return `If ${ctx.qualificationContext.ifNo}, ignore this.`;
        }
        return `If everything's working perfectly with your current solution, feel free to stop reading.`;
      },
      fitScore: (ctx) => {
        return ctx.relationshipStage.current === 1 ? 95 : 70;
      },
    },

    {
      name: "permission",
      displayName: "Permission",
      description: "Permission with specificity. Based on their exact situation.",
      openingLine: (ctx) => {
        return `If ${ctx.scenarioContext.likelyRealityForThem.toLowerCase()}, this won't be relevant.`;
      },
      fitScore: (ctx) => {
        return ctx.relationshipStage.current === 1 ? 90 : 75;
      },
    },

    {
      name: "anti-pitch",
      displayName: "Anti-Pitch",
      description: "Explicitly not a sales pitch. Removes pressure immediately.",
      openingLine: (ctx) => {
        return `I'm not here to convince you. Just to observe something.`;
      },
      fitScore: (ctx) => {
        return 75;
      },
    },

    {
      name: "shared-reality",
      displayName: "Shared Reality",
      description: "Sometimes everything works... until it doesn't.",
      openingLine: (ctx) => {
        return `${ctx.scenarioContext.likelyRealityForThem}, but ${ctx.scenarioContext.triggeringMoment.toLowerCase()}.`;
      },
      fitScore: (ctx) => {
        return ctx.relationshipStage.current <= 2 ? 85 : 70;
      },
    },

    {
      name: "observation",
      displayName: "Observation",
      description: "I noticed something. Pure observation.",
      openingLine: (ctx) => {
        return `I noticed something: ${ctx.scenarioContext.likelyRealityForThem.toLowerCase()}.`;
      },
      fitScore: (ctx) => {
        return 80;
      },
    },

    {
      name: "assumption-reversal",
      displayName: "Assumption Reversal",
      description: "You probably don't need this. Assumes they're fine.",
      openingLine: (ctx) => {
        return `You probably don't need this if ${ctx.qualificationContext.ifNo.toLowerCase()}.`;
      },
      fitScore: (ctx) => {
        return ctx.relationshipStage.current === 1 ? 85 : 70;
      },
    },

    {
      name: "curiosity",
      displayName: "Curiosity",
      description: "Quick question. Opens with inquiry.",
      openingLine: (ctx) => {
        return `Quick question: ${ctx.scenarioContext.likelyRealityForThem.toLowerCase()}?`;
      },
      fitScore: (ctx) => {
        return 75;
      },
    },

    {
      name: "self-qualification",
      displayName: "Self-Qualification",
      description: "This only matters if... lets them self-qualify.",
      openingLine: (ctx) => {
        return `This only matters if ${ctx.qualificationContext.ifYes.toLowerCase()}.`;
      },
      fitScore: (ctx) => {
        return ctx.relationshipStage.current <= 2 ? 80 : 65;
      },
    },

    {
      name: "pattern-recognition",
      displayName: "Pattern Recognition",
      description: "We tend to see two kinds of businesses...",
      openingLine: (ctx) => {
        return `We tend to see two kinds of ${ctx.businessAnalysis.industry} companies: those who've solved this, and those still scrambling.`;
      },
      fitScore: (ctx) => {
        return 70;
      },
    },

    {
      name: "tiny-observation",
      displayName: "Tiny Observation",
      description: "Something small you've noticed. Specific detail.",
      openingLine: (ctx) => {
        return `Something I've noticed: ${ctx.triggeringMoment || "this happens most often during..."}`;
      },
      fitScore: (ctx) => {
        return 75;
      },
    },
  ];
}

/**
 * Score and rank formulations
 */
function scoreFormulations(
  formulations: FormulationTemplate[],
  context: RelationshipReasoning
): ScoredFormulation[] {
  return formulations
    .map((formulation) => {
      const openingLine = formulation.openingLine(context);
      const fitScore = formulation.fitScore(context);

      // Score opening line for quality
      const qualityScore = calculateQualityScore(openingLine, {
        industry: context.businessAnalysis.industry,
        stage: context.relationshipStage.current,
        isPermissionStatement:
          formulation.name === "permission" ||
          formulation.name === "minimalist" ||
          formulation.name === "assumption-reversal" ||
          formulation.name === "self-qualification",
      });

      // Combined: contextual fit (fitScore) × quality (qualityPercentile)
      const combinedScore = (fitScore / 100) * qualityScore.percentile;

      return {
        name: formulation.name,
        displayName: formulation.displayName,
        description: formulation.description,
        openingLine,
        fitScore,
        qualityScore: qualityScore.combinedScore,
        qualityPercentile: qualityScore.percentile,
        rank: 0, // Will assign after sorting
      };
    })
    .sort((a, b) => {
      // Sort by combined score descending
      const aScore = (a.fitScore / 100) * a.qualityPercentile;
      const bScore = (b.fitScore / 100) * b.qualityPercentile;
      return bScore - aScore;
    })
    .map((formulation, index) => ({
      ...formulation,
      rank: index + 1,
    }));
}

/**
 * Generate complete email body using a formulation
 */
function generateEmailBody(
  formulation: ScoredFormulation,
  context: RelationshipReasoning,
  stage: RelationshipStage
): string {
  // Convert reasoning into a proper professional letter
  // that sounds like one director speaking to another

  const scenario = context.scenarioContext.likelyRealityForThem;
  const triggering = context.scenarioContext.triggeringMoment;
  const strength = context.trustContext.genuineStrength;
  const ask = context.askContext.minimumCommitment;

  // Build a natural, flowing letter (not reasoning dump)
  const letterBody = `${scenario}

When ${triggering.toLowerCase()}, that's when reliable backup becomes critical. ${strength}

${ask}

If that makes sense, I'd love to explore this together.`;

  return letterBody;
}

/**
 * Main: Generate three ranked communication recommendations
 */
export function generateCommunicationRecommendations(
  context: RelationshipReasoning
): CommunicationRecommendation[] {
  // Step 1: Generate all 10 formulations
  const formulations = generateOpeningFormulations(context);

  // Step 2: Score and rank
  const scored = scoreFormulations(formulations, context);

  // Step 3: Take top 3
  const top3 = scored.slice(0, 3);

  // Step 4: Generate full email + validation for #1 only
  const recommendations: CommunicationRecommendation[] = top3.map((formulation, index) => {
    const rank = (index + 1) as 1 | 2 | 3;

    if (rank === 1) {
      // Generate full email and validate
      const emailBody = generateEmailBody(formulation, context, context.relationshipStage.current);
      const validation = validateEmailForTrust(emailBody);

      return {
        rank,
        formulation,
        email: {
          formulation,
          fullBody: emailBody,
          trustValidation: {
            trustScore: validation.trustScore,
            isValid: validation.isValid,
            criticalIssues: validation.focusAreas,
          },
          recommendation: validation.recommendation,
        },
      };
    } else {
      // Preview only for #2 and #3
      return {
        rank,
        formulation,
        preview: `${formulation.displayName}: ${formulation.description}`,
      };
    }
  });

  return recommendations;
}

/**
 * Format recommendations for operator display
 */
export function formatRecommendationsForOperator(
  recommendations: CommunicationRecommendation[]
): string {
  let output = `\n${"═".repeat(80)}\n`;
  output += `COMMUNICATION RECOMMENDATIONS\n`;
  output += `${"═".repeat(80)}\n\n`;

  recommendations.forEach((rec) => {
    if (rec.rank === 1) {
      output += `🟢 #${rec.rank} RECOMMENDED: ${rec.formulation.displayName}\n`;
      output += `   Fit Score: ${rec.formulation.fitScore}% | Quality: ${rec.formulation.qualityPercentile}%\n`;
      output += `   ${rec.formulation.description}\n\n`;

      if (rec.email) {
        output += `   EMAIL BODY:\n`;
        output += `   ${rec.email.fullBody.split("\n").join("\n   ")}\n\n`;

        output += `   TRUST VALIDATION: ${rec.email.trustValidation.isValid ? "✓ PASS" : "⚠ REVIEW"}\n`;
        output += `   Trust Score: ${rec.email.trustValidation.trustScore}/100\n`;

        if (rec.email.trustValidation.criticalIssues.length > 0) {
          output += `   Issues: ${rec.email.trustValidation.criticalIssues.join(", ")}\n`;
        }
      }
    } else {
      output += `⚪ #${rec.rank} ALTERNATIVE: ${rec.formulation.displayName}\n`;
      output += `   Fit Score: ${rec.formulation.fitScore}% | Quality: ${rec.formulation.qualityPercentile}%\n`;
      output += `   ${rec.formulation.description}\n`;
    }

    output += "\n";
  });

  output += `${"═".repeat(80)}\n`;
  output += `Operator: Review #1 Recommended email above. Edit as needed, then send.\n`;
  output += `Want to try a different approach? #2 and #3 are available.\n`;
  output += `${"═".repeat(80)}\n`;

  return output;
}
