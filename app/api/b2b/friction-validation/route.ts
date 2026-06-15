import { neon } from "@neondatabase/serverless";
import { generateValidationIntelligence } from "@/lib/validation-intelligence";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");

    if (!leadId) {
      return Response.json(
        { error: "leadId parameter required" },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return Response.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // Get lead with outcome case data
    const leadResult = (await sql`
      SELECT
        id,
        business_name,
        business_category
      FROM b2b_leads
      WHERE id = ${leadId}
      LIMIT 1
    `) as Array<any>;

    if (leadResult.length === 0) {
      return Response.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    const lead = leadResult[0];

    // TODO: Get from stored outcome case once available
    const desiredOutcome = "Standard outcome";
    const blockedOutcome = "Standard blockage";
    const operationalCause = undefined;

    // Generate validation intelligence
    const validation = await generateValidationIntelligence(
      sql,
      lead.id,
      lead.business_name,
      lead.business_category || "removals",
      desiredOutcome,
      blockedOutcome,
      operationalCause
    );

    if (!validation) {
      return Response.json(
        { error: "Could not generate validation intelligence" },
        { status: 500 }
      );
    }

    return Response.json(validation);
  } catch (error) {
    console.error("[Validation Intelligence API] Error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
