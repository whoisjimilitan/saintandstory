import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { generateDashboardIntelligence } from "@/lib/dashboard-intelligence";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk",
];

async function isAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const user = await currentUser();
  return ADMIN_EMAILS.includes(user?.emailAddresses[0]?.emailAddress ?? "");
}

/**
 * GET /api/b2b/intelligence/command-center
 *
 * Operator Command Center
 * System tells operator what to do next
 *
 * Shows:
 * - Hottest prospects (highest heat score)
 * - Pending follow-ups (by engagement pattern)
 * - Recent engagement activity
 * - Revenue summary
 * - Category and mission insights
 * - AI recommendations for next actions
 *
 * DORMANT: Display only. No automatic actions.
 */
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sql = neon(process.env.DATABASE_URL!);

  try {
    const intelligence = await generateDashboardIntelligence(sql);

    return NextResponse.json({
      command_center: intelligence,
      note: "DORMANT: Intelligence dashboard for human decision-making. No automatic behavior activated.",
    });
  } catch (error) {
    console.error("[COMMAND-CENTER API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate command center intelligence",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
