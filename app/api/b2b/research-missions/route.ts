import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { ensureB2BSchema } from "@/lib/b2b-schema";
import {
  createResearchMission,
  executeResearchMission,
  getMissionStatus,
  addOpportunitySignal,
} from "@/lib/research-missions";

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
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  return ADMIN_EMAILS.includes(email);
}

// GET - List missions or get single mission
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureB2BSchema();
  const sql = neon(process.env.DATABASE_URL!);

  const { searchParams } = new URL(request.url);
  const missionId = searchParams.get("missionId");
  const status = searchParams.get("status");

  try {
    if (missionId) {
      const mission = await getMissionStatus(sql, missionId);
      return NextResponse.json({ mission });
    }

    const query = status
      ? await sql`SELECT * FROM research_missions WHERE status = ${status} ORDER BY created_at DESC LIMIT 50`
      : await sql`SELECT * FROM research_missions ORDER BY created_at DESC LIMIT 50`;

    return NextResponse.json({ missions: query });
  } catch (error) {
    console.error("Error fetching missions:", error);
    return NextResponse.json({ error: "Failed to fetch missions" }, { status: 500 });
  }
}

// POST - Create or execute mission
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureB2BSchema();
  const sql = neon(process.env.DATABASE_URL!);
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";

  const body = await request.json() as {
    action?: "create" | "execute" | "signal";
    name?: string;
    mission_type?: string;
    prompt?: string;
    discovery_strategy?: any;
    mission_id?: string;
    business_id?: string;
    signal_type?: string;
    score_impact?: number;
    description?: string;
  };

  try {
    if (body.action === "create") {
      // Create new mission
      const missionId = await createResearchMission(sql, {
        name: body.name || "Untitled Mission",
        mission_type: body.mission_type || "custom",
        prompt: body.prompt,
        discovery_strategy: body.discovery_strategy || { search_terms: [], locations: [] },
        created_by: email,
      });

      return NextResponse.json({
        success: true,
        missionId,
        message: "Mission created. Call with action=execute to run it.",
      });
    }

    if (body.action === "execute") {
      // Execute mission
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: "GOOGLE_MAPS_API_KEY not configured" }, { status: 500 });
      }

      const result = await executeResearchMission(sql, body.mission_id!, apiKey, 40);

      return NextResponse.json(result);
    }

    if (body.action === "signal") {
      // Add opportunity signal
      const success = await addOpportunitySignal(
        sql,
        body.business_id!,
        body.signal_type!,
        body.score_impact || 5,
        body.description
      );

      return NextResponse.json({
        success,
        message: success ? "Signal added and score updated" : "Failed to add signal",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in research mission endpoint:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
