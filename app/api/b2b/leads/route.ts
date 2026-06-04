import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { ensureB2BSchema } from "@/lib/b2b-schema";

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
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  return ADMIN_EMAILS.includes(email);
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await ensureB2BSchema();
  const sql = neon(process.env.DATABASE_URL!);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? null;

  const rows = status
    ? await sql`SELECT * FROM b2b_leads WHERE status = ${status} ORDER BY created_at DESC LIMIT 100`
    : await sql`SELECT * FROM b2b_leads ORDER BY created_at DESC LIMIT 200`;

  const outreach = await sql`
    SELECT lead_id, MAX(sent_at) as last_sent, COUNT(*) as email_count, bool_or(replied) as replied
    FROM b2b_outreach GROUP BY lead_id
  `;
  const outreachMap = Object.fromEntries(outreach.map(r => [r.lead_id as string, r]));

  return NextResponse.json({
    leads: rows.map(r => ({ ...r, outreach: outreachMap[r.id as string] ?? null })),
  });
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await ensureB2BSchema();
  const sql = neon(process.env.DATABASE_URL!);
  const body = await request.json() as {
    business_name: string;
    business_category?: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    city?: string;
    pain_point?: string;
    niche?: string;
    website?: string;
    notes?: string;
  };

  const rows = await sql`
    INSERT INTO b2b_leads (
      business_name, business_category, contact_name, email, phone,
      city, pain_point, niche, website, notes, source, status
    ) VALUES (
      ${body.business_name}, ${body.business_category ?? null}, ${body.contact_name ?? null},
      ${body.email ?? null}, ${body.phone ?? null}, ${body.city ?? null},
      ${body.pain_point ?? null}, ${body.niche ?? null}, ${body.website ?? null},
      ${body.notes ?? null}, 'manual', 'new'
    ) RETURNING *
  `;

  return NextResponse.json({ lead: rows[0] });
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sql = neon(process.env.DATABASE_URL!);
  const { id, status, notes, email } = await request.json() as { id: string; status?: string; notes?: string; email?: string };

  await sql`
    UPDATE b2b_leads SET
      status = COALESCE(${status ?? null}, status),
      notes = COALESCE(${notes ?? null}, notes),
      email = COALESCE(${email ?? null}, email),
      updated_at = NOW()
    WHERE id = ${id}
  `;

  return NextResponse.json({ success: true });
}
