/**
 * DRIVER SYSTEM IS DETECTION ONLY
 * NOT a matching engine
 * NOT a ranking system
 * NOT an optimization layer
 *
 * Driver side mirrors customer side pressure signals.
 * No integration with lead qualification.
 * No connection to pipeline.
 */

export interface DriverSignal {
  availability: boolean;
  urgency_keywords: string[];
  readiness_level: "high" | "medium" | "low";
  source: string;
  detected_at: string;
}

const DRIVER_URGENCY_PATTERNS = [
  "available today",
  "same day",
  "urgent work",
  "owner driver",
  "van work",
  "deliveries today",
  "collections urgent",
];

export function detectDriverSignal(text: string): DriverSignal {
  const lower = text.toLowerCase();
  const matchedKeywords = DRIVER_URGENCY_PATTERNS.filter((pattern) =>
    lower.includes(pattern)
  );

  return {
    availability: matchedKeywords.length > 0,
    urgency_keywords: matchedKeywords,
    readiness_level:
      matchedKeywords.length > 2 ? "high" : matchedKeywords.length > 0 ? "medium" : "low",
    source: "signal_detection_only",
    detected_at: new Date().toISOString(),
  };
}

// HARD RULE: Driver system does NOT integrate with lead pipeline
export function driverSignalCannotBeUsedForLeadMatching(): boolean {
  return false; // Explicitly disallow
}
