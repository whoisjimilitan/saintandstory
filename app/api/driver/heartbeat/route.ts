import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sql = neon(process.env.DATABASE_URL!);
  await sql`UPDATE drivers SET last_seen_at = NOW() WHERE clerk_user_id = ${userId}`;

  return NextResponse.json({ ok: true });
}
