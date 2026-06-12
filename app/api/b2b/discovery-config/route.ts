import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { ensureB2BSchema } from "@/lib/b2b-schema";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk",
];

async function isAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  return ADMIN_EMAILS.includes(email);
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureB2BSchema();
  const sql = neon(process.env.DATABASE_URL!);

  const { searchParams } = new URL(request.url);
  const enabled = searchParams.get("enabled");

  const configs = enabled === "true"
    ? await sql`
        SELECT * FROM discovery_config WHERE enabled = true ORDER BY priority DESC
      `
    : await sql`
        SELECT * FROM discovery_config ORDER BY priority DESC
      `;

  return NextResponse.json({ configs });
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureB2BSchema();
  const sql = neon(process.env.DATABASE_URL!);

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";

  const body = await request.json() as {
    mode: string;
    niche: string;
    locations: string[];
    enabled?: boolean;
    priority?: number;
    minScore?: number;
  };

  const config = await sql`
    INSERT INTO discovery_config (
      mode, niche, locations, enabled, priority, min_score, created_by
    ) VALUES (
      ${body.mode}, ${body.niche}, ${JSON.stringify(body.locations)},
      ${body.enabled !== false}, ${body.priority || 50}, ${body.minScore || 40}, ${email}
    ) RETURNING *
  `;

  return NextResponse.json({ config: config[0] });
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureB2BSchema();
  const sql = neon(process.env.DATABASE_URL!);

  const body = await request.json() as {
    id: string;
    enabled?: boolean;
    priority?: number;
    minScore?: number;
  };

  await sql`
    UPDATE discovery_config
    SET
      enabled = COALESCE(${body.enabled ?? null}, enabled),
      priority = COALESCE(${body.priority ?? null}, priority),
      min_score = COALESCE(${body.minScore ?? null}, min_score),
      updated_at = NOW()
    WHERE id = ${body.id}
  `;

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureB2BSchema();
  const sql = neon(process.env.DATABASE_URL!);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  await sql`DELETE FROM discovery_config WHERE id = ${id}`;

  return NextResponse.json({ success: true });
}
