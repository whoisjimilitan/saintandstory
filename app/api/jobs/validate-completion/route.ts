import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { jobId } = await request.json();
    if (!jobId) return NextResponse.json({ error: "Job ID required" }, { status: 400 });

    const sql = neon(process.env.DATABASE_URL!);

    // Get job details
    const rows = await sql`
      SELECT id, pickup_photo_url, delivery_photo_url
      FROM jobs
      WHERE id = ${jobId}
      LIMIT 1
    `;

    if (!rows.length) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const job = rows[0];
    const hasPickup = !!job.pickup_photo_url;
    const hasDelivery = !!job.delivery_photo_url;

    if (!hasPickup || !hasDelivery) {
      return NextResponse.json({
        valid: false,
        message: "Photos required",
        missing: [
          !hasPickup ? "pickup_photo" : null,
          !hasDelivery ? "delivery_photo" : null,
        ].filter(Boolean),
      });
    }

    return NextResponse.json({ valid: true, message: "Job ready to complete" });
  } catch (error) {
    console.error("[Job Validation] Error:", error);
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}
