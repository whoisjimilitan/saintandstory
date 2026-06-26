import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

async function isAdmin(request: NextRequest) {
  const email = request.headers.get("x-admin-email");
  return email && ADMIN_EMAILS.includes(email);
}

/**
 * Phone Call Queue Management
 * Persists recommended prospects in a call queue
 * Tracks call status (pending, called, interested, converted)
 * Links to outcomes and follow-ups
 */

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);
    const status = new URL(request.url).searchParams.get("status") || "pending";

    const queue = await sql`
      SELECT
        pcq.id,
        pcq.lead_id,
        bl.business_name,
        bl.phone,
        bl.city,
        bl.email,
        pcq.category,
        pcq.status,
        pcq.call_result,
        pcq.notes,
        pcq.created_at,
        pcq.called_at,
        pcq.updated_at
      FROM phone_call_queue pcq
      JOIN b2b_leads bl ON pcq.lead_id = bl.id
      WHERE pcq.status = ${status}
      ORDER BY pcq.created_at ASC
      LIMIT 50
    `;

    const stats = await sql`
      SELECT
        status,
        COUNT(*) as count
      FROM phone_call_queue
      GROUP BY status
    `;

    return NextResponse.json({
      status: "ready",
      current_queue: queue || [],
      queue_count: queue?.length || 0,
      stats: stats || [],
    });
  } catch (error) {
    console.error("[phone-call-queue] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, lead_id, category, call_result, notes } = body;

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    if (action === "add_to_queue") {
      // Add prospect to call queue
      if (!lead_id || !category) {
        return NextResponse.json(
          { error: "lead_id and category required" },
          { status: 400 }
        );
      }

      const queueId = crypto.randomUUID();
      await sql`
        INSERT INTO phone_call_queue (
          id, lead_id, category, status, created_at
        ) VALUES (
          ${queueId}, ${lead_id}, ${category}, 'pending', NOW()
        )
        ON CONFLICT (lead_id) DO NOTHING
      `;

      return NextResponse.json({
        status: "added_to_queue",
        queue_id: queueId,
        message: "Prospect added to call queue",
      });
    }

    if (action === "record_call") {
      // Record call attempt and result
      if (!lead_id || !call_result) {
        return NextResponse.json(
          { error: "lead_id and call_result required" },
          { status: 400 }
        );
      }

      const resultStatus =
        call_result === "interested"
          ? "interested"
          : call_result === "converted"
            ? "converted"
            : "called";

      await sql`
        UPDATE phone_call_queue
        SET status = ${resultStatus}, call_result = ${call_result}, called_at = NOW(), notes = ${notes || null}, updated_at = NOW()
        WHERE lead_id = ${lead_id}
      `;

      return NextResponse.json({
        status: "call_recorded",
        lead_id: lead_id,
        result: call_result,
        message: `Call recorded: ${call_result}`,
      });
    }

    if (action === "load_sprint") {
      // Load today's sprint recommendations into queue
      const sprint = await sql`
        SELECT
          bl.id as lead_id,
          bl.business_name,
          bl.phone,
          ${body.category} as category
        FROM b2b_leads bl
        WHERE bl.phone IS NOT NULL
          AND bl.phone != ''
          AND (
            bl.business_name ILIKE '%${body.category}%'
            OR bl.business_category ILIKE '%${body.category}%'
          )
        ORDER BY bl.rating DESC
        LIMIT 10
      `;

      let added = 0;
      for (const prospect of sprint) {
        try {
          await sql`
            INSERT INTO phone_call_queue (
              id, lead_id, category, status, created_at
            ) VALUES (
              ${crypto.randomUUID()}, ${prospect.lead_id}, ${body.category}, 'pending', NOW()
            )
            ON CONFLICT (lead_id) DO NOTHING
          `;
          added++;
        } catch (e) {
          // Skip duplicates
        }
      }

      return NextResponse.json({
        status: "sprint_loaded",
        category: body.category,
        prospects_added: added,
        message: `Added ${added} prospects to call queue for ${body.category}`,
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[phone-call-queue] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
