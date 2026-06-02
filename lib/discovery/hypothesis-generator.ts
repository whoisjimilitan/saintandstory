/**
 * Hypothesis generation from observed patterns.
 *
 * Input: Patterns extracted from reviews (via lib/interpretation/patterns.ts)
 * Output: Traceable hypotheses with evidence references
 *
 * Key rule: No LLM. No invention. Deterministic statements keyed by pattern type.
 */

import { ObservedPattern } from "../interpretation/patterns";

export interface TraceableHypothesis {
  statement: string
  patternType: string        // Maps to ObservedPattern.description
  evidenceCount: number
  sampleTexts: string[]      // From ObservedPattern.examples
}

const HYPOTHESIS_TEMPLATES: Record<string, (count: number) => string> = {
  "Wedding-related work mentioned": (count) =>
    `This business handles wedding or event work based on ${count} review(s) mentioning wedding-related themes.`,
  "Seasonal occasions mentioned": (count) =>
    `This business experiences seasonal demand spikes based on ${count} review(s) referencing seasonal occasions.`,
  "Owner mentioned by name or personal involvement noted": (count) =>
    `This business is owner-operated with hands-on personal service based on ${count} review(s) noting owner involvement.`,
  "Custom coordination or bespoke service mentioned": (count) =>
    `This business fulfils bespoke or custom orders based on ${count} review(s) describing personalised work.`,
  "Last-minute or urgent requests handled": (count) =>
    `This business regularly handles last-minute or urgent orders based on ${count} review(s) mentioning short-notice requests.`,
};

export function generateHypotheses(
  patterns: ObservedPattern[]
): TraceableHypothesis[] {
  const hypotheses: TraceableHypothesis[] = [];

  for (const pattern of patterns) {
    // Look up template for this pattern type
    const template = HYPOTHESIS_TEMPLATES[pattern.description];
    const statement = template
      ? template(pattern.occurrences)
      : `${pattern.description} based on ${pattern.occurrences} review(s).`;

    hypotheses.push({
      statement,
      patternType: pattern.description,
      evidenceCount: pattern.occurrences,
      sampleTexts: pattern.examples,
    });
  }

  return hypotheses;
}
