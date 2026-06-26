import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

async function isAdmin(request: NextRequest) {
  const email = request.headers.get("x-admin-email");
  return email && ADMIN_EMAILS.includes(email);
}

/**
 * CLEANUP: Keep only "Test" driver, delete all others
 * Use with caution - destructive operation
 * Only callable by admin
 */

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { confirm_cleanup } = await request.json();

  if (confirm_cleanup !== true) {
    return NextResponse.json(
      {
        warning: "This will DELETE all drivers except 'Test'. Pass confirm_cleanup: true to proceed.",
        action: "No changes made yet.",
      },
      { status: 400 }
    );
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Find Test driver
    const testDriver = await sql`
      SELECT id, full_name FROM drivers
      WHERE full_name ILIKE '%test%' OR full_name = 'Test'
      LIMIT 1
    `;

    if (!testDriver || testDriver.length === 0) {
      return NextResponse.json(
        { error: "No 'Test' driver found. Cannot cleanup without keeping a test driver." },
        { status: 404 }
      );
    }

    const testDriverId = testDriver[0].id;
    const testDriverName = testDriver[0].full_name;

    // Get count of drivers to delete
    const driversToDelete = await sql`
      SELECT COUNT(*) as count FROM drivers
      WHERE id != ${testDriverId}
    `;

    const deleteCount = driversToDelete[0]?.count || 0;

    // DELETE all drivers except Test
    await sql`
      DELETE FROM drivers
      WHERE id != ${testDriverId}
    `;

    return NextResponse.json({
      status: "cleanup_complete",
      message: `System reset: Deleted ${deleteCount} drivers`,
      kept_driver: {
        id: testDriverId,
        name: testDriverName,
      },
      deleted_count: deleteCount,
      system_status: "Ready for live mode - clean slate with Test driver only",
    });
  } catch (error) {
    console.error("[cleanup-drivers] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
