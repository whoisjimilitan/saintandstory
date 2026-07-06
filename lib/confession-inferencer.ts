/**
 * Confession Inferencer — Intelligent problem detection from implicit confessions.
 *
 * Takes vague/implicit confessions and uses Claude to infer the underlying problem.
 * Handles: "We're spending too much time on logistics" → court_deadline_delivery
 *
 * This is the smart layer that makes the system work with real-world confessions,
 * not just explicit "I need a courier" statements.
 */

import { Anthropic } from "@anthropic-ai/sdk";
import { PROBLEMS_MAP } from "./problems-map";

const client = new Anthropic();

interface InferenceResult {
  inferred_problem_type: string | null;
  confidence: number;
  reasoning: string;
  alternative_problems: Array<{ problem_type: string; confidence: number }>;
}

/**
 * Infer problem type from implicit/vague confession using Claude.
 *
 * INPUT: "We're spending too much time managing courier logistics"
 * OUTPUT: { inferred_problem_type: "court_deadline_delivery", confidence: 0.82, reasoning: "..." }
 *
 * This handles the real world where prospects don't explicitly state their needs.
 */
export async function inferProblemFromConfession(
  confessionText: string
): Promise<InferenceResult> {
  if (!confessionText || confessionText.trim().length === 0) {
    return {
      inferred_problem_type: null,
      confidence: 0,
      reasoning: "Empty confession",
      alternative_problems: []
    };
  }

  // Build problem descriptions for Claude context
  const problemDescriptions = Object.entries(PROBLEMS_MAP)
    .map(
      ([key, problem]) =>
        `${key}: ${problem.brief_opening} (Tier ${problem.tier})`
    )
    .join("\n");

  const prompt = `You are an expert at inferring business problems from implicit statements.

Given a confession (statement about a business problem), determine:
1. What specific operational problem they are experiencing
2. How confident you are (0-100)
3. Alternative problems they might have

Available problem types:
${problemDescriptions}

Confession: "${confessionText}"

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "inferred_problem_type": "problem_key_or_null",
  "confidence": 85,
  "reasoning": "They mentioned logistics delays, which is characteristic of..."
  "alternative_problems": [
    {"problem_type": "restaurant_supply_delivery", "confidence": 45}
  ]
}`;

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-1",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const content = message.content[0];
    if (content.type !== "text") {
      return {
        inferred_problem_type: null,
        confidence: 0,
        reasoning: "Invalid response from Claude",
        alternative_problems: []
      };
    }

    const result = JSON.parse(content.text) as InferenceResult;

    // Validate that inferred problem exists in PROBLEMS_MAP
    if (result.inferred_problem_type && !PROBLEMS_MAP[result.inferred_problem_type]) {
      return {
        inferred_problem_type: null,
        confidence: 0,
        reasoning: `Claude suggested "${result.inferred_problem_type}" but it doesn't exist in PROBLEMS_MAP`,
        alternative_problems: result.alternative_problems.filter(
          p => PROBLEMS_MAP[p.problem_type]
        )
      };
    }

    return result;
  } catch (error) {
    console.error("[CONFESSION INFERENCER] Error:", error);
    return {
      inferred_problem_type: null,
      confidence: 0,
      reasoning: `Inference failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      alternative_problems: []
    };
  }
}

/**
 * Infer problem from business category (for search results).
 *
 * When we find a prospect via postcode search for "Solicitor",
 * we can infer they likely have court_deadline_delivery problems.
 *
 * This is how search results feed into the problem-centric system.
 */
export function inferProblemFromCategory(category: string): {
  primary_problem: string | null;
  alternatives: string[];
  confidence: number;
} {
  const categoryLower = category.toLowerCase();

  // Map business categories to problem types
  const categoryMap: Record<string, { primary: string; alternatives: string[]; confidence: number }> = {
    // Legal
    solicitor: {
      primary: "court_deadline_delivery",
      alternatives: ["legal_document_delivery"],
      confidence: 0.9
    },
    lawyer: {
      primary: "court_deadline_delivery",
      alternatives: ["legal_document_delivery"],
      confidence: 0.9
    },
    "law firm": {
      primary: "court_deadline_delivery",
      alternatives: ["legal_document_delivery"],
      confidence: 0.9
    },

    // Healthcare
    hospital: {
      primary: "hospital_supply_delivery",
      alternatives: ["pharmacy_prescription_delivery"],
      confidence: 0.85
    },
    clinic: {
      primary: "hospital_supply_delivery",
      alternatives: ["pharmacy_prescription_delivery"],
      confidence: 0.8
    },
    pharmacy: {
      primary: "pharmacy_prescription_delivery",
      alternatives: ["hospital_supply_delivery"],
      confidence: 0.85
    },
    medical: {
      primary: "hospital_supply_delivery",
      alternatives: ["pharmacy_prescription_delivery"],
      confidence: 0.75
    },

    // Real Estate
    "estate agent": {
      primary: "estate_agent_document_delivery",
      alternatives: ["legal_document_delivery"],
      confidence: 0.85
    },
    realtor: {
      primary: "estate_agent_document_delivery",
      alternatives: [],
      confidence: 0.8
    },

    // Food & Beverage
    restaurant: {
      primary: "restaurant_supply_delivery",
      alternatives: ["catering_supply_delivery"],
      confidence: 0.9
    },
    cafe: {
      primary: "restaurant_supply_delivery",
      alternatives: ["catering_supply_delivery"],
      confidence: 0.85
    },
    catering: {
      primary: "catering_supply_delivery",
      alternatives: ["restaurant_supply_delivery"],
      confidence: 0.85
    },

    // Construction
    construction: {
      primary: "construction_material_delivery",
      alternatives: [],
      confidence: 0.85
    },
    builder: {
      primary: "construction_material_delivery",
      alternatives: [],
      confidence: 0.8
    },
    architect: {
      primary: "architecture_drawing_delivery",
      alternatives: ["construction_material_delivery"],
      confidence: 0.8
    },

    // Professional Services
    accountant: {
      primary: "accounting_file_delivery",
      alternatives: ["legal_document_delivery"],
      confidence: 0.8
    },
    "accounting firm": {
      primary: "accounting_file_delivery",
      alternatives: [],
      confidence: 0.85
    },

    // Retail
    retail: {
      primary: "retail_stock_delivery",
      alternatives: [],
      confidence: 0.75
    },
    shop: {
      primary: "retail_stock_delivery",
      alternatives: [],
      confidence: 0.7
    },

    // Other
    vet: {
      primary: "veterinary_supply_delivery",
      alternatives: [],
      confidence: 0.85
    },
    veterinary: {
      primary: "veterinary_supply_delivery",
      alternatives: [],
      confidence: 0.9
    },
    dental: {
      primary: "dental_supply_delivery",
      alternatives: [],
      confidence: 0.85
    }
  };

  // Match category
  for (const [key, mapping] of Object.entries(categoryMap)) {
    if (categoryLower.includes(key)) {
      return {
        primary_problem: mapping.primary,
        alternatives: mapping.alternatives,
        confidence: mapping.confidence
      };
    }
  }

  // No match
  return {
    primary_problem: null,
    alternatives: [],
    confidence: 0
  };
}
