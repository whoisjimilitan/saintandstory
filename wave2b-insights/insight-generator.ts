/**
 * WAVE 2B: CONSTRAINED INTELLIGENCE OBSERVATIONS
 *
 * MINIMAL REAL BEHAVIOR
 *
 * Generates evidence-based observations from observations.
 * Detects lexical contradiction markers only.
 */

export interface Observation {
  observation_id: string;
  observation_type: string;
  evidence_text: string;
  source: string;
  confidence: string;
}

export class IntelligenceAnalyzer {
  private contradictionKeywords = [
    "but",
    "however",
    "while",
    "although",
    "yet",
    "despite",
    "nonetheless",
    "contradicts",
    "conflict",
    "disagree",
  ];

  async generateIntelligenceObservations(
    wave2a: any,
    observations: Observation[]
  ): Promise<Array<Record<string, unknown>>> {
    const result: Array<Record<string, unknown>> = [];
    let observationIndex = 0;

    for (const obs of observations) {
      const text = obs.evidence_text.toLowerCase();

      // Check for contradiction keywords
      for (const keyword of this.contradictionKeywords) {
        if (text.includes(keyword)) {
          // Extract sentence containing keyword
          const sentences = obs.evidence_text.split(/[.!?]+/).filter((s) => s.trim());
          const relevantSentence = sentences.find((s) =>
            s.toLowerCase().includes(keyword)
          );

          if (relevantSentence) {
            result.push({
              id: `IO-${String(observationIndex).padStart(4, "0")}`,
              category: this.classifyCategory(text),
              title: `Contradiction detected: ${keyword}`,
              description: relevantSentence.trim(),
              supporting_observations: [obs.observation_id],
              confidence: "medium",
              data_quality: "moderate",
              evidence_strength: 0.5,
              generated_at: new Date().toISOString(),
              reasoning: "detected lexical contradiction marker",
            });
            observationIndex++;
          }
          break; // One per observation max
        }
      }
    }

    return result;
  }

  private classifyCategory(text: string): string {
    if (
      text.includes("review") ||
      text.includes("feedback") ||
      text.includes("customer") ||
      text.includes("user")
    ) {
      return "customer_experience";
    }
    if (
      text.includes("hour") ||
      text.includes("open") ||
      text.includes("close") ||
      text.includes("time")
    ) {
      return "operations";
    }
    return "other";
  }
}
