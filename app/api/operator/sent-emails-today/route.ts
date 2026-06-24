import { NextResponse } from "next/server";
import { dashboardService } from "@/lib/b2b/dashboard-service";

export async function GET() {
  try {
    const sentEmails = await dashboardService.getSentEmailsToday();

    return NextResponse.json({
      success: true,
      emails: sentEmails,
      count: sentEmails.length,
    });
  } catch (error) {
    console.error("[SENT-EMAILS-TODAY] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sent emails", success: false },
      { status: 500 }
    );
  }
}
