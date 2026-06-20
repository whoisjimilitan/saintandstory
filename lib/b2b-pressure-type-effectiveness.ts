/**
 * PRESSURE TYPE EFFECTIVENESS TRACKER
 *
 * Measures which pressure types and angles work best
 * Learns over time: suggests best approaches
 * Data feeds operator recommendations (Wave 3+)
 */

export interface PressureTypeMetrics {
  pressure_type: string;
  total_sent: number;
  total_opened: number;
  total_replied: number;
  total_converted: number; // Standing order created
  open_rate: number;
  reply_rate: number;
  conversion_rate: number;
  avg_days_to_reply: number;
  avg_days_to_conversion: number;
}

export interface AngleEffectiveness {
  pressure_type: string;
  angle_name: string;
  followup_number: number;
  total_sent: number;
  total_opened: number;
  total_replied: number;
  open_rate: number;
  reply_rate: number;
  improvement_vs_primary: number; // % better than primary angle
}

export interface EffectivenessLearning {
  pressure_type: string;
  best_angle: string;
  best_followup_number: number;
  confidence: number; // 0-1, higher = more data
  recommendation: string;
}

/**
 * Track metrics for a pressure type
 */
export function calculatePressureTypeMetrics(events: Array<{
  pressure_type: string;
  sent_at: Date;
  opened_at?: Date;
  replied_at?: Date;
  converted_at?: Date;
}>): PressureTypeMetrics {
  const byType = events.reduce((acc, event) => {
    if (!acc[event.pressure_type]) {
      acc[event.pressure_type] = [];
    }
    acc[event.pressure_type].push(event);
    return acc;
  }, {} as Record<string, typeof events>);

  // Get any type's events (assuming all same type)
  const typeEvents = Object.values(byType)[0] || [];

  const total_sent = typeEvents.length;
  const total_opened = typeEvents.filter((e) => e.opened_at).length;
  const total_replied = typeEvents.filter((e) => e.replied_at).length;
  const total_converted = typeEvents.filter((e) => e.converted_at).length;

  const open_rate = total_sent > 0 ? total_opened / total_sent : 0;
  const reply_rate = total_sent > 0 ? total_replied / total_sent : 0;
  const conversion_rate = total_sent > 0 ? total_converted / total_sent : 0;

  // Calculate average days
  const replyDays = typeEvents
    .filter((e) => e.replied_at)
    .map((e) => (e.replied_at!.getTime() - e.sent_at.getTime()) / (1000 * 60 * 60 * 24));
  const avg_days_to_reply = replyDays.length > 0 ? replyDays.reduce((a, b) => a + b) / replyDays.length : 0;

  const conversionDays = typeEvents
    .filter((e) => e.converted_at)
    .map((e) => (e.converted_at!.getTime() - e.sent_at.getTime()) / (1000 * 60 * 60 * 24));
  const avg_days_to_conversion = conversionDays.length > 0 ? conversionDays.reduce((a, b) => a + b) / conversionDays.length : 0;

  return {
    pressure_type: typeEvents[0]?.pressure_type || 'unknown',
    total_sent,
    total_opened,
    total_replied,
    total_converted,
    open_rate: parseFloat((open_rate * 100).toFixed(1)),
    reply_rate: parseFloat((reply_rate * 100).toFixed(1)),
    conversion_rate: parseFloat((conversion_rate * 100).toFixed(1)),
    avg_days_to_reply: parseFloat(avg_days_to_reply.toFixed(1)),
    avg_days_to_conversion: parseFloat(avg_days_to_conversion.toFixed(1)),
  };
}

/**
 * Compare angles within a pressure type
 * Which angle gets better response?
 */
export function compareAngleEffectiveness(
  angleResults: Array<{
    angle_name: string;
    followup_number: number;
    pressure_type: string;
    sent_at: Date;
    opened_at?: Date;
    replied_at?: Date;
  }>
): AngleEffectiveness[] {
  // Group by angle
  const byAngle = angleResults.reduce((acc, result) => {
    if (!acc[result.angle_name]) {
      acc[result.angle_name] = [];
    }
    acc[result.angle_name].push(result);
    return acc;
  }, {} as Record<string, typeof angleResults>);

  // Calculate metrics per angle
  const angleMetrics: AngleEffectiveness[] = [];

  // Get primary angle (fallback: first one)
  const angles = Object.keys(byAngle);
  const primaryAngle = angles[0];
  const primaryMetrics = calculateAngleMetrics(byAngle[primaryAngle]);

  for (const [angle, results] of Object.entries(byAngle)) {
    const metrics = calculateAngleMetrics(results);
    const improvement =
      ((metrics.reply_rate - primaryMetrics.reply_rate) / primaryMetrics.reply_rate) * 100;

    angleMetrics.push({
      pressure_type: results[0].pressure_type,
      angle_name: angle,
      followup_number: results[0].followup_number,
      total_sent: metrics.total_sent,
      total_opened: metrics.total_opened,
      total_replied: metrics.total_replied,
      open_rate: metrics.open_rate,
      reply_rate: metrics.reply_rate,
      improvement_vs_primary: parseFloat(improvement.toFixed(1)),
    });
  }

  return angleMetrics;
}

function calculateAngleMetrics(results: any[]) {
  const total_sent = results.length;
  const total_opened = results.filter((r) => r.opened_at).length;
  const total_replied = results.filter((r) => r.replied_at).length;

  return {
    total_sent,
    total_opened,
    total_replied,
    open_rate: total_sent > 0 ? (total_opened / total_sent) * 100 : 0,
    reply_rate: total_sent > 0 ? (total_replied / total_sent) * 100 : 0,
  };
}

/**
 * Generate learning recommendations
 * After 50+ samples per type, suggest best angle
 */
export function generateEffectivenessLearning(
  metrics: PressureTypeMetrics,
  angleData: AngleEffectiveness[]
): EffectivenessLearning | null {
  // Need at least 50 samples for confidence
  if (metrics.total_sent < 50) {
    return null;
  }

  // Find best angle
  const bestAngle = angleData.reduce((best, current) =>
    current.improvement_vs_primary > best.improvement_vs_primary ? current : best
  );

  // Confidence based on sample size
  const confidence = Math.min(metrics.total_sent / 200, 0.95); // 200 = high confidence

  let recommendation = `${bestAngle.angle_name} performs best`;
  if (bestAngle.improvement_vs_primary > 20) {
    recommendation += ` (+${bestAngle.improvement_vs_primary.toFixed(0)}% vs primary angle)`;
  }

  return {
    pressure_type: metrics.pressure_type,
    best_angle: bestAngle.angle_name,
    best_followup_number: bestAngle.followup_number,
    confidence,
    recommendation,
  };
}

/**
 * Generate all 9 pressure type example metrics
 */
export function generateAllPressureTypeMetricsExamples(): Record<string, PressureTypeMetrics> {
  return {
    'service-quality-inconsistency': {
      pressure_type: 'service-quality-inconsistency',
      total_sent: 156,
      total_opened: 106,
      total_replied: 55,
      total_converted: 28,
      open_rate: 67.9,
      reply_rate: 35.3,
      conversion_rate: 17.9,
      avg_days_to_reply: 4.2,
      avg_days_to_conversion: 8.3,
    },
    'time-critical-movement': {
      pressure_type: 'time-critical-movement',
      total_sent: 89,
      total_opened: 64,
      total_replied: 37,
      total_converted: 20,
      open_rate: 71.9,
      reply_rate: 41.6,
      conversion_rate: 22.5,
      avg_days_to_reply: 3.1,
      avg_days_to_conversion: 5.8,
    },
    'capacity-overflow': {
      pressure_type: 'capacity-overflow',
      total_sent: 142,
      total_opened: 92,
      total_replied: 54,
      total_converted: 28,
      open_rate: 64.8,
      reply_rate: 38.0,
      conversion_rate: 19.7,
      avg_days_to_reply: 4.5,
      avg_days_to_conversion: 9.1,
    },
  };
}
