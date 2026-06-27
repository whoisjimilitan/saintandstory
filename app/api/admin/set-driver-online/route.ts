import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

async function isAdmin(request: NextRequest) {
  const email = request.headers.get("x-admin-email");
  return email && ADMIN_EMAILS.includes(email);
}

/**
 * Force driver to "online" status
 * Used when driver calls to say they're ready but GPS is off
 * Updates last_seen_at to current time
 */
export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { driver_id } = await request.json();

    if (!driver_id) {
      return NextResponse.json({ error: "driver_id required" }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Update driver's last_seen_at to now (makes them appear online)
    await sql`
      UPDATE drivers
      SET last_seen_at = NOW()
      WHERE id = ${driver_id}
    `;

    return NextResponse.json({
      status: "success",
      message: `Driver set to online status`,
      driver_id,
      last_seen_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[set-driver-online] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
