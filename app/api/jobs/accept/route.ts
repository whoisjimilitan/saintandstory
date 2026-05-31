import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { jobId, driverId } = await req.json();
  if (!jobId || !driverId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const sql = neon(process.env.DATABASE_URL!);

  // Verify the driver belongs to the logged-in user
  const check = await sql`SELECT id FROM drivers WHERE id = ${driverId} AND clerk_user_id = ${userId}`;
  if (!check.length) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Claim the job (only if still unclaimed)
  const result = await sql`
    UPDATE jobs SET driver_id = ${driverId}, status = 'matched', updated_at = NOW()
    WHERE id = ${jobId} AND driver_id IS NULL AND status = 'new'
    RETURNING id
  `;

  if (!result.length) return NextResponse.json({ error: "Job no longer available" }, { status: 409 });

  return NextResponse.json({ ok: true });
}
