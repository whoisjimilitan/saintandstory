// Movement Intelligence Layer
// Returns likely courier movements for each business category

export function getMovementsForBusiness(category: string): string[] {
  const categoryLower = category?.toLowerCase() || "";

  const movements: Record<string, string[]> = {
    legal: [
      "Court Filing Documents",
      "Signed Legal Contracts",
      "Property Completion Documents",
      "Immigration Documentation",
    ],
    solicitor: [
      "Court Filing Documents",
      "Signed Legal Contracts",
      "Property Completion Documents",
      "Immigration Documentation",
    ],
    "law firm": [
      "Court Filing Documents",
      "Signed Legal Contracts",
      "Property Completion Documents",
      "Immigration Documentation",
    ],
    "estate agent": [
      "Property Completion Keys",
      "Urgent Valuation Documents",
      "Mortgage & Contract Documents",
    ],
    "estate agents": [
      "Property Completion Keys",
      "Urgent Valuation Documents",
      "Mortgage & Contract Documents",
    ],
    property: [
      "Property Completion Keys",
      "Urgent Valuation Documents",
      "Mortgage & Contract Documents",
    ],
    "real estate": [
      "Property Completion Keys",
      "Urgent Valuation Documents",
      "Mortgage & Contract Documents",
    ],
    construction: [
      "Emergency Site Materials",
      "Revised Specifications",
      "Safety Certificates",
    ],
    builder: [
      "Emergency Site Materials",
      "Revised Specifications",
      "Safety Certificates",
    ],
    contractor: [
      "Emergency Site Materials",
      "Revised Specifications",
      "Safety Certificates",
    ],
    medical: [
      "Prescription & Medication Transfers",
      "Medical Specimens",
      "Medical Records",
    ],
    pharmacy: [
      "Prescription & Medication Transfers",
      "Medical Specimens",
      "Medical Records",
    ],
    clinic: [
      "Prescription & Medication Transfers",
      "Medical Specimens",
      "Medical Records",
    ],
    hospital: [
      "Prescription & Medication Transfers",
      "Medical Specimens",
      "Medical Records",
    ],
    accounting: [
      "Tax Filing Documents",
      "Financial Records & Statements",
      "Audit Documentation",
    ],
    accountant: [
      "Tax Filing Documents",
      "Financial Records & Statements",
      "Audit Documentation",
    ],
    insurance: [
      "Policy Documents",
      "Claims Documentation",
      "Underwriting Files",
    ],
    broker: [
      "Policy Documents",
      "Claims Documentation",
      "Underwriting Files",
    ],
  };

  // Try exact match first, then try partial match
  for (const [key, value] of Object.entries(movements)) {
    if (categoryLower.includes(key) || key.includes(categoryLower)) {
      return value;
    }
  }

  // Default generic movements if no match found
  return [
    "Time-Sensitive Documents",
    "Inter-office Transfers",
    "Urgent Materials",
  ];
}
