/**
 * PRESSURE SIGNAL LEARNING
 *
 * Phase 5B: Learn which pressure signals work best
 *
 * System tracks:
 * - Which prospects operator qualifies (positive signal)
 * - What industry they are
 * - What pressure signal was emphasized in the discovery
 *
 * Then learns:
 * - "For restaurants, 'prep timing' resonates 80% of the time"
 * - "For lawyers, 'deadline certainty' resonates 95% of the time"
 * - "For removals in London, 'Saturday pressure' is strongest"
 *
 * Usage: When generating emails, prioritize learned pressure signals
 */

export interface PressureSignalRecord {
  industry: string;
  city?: string;
  pressureSignal: string;
  qualificationCount: number;
  effectiveness: number; // 0-100, how often does it lead to qualification
  lastSeen: Date;
}

export interface OperatorLearningProfile {
  operatorId: string;
  learningHistory: PressureSignalRecord[];
  strongestSignalsPerIndustry: Map<string, string>;
  geographicPatterns: Map<string, string>; // city -> strongest signal
}

/**
 * RECORD A QUALIFICATION (Learning point)
 */
export function recordQualification(
  operatorId: string,
  industry: string,
  city: string | undefined,
  pressureSignal: string,
  operatorProfile: OperatorLearningProfile
): OperatorLearningProfile {
  // Find existing record
  const existingRecord = operatorProfile.learningHistory.find(
    (record) =>
      record.industry === industry &&
      record.city === city &&
      record.pressureSignal === pressureSignal
  );

  if (existingRecord) {
    // Increment count (positive reinforcement)
    existingRecord.qualificationCount += 1;
    existingRecord.effectiveness = Math.min(
      100,
      (existingRecord.qualificationCount / 10) * 100
    );
    existingRecord.lastSeen = new Date();
  } else {
    // Create new record
    operatorProfile.learningHistory.push({
      industry,
      city,
      pressureSignal,
      qualificationCount: 1,
      effectiveness: 10,
      lastSeen: new Date(),
    });
  }

  // Update strongest signals per industry
  const industryRecords = operatorProfile.learningHistory.filter(
    (r) => r.industry === industry
  );
  const strongestSignal = industryRecords.reduce((prev, current) =>
    current.effectiveness > prev.effectiveness ? current : prev
  );
  operatorProfile.strongestSignalsPerIndustry.set(
    industry,
    strongestSignal.pressureSignal
  );

  // Update geographic patterns
  if (city) {
    const cityRecords = operatorProfile.learningHistory.filter(
      (r) => r.city === city
    );
    const strongestCitySignal = cityRecords.reduce((prev, current) =>
      current.effectiveness > prev.effectiveness ? current : prev
    );
    operatorProfile.geographicPatterns.set(city, strongestCitySignal.pressureSignal);
  }

  return operatorProfile;
}

/**
 * GET RECOMMENDED PRESSURE SIGNAL FOR EMAIL
 */
export function getRecommendedPressureSignal(
  industry: string,
  city: string | undefined,
  operatorProfile: OperatorLearningProfile
): string | null {
  // First priority: Geographic + Industry pattern
  if (city) {
    const geoSignal = operatorProfile.geographicPatterns.get(city);
    if (geoSignal) {
      const matchingRecord = operatorProfile.learningHistory.find(
        (r) =>
          r.industry === industry &&
          r.city === city &&
          r.pressureSignal === geoSignal
      );
      if (matchingRecord && matchingRecord.effectiveness > 60) {
        return geoSignal;
      }
    }
  }

  // Second priority: Industry-wide pattern
  const industrySignal = operatorProfile.strongestSignalsPerIndustry.get(industry);
  if (industrySignal) {
    const matchingRecord = operatorProfile.learningHistory.find(
      (r) =>
        r.industry === industry &&
        r.pressureSignal === industrySignal &&
        (!city || r.city === city)
    );
    if (matchingRecord && matchingRecord.effectiveness > 50) {
      return industrySignal;
    }
  }

  return null;
}

/**
 * GET LEARNING INSIGHTS
 */
export function getOperatorInsights(
  operatorProfile: OperatorLearningProfile
): {
  strongestIndustries: Array<{ industry: string; signal: string; effectiveness: number }>;
  geoPatterns: Array<{ city: string; signal: string }>;
  totalQualifications: number;
} {
  const strongestIndustries = Array.from(
    operatorProfile.strongestSignalsPerIndustry.entries()
  ).map(([industry, signal]) => {
    const record = operatorProfile.learningHistory.find(
      (r) => r.industry === industry && r.pressureSignal === signal
    );
    return {
      industry,
      signal,
      effectiveness: record?.effectiveness || 0,
    };
  });

  const geoPatterns = Array.from(
    operatorProfile.geographicPatterns.entries()
  ).map(([city, signal]) => ({
    city,
    signal,
  }));

  const totalQualifications = operatorProfile.learningHistory.reduce(
    (sum, r) => sum + r.qualificationCount,
    0
  );

  return {
    strongestIndustries,
    geoPatterns,
    totalQualifications,
  };
}
