import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { ensureB2BSchema } from "@/lib/b2b-schema";
import { recordOutcome } from "@/lib/learning-outcomes";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];

async function isAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const user = await currentUser();
  return ADMIN_EMAILS.includes(user?.emailAddresses[0]?.emailAddress ?? "");
}

function nextOccurrence(dayOfWeek: number): Date {
  const now = new Date();
  const diff = (dayOfWeek - now.getDay() + 7) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + diff);
  next.setHours(9, 0, 0, 0);
  return next;
}

export async function GET() {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await ensureB2BSchema();

    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT *
      FROM b2b_standing_orders
      WHERE active = true
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ orders: rows });
  } catch (error) {
    console.error("[STANDING_ORDERS] Error fetching orders:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        type: error instanceof Error ? error.name : typeof error,
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await ensureB2BSchema();
  const sql = neon(process.env.DATABASE_URL!);

  const body = await request.json() as {
    lead_id?: string;
    business_name: string;
    contact_name?: string;
    contact_phone?: string;
    contact_email?: string;
    pickup_address?: string;
    pickup_postcode?: string;
    delivery_address?: string;
    delivery_postcode?: string;
    service_type?: string;
    frequency?: string;
    day_of_week?: number;
    preferred_time?: string;
    price?: number;
    notes?: string;
  };

  // Validate required operational fields
  if (!body.pickup_postcode || !body.pickup_postcode.trim()) {
    return NextResponse.json(
      { error: "pickup_postcode is required for job routing" },
      { status: 400 }
    );
  }

  if (!body.delivery_postcode || !body.delivery_postcode.trim()) {
    return NextResponse.json(
      { error: "delivery_postcode is required for job routing" },
      { status: 400 }
    );
  }

  const nextDate = body.day_of_week != null
    ? nextOccurrence(body.day_of_week).toISOString()
    : null;

  const rows = await sql`
    INSERT INTO b2b_standing_orders (
      lead_id, business_name, contact_name, contact_phone, contact_email,
      pickup_address, pickup_postcode, delivery_address, delivery_postcode,
      service_type, frequency, day_of_week, preferred_time, price, notes,
      next_scheduled_at
    ) VALUES (
      ${body.lead_id ?? null}, ${body.business_name},
      ${body.contact_name ?? null}, ${body.contact_phone ?? null}, ${body.contact_email ?? null},
      ${body.pickup_address ?? null}, ${body.pickup_postcode ?? null},
      ${body.delivery_address ?? null}, ${body.delivery_postcode ?? null},
      ${body.service_type ?? "Logistics run"}, ${body.frequency ?? "weekly"},
      ${body.day_of_week ?? null}, ${body.preferred_time ?? null},
      ${body.price ?? null}, ${body.notes ?? null}, ${nextDate}
    ) RETURNING *
  `;

  // Update lead status to closed
  if (body.lead_id) {
    await sql`UPDATE b2b_leads SET status = 'closed', updated_at = NOW() WHERE id = ${body.lead_id}`;

    // Record conversion outcome for learning loop
    try {
      const lead = await sql`
        SELECT qualified_business_id, business_category, opportunity_score, created_at
        FROM b2b_leads
        WHERE id = ${body.lead_id}
      `;

      if (lead.length > 0) {
        const leadData = lead[0];
        const daysToConversion = leadData.created_at
          ? Math.floor(
              (new Date().getTime() - new Date(leadData.created_at).getTime()) / (1000 * 60 * 60 * 24)
            )
          : 0;

        await recordOutcome(
          sql,
          leadData.qualified_business_id as string,
          body.lead_id,
          "converted",
          leadData.business_category as string,
          (leadData.opportunity_score as number) || 0,
          daysToConversion,
          { standing_order_created: true, price: body.price }
        );
      }
    } catch (err) {
      console.error("[Standing Order] Failed to record conversion outcome:", err);
      // Don't fail the standing order creation if outcome recording fails
    }
  }

  return NextResponse.json({ order: rows[0] });
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json() as { orderId: string; status: string };
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "orderId and status required" },
        { status: 400 }
      );
    }

    await ensureB2BSchema();
    const sql = neon(process.env.DATABASE_URL!);

    const rows = await sql`
      UPDATE b2b_standing_orders
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${orderId}
      RETURNING *
    `;

    if (!rows.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order: rows[0] });
  } catch (error) {
    console.error("[STANDING_ORDERS] Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}

// Generate this week's jobs from standing orders
export async function PUT() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const sql = neon(process.env.DATABASE_URL!);

  const now = new Date();
  const orders = await sql`
    SELECT * FROM b2b_standing_orders
    WHERE active = true
      AND (next_scheduled_at IS NULL OR next_scheduled_at <= ${now.toISOString()})
  ` as Record<string, unknown>[];

  const created: string[] = [];
  const skipped: string[] = [];

  for (const order of orders) {
    // Validate required routing information before job creation
    const pickupPostcode = order.pickup_postcode as string | null;
    const deliveryPostcode = order.delivery_postcode as string | null;

    if (!pickupPostcode || !pickupPostcode.trim() || !deliveryPostcode || !deliveryPostcode.trim()) {
      console.warn(
        `[Standing Orders Job Generation] Skipped: missing routing postcode for standing order ${order.id as string} (${order.business_name as string}). Pickup: ${pickupPostcode || 'null'}, Delivery: ${deliveryPostcode || 'null'}`
      );
      skipped.push(`${order.id as string} (missing postcode)`);
      continue;
    }

    // Create a job in the existing jobs table
    const reference = `B2B-${Date.now().toString(36).toUpperCase()}`;
    await sql`
      INSERT INTO jobs (
        customer_name, customer_email, customer_phone, service_type,
        postcode_from, postcode_to, status, reference, price, timeframe
      ) VALUES (
        ${order.business_name as string},
        ${order.contact_email as string ?? null},
        ${order.contact_phone as string ?? null},
        ${order.service_type as string ?? "Standing order"},
        ${pickupPostcode},
        ${deliveryPostcode},
        'pending_review',
        ${reference},
        ${order.price as number ?? null},
        'Standing order — ${order.business_name as string}'
      )
    `;

    // Update next scheduled date
    const dayOfWeek = order.day_of_week as number | null;
    let nextDate: Date;
    if (dayOfWeek != null) {
      nextDate = nextOccurrence(dayOfWeek);
    } else {
      nextDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    await sql`
      UPDATE b2b_standing_orders
      SET last_generated_at = NOW(), next_scheduled_at = ${nextDate.toISOString()}
      WHERE id = ${order.id as string}
    `;

    created.push(reference);
  }

  return NextResponse.json({
    created,
    skipped,
    count: created.length,
    skippedCount: skipped.length,
    message: skipped.length > 0
      ? `Created ${created.length} jobs, skipped ${skipped.length} standing orders due to missing routing information`
      : `Created ${created.length} jobs successfully`
  });
}
