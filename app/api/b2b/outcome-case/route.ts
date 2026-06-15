import { neon } from "@neondatabase/serverless";
import { generateOutcomeCase } from "@/lib/outcome-case-engine";

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

    // Get lead details
    const leadResult = (await sql`
      SELECT
        id,
        business_name,
        business_category,
        email,
        email_sent_at,
        email_opened_count,
        email_clicked_count,
        replied,
        discovery_signals,
        qualification_signals,
        status
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

    // Parse signals (stored as JSON arrays)
    const discoverySignals = Array.isArray(lead.discovery_signals)
      ? lead.discovery_signals
      : (lead.discovery_signals ? JSON.parse(lead.discovery_signals) : []);

    const qualificationSignals = Array.isArray(lead.qualification_signals)
      ? lead.qualification_signals
      : (lead.qualification_signals ? JSON.parse(lead.qualification_signals) : []);

    // Generate outcome case
    const outcomeCase = await generateOutcomeCase(
      lead.id,
      lead.business_name,
      lead.business_category || "removals",
      discoverySignals,
      qualificationSignals,
      {
        email_sent_at: lead.email_sent_at,
        opened_count: lead.email_opened_count || 0,
        clicked_count: lead.email_clicked_count || 0,
        replied: lead.replied,
        relationship_state: lead.status
      }
    );

    return Response.json(outcomeCase);
  } catch (error) {
    console.error("[Outcome Case API] Error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
