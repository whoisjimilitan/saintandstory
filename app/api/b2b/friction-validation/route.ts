import { neon } from "@neondatabase/serverless";
import { generateFrictionValidation } from "@/lib/friction-intelligence";

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
        business_category,
        email_sent_at
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

    // For now, get the diagnosed friction from a hardcoded example
    // In production, this would come from the stored outcome case
    // TODO: Query the outcome_cases table once it's created
    const diagnosedFriction = "Movement of items or information to required location";

    // Generate friction validation
    const validation = await generateFrictionValidation(
      sql,
      lead.id,
      lead.business_name,
      lead.business_category || "removals",
      diagnosedFriction
    );

    if (!validation) {
      return Response.json(
        { error: "Could not generate friction validation" },
        { status: 500 }
      );
    }

    return Response.json(validation);
  } catch (error) {
    console.error("[Friction Validation API] Error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
