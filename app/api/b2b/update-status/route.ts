import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const STATUS_MACHINE = {
  new: ["ready"],
  ready: ["contacted", "archived"],
  contacted: ["engaged", "archived"],
  engaged: ["qualified", "archived"],
  qualified: ["active", "archived"],
  active: ["archived"],
  archived: [],
};

export async function POST(request: NextRequest) {
  try {
    const { lead_id, status, operator, notes } = await request.json();

    if (!lead_id || !status || !operator) {
      return NextResponse.json(
        { error: "Missing required fields: lead_id, status, operator" },
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

    // Get current lead status
    const leads = await sql`
      SELECT id, lead_status, business_name FROM b2b_leads WHERE id = ${lead_id}
    `;

    if (leads.length === 0) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const lead = leads[0] as any;
    const currentStatus = (lead.lead_status || "new") as string;

    // Validate status transition
    const allowedTransitions =
      (STATUS_MACHINE[currentStatus as keyof typeof STATUS_MACHINE] || []) as any[];
    if (!allowedTransitions.includes(status)) {
      return NextResponse.json(
        {
          error: "INVALID_TRANSITION",
          message: `Cannot transition from '${currentStatus}' to '${status}'. Allowed: ${allowedTransitions.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Update lead status
    await sql`
      UPDATE b2b_leads
      SET
        lead_status = ${status},
        updated_at = NOW()
      WHERE id = ${lead_id}
    `;

    // Create audit event: STATUS_CHANGED
    await sql`
      INSERT INTO b2b_outreach_events
      (lead_id, event_type, operator, event_data)
      VALUES
      (${lead_id}, 'status_changed', ${operator},
       '{"from":"${currentStatus}","to":"${status}","notes":"${notes || ""}"}')
    `;

    return NextResponse.json({
      success: true,
      message: `Status updated: ${currentStatus} → ${status}`,
      lead_id,
      previous_status: currentStatus,
      new_status: status,
    });
  } catch (error) {
    console.error("[UPDATE-STATUS] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
