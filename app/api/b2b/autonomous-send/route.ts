/**
 * POST /api/b2b/autonomous-send
 *
 * Triggers autonomous email sending for qualified leads.
 * Called daily by Vercel cron job (~07:00 UTC).
 *
 * Response includes:
 * - emails_sent: count of emails successfully sent
 * - emails_queued: count of leads that were ready
 * - emails_skipped: count of leads that were skipped
 * - errors: array of error messages
 */

import { NextResponse } from "next/server";
import { autonomousSendEmails } from "@/lib/b2b-autonomous-send";

export const maxDuration = 60; // 60 second timeout

export async function POST(request: Request) {
  try {
    // Optional: Validate request is from Vercel cron
    // In production, check vercel-cron header
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Allow for local testing without auth
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    console.log("[API] POST /api/b2b/autonomous-send triggered");

    // Run autonomous send
    const result = await autonomousSendEmails();

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[API] Error in autonomous send:", error);
    const errorMsg =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to execute autonomous send",
        message: errorMsg,
        emails_sent: 0,
        emails_skipped: 0,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Allow GET for debugging/testing
    console.log("[API] GET /api/b2b/autonomous-send (test mode)");

    const result = await autonomousSendEmails();

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[API] Error in autonomous send:", error);
    const errorMsg =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to execute autonomous send",
        message: errorMsg,
      },
      { status: 500 }
    );
  }
}
