/**
 * AUTONOMOUS ORCHESTRATOR
 * Runs complete end-to-end pipeline
 * Discovery → Psychology → Validation → Sending → Monitoring → Learning
 */

import { runAutonomousDiscovery } from './b2b-autonomous-discovery';
import { runAutonomousPsychologyGeneration } from './b2b-autonomous-psychology';
import { runAutonomousValidation } from './b2b-autonomous-validation';
import { runAutonomousSending } from './b2b-autonomous-sending';
import { runAutonomousMonitoring } from './b2b-autonomous-monitoring';
import { runAutonomousLearning } from './b2b-autonomous-learning';

export interface AutonomousPipelineRun {
  timestamp: string;
  discovery: {
    discovered: number;
    enriched: number;
    deduplicated: number;
    queued: number;
  };
  psychology: {
    generated: number;
  };
  validation: {
    validated: number;
    ready_to_send: number;
    held_for_review: number;
    avg_confidence: number;
  };
  sending: {
    sent: number;
    failed: number;
    avg_confidence: number;
  };
  monitoring: {
    total_monitored: number;
    gate_1: number;
    gate_2: number;
    gate_3: number;
    gate_4: number;
    gate_5: number;
    gate_6: number;
    stalled: number;
  };
  learning: {
    avg_open_rate: number;
    avg_reply_rate: number;
    avg_conversion_rate: number;
    top_3_angles: string[];
  };
  total_emails_sent_today: number;
  operator_time_minutes: number;
}

/**
 * Run complete autonomous pipeline
 */
export function runAutonomousPipeline(): AutonomousPipelineRun {
  const startTime = new Date();

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║        AUTONOMOUS PIPELINE START - Intelligence 3.0             ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Phase 1: Discovery
  console.log('=== PHASE 1: DISCOVERY ===\n');
  const discovery = runAutonomousDiscovery();

  // Phase 2: Psychology
  console.log('\n=== PHASE 2: PSYCHOLOGY ===\n');
  const psychology = runAutonomousPsychologyGeneration(discovery.prospects);

  // Phase 3: Validation
  console.log('\n=== PHASE 3: VALIDATION ===\n');
  const validation = runAutonomousValidation(psychology.emails);

  // Phase 4: Sending
  console.log('\n=== PHASE 4: SENDING ===\n');
  const sending = runAutonomousSending(validation.emails.filter((e) => e.path === 'pass' && e.validation_confidence > 85));

  // Phase 5: Monitoring (includes previously sent emails)
  console.log('\n=== PHASE 5: MONITORING ===\n');
  const prospectIds = [
    ...sending.emails.map((e) => e.prospect_id),
    'prev-001',
    'prev-002',
    'prev-003',
    'prev-004',
    'prev-005',
  ]; // Include previously sent
  const monitoring = runAutonomousMonitoring(prospectIds);

  // Phase 6: Learning
  console.log('\n=== PHASE 6: LEARNING ===\n');
  const learning = runAutonomousLearning();

  const endTime = new Date();
  const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);

  return {
    timestamp: startTime.toISOString(),
    discovery: {
      discovered: discovery.discovered,
      enriched: discovery.enriched,
      deduplicated: discovery.deduplicated,
      queued: discovery.queued,
    },
    psychology: {
      generated: psychology.generated,
    },
    validation: {
      validated: validation.validated,
      ready_to_send: validation.ready_to_send,
      held_for_review: validation.held_for_review,
      avg_confidence: validation.avg_confidence,
    },
    sending: {
      sent: sending.sent,
      failed: sending.failed,
      avg_confidence: sending.avg_confidence,
    },
    monitoring: {
      total_monitored: monitoring.total_monitored,
      gate_1: monitoring.gate_distribution[1],
      gate_2: monitoring.gate_distribution[2],
      gate_3: monitoring.gate_distribution[3],
      gate_4: monitoring.gate_distribution[4],
      gate_5: monitoring.gate_distribution[5],
      gate_6: monitoring.gate_distribution[6],
      stalled: monitoring.stalled_count,
    },
    learning: {
      avg_open_rate: learning.avg_open_rate,
      avg_reply_rate: learning.avg_reply_rate,
      avg_conversion_rate: learning.avg_conversion_rate,
      top_3_angles: learning.top_angles.map((a) => `${a.angle} (${(a.reply_rate * 100).toFixed(0)}%)`),
    },
    total_emails_sent_today: sending.sent,
    operator_time_minutes: Math.round(durationMinutes),
  };
}
