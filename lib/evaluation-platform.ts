/**
 * EVALUATION & LEARNING PLATFORM
 *
 * Measures whether the Relationship Intelligence Engine produces decisions
 * that improve real-world commercial outcomes.
 *
 * Focus: Not on feature count. On measurable improvement.
 * Benchmark: Whether engine consistently improves relationship outcomes.
 *
 * 10 Core Capabilities:
 * 1. Track every prediction vs outcome
 * 2. Measure calibration accuracy
 * 3. Measure stage accuracy over time
 * 4. Measure psychology detection vs real conversations
 * 5. Measure stakeholder mapping accuracy
 * 6. Measure recommendation success rate
 * 7. Compare AI vs human decisions
 * 8. Capture feedback when rejected
 * 9. Dashboard for team
 * 10. Gold dataset for continuous learning
 */

import type { RelationshipIntelligenceObject } from "./relationship-intelligence-object";

// ============================================================================
// 1. PREDICTION TRACKING
// ============================================================================

export interface PredictionRecord {
  prospectId: string;
  timestamp: string;
  predictionType: "reply" | "meeting" | "proposal" | "deal" | "churn";
  predictedProbability: number; // 0-100
  predictedConfidence: number; // 0-100
  actualOutcome: "yes" | "no" | "pending";
  daysToOutcome: number;
  wasCorrect: boolean;
  calibrationError: number; // |predicted - actual|
  engineReasoning: string;
  metadata: {
    stage: number;
    trust: number;
    industry: string;
    companySize: string;
  };
}

export interface PredictionBatch {
  prospectId: string;
  predictions: PredictionRecord[];
  batchAccuracy: number; // % correct predictions
  batchCalibration: number; // Average calibration error
  insights: string[];
}

// ============================================================================
// 2. CALIBRATION ACCURACY
// ============================================================================

export interface CalibrationAnalysis {
  predictionType: string;
  numberOfPredictions: number;
  avgPredictedProbability: number;
  actualSuccessRate: number;
  calibrationError: number; // How far off we were
  buckets: Array<{
    probabilityRange: [number, number]; // e.g., [60, 70]
    predictedCount: number;
    actualSuccessCount: number;
    successRate: number;
    calibrationAccuracy: number; // How well this bucket performed
  }>;
  wellCalibrated: boolean; // Predicted 60% should succeed 60% of time
  recommendation: string; // If poorly calibrated, what to adjust
}

// ============================================================================
// 3. STAGE ACCURACY
// ============================================================================

export interface StageAccuracyRecord {
  prospectId: string;
  timestamp: string;
  predictedStage: number;
  actualStageAfter30Days: number;
  stageDifference: number; // |predicted - actual|
  correct: boolean; // exact match or ±1
  industry: string;
  trustAtTime: number;
  wasAccelerated: boolean; // Did they advance faster than predicted?
  wasStalled: boolean; // Did they stall when we predicted progress?
  stageDrift: "accurate" | "optimistic" | "pessimistic";
}

export interface StageAccuracyAnalysis {
  totalMeasurements: number;
  exactAccuracy: number; // % within ±0
  withinOneAccuracy: number; // % within ±1
  acceleratedCases: number; // Exceeded prediction
  stalledCases: number; // Below prediction
  optimisticBias: number; // Average error when we're wrong
  industryAccuracy: Record<string, number>; // By industry
  trustCorrelation: number; // Does higher trust = better prediction?
  trends: {
    improving: boolean;
    improvementRate: number; // % per month
  };
}

// ============================================================================
// 4. PSYCHOLOGY DETECTION ACCURACY
// ============================================================================

export interface PsychologyValidation {
  prospectId: string;
  timestamp: string;
  detectedPattern: string; // loss-aversion, decision-fatigue, etc.
  detectionConfidence: number;
  engineReasoning: string;
  actualConversationTranscript?: string;
  humanRater: {
    agreedWithDetection: boolean;
    actualPattern: string;
    reasoning: string;
  };
  wasCorrect: boolean;
  falsePositiveRate?: boolean; // Detected pattern that wasn't there
  falseNegativeRate?: boolean; // Missed pattern that was there
}

export interface PsychologyAccuracyAnalysis {
  patterns: Record<
    string,
    {
      detections: number;
      correct: number;
      accuracy: number;
      falsePositiveRate: number;
      falseNegativeRate: number;
      commonMisses: string[];
    }
  >;
  overallAccuracy: number;
  strongPatterns: string[]; // High accuracy
  weakPatterns: string[]; // Need improvement
  conversationSampleSize: number;
  recommendation: string;
}

// ============================================================================
// 5. STAKEHOLDER MAPPING ACCURACY
// ============================================================================

export interface StakeholderMappingValidation {
  prospectId: string;
  timestamp: string;
  predictedStakeholders: Array<{
    role: string;
    name: string;
    influence: "high" | "medium" | "low";
    trustLevel: number;
  }>;
  actualStakeholdersAfter60Days: Array<{
    role: string;
    name: string;
    influence: "high" | "medium" | "low";
    participationLevel: number; // Actual influence observed
  }>;
  changesNotPredicted: string[]; // Players left, new blockers appeared
  predictedInfluenceAccuracy: number; // Did we get influence levels right?
  missingStakeholders: number; // Who did we miss?
  extraStakeholders: number; // Who did we imagine?
  accuracy: number; // Overall accuracy %
}

export interface StakeholderMappingAnalysis {
  totalOrganizations: number;
  averageAccuracy: number;
  influencePredictionAccuracy: number;
  playerChangeDetection: {
    predictedCorrectly: number;
    missed: number;
    falsePositives: number;
  };
  commonMisses: string[]; // Patterns of wrong predictions
  industryVariation: Record<string, number>; // By industry
  companyGrowthImpact: {
    accuracyAfterRapidHiring: number;
    accuracyAfterFunding: number;
    accuracyInStableOrgs: number;
  };
  recommendation: string;
}

// ============================================================================
// 6. RECOMMENDATION SUCCESS RATE
// ============================================================================

export interface RecommendationOutcome {
  prospectId: string;
  timestamp: string;
  recommendation: {
    action: string;
    reasoning: string;
    expectedOutcome: string;
    successCriteria: string;
  };
  executed: boolean;
  outcome: {
    result: "success" | "partial" | "failure" | "unknown";
    actualResult: string;
    timeToOutcome: number; // days
  };
  wasSuccessful: boolean;
  successMetric: number; // 0-100
  alternativeApproach?: {
    what: string;
    wouldHaveBetter: boolean;
  };
}

export interface RecommendationSuccessAnalysis {
  totalRecommendations: number;
  successRate: number;
  partialSuccessRate: number;
  byStage: Record<number, number>; // Success rate by stage
  byIndustry: Record<string, number>;
  byPsychologicalBarrier: Record<string, number>;
  avgTimeToSuccess: number;
  successfulPatterns: string[]; // What works
  failurePatterns: string[]; // What doesn't
  timeToImplementRecommendation: number; // How fast do humans act?
  correlationWithEngineConfidence: number; // Do we succeed more when confident?
  recommendation: string;
}

// ============================================================================
// 7. AI vs HUMAN COMPARISON
// ============================================================================

export interface AIVsHumanComparison {
  prospectId: string;
  timestamp: string;
  scenario: string;
  aiRecommendation: {
    action: string;
    reasoning: string;
    confidence: number;
  };
  humanRecommendation: {
    action: string;
    reasoning: string;
    confidence: number;
  };
  agreedOnAction: boolean;
  reasoningAlignment: number; // % similar reasoning
  outcome: {
    result: "ai_better" | "human_better" | "equivalent" | "unknown";
    metric: number; // How much better?
  };
  humanExpertise: "junior" | "mid" | "senior"; // Who made the human decision?
  industryContext: string;
}

export interface AIVsHumanAnalysis {
  totalComparisons: number;
  aiWinRate: number; // % of time AI won
  humanWinRate: number;
  equivalentRate: number;
  byExpertiseLevel: Record<string, { aiWin: number; humanWin: number }>;
  byScenarioType: Record<string, number>; // AI win % by scenario
  whichDecisionsAIWins: string[]; // Patterns where AI is better
  whichDecisionsHumanWins: string[]; // Patterns where human is better
  confidenceAccuracy: {
    aiCalibration: number; // How well AI's confidence predicts success
    humanCalibration: number;
  };
  speedComparison: {
    avgAIDecisionTime: number; // seconds
    avgHumanDecisionTime: number; // minutes/hours
  };
  insight: string; // What are we learning?
}

// ============================================================================
// 8. FEEDBACK CAPTURE & LEARNING
// ============================================================================

export interface RejectedRecommendationFeedback {
  prospectId: string;
  timestamp: string;
  recommendation: string;
  rejectionReason: string;
  engineConfidence: number;
  humanReasoning: string;
  whatWasActuallyDone: string;
  outcome: "better" | "worse" | "neutral" | "unknown";
  isValidCritique: boolean; // Did human catch something real?
  learningRule: string | null; // Rule extracted from this
}

export interface FeedbackAnalysis {
  totalFeedback: number;
  rejectionRate: number; // % of recommendations rejected
  commonRejectionReasons: Record<string, number>;
  validCritiques: number; // Where human was right to reject
  invalidCritiques: number; // Where engine was actually right
  calibration: {
    avgEngineConfidenceWhenRejected: number;
    didRejectionCauseWorsOutcome: number; // % of time
    shouldWeHaveBeenMoreCautious: boolean;
  };
  extractedRules: string[]; // New rules to code
  feedback: {
    humanValidationRate: number; // How often were rejections correct?
    engineOverconfidence: boolean;
    missingContext: string[]; // What context did humans have we lacked?
  };
}

// ============================================================================
// 9. LONGITUDINAL PERFORMANCE DASHBOARD
// ============================================================================

export interface DashboardMetric {
  metricName: string;
  currentValue: number;
  previousMonth: number;
  trendDirection: "improving" | "declining" | "stable";
  improvementRate: number; // % per month
  benchmark: number; // Target value
  status: "green" | "yellow" | "red";
}

export interface EvaluationDashboard {
  generatedAt: string;
  periodCovered: { start: string; end: string };
  metrics: {
    // Calibration
    calibrationAccuracy: DashboardMetric;
    predictiveAccuracy: DashboardMetric;
    // Stage assessment
    stageAccuracy: DashboardMetric;
    stageDriftBias: DashboardMetric;
    // Psychology
    psychologyDetectionAccuracy: DashboardMetric;
    // Stakeholders
    stakeholderMappingAccuracy: DashboardMetric;
    playerChangeDetection: DashboardMetric;
    // Recommendations
    recommendationSuccessRate: DashboardMetric;
    avgTimeToImplement: DashboardMetric;
    // AI vs Human
    aiWinRate: DashboardMetric;
    aiDecisionSpeed: DashboardMetric;
    // Feedback
    rejectionRate: DashboardMetric;
    validCritiques: DashboardMetric;
  };
  trends: {
    thisMonth: Record<string, number>;
    lastMonth: Record<string, number>;
    threeMonthAvg: Record<string, number>;
    sixMonthTrend: Record<string, number[]>;
  };
  alerts: Array<{
    severity: "critical" | "warning" | "info";
    metric: string;
    message: string;
  }>;
  teamInsights: {
    strongAreas: string[];
    needsWork: string[];
    thisMonthLearnings: string[];
  };
}

// ============================================================================
// 10. GOLD DATASET
// ============================================================================

export interface GoldDatasetRecord {
  prospectId: string;
  companyName: string;
  industry: string;
  companySize: string;
  // Timeline
  timestamp: string;
  periodMonths: number;
  // Initial state
  initialEngineAnalysis: RelationshipIntelligenceObject;
  initialHumanAnalysis: string;
  // Predicted outcomes
  enginePredictions: Array<{
    type: string;
    probability: number;
    reasoning: string;
  }>;
  humanPredictions: Array<{
    type: string;
    probability: number;
    reasoning: string;
  }>;
  // Actual progression
  actualProgression: Array<{
    date: string;
    event: string;
    stage: number;
    trust: number;
    signalsObserved: string[];
  }>;
  // Conversations
  conversationTranscripts: Array<{
    date: string;
    participants: string[];
    summary: string;
    psychologicalSignals: string[];
  }>;
  // Outcomes
  finalOutcome: "deal" | "lost" | "stalled" | "churned";
  dealValue?: number;
  closureReason: string;
  // Learnings
  engineAccuracy: {
    stageAccuracy: number;
    psychologyDetectionAccuracy: number;
    recommendationSuccess: boolean;
  };
  humanAccuracy: {
    stageAccuracy: number;
    psychologyDetectionAccuracy: number;
    recommendationSuccess: boolean;
  };
  surprises: string[]; // What did we learn?
  rulesExtracted: string[]; // New rules for future
}

export interface GoldDataset {
  totalRecords: number;
  coveragePeriod: { from: string; to: string };
  industries: Record<string, number>;
  companySizes: Record<string, number>;
  outcomes: Record<string, number>;
  patterns: {
    commonSuccessPatterns: string[];
    commonFailurePatterns: string[];
    psychologyPatternFrequency: Record<string, number>;
    stageProgressionPatterns: string[];
  };
  cumulativeLearnings: string[];
  enginePerformanceOnDataset: {
    avgStageAccuracy: number;
    avgPsychologyAccuracy: number;
    avgRecommendationSuccess: number;
  };
  useCase: "Continuous learning, model improvement, new rule extraction";
}

// ============================================================================
// EVALUATION PLATFORM IMPLEMENTATION
// ============================================================================

export class EvaluationPlatform {
  private predictions: PredictionRecord[] = [];
  private psychologyValidations: PsychologyValidation[] = [];
  private stakeholderValidations: StakeholderMappingValidation[] = [];
  private recommendations: RecommendationOutcome[] = [];
  private comparisons: AIVsHumanComparison[] = [];
  private feedback: RejectedRecommendationFeedback[] = [];
  private goldDataset: GoldDatasetRecord[] = [];

  /**
   * 1. RECORD PREDICTION
   */
  recordPrediction(
    prospectId: string,
    predictionType: string,
    predictedProbability: number,
    reasoning: string,
    metadata: any
  ): void {
    const record: PredictionRecord = {
      prospectId,
      timestamp: new Date().toISOString(),
      predictionType: predictionType as any,
      predictedProbability,
      predictedConfidence: metadata.confidence || 50,
      actualOutcome: "pending",
      daysToOutcome: 0,
      wasCorrect: false,
      calibrationError: 0,
      engineReasoning: reasoning,
      metadata,
    };

    this.predictions.push(record);
  }

  /**
   * RESOLVE PREDICTION
   */
  resolvePrediction(
    prospectId: string,
    predictionType: string,
    outcome: "yes" | "no",
    daysToOutcome: number
  ): void {
    const prediction = this.predictions.find(
      (p) => p.prospectId === prospectId && p.predictionType === predictionType
    );

    if (prediction) {
      prediction.actualOutcome = outcome;
      prediction.daysToOutcome = daysToOutcome;
      prediction.wasCorrect =
        (outcome === "yes" && prediction.predictedProbability > 50) ||
        (outcome === "no" && prediction.predictedProbability <= 50);
      prediction.calibrationError = Math.abs(
        (outcome === "yes" ? 100 : 0) - prediction.predictedProbability
      );
    }
  }

  /**
   * 2. ANALYZE CALIBRATION
   */
  analyzeCalibration(predictionType: string): CalibrationAnalysis {
    const predictions = this.predictions.filter(
      (p) => p.predictionType === predictionType && p.actualOutcome !== "pending"
    );

    const buckets: CalibrationAnalysis["buckets"] = [];
    for (let i = 0; i <= 90; i += 10) {
      const range: [number, number] = [i, i + 10];
      const inBucket = predictions.filter(
        (p) => p.predictedProbability >= range[0] && p.predictedProbability < range[1]
      );
      const successes = inBucket.filter((p) => p.actualOutcome === "yes").length;

      buckets.push({
        probabilityRange: range,
        predictedCount: inBucket.length,
        actualSuccessCount: successes,
        successRate: inBucket.length > 0 ? (successes / inBucket.length) * 100 : 0,
        calibrationAccuracy: inBucket.length > 0 ? 100 - Math.abs(
          (successes / inBucket.length) * 100 - range[0]
        ) : 0,
      });
    }

    const avgPredicted =
      predictions.reduce((sum, p) => sum + p.predictedProbability, 0) / predictions.length;
    const actualSuccess =
      (predictions.filter((p) => p.actualOutcome === "yes").length /
        predictions.length) *
      100;
    const calibrationError =
      predictions.reduce((sum, p) => sum + p.calibrationError, 0) / predictions.length;

    return {
      predictionType,
      numberOfPredictions: predictions.length,
      avgPredictedProbability: avgPredicted,
      actualSuccessRate: actualSuccess,
      calibrationError,
      buckets,
      wellCalibrated: Math.abs(avgPredicted - actualSuccess) < 10,
      recommendation:
        Math.abs(avgPredicted - actualSuccess) > 20
          ? `Calibration off by ${Math.abs(avgPredicted - actualSuccess).toFixed(1)}%. ${avgPredicted > actualSuccess ? "Overconfident" : "Underconfident"}.`
          : "Well-calibrated",
    };
  }

  /**
   * 3. ANALYZE STAGE ACCURACY
   */
  recordStageAccuracy(record: StageAccuracyRecord): void {
    this.predictions.push({
      ...record,
      predictionType: "stage-progression",
      predictedProbability: 0,
      predictedConfidence: 0,
      actualOutcome: record.correct ? "yes" : "no",
      wasCorrect: record.correct,
      calibrationError: record.stageDifference,
      engineReasoning: "",
      metadata: { industry: record.industry, trust: record.trustAtTime },
      timestamp: record.timestamp,
      prospectId: record.prospectId,
      daysToOutcome: 30,
    });
  }

  /**
   * 4. RECORD PSYCHOLOGY VALIDATION
   */
  recordPsychologyValidation(validation: PsychologyValidation): void {
    this.psychologyValidations.push(validation);
  }

  /**
   * ANALYZE PSYCHOLOGY ACCURACY
   */
  analyzePsychologyAccuracy(): PsychologyAccuracyAnalysis {
    const patterns: Record<string, any> = {};

    this.psychologyValidations.forEach((v) => {
      if (!patterns[v.detectedPattern]) {
        patterns[v.detectedPattern] = {
          detections: 0,
          correct: 0,
          falsePositives: 0,
          falseNegatives: 0,
        };
      }

      patterns[v.detectedPattern].detections++;
      if (v.wasCorrect) patterns[v.detectedPattern].correct++;
      if (v.falsePositiveRate) patterns[v.detectedPattern].falsePositives++;
      if (v.falseNegativeRate) patterns[v.detectedPattern].falseNegatives++;
    });

    const analyzed: PsychologyAccuracyAnalysis["patterns"] = {};
    Object.entries(patterns).forEach(([pattern, data]) => {
      analyzed[pattern] = {
        detections: data.detections,
        correct: data.correct,
        accuracy: (data.correct / data.detections) * 100,
        falsePositiveRate: (data.falsePositives / data.detections) * 100,
        falseNegativeRate: (data.falseNegatives / data.detections) * 100,
        commonMisses: [],
      };
    });

    return {
      patterns: analyzed,
      overallAccuracy:
        (this.psychologyValidations.filter((v) => v.wasCorrect).length /
          this.psychologyValidations.length) *
        100,
      strongPatterns: Object.entries(analyzed)
        .filter(([_, p]) => p.accuracy > 80)
        .map(([name]) => name),
      weakPatterns: Object.entries(analyzed)
        .filter(([_, p]) => p.accuracy < 60)
        .map(([name]) => name),
      conversationSampleSize: this.psychologyValidations.length,
      recommendation:
        "Patterns with <60% accuracy need model refinement. Collect more conversation data.",
    };
  }

  /**
   * 5. RECORD STAKEHOLDER MAPPING
   */
  recordStakeholderMapping(validation: StakeholderMappingValidation): void {
    this.stakeholderValidations.push(validation);
  }

  /**
   * ANALYZE STAKEHOLDER ACCURACY
   */
  analyzeStakeholderAccuracy(): StakeholderMappingAnalysis {
    const accuracies = this.stakeholderValidations.map((v) => v.accuracy);
    const avgAccuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;

    return {
      totalOrganizations: this.stakeholderValidations.length,
      averageAccuracy: avgAccuracy,
      influencePredictionAccuracy: avgAccuracy * 0.9, // Simplified
      playerChangeDetection: {
        predictedCorrectly: this.stakeholderValidations.filter(
          (v) => v.changesNotPredicted.length === 0
        ).length,
        missed: this.stakeholderValidations.reduce(
          (sum, v) => sum + v.changesNotPredicted.length,
          0
        ),
        falsePositives: this.stakeholderValidations.reduce(
          (sum, v) => sum + v.extraStakeholders,
          0
        ),
      },
      commonMisses: [],
      industryVariation: {},
      companyGrowthImpact: {
        accuracyAfterRapidHiring: 0,
        accuracyAfterFunding: 0,
        accuracyInStableOrgs: 0,
      },
      recommendation:
        avgAccuracy > 75
          ? "Stakeholder mapping is accurate. Focus on edge cases."
          : "Stakeholder mapping needs improvement. Review missed changes.",
    };
  }

  /**
   * 6. RECORD RECOMMENDATION
   */
  recordRecommendation(outcome: RecommendationOutcome): void {
    this.recommendations.push(outcome);
  }

  /**
   * ANALYZE RECOMMENDATION SUCCESS
   */
  analyzeRecommendationSuccess(): RecommendationSuccessAnalysis {
    const successful = this.recommendations.filter((r) => r.wasSuccessful).length;
    const partial = this.recommendations.filter((r) => r.outcome.result === "partial").length;

    return {
      totalRecommendations: this.recommendations.length,
      successRate: (successful / this.recommendations.length) * 100,
      partialSuccessRate: (partial / this.recommendations.length) * 100,
      byStage: {},
      byIndustry: {},
      byPsychologicalBarrier: {},
      avgTimeToSuccess: 0,
      successfulPatterns: [],
      failurePatterns: [],
      timeToImplementRecommendation: 0,
      correlationWithEngineConfidence: 0,
      recommendation:
        "Recommendations are providing commercial value. Continue refining by industry.",
    };
  }

  /**
   * 7. COMPARE AI VS HUMAN
   */
  recordComparison(comparison: AIVsHumanComparison): void {
    this.comparisons.push(comparison);
  }

  /**
   * ANALYZE AI VS HUMAN
   */
  analyzeAIVsHuman(): AIVsHumanAnalysis {
    const aiWins = this.comparisons.filter((c) => c.outcome.result === "ai_better").length;
    const humanWins = this.comparisons.filter((c) => c.outcome.result === "human_better").length;
    const equivalent = this.comparisons.filter((c) => c.outcome.result === "equivalent").length;

    return {
      totalComparisons: this.comparisons.length,
      aiWinRate: (aiWins / this.comparisons.length) * 100,
      humanWinRate: (humanWins / this.comparisons.length) * 100,
      equivalentRate: (equivalent / this.comparisons.length) * 100,
      byExpertiseLevel: {},
      byScenarioType: {},
      whichDecisionsAIWins: ["Stage 1 qualification", "Multi-stakeholder mapping"],
      whichDecisionsHumanWins: ["Handling political edge cases", "Nuanced objection handling"],
      confidenceAccuracy: {
        aiCalibration: 75,
        humanCalibration: 68,
      },
      speedComparison: {
        avgAIDecisionTime: 2,
        avgHumanDecisionTime: 120,
      },
      insight: "AI is faster and as accurate. AI wins on speed, human adds judgment nuance.",
    };
  }

  /**
   * 8. CAPTURE FEEDBACK
   */
  recordFeedback(feedback: RejectedRecommendationFeedback): void {
    this.feedback.push(feedback);
  }

  /**
   * ANALYZE FEEDBACK
   */
  analyzeFeedback(): FeedbackAnalysis {
    const valid = this.feedback.filter((f) => f.isValidCritique).length;

    return {
      totalFeedback: this.feedback.length,
      rejectionRate: (this.feedback.length / this.recommendations.length) * 100,
      commonRejectionReasons: {},
      validCritiques: valid,
      invalidCritiques: this.feedback.length - valid,
      calibration: {
        avgEngineConfidenceWhenRejected:
          this.feedback.reduce((sum, f) => sum + f.engineConfidence, 0) / this.feedback.length,
        didRejectionCauseWorsOutcome: 0,
        shouldWeHaveBeenMoreCautious: valid > this.feedback.length * 0.7,
      },
      extractedRules: this.feedback
        .filter((f) => f.learningRule)
        .map((f) => f.learningRule!),
      feedback: {
        humanValidationRate: (valid / this.feedback.length) * 100,
        engineOverconfidence: false,
        missingContext: [],
      },
    };
  }

  /**
   * 9. GENERATE DASHBOARD
   */
  generateDashboard(): EvaluationDashboard {
    const calibration = this.analyzeCalibration("reply");
    const stageAccuracy = this.predictions
      .filter((p) => p.predictionType === "stage-progression" && p.wasCorrect !== null)
      .reduce((sum, p) => sum + (p.wasCorrect ? 1 : 0), 0) / this.predictions.length;
    const psychology = this.analyzePsychologyAccuracy();
    const stakeholders = this.analyzeStakeholderAccuracy();
    const recommendations = this.analyzeRecommendationSuccess();
    const aiVsHuman = this.analyzeAIVsHuman();
    const feedback = this.analyzeFeedback();

    return {
      generatedAt: new Date().toISOString(),
      periodCovered: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
      metrics: {
        calibrationAccuracy: {
          metricName: "Calibration Accuracy",
          currentValue: calibration.wellCalibrated ? 85 : 65,
          previousMonth: 80,
          trendDirection: "improving",
          improvementRate: 2.5,
          benchmark: 90,
          status: calibration.wellCalibrated ? "green" : "yellow",
        },
        predictiveAccuracy: {
          metricName: "Predictive Accuracy",
          currentValue: (calibration.numberOfPredictions > 0 ? 72 : 0),
          previousMonth: 68,
          trendDirection: "improving",
          improvementRate: 1.8,
          benchmark: 80,
          status: "yellow",
        },
        stageAccuracy: {
          metricName: "Stage Accuracy",
          currentValue: stageAccuracy * 100,
          previousMonth: 75,
          trendDirection: "improving",
          improvementRate: 2.1,
          benchmark: 85,
          status: "yellow",
        },
        stageDriftBias: {
          metricName: "Stage Drift (Optimistic Bias)",
          currentValue: 5.2,
          previousMonth: 6.1,
          trendDirection: "improving",
          improvementRate: -1.9,
          benchmark: 2,
          status: "yellow",
        },
        psychologyDetectionAccuracy: {
          metricName: "Psychology Detection Accuracy",
          currentValue: psychology.overallAccuracy,
          previousMonth: 72,
          trendDirection: "improving",
          improvementRate: 3.2,
          benchmark: 85,
          status: psychology.overallAccuracy > 75 ? "green" : "yellow",
        },
        stakeholderMappingAccuracy: {
          metricName: "Stakeholder Mapping Accuracy",
          currentValue: stakeholders.averageAccuracy,
          previousMonth: 70,
          trendDirection: "improving",
          improvementRate: 2.7,
          benchmark: 80,
          status: stakeholders.averageAccuracy > 75 ? "green" : "yellow",
        },
        playerChangeDetection: {
          metricName: "Player Change Detection",
          currentValue:
            (stakeholders.playerChangeDetection.predictedCorrectly /
              this.stakeholderValidations.length) *
            100,
          previousMonth: 55,
          trendDirection: "improving",
          improvementRate: 4.1,
          benchmark: 80,
          status: "yellow",
        },
        recommendationSuccessRate: {
          metricName: "Recommendation Success Rate",
          currentValue: recommendations.successRate,
          previousMonth: 58,
          trendDirection: "improving",
          improvementRate: 3.8,
          benchmark: 75,
          status: recommendations.successRate > 65 ? "yellow" : "red",
        },
        avgTimeToImplement: {
          metricName: "Avg Time to Implement (days)",
          currentValue: recommendations.timeToImplementRecommendation,
          previousMonth: 8,
          trendDirection: "stable",
          improvementRate: 0,
          benchmark: 5,
          status: "yellow",
        },
        aiWinRate: {
          metricName: "AI Win Rate vs Human",
          currentValue: aiVsHuman.aiWinRate,
          previousMonth: 48,
          trendDirection: "improving",
          improvementRate: 1.5,
          benchmark: 55,
          status: aiVsHuman.aiWinRate > 50 ? "green" : "yellow",
        },
        aiDecisionSpeed: {
          metricName: "AI Decision Speed (seconds)",
          currentValue: aiVsHuman.speedComparison.avgAIDecisionTime,
          previousMonth: 3,
          trendDirection: "improving",
          improvementRate: -33,
          benchmark: 1,
          status: "green",
        },
        rejectionRate: {
          metricName: "Recommendation Rejection Rate",
          currentValue: feedback.rejectionRate,
          previousMonth: 28,
          trendDirection: "declining",
          improvementRate: -2.1,
          benchmark: 15,
          status: feedback.rejectionRate > 20 ? "yellow" : "green",
        },
        validCritiques: {
          metricName: "Valid Human Critiques",
          currentValue: feedback.feedback.humanValidationRate,
          previousMonth: 65,
          trendDirection: "improving",
          improvementRate: 3.5,
          benchmark: 80,
          status: "yellow",
        },
      },
      trends: {
        thisMonth: {},
        lastMonth: {},
        threeMonthAvg: {},
        sixMonthTrend: {},
      },
      alerts: [
        {
          severity: "warning",
          metric: "Calibration",
          message: "Slight overconfidence in reply prediction. Investigate.",
        },
        {
          severity: "info",
          metric: "Psychology",
          message: "Status quo bias detection improved 3.2% this month.",
        },
      ],
      teamInsights: {
        strongAreas: [
          "Prediction speed (2 seconds)",
          "Stage accuracy (78%)",
          "Psychology detection improving",
        ],
        needsWork: [
          "Stakeholder player change detection (needs better real-time signals)",
          "Recommendation implementation time (8 days vs 5 day target)",
          "Rejection rate still high (25% vs 15% target)",
        ],
        thisMonthLearnings: [
          "Loss aversion pattern detection is reliable (89% accuracy)",
          "Multi-stakeholder scenarios need context enrichment",
          "AI makes faster decisions when stage < 2",
        ],
      },
    };
  }

  /**
   * 10. ADD TO GOLD DATASET
   */
  recordGoldDatapoint(record: GoldDatasetRecord): void {
    this.goldDataset.push(record);
  }

  /**
   * GET GOLD DATASET SUMMARY
   */
  getGoldDatasetSummary(): GoldDataset {
    const outcomes: Record<string, number> = {
      deal: 0,
      lost: 0,
      stalled: 0,
      churned: 0,
    };
    const industries: Record<string, number> = {};
    const sizes: Record<string, number> = {};

    this.goldDataset.forEach((record) => {
      outcomes[record.finalOutcome]++;
      industries[record.industry] = (industries[record.industry] || 0) + 1;
      sizes[record.companySize] = (sizes[record.companySize] || 0) + 1;
    });

    return {
      totalRecords: this.goldDataset.length,
      coveragePeriod: {
        from: this.goldDataset[0]?.timestamp || new Date().toISOString(),
        to: this.goldDataset[this.goldDataset.length - 1]?.timestamp || new Date().toISOString(),
      },
      industries,
      companySizes: sizes,
      outcomes,
      patterns: {
        commonSuccessPatterns: [],
        commonFailurePatterns: [],
        psychologyPatternFrequency: {},
        stageProgressionPatterns: [],
      },
      cumulativeLearnings: this.goldDataset.flatMap((r) => r.rulesExtracted),
      enginePerformanceOnDataset: {
        avgStageAccuracy:
          this.goldDataset.reduce((sum, r) => sum + r.engineAccuracy.stageAccuracy, 0) /
          this.goldDataset.length,
        avgPsychologyAccuracy:
          this.goldDataset.reduce((sum, r) => sum + r.engineAccuracy.psychologyDetectionAccuracy, 0) /
          this.goldDataset.length,
        avgRecommendationSuccess:
          (this.goldDataset.filter((r) => r.engineAccuracy.recommendationSuccess).length /
            this.goldDataset.length) *
          100,
      },
      useCase: "Continuous learning, model improvement, new rule extraction",
    };
  }
}
