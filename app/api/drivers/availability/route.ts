import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { driverId, date } = await req.json();
  if (!driverId || !date) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const sql = neon(process.env.DATABASE_URL!);

  // Verify the driver belongs to the logged-in user
  const check = await sql`SELECT id FROM drivers WHERE id = ${driverId} AND clerk_user_id = ${userId}`;
  if (!check.length) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await sql`
    INSERT INTO driver_availability (driver_id, available_date)
    VALUES (${driverId}, ${date})
    ON CONFLICT (driver_id, available_date) DO NOTHING
  `;

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { driverId, date } = await req.json();
  if (!driverId || !date) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const sql = neon(process.env.DATABASE_URL!);

  const check = await sql`SELECT id FROM drivers WHERE id = ${driverId} AND clerk_user_id = ${userId}`;
  if (!check.length) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await sql`
    DELETE FROM driver_availability
    WHERE driver_id = ${driverId} AND available_date = ${date}
  `;

  return NextResponse.json({ ok: true });
}
