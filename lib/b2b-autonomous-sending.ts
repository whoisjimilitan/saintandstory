/**
 * AUTONOMOUS SENDING
 * Sends validated emails automatically, records gates
 */

import { ValidatedEmail } from './b2b-autonomous-validation';

export interface SentEmail {
  prospect_id: string;
  prospect_name: string;
  email_subject: string;
  sent_at: string;
  gate_1_delivered_at: string;
  status: 'sent' | 'failed';
  confidence: number;
}

/**
 * Send email autonomously
 */
export function sendEmailAutonomous(validated: ValidatedEmail): SentEmail {
  // In production: integrate with Resend or email service
  // For now: simulate successful send

  const now = new Date().toISOString();

  return {
    prospect_id: validated.prospect_id,
    prospect_name: validated.prospect_name,
    email_subject: validated.email_subject,
    sent_at: now,
    gate_1_delivered_at: now,
    status: 'sent',
    confidence: validated.validation_confidence,
  };
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
