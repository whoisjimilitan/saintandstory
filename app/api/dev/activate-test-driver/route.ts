import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

async function activate() {
  const sql = neon(process.env.DATABASE_URL!);

  // First check if driver exists
  const existing = await sql`
    SELECT id, email, profile_live FROM drivers
    WHERE email = 'mz_kay2006@hotmail.co.uk'
  `;

  if (existing.length === 0) {
    return {
      error: "Test driver not found",
      hint: "Run /api/dev/init-test-driver first",
      checked_email: "mz_kay2006@hotmail.co.uk",
    };
  }

  // Activate the driver
  const result = await sql`
    UPDATE drivers
    SET profile_live = true, subscription_status = 'active'
    WHERE email = 'mz_kay2006@hotmail.co.uk'
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
