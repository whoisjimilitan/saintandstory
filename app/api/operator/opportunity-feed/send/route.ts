import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  console.log("[OPPORTUNITY FEED] Send started");

  try {
    const body = await request.json();
    const { opportunityIds } = body;

    if (!Array.isArray(opportunityIds) || opportunityIds.length === 0) {
      return NextResponse.json(
        { error: "opportunityIds array is required" },
        { status: 400 }
      );
    }

    console.log("[OPPORTUNITY FEED] Sending", opportunityIds.length, "emails");

    // Fetch queued opportunities
    const opportunities = await prisma.opportunityFeed.findMany({
      where: {
        id: { in: opportunityIds },
        status: "queued",
      },
    });

    if (opportunities.length === 0) {
      return NextResponse.json(
        { error: "No queued opportunities found with given IDs" },
        { status: 404 }
      );
    }

    const results = [];
    const failed = [];

    for (const opp of opportunities) {
      try {
        if (!opp.emailBody || !opp.emailSubject || !opp.contactEmail) {
          throw new Error("Missing email data or contact email");
        }

        console.log("[OPPORTUNITY FEED] Sending to:", opp.companyName, opp.contactEmail);

        // Send via Resend
        const response = await resend.emails.send({
          from: "james@saintandstory.co.uk",
          to: opp.contactEmail,
          subject: opp.emailSubject,
          text: opp.emailBody,
        });

        if (!response.id) {
          throw new Error(response.error?.message || "Failed to send email");
        }

        // Update database
        await prisma.opportunityFeed.update({
          where: { id: opp.id },
          data: {
            status: "sent",
            sentAt: new Date(),
          },
        });

        results.push({
          id: opp.id,
          company: opp.companyName,
          email: opp.contactEmail,
          resendId: response.id,
        });

        console.log("[OPPORTUNITY FEED] Sent successfully to", opp.companyName, "resend id:", response.id);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log("[OPPORTUNITY FEED] Send failed for", opp.companyName, ":", errorMsg);
        failed.push({
          company: opp.companyName,
          email: opp.contactEmail,
          error: errorMsg,
        });
      }
    }

    console.log("[OPPORTUNITY FEED] Send complete. Sent:", results.length, "Failed:", failed.length);

    return NextResponse.json({
      success: true,
      sent: results.length,
      failed: failed.length,
      results,
      errors: failed,
    });
  } catch (error) {
    console.error("[OPPORTUNITY FEED] Send error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
