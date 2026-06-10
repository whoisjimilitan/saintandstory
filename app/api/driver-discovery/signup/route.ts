import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { name, email, postcode, radiusMiles, vehicleType, availableDays } = body;

    // Validate required fields
    if (!name || !email || !postcode || !radiusMiles) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL);

    // Check if driver already exists
    const existing = await sql`
      SELECT id FROM drivers WHERE email = ${email} LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json({ error: "Driver already registered" }, { status: 409 });
    }

    // TODO: Integrate with postal code geocoding service to get lat/lon
    // For now, use placeholder coordinates (0, 0) - should be replaced with real geocoding
    const latitude = 0;
    const longitude = 0;

    // Insert new driver (use full_name for consistency with existing drivers table)
    const result = await sql`
      INSERT INTO drivers (full_name, email, postcode, latitude, longitude, radius_miles, vehicle_type, available_days)
      VALUES (${name}, ${email}, ${postcode}, ${latitude}, ${longitude}, ${radiusMiles}, ${vehicleType}, ${availableDays})
      ON CONFLICT (email) DO UPDATE SET
        full_name = ${name},
        postcode = ${postcode},
        latitude = ${latitude},
        longitude = ${longitude},
        radius_miles = ${radiusMiles},
        vehicle_type = ${vehicleType},
        available_days = ${availableDays},
        updated_at = NOW()
      RETURNING id, full_name, email, postcode, radius_miles
    `;

    if (!result.length) {
      throw new Error("Failed to create driver record");
    }

    return NextResponse.json({
      success: true,
      driver: result[0],
      message: "Successfully registered for B2B lead discovery",
    });
  } catch (error) {
    console.error("[Driver Discovery Signup] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to sign up" },
      { status: 500 }
    );
  }
}
