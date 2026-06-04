import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { ensureB2BSchema } from "@/lib/b2b-schema";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com", "oye.van@outlook.com"];

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
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await ensureB2BSchema();
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`
    SELECT so.*, bl.business_name as lead_business_name
    FROM b2b_standing_orders so
    LEFT JOIN b2b_leads bl ON bl.id = so.lead_id
    WHERE so.active = true
    ORDER BY so.created_at DESC
  `;
  return NextResponse.json({ orders: rows });
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
  }

  return NextResponse.json({ order: rows[0] });
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

  for (const order of orders) {
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
        ${order.pickup_postcode as string ?? ""},
        ${order.delivery_postcode as string ?? null},
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

  return NextResponse.json({ created, count: created.length });
}
