import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { driverId, date } = await request.json() as { driverId: string; date: string };
    if (!driverId || !date) {
      return NextResponse.json({ error: "Missing driverId or date" }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Insert availability date
    await sql`
      INSERT INTO driver_availability (driver_id, available_date, created_at)
      VALUES (${driverId}, ${date}, NOW())
      ON CONFLICT (driver_id, available_date) DO NOTHING
    `;

    return NextResponse.json({ success: true, date });
  } catch (error) {
    console.error("[Availability] POST error:", error);
    return NextResponse.json({ error: "Failed to save availability" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { driverId, date } = await request.json() as { driverId: string; date: string };
    if (!driverId || !date) {
      return NextResponse.json({ error: "Missing driverId or date" }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Delete availability date
    await sql`
      DELETE FROM driver_availability
      WHERE driver_id = ${driverId} AND available_date = ${date}
    `;

    return NextResponse.json({ success: true, date });
  } catch (error) {
    console.error("[Availability] DELETE error:", error);
    return NextResponse.json({ error: "Failed to remove availability" }, { status: 500 });
  }
}
