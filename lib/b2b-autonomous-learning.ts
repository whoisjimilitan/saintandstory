/**
 * AUTONOMOUS LEARNING SYSTEM
 * Tracks performance, identifies best angles, optimizes future sends
 */

export interface AnglePerformance {
  angle: string;
  pressure_type: string;
  emails_sent: number;
  emails_opened: number;
  emails_replied: number;
  open_rate: number;
  reply_rate: number;
  conversion_rate: number;
  rank: number;
}

export interface PressureTypePerformance {
  pressure_type: string;
  total_sent: number;
  avg_open_rate: number;
  avg_reply_rate: number;
  avg_conversion_rate: number;
  best_angle: string;
  angles: AnglePerformance[];
}

/**
 * Track angle performance
 */
export function trackAnglePerformance(): AnglePerformance[] {
  // Mock learning data from 3 days of sends
  return [
    {
      angle: 'Operational Independence',
      pressure_type: 'service-quality-inconsistency',
      emails_sent: 47,
      emails_opened: 32,
      emails_replied: 13,
      open_rate: 0.681,
      reply_rate: 0.406,
      conversion_rate: 0.276,
      rank: 1,
    },
    {
      angle: 'Quality Consistency',
      pressure_type: 'service-quality-inconsistency',
      emails_sent: 42,
      emails_opened: 28,
      emails_replied: 9,
      open_rate: 0.667,
      reply_rate: 0.321,
      conversion_rate: 0.214,
      rank: 2,
    },
    {
      angle: 'Timeline Feasibility',
      pressure_type: 'time-critical-movement',
      emails_sent: 38,
      emails_opened: 29,
      emails_replied: 13,
      open_rate: 0.763,
      reply_rate: 0.448,
      conversion_rate: 0.342,
      rank: 1,
    },
    {
      angle: 'Process Automation',
      pressure_type: 'capacity-overflow',
      emails_sent: 35,
      emails_opened: 22,
      emails_replied: 8,
      open_rate: 0.629,
      reply_rate: 0.364,
      conversion_rate: 0.229,
      rank: 1,
    },
  ];
}

/**
 * Calculate pressure type performance
 */
export function calculatePressureTypePerformance(): PressureTypePerformance[] {
  const angles = trackAnglePerformance();

  const byType: Record<string, AnglePerformance[]> = {};
  angles.forEach((a) => {
    if (!byType[a.pressure_type]) byType[a.pressure_type] = [];
    byType[a.pressure_type].push(a);
  });

  return Object.entries(byType).map(([type, typeAngles]) => {
    const totalSent = typeAngles.reduce((sum, a) => sum + a.emails_sent, 0);
    const totalOpened = typeAngles.reduce((sum, a) => sum + a.emails_opened, 0);
    const totalReplied = typeAngles.reduce((sum, a) => sum + a.emails_replied, 0);

    return {
      pressure_type: type,
      total_sent: totalSent,
      avg_open_rate: totalSent > 0 ? totalOpened / totalSent : 0,
      avg_reply_rate: totalSent > 0 ? totalReplied / totalSent : 0,
      avg_conversion_rate: typeAngles.reduce((sum, a) => sum + a.conversion_rate, 0) / typeAngles.length,
      best_angle: typeAngles.sort((a, b) => b.reply_rate - a.reply_rate)[0].angle,
      angles: typeAngles,
    };
  });
}

/**
 * Generate optimization recommendations
 */
export function generateOptimizations(): string[] {
  const recommendations: string[] = [];
  const performance = calculatePressureTypePerformance();

  performance.forEach((p) => {
    // Find best angle
    const best = p.angles.sort((a, b) => b.reply_rate - a.reply_rate)[0];
    recommendations.push(
      `Use "${best.angle}" for ${p.pressure_type} (${(best.reply_rate * 100).toFixed(0)}% reply rate)`
    );

    // Find opportunity (underperforming angle)
    const worst = p.angles.sort((a, b) => b.reply_rate - a.reply_rate).pop();
    if (worst && worst.reply_rate < best.reply_rate * 0.8) {
      recommendations.push(
        `Deprioritize "${worst.angle}" for ${p.pressure_type} (only ${(worst.reply_rate * 100).toFixed(0)}% reply rate)`
      );
    }
  });

  // Overall insights
  const bestType = performance.sort((a, b) => b.avg_conversion_rate - a.avg_conversion_rate)[0];
  recommendations.push(
    `Focus on ${bestType.pressure_type} (${(bestType.avg_conversion_rate * 100).toFixed(1)}% conversion)`
  );

  return recommendations;
}

/**
 * Autonomous learning process
 */
export function runAutonomousLearning(): {
  performance_by_type: PressureTypePerformance[];
  top_angles: AnglePerformance[];
  recommendations: string[];
  avg_open_rate: number;
  avg_reply_rate: number;
  avg_conversion_rate: number;
} {
  console.log(`[Learning] Analyzing performance data...`);

  const performance = calculatePressureTypePerformance();
  const angles = trackAnglePerformance();
  const recommendations = generateOptimizations();

  const totalSent = angles.reduce((sum, a) => sum + a.emails_sent, 0);
  const totalOpened = angles.reduce((sum, a) => sum + a.emails_opened, 0);
  const totalReplied = angles.reduce((sum, a) => sum + a.emails_replied, 0);

  const avgOpen = totalSent > 0 ? totalOpened / totalSent : 0;
  const avgReply = totalSent > 0 ? totalReplied / totalSent : 0;
  const avgConversion = angles.reduce((sum, a) => sum + a.conversion_rate, 0) / angles.length;

  console.log(`[Learning] Average open rate: ${(avgOpen * 100).toFixed(1)}%`);
  console.log(`[Learning] Average reply rate: ${(avgReply * 100).toFixed(1)}%`);
  console.log(`[Learning] Average conversion rate: ${(avgConversion * 100).toFixed(1)}%`);
  console.log(`[Learning] Generated ${recommendations.length} optimizations`);

  return {
    performance_by_type: performance,
    top_angles: angles.sort((a, b) => b.reply_rate - a.reply_rate).slice(0, 3),
    recommendations,
    avg_open_rate: avgOpen,
    avg_reply_rate: avgReply,
    avg_conversion_rate: avgConversion,
  };
}
