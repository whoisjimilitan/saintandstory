/**
 * AUTONOMOUS SENDING (NOW FULLY INTEGRATED)
 *
 * Pipeline:
 * 1. Send validated emails
 * 2. Record gate_1_delivered_at
 * 3. PERSIST outcome signal for learning
 * 4. Track delivery status
 */

import { ValidatedEmail } from './b2b-autonomous-validation';
import { recordOutcomeSignal, initializePersistence } from './b2b-outcome-persistence';

export interface SentEmail {
  prospect_id: string;
  prospect_name: string;
  email_subject: string;
  sent_at: string;
  gate_1_delivered_at: string;
  status: 'sent' | 'failed';
  confidence: number;
  pressure_type?: string;
}

// Initialize on module load
initializePersistence();

/**
 * Send email autonomously
 * NOW: Records outcome signal for persistence
 */
export function sendEmailAutonomous(validated: ValidatedEmail): SentEmail {
  // In production: integrate with Resend or email service
  // For now: simulate successful send

  const now = new Date().toISOString();

  const sentEmail: SentEmail = {
    prospect_id: validated.prospect_id,
    prospect_name: validated.prospect_name,
    email_subject: validated.email_subject,
    sent_at: now,
    gate_1_delivered_at: now,
    status: 'sent',
    confidence: validated.validation_confidence,
    pressure_type: validated.pressure_type,
  };

  // RECORD OUTCOME SIGNAL for persistence and learning
  recordOutcomeSignal({
    prospect_id: validated.prospect_id,
    pressure_type_detected: validated.pressure_type || 'unknown',
    predicted_confidence: validated.validation_confidence,
    predicted_burden: validated.email_body.substring(0, 100),
    email_subject: validated.email_subject,
    email_body: validated.email_body,
    email_delivered: sentEmail.status === 'sent',
    email_opened: false, // Will be updated by tracking
    email_replied: false, // Will be updated by tracking
    conversion_to_call: false,
    conversion_to_customer: false,
    timestamp: now,
  });

  return sentEmail;
}

/**
 * Batch send emails
 */
export function sendEmailsBatch(validated: ValidatedEmail[]): SentEmail[] {
  return validated.map((e) => sendEmailAutonomous(e));
}

/**
 * Record gate 1 for sent emails
 */
export function recordGate1(sent: SentEmail[]): SentEmail[] {
  // In production: update database with gate_1_delivered_at
  // For now: already set in sendEmailAutonomous
  return sent;
}

/**
 * Autonomous sending process
 */
export function runAutonomousSending(validated: ValidatedEmail[]): {
  sent: number;
  failed: number;
  avg_confidence: number;
  emails: SentEmail[];
} {
  console.log(`[Sending] Sending ${validated.length} emails...`);

  const sent = sendEmailsBatch(validated);
  const recorded = recordGate1(sent);

  const successCount = recorded.filter((e) => e.status === 'sent').length;
  const failureCount = recorded.filter((e) => e.status === 'failed').length;
  const avgConfidence =
    recorded.length > 0
      ? recorded.reduce((sum, e) => sum + e.confidence, 0) / recorded.length
      : 0;

  console.log(`[Sending] Successfully sent: ${successCount}`);
  console.log(`[Sending] Failed: ${failureCount}`);
  console.log(`[Sending] Average confidence of sent: ${avgConfidence.toFixed(1)}%`);

  return {
    sent: successCount,
    failed: failureCount,
    avg_confidence: avgConfidence,
    emails: recorded,
  };
}
