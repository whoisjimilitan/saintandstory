/**
 * Validation Intelligence V2
 *
 * THE TRUTH LAYER OF THE OPERATING SYSTEM
 *
 * Separates:
 * - What we think is happening (diagnosis)
 * - What we know is happening (evidence)
 *
 * Every Outcome Case has TWO independent validation dimensions:
 *
 * 1. PROBLEM VALIDATION
 *    Do they actually have the problem we diagnosed?
 *    Evidence: opened → clicked → confirmed issue → discussed issue
 *
 * 2. SOLUTION VALIDATION
 *    Do they believe Saint & Story can solve it?
 *    Evidence: requested details → asked how → booked call → requested pricing → bought
 *
 * Pattern Intelligence learns ONLY from validated problems.
 * Commercial Intelligence learns ONLY from validated solutions.
 * This prevents learning from false positives AND false trust.
 */

export type EvidenceLevel = 'none' | 'weak' | 'medium' | 'strong' | 'definitive';
export type ValidationStatus = 'hypothesis' | 'emerging_truth' | 'confirmed_reality';

/**
 * Problem Validation Evidence
 * Do they actually have the problem we diagnosed?
 */
export interface ProblemValidationEvidence {
  opened: boolean;
  opened_count: number;
  clicked: boolean;
  clicked_count: number;
  replied: boolean;
  confirmed_issue_in_reply: boolean;
  discussed_on_call: boolean;
  explicitly_described_problem: string | null;
}

/**
 * Solution Validation Evidence
 * Do they believe we can solve it?
 */
export interface SolutionValidationEvidence {
  requested_details: boolean;
  asked_how_it_works: boolean;
  booked_call: boolean;
  requested_pricing: boolean;
  requested_proposal: boolean;
  became_customer: boolean;
  endorsement_comment: string | null;
}

/**
 * Complete Validation Intelligence for an Outcome Case
 */
export interface ValidationIntelligence {
  // Outcome Case reference
  lead_id: string;
  business_name: string;
  industry: string;
  diagnosed_outcome: string;

  // Diagnosis confidence
  diagnosis_confidence: number; // 0-100: How confident in our assessment?

  // PROBLEM VALIDATION DIMENSION
  problem_validation_confidence: number; // 0-100: How much evidence they have the problem?
  problem_evidence_level: EvidenceLevel;
  problem_status: ValidationStatus;
  problem_evidence: ProblemValidationEvidence;

  // SOLUTION VALIDATION DIMENSION
  solution_validation_confidence: number; // 0-100: How much evidence they believe we solve it?
  solution_evidence_level: EvidenceLevel;
  solution_status: ValidationStatus;
  solution_evidence: SolutionValidationEvidence;

  // Overall readiness
  is_pattern_ready: boolean; // problem_validation >= 60
  is_commercial_ready: boolean; // problem_validation >= 60 AND solution_validation >= 60

  // Metadata
  generated_at: string;
}

/**
 * Build problem validation evidence
 */
export async function buildProblemValidationEvidence(
  sql: any,
  leadId: string
): Promise<ProblemValidationEvidence | null> {
  try {
    // Get lead data
    const leadResult = (await sql`
      SELECT
        id,
        email_opened_count,
        email_clicked_count,
        replied,
        replied_at
      FROM b2b_leads
      WHERE id = ${leadId}
      LIMIT 1
    `) as Array<any>;

    if (leadResult.length === 0) {
      return null;
    }

    const lead = leadResult[0];
    const opened_count = lead.email_opened_count || 0;
    const clicked_count = lead.email_clicked_count || 0;

    // TODO: In a real system, analyze reply text for:
    // - confirmed_issue_in_reply
    // - explicitly_described_problem
    // For now, return base structure
    return {
      opened: opened_count > 0,
      opened_count,
      clicked: clicked_count > 0,
      clicked_count,
      replied: lead.replied || false,
      confirmed_issue_in_reply: false,
      discussed_on_call: false,
      explicitly_described_problem: null
    };
  } catch (error) {
    console.error("[Problem Validation Evidence] Error:", error);
    return null;
  }
}

/**
 * Build solution validation evidence
 *
 * This measures: "Do they believe we can solve it?"
 * Not just: "Did they engage?"
 */
export async function buildSolutionValidationEvidence(
  sql: any,
  leadId: string
): Promise<SolutionValidationEvidence | null> {
  try {
    // TODO: Query for solution-related signals:
    // - requested_details: Clicked "how it works" or "learn more"
    // - asked_how_it_works: Asked in email/call
    // - booked_call: Scheduled meeting
    // - requested_pricing: Asked for pricing
    // - became_customer: Converted to job/payment
    //
    // For now, return base structure
    return {
      requested_details: false,
      asked_how_it_works: false,
      booked_call: false,
      requested_pricing: false,
      requested_proposal: false,
      became_customer: false,
      endorsement_comment: null
    };
  } catch (error) {
    console.error("[Solution Validation Evidence] Error:", error);
    return null;
  }
}

/**
 * Calculate Problem Validation Confidence
 *
 * Evidence Hierarchy:
 * None: 0 (no engagement)
 * Weak: 20-40 (opened, clicked)
 * Medium: 50-70 (replied)
 * Strong: 75-90 (confirmed issue)
 * Definitive: 100 (discussed on call)
 */
export function calculateProblemValidationConfidence(
  evidence: ProblemValidationEvidence
): number {
  let confidence = 0;

  if (!evidence.opened) {
    return 0; // No engagement = no validation
  }

  confidence = 20; // They read it

  if (evidence.clicked) {
    confidence = 40; // They showed interest in the specific problem
  }

  if (evidence.replied) {
    confidence = 70; // They engaged seriously
  }

  if (evidence.confirmed_issue_in_reply) {
    confidence = 90; // They explicitly confirmed the problem
  }

  if (evidence.discussed_on_call) {
    confidence = 100; // They discussed it - we know they have it
  }

  return Math.min(confidence, 100);
}

/**
 * Calculate Solution Validation Confidence
 *
 * This is SEPARATE from problem validation.
 * A prospect can understand the problem but not believe we solve it.
 *
 * Evidence Hierarchy:
 * None: 0 (no solution interest)
 * Weak: 20-30 (viewed solution details)
 * Medium: 40-60 (asked questions, booked call)
 * Strong: 70-85 (requested pricing, proposal)
 * Definitive: 100 (became customer)
 */
export function calculateSolutionValidationConfidence(
  evidence: SolutionValidationEvidence
): number {
  let confidence = 0;

  if (!evidence.requested_details && !evidence.asked_how_it_works && !evidence.booked_call) {
    return 0; // No solution interest
  }

  if (evidence.requested_details || evidence.asked_how_it_works) {
    confidence = 30; // Interested in learning more
  }

  if (evidence.booked_call) {
    confidence = 60; // Serious enough to meet
  }

  if (evidence.requested_pricing || evidence.requested_proposal) {
    confidence = 85; // Ready to buy
  }

  if (evidence.became_customer) {
    confidence = 100; // Bought it - they believe we solve it
  }

  return Math.min(confidence, 100);
}

/**
 * Determine evidence level from confidence score
 */
export function getEvidenceLevel(confidence: number): EvidenceLevel {
  if (confidence === 0) return 'none';
  if (confidence < 40) return 'weak';
  if (confidence < 70) return 'medium';
  if (confidence < 100) return 'strong';
  return 'definitive';
}

/**
 * Determine validation status
 */
export function getValidationStatus(confidence: number): ValidationStatus {
  if (confidence < 40) return 'hypothesis';
  if (confidence < 80) return 'emerging_truth';
  return 'confirmed_reality';
}

/**
 * Generate complete Validation Intelligence V2
 *
 * This is the truth layer. Every Outcome Case has:
 * - Diagnosis Confidence (how sure are we in our assessment)
 * - Problem Validation (evidence they have the problem)
 * - Solution Validation (evidence they believe we solve it)
 */
export async function generateValidationIntelligence(
  sql: any,
  leadId: string,
  businessName: string,
  industry: string,
  diagnosedOutcome: string,
  diagnosisConfidence: number
): Promise<ValidationIntelligence | null> {
  try {
    // Build evidence
    const problemEvidence = await buildProblemValidationEvidence(sql, leadId);
    const solutionEvidence = await buildSolutionValidationEvidence(sql, leadId);

    if (!problemEvidence || !solutionEvidence) {
      return null;
    }

    // Calculate confidences
    const problemConfidence = calculateProblemValidationConfidence(problemEvidence);
    const solutionConfidence = calculateSolutionValidationConfidence(solutionEvidence);

    // Determine levels and statuses
    const problemLevel = getEvidenceLevel(problemConfidence);
    const problemStatus = getValidationStatus(problemConfidence);
    const solutionLevel = getEvidenceLevel(solutionConfidence);
    const solutionStatus = getValidationStatus(solutionConfidence);

    // Pattern Intelligence can only learn from validated problems
    const is_pattern_ready = problemConfidence >= 60;

    // Commercial Intelligence can only learn from validated problems AND validated solutions
    const is_commercial_ready = problemConfidence >= 60 && solutionConfidence >= 60;

    return {
      lead_id: leadId,
      business_name: businessName,
      industry,
      diagnosed_outcome: diagnosedOutcome,
      diagnosis_confidence: diagnosisConfidence,

      problem_validation_confidence: problemConfidence,
      problem_evidence_level: problemLevel,
      problem_status: problemStatus,
      problem_evidence: problemEvidence,

      solution_validation_confidence: solutionConfidence,
      solution_evidence_level: solutionLevel,
      solution_status: solutionStatus,
      solution_evidence: solutionEvidence,

      is_pattern_ready,
      is_commercial_ready,
      generated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error("[Validation Intelligence] Error:", error);
    return null;
  }
}

/**
 * Helper: Check if this outcome case is ready for Pattern Intelligence
 */
export function isReadyForPatternLearning(validation: ValidationIntelligence): boolean {
  return validation.is_pattern_ready;
}

/**
 * Helper: Check if this outcome case is ready for Commercial Intelligence
 */
export function isReadyForCommercialLearning(validation: ValidationIntelligence): boolean {
  return validation.is_commercial_ready;
}
