import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const result = await sql`
      UPDATE drivers
      SET profile_live = true, subscription_status = 'active'
      WHERE email = 'mz_kay2006@hotmail.co.uk'
      RETURNING id, email, profile_live, subscription_status
    `;

    if (result.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Test driver activated",
        driver: result[0],
      });
    } else {
      return NextResponse.json(
        { error: "Test driver not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to activate" },
      { status: 500 }
    );
  }
}
