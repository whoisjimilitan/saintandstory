import { neon } from "@neondatabase/serverless";
import { generatePatternsFromOutcomeCases } from "@/lib/pattern-generation";

/**
 * Pattern Generation Endpoint
 *
 * POST /api/b2b/pattern-generation
 *
 * Regenerates all patterns from validated Outcome Cases.
 * Only processes cases with Logistics Fit Score >= 60.
 *
 * Response:
 * {
 *   patterns_generated: number
 *   patterns_updated: number
 *   success: boolean
 * }
 */
export async function POST(request: Request) {
  try {
    // Auth check (can be expanded based on requirements)
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return Response.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // Generate patterns from validated outcome cases
    const result = await generatePatternsFromOutcomeCases(sql);

    return Response.json({
      success: true,
      patterns_generated: result.patterns_generated,
      patterns_updated: result.patterns_updated,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[Pattern Generation] Error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for health check
 */
export async function GET(request: Request) {
  return Response.json({
    message: "Pattern Generation API",
    methods: {
      POST: "Regenerate all patterns from validated outcome cases"
    }
  });
}
