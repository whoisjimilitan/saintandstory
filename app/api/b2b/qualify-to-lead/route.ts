import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { ensureB2BSchema } from "@/lib/b2b-schema";
import { promoteToLead } from "@/lib/four-layer-pipeline";

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

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureB2BSchema();
  const sql = neon(process.env.DATABASE_URL!);

  const body = await request.json() as {
    qualified_business_id: string;
  };

  const { qualified_business_id } = body;

  if (!qualified_business_id) {
    return NextResponse.json(
      { error: "qualified_business_id required" },
      { status: 400 }
    );
  }

  try {
    // Get qualified business
    const qb = (await sql`
      SELECT * FROM qualified_businesses WHERE id = ${qualified_business_id}
    `) as Array<any>;

    if (qb.length === 0) {
      return NextResponse.json({ error: "Qualified business not found" }, { status: 404 });
    }

    // Promote to lead
    const result = await promoteToLead(sql, qualified_business_id, qb[0], 0); // No minimum threshold for manual promotion

    if (result.success) {
      return NextResponse.json({
        success: true,
        leadId: result.leadId,
        message: "Business promoted to active lead",
      });
    } else {
      return NextResponse.json(
        { error: "Failed to promote to lead" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error promoting to lead:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
