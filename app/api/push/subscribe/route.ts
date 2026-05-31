import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com", "oye.van@outlook.com"];
const ADMIN_USER_IDS = ["user_3EVExeiSBmgdhAWGzMEb8GMVc62"];

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email) && !ADMIN_USER_IDS.includes(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { endpoint, keys } = await request.json();
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const sql = neon(process.env.DATABASE_URL!);
  await sql`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id SERIAL PRIMARY KEY,
      endpoint TEXT UNIQUE NOT NULL,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    INSERT INTO push_subscriptions (endpoint, p256dh, auth)
    VALUES (${endpoint}, ${keys.p256dh}, ${keys.auth})
    ON CONFLICT (endpoint) DO UPDATE SET p256dh = ${keys.p256dh}, auth = ${keys.auth}
  `;

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({
    publicKey: process.env.VAPID_PUBLIC_KEY ?? null,
  });
}
