/**
 * AUTONOMOUS VALIDATION
 * Validates emails at scale using Human Writing Engine
 */

import { PsychologyEmailGenerated } from './b2b-autonomous-psychology';
import { validateEmail } from './b2b-human-writing-validator';

export interface ValidatedEmail {
  prospect_id: string;
  prospect_name: string;
  pressure_type: string;
  email_subject: string;
  email_body: string;
  validation_confidence: number;
  path: 'pass' | 'suggest' | 'fail';
  gates_passed: number;
  status: 'validated' | 'ready_to_send' | 'held_for_review';
}

/**
 * Validate psychology email
 */
export function validatePsychologyEmailAutonomous(
  email: PsychologyEmailGenerated
): ValidatedEmail {
  const validation = validateEmail(
    email.email_subject,
    email.email_body,
    email.pressure_type,
    email.prospect_name
  );

  const gates_passed = Object.values(validation.gates).filter((g) => g.passed).length;

  return {
    prospect_id: email.prospect_id,
    prospect_name: email.prospect_name,
    pressure_type: email.pressure_type,
    email_subject: email.email_subject,
    email_body: email.email_body,
    validation_confidence: validation.overall_confidence,
    path: validation.path,
    gates_passed,
    status:
      validation.path === 'pass'
        ? 'ready_to_send'
        : validation.path === 'suggest'
          ? 'held_for_review'
          : 'held_for_review',
  };
}

/**
 * Batch validate emails
 */
export function validateEmailsBatch(emails: PsychologyEmailGenerated[]): ValidatedEmail[] {
  return emails.map((e) => validatePsychologyEmailAutonomous(e));
}

/**
 * Route validated emails based on confidence
 */
export function routeValidatedEmails(validated: ValidatedEmail[]): {
  ready_to_send: ValidatedEmail[];
  held_for_review: ValidatedEmail[];
  total_confidence_avg: number;
} {
  const ready = validated.filter((e) => e.path === 'pass' && e.validation_confidence > 85);
  const held = validated.filter((e) => e.path !== 'pass' || e.validation_confidence <= 85);

  const totalConfidence = validated.reduce((sum, e) => sum + e.validation_confidence, 0);
  const avgConfidence = validated.length > 0 ? totalConfidence / validated.length : 0;

  return {
    ready_to_send: ready,
    held_for_review: held,
    total_confidence_avg: avgConfidence,
  };
}

/**
 * Autonomous validation process
 */
export function runAutonomousValidation(emails: PsychologyEmailGenerated[]): {
  validated: number;
  ready_to_send: number;
  held_for_review: number;
  avg_confidence: number;
  emails: ValidatedEmail[];
} {
  console.log(`[Validation] Validating ${emails.length} emails...`);

  const validated = validateEmailsBatch(emails);
  const routed = routeValidatedEmails(validated);

  console.log(`[Validation] Ready to send: ${routed.ready_to_send.length}`);
  console.log(`[Validation] Held for review: ${routed.held_for_review.length}`);
  console.log(
    `[Validation] Average confidence: ${routed.total_confidence_avg.toFixed(1)}%`
  );

  return {
    validated: validated.length,
    ready_to_send: routed.ready_to_send.length,
    held_for_review: routed.held_for_review.length,
    avg_confidence: routed.total_confidence_avg,
    emails: validated,
  };
}
