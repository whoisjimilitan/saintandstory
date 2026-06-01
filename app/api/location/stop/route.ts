import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { getPusherServer } from "@/lib/pusher";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId } = await request.json() as { jobId: string };
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });

  const sql = neon(process.env.DATABASE_URL!);

  const rows = await sql`
    SELECT j.tracking_token FROM jobs j
    JOIN drivers d ON d.id = j.driver_id
    WHERE j.id = ${jobId} AND d.clerk_user_id = ${userId}
    LIMIT 1
  `;
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Clear live location — keep history and location_sharing_since as record
  await sql`
    UPDATE jobs SET driver_lat = NULL, driver_lng = NULL, driver_eta_minutes = NULL
    WHERE id = ${jobId}
  `;

  const pusher = getPusherServer();
  if (pusher) {
    const token = rows[0].tracking_token as string;
    await Promise.allSettled([
      pusher.trigger("admin", "location-update", { jobId, etaMinutes: null, arrived: false }),
      pusher.trigger(`tracking-${token}`, "driver-location", { jobId, etaMinutes: null, arrived: false }),
    ]);
  }

  return NextResponse.json({ success: true });
}
