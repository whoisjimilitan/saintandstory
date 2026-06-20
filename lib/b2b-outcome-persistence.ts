/**
 * OUTCOME PERSISTENCE LAYER
 *
 * Replaces console.log with actual persistent storage
 * Records every outcome signal for learning and feedback
 *
 * In production: Writes to database (Postgres)
 * In development: Writes to JSON file + memory
 */

import * as fs from 'fs';
import * as path from 'path';

export interface OutcomeSignal {
  prospect_id: string;
  pressure_type_detected: string;
  predicted_confidence: number;
  predicted_burden: string;
  email_subject: string;
  email_body: string;

  // Outcome signals (captured post-send)
  email_delivered: boolean;
  email_opened: boolean;
  email_replied: boolean;
  reply_content?: string;

  // Operator/prospect feedback
  recognition_accurate?: 'yes' | 'partially' | 'no';
  burden_accurate?: 'yes' | 'partially' | 'no';
  pressure_type_correct?: 'yes' | 'partially' | 'no';
  operator_notes?: string;

  // Outcome
  conversion_to_call: boolean;
  conversion_to_customer: boolean;

  timestamp: string;
}

const OUTCOMES_FILE = path.join(process.cwd(), 'data', 'outcomes.jsonl');
let outcomesBuffer: OutcomeSignal[] = [];

/**
 * Initialize persistence
 */
export function initializePersistence(): void {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Load existing outcomes into buffer
  if (fs.existsSync(OUTCOMES_FILE)) {
    const content = fs.readFileSync(OUTCOMES_FILE, 'utf-8');
    const lines = content.split('\n').filter((line) => line.trim());
    outcomesBuffer = lines.map((line) => JSON.parse(line));
  }
}

/**
 * Record outcome signal persistently
 */
export function recordOutcomeSignal(signal: OutcomeSignal): void {
  // Add to buffer
  outcomesBuffer.push(signal);

  // Persist to file immediately
  fs.appendFileSync(OUTCOMES_FILE, JSON.stringify(signal) + '\n', 'utf-8');

  console.log(`[PERSISTENCE] Recorded outcome for ${signal.prospect_id}`);
}

/**
 * Query all recorded outcomes
 */
export function queryAllOutcomes(): OutcomeSignal[] {
  return [...outcomesBuffer];
}

/**
 * Query outcomes for specific pressure type
 */
export function queryOutcomesByPressureType(pressure_type: string): OutcomeSignal[] {
  return outcomesBuffer.filter((o) => o.pressure_type_detected === pressure_type);
}

/**
 * Calculate recognition accuracy
 */
export function calculateRecognitionAccuracy(): {
  overall_rate: number;
  by_pressure_type: Record<string, { correct: number; total: number; rate: number }>;
  by_confidence_level: Record<string, { correct: number; total: number; rate: number }>;
} {
  const byType: Record<string, { correct: number; total: number }> = {};
  const byConfidence: Record<string, { correct: number; total: number }> = {};

  let total_correct = 0;
  let total_signals = 0;

  outcomesBuffer.forEach((signal) => {
    if (!signal.recognition_accurate) return;

    total_signals++;
    const is_correct = signal.recognition_accurate === 'yes';
    if (is_correct) total_correct++;

    // By pressure type
    if (!byType[signal.pressure_type_detected]) {
      byType[signal.pressure_type_detected] = { correct: 0, total: 0 };
    }
    byType[signal.pressure_type_detected].total++;
    if (is_correct) byType[signal.pressure_type_detected].correct++;

    // By confidence
    const confidence_bucket =
      signal.predicted_confidence >= 0.8
        ? '80-100%'
        : signal.predicted_confidence >= 0.6
          ? '60-80%'
          : '< 60%';

    if (!byConfidence[confidence_bucket]) {
      byConfidence[confidence_bucket] = { correct: 0, total: 0 };
    }
    byConfidence[confidence_bucket].total++;
    if (is_correct) byConfidence[confidence_bucket].correct++;
  });

  // Convert to rates
  const typeRates: Record<string, { correct: number; total: number; rate: number }> = {};
  Object.entries(byType).forEach(([type, counts]) => {
    typeRates[type] = { ...counts, rate: counts.total > 0 ? counts.correct / counts.total : 0 };
  });

  const confRates: Record<string, { correct: number; total: number; rate: number }> = {};
  Object.entries(byConfidence).forEach(([level, counts]) => {
    confRates[level] = { ...counts, rate: counts.total > 0 ? counts.correct / counts.total : 0 };
  });

  return {
    overall_rate: total_signals > 0 ? total_correct / total_signals : 0,
    by_pressure_type: typeRates,
    by_confidence_level: confRates,
  };
}

/**
 * Get pressure types with poor recognition accuracy
 */
export function getPoorPerformingTypes(): Array<{
  pressure_type: string;
  accuracy: number;
  sample_size: number;
}> {
  const accuracy = calculateRecognitionAccuracy();
  const results: Array<{ pressure_type: string; accuracy: number; sample_size: number }> = [];

  Object.entries(accuracy.by_pressure_type).forEach(([type, data]) => {
    if (data.total >= 5 && data.rate < 0.65) {
      results.push({
        pressure_type: type,
        accuracy: data.rate,
        sample_size: data.total,
      });
    }
  });

  return results.sort((a, b) => a.accuracy - b.accuracy);
}
