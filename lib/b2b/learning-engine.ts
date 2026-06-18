/**
 * B2B Learning Engine (Wave 5)
 *
 * REPORTING BRAIN, NOT THINKING AGENT
 *
 * Purpose: Observe + interpret what already happened
 * FORBIDDEN: Influence, decide, optimize, suggest changes to system behavior
 *
 * Pure analysis only. Read-only. No writes, no mutations, no side effects.
 */

import { prisma } from "@/lib/prisma";

/**
 * Confidence levels based on sample size
 */
type ConfidenceLevel = "LOW" | "MEDIUM" | "HIGH";

function getConfidenceLevel(sampleSize: number): ConfidenceLevel {
  if (sampleSize < 20) return "LOW";
  if (sampleSize < 50) return "MEDIUM";
  return "HIGH";
}

/**
 * Stability score: how consistent is the metric over time?
 * Returns 0-1 (1 = very stable, 0 = highly variable)
 */
function calculateStabilityScore(values: number[]): number {
  if (values.length < 2) return 0.5;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;
  const stdDev = Math.sqrt(variance);

  // Normalize: low stdDev = high stability
  // If stdDev > mean, clamp to 0
  if (mean === 0) return 0.5;
  const normalizedStdDev = stdDev / mean;
  return Math.max(0, 1 - normalizedStdDev);
}

/**
 * Metric: raw performance data with confidence scoring
 */
export interface RawMetric {
  name: string;
  yes_rate: number;
  yes_count: number;
  no_count: number;
  sent_count: number;
  sample_size: number;
  confidence_level: ConfidenceLevel;
  stability_score: number;
}

/**
 * Signal: interpreted metric (what it means)
 */
export interface Signal {
  metric_name: string;
  yes_rate: number;
  confidence_level: ConfidenceLevel;
  stability_score: number;
  interpretation: string;
  caveats: string[];
}

/**
 * Insight: pattern across multiple signals
 */
export interface Insight {
  title: string;
  description: string;
  supporting_signals: Signal[];
  confidence_level: ConfidenceLevel;
}

/**
 * Calculate pressure type metrics with confidence scoring
 */
export async function analyzePressureTypes(): Promise<RawMetric[]> {
  try {
    const outreach = await prisma.b2bOutreach.findMany({
      include: {
        b2b_responses: true,
      },
    });

    const metrics: Record<string, any> = {};

    // Collect raw data
    for (const record of outreach) {
      const type = record.pressure_type || "unknown";

      if (!metrics[type]) {
        metrics[type] = {
          yes_count: 0,
          no_count: 0,
          sent_count: 0,
          daily_rates: [],
        };
      }

      metrics[type].sent_count++;

      const response = record.b2b_responses[0];
      if (response) {
        if (response.response_type === "YES") {
          metrics[type].yes_count++;
        } else if (response.response_type === "NO") {
          metrics[type].no_count++;
        }
      }
    }

    // Calculate metrics with confidence
    const results: RawMetric[] = [];
    for (const type in metrics) {
      const data = metrics[type];
      const respondedCount = data.yes_count + data.no_count;
      const yes_rate =
        respondedCount > 0 ? data.yes_count / respondedCount : 0;

      const confidenceLevel = getConfidenceLevel(respondedCount);
      const stability_score = calculateStabilityScore(
        data.daily_rates.length > 0
          ? data.daily_rates
          : [yes_rate] // Fallback for single point
      );

      results.push({
        name: type,
        yes_rate,
        yes_count: data.yes_count,
        no_count: data.no_count,
        sent_count: data.sent_count,
        sample_size: respondedCount,
        confidence_level: confidenceLevel,
        stability_score,
      });
    }

    return results.sort((a, b) => b.yes_rate - a.yes_rate);
  } catch (error) {
    console.error("[LEARNING ENGINE] Error analyzing pressure types:", error);
    return [];
  }
}

/**
 * Calculate copy variant metrics with confidence scoring
 */
export async function analyzeCopyVariants(): Promise<RawMetric[]> {
  try {
    const outreach = await prisma.b2bOutreach.findMany({
      include: {
        b2b_responses: true,
      },
    });

    const metrics: Record<string, any> = {};

    // Collect raw data
    for (const record of outreach) {
      const variant = record.copy_variant || "UNKNOWN";

      if (!metrics[variant]) {
        metrics[variant] = {
          yes_count: 0,
          no_count: 0,
          sent_count: 0,
          daily_rates: [],
        };
      }

      metrics[variant].sent_count++;

      const response = record.b2b_responses[0];
      if (response) {
        if (response.response_type === "YES") {
          metrics[variant].yes_count++;
        } else if (response.response_type === "NO") {
          metrics[variant].no_count++;
        }
      }
    }

    // Calculate metrics with confidence
    const results: RawMetric[] = [];
    for (const variant in metrics) {
      const data = metrics[variant];
      const respondedCount = data.yes_count + data.no_count;
      const yes_rate =
        respondedCount > 0 ? data.yes_count / respondedCount : 0;

      const confidenceLevel = getConfidenceLevel(respondedCount);
      const stability_score = calculateStabilityScore(
        data.daily_rates.length > 0
          ? data.daily_rates
          : [yes_rate] // Fallback
      );

      results.push({
        name: variant,
        yes_rate,
        yes_count: data.yes_count,
        no_count: data.no_count,
        sent_count: data.sent_count,
        sample_size: respondedCount,
        confidence_level: confidenceLevel,
        stability_score,
      });
    }

    return results.sort((a, b) => b.yes_rate - a.yes_rate);
  } catch (error) {
    console.error("[LEARNING ENGINE] Error analyzing copy variants:", error);
    return [];
  }
}

/**
 * Interpret a metric as a human-readable signal
 * OBSERVATION ONLY - no influence on system
 */
export function interpretMetric(metric: RawMetric): Signal {
  const caveats: string[] = [];

  // Build interpretation
  let interpretation = `${metric.name} shows ${(metric.yes_rate * 100).toFixed(1)}% YES rate`;

  // Add confidence caveat
  if (metric.confidence_level === "LOW") {
    caveats.push(
      `Very small sample (${metric.sample_size}). This pattern may be noise.`
    );
  } else if (metric.confidence_level === "MEDIUM") {
    caveats.push(
      `Moderate sample (${metric.sample_size}). Pattern may shift as more data arrives.`
    );
  }

  // Add stability caveat
  if (metric.stability_score < 0.4) {
    caveats.push("Performance has been inconsistent over time.");
  } else if (metric.stability_score < 0.7) {
    caveats.push("Performance shows some variance.");
  }

  // Add YES rate context
  if (metric.yes_rate > 0.6 && metric.confidence_level === "HIGH") {
    interpretation += " (strong performer with high confidence)";
  } else if (metric.yes_rate < 0.3 && metric.confidence_level === "HIGH") {
    interpretation += " (weak performer - collect more data before changing)";
  }

  return {
    metric_name: metric.name,
    yes_rate: metric.yes_rate,
    confidence_level: metric.confidence_level,
    stability_score: metric.stability_score,
    interpretation,
    caveats,
  };
}

/**
 * Generate insights from multiple signals
 * OBSERVATION ONLY - no recommendations, no influence
 */
export function generateInsights(signals: Signal[]): Insight[] {
  const insights: Insight[] = [];

  // Insight 1: High confidence performers
  const highConfidenceSignals = signals.filter(
    (s) => s.confidence_level === "HIGH"
  );
  if (highConfidenceSignals.length > 0) {
    const topPerformers = highConfidenceSignals
      .sort((a, b) => b.yes_rate - a.yes_rate)
      .slice(0, 3);

    if (topPerformers.some((s) => s.yes_rate > 0.5)) {
      insights.push({
        title: "High-Confidence Performers Detected",
        description: `These signals show consistent performance with adequate sample sizes: ${topPerformers.map((s) => s.metric_name).join(", ")}`,
        supporting_signals: topPerformers,
        confidence_level: "HIGH",
      });
    }
  }

  // Insight 2: Low confidence signals (need more data)
  const lowConfidenceSignals = signals.filter(
    (s) => s.confidence_level === "LOW"
  );
  if (lowConfidenceSignals.length > 0) {
    insights.push({
      title: "Signals Need More Data",
      description: `These patterns are based on small samples and should not yet inform decisions: ${lowConfidenceSignals.map((s) => s.metric_name).join(", ")}`,
      supporting_signals: lowConfidenceSignals,
      confidence_level: "LOW",
    });
  }

  // Insight 3: Unstable performers (variance alert)
  const unstableSignals = signals.filter((s) => s.stability_score < 0.4);
  if (unstableSignals.length > 0) {
    insights.push({
      title: "Unstable Patterns Observed",
      description: `These signals show high variance over time - patterns may be shifting: ${unstableSignals.map((s) => s.metric_name).join(", ")}`,
      supporting_signals: unstableSignals,
      confidence_level: "MEDIUM",
    });
  }

  return insights;
}

/**
 * Full learning report
 * OBSERVATION ONLY - for operator reading, not system influence
 */
export async function generateLearningReport() {
  try {
    const pressureTypeMetrics = await analyzePressureTypes();
    const copyVariantMetrics = await analyzeCopyVariants();

    const pressureTypeSignals = pressureTypeMetrics.map(interpretMetric);
    const copyVariantSignals = copyVariantMetrics.map(interpretMetric);

    const allSignals = [...pressureTypeSignals, ...copyVariantSignals];
    const insights = generateInsights(allSignals);

    return {
      timestamp: new Date().toISOString(),
      pressure_type_metrics: pressureTypeMetrics,
      copy_variant_metrics: copyVariantMetrics,
      pressure_type_signals: pressureTypeSignals,
      copy_variant_signals: copyVariantSignals,
      insights,
      caveat:
        "This is observation only. All patterns should be interpreted conservatively. This report does not influence system behavior.",
    };
  } catch (error) {
    console.error("[LEARNING ENGINE] Error generating report:", error);
    return {
      timestamp: new Date().toISOString(),
      error: "Failed to generate learning report",
      caveat:
        "This is observation only. This report does not influence system behavior.",
    };
  }
}
