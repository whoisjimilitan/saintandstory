// Opportunity Engine
// Ranks movements by likelihood and impact

export interface RankedMovement {
  type: string;
  opportunityScore: number;
}

export function rankMovementsByOpportunity(
  movements: Array<{ type: string }>
): string[] {
  // Define opportunity scores for each movement type
  const movementScores: Record<string, number> = {
    // Legal & Court Movements (Highest Urgency)
    "Court Filing Documents": 100,
    "Legal Appeal Documents": 100,
    "Immigration Documentation": 95,
    "Property Completion Documents": 90,
    "Signed Legal Contracts": 85,
    "Witness Statements": 95,
    "Evidence Files": 100,

    // Property Movements
    "Property Completion Keys": 100,
    "Urgent Valuation Documents": 75,
    "Mortgage & Contract Documents": 70,

    // Construction Movements
    "Emergency Site Materials": 95,
    "Revised Specifications": 70,
    "Safety Certificates": 80,

    // Medical/Pharmacy Movements (High Urgency)
    "Prescription & Medication Transfers": 90,
    "Medical Specimens": 100,
    "Medical Records": 75,

    // Accounting/Finance
    "Tax Filing Documents": 85,
    "Financial Records & Statements": 65,
    "Audit Documentation": 70,

    // Insurance
    "Policy Documents": 70,
    "Claims Documentation": 80,
    "Underwriting Files": 65,

    // Generic/Default
    "Time-Sensitive Documents": 60,
    "Inter-office Transfers": 55,
    "Urgent Materials": 70,
  };

  // Sort movements by opportunity score (descending)
  const ranked = movements
    .map((m) => ({
      type: m.type,
      score: movementScores[m.type] || 50,
    }))
    .sort((a, b) => b.score - a.score)
    .map((m) => m.type);

  return ranked;
}
