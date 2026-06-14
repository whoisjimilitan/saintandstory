import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const leadId = searchParams.get("lead_id");

    if (!leadId) {
      return NextResponse.json(
        { error: "Missing required parameter: lead_id" },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    const events = await sql`
      SELECT
        id,
        event_type,
        operator,
        event_data,
        created_at
      FROM b2b_outreach_events
      WHERE lead_id = ${leadId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json(events);
  } catch (error) {
    console.error("[OUTREACH-EVENTS] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
