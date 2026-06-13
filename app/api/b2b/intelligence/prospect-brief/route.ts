import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { getProspectBriefAI } from "@/lib/prospect-brief-ai";

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
 * GET /api/b2b/intelligence/prospect-brief?lead_id=X
 *
 * Generate AI-powered conversation brief for a prospect
 * Includes: why they need it, pain points, conversation starter,
 *           likely objections, conversion probability
 *
 * DORMANT: Not automatically called. For manual research only.
 */
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get("lead_id");

  if (!leadId) {
    return NextResponse.json(
      { error: "lead_id parameter required" },
      { status: 400 }
    );
  }

  const sql = neon(process.env.DATABASE_URL!);

  try {
    const brief = await getProspectBriefAI(sql, leadId);

    if (!brief) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      lead_id: leadId,
      brief,
      note: "DORMANT: AI-generated brief for research only. Not activated for auto-sending.",
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[PROSPECT-BRIEF API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate brief",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
