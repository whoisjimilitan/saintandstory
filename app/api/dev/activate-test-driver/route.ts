import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { TEST_DRIVER_EMAIL } from "@/lib/test-driver";

async function activate() {
  const sql = neon(process.env.DATABASE_URL!);

  // First check if driver exists
  const existing = await sql`
    SELECT id, email, profile_live FROM drivers
    WHERE email = ${TEST_DRIVER_EMAIL}
  `;

  if (existing.length === 0) {
    // Debug: check all drivers to see what exists
    const allDrivers = await sql`
      SELECT id, email FROM drivers LIMIT 5
    `;
    return {
      error: "Test driver not found",
      hint: "Run /api/dev/init-test-driver first",
      checked_email: TEST_DRIVER_EMAIL,
      debug_sample_drivers: allDrivers.map(d => d.email),
    };
  }

  // Activate the driver
  const result = await sql`
    UPDATE drivers
    SET profile_live = true, subscription_status = 'active'
    WHERE email = ${TEST_DRIVER_EMAIL}
    RETURNING id, email, profile_live, subscription_status
  `;

  return {
    success: true,
    message: "Test driver activated ✅",
    driver: result[0],
  };
}

export async function GET() {
  try {
    const result = await activate();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to activate" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const result = await activate();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to activate" },
      { status: 500 }
    );
  }
}
