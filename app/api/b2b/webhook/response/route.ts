import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const response = url.searchParams.get("response");

    if (!token || !response) {
      return NextResponse.json(
        { error: "Missing token or response parameter" },
        { status: 400 }
      );
    }

    if (!["YES", "NO"].includes(response)) {
      return NextResponse.json(
        { error: "Invalid response type" },
        { status: 400 }
      );
    }

    // Validate token exists and is unique (prevents duplicate clicks)
    const existingResponse = await (prisma as any).b2b_responses.findUnique({
      where: { tracking_token: token },
      include: { b2b_outreach: { include: { lead: true } } },
    });

    if (!existingResponse) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 404 }
      );
    }

    // Prevent duplicate responses (token already responded)
    if (existingResponse.response_type !== "PENDING") {
      return NextResponse.json(
        { error: "Response already recorded for this token" },
        { status: 409 }
      );
    }

    // Update response record with actual response
    await (prisma as any).b2b_responses.update({
      where: { id: existingResponse.id },
      data: {
        response_type: response,
        responded_at: new Date(),
      },
    });

    // Update outreach: marked as replied
    const outreach = existingResponse.b2b_outreach;
    await prisma.b2bOutreach.update({
      where: { id: outreach.id },
      data: {
        replied: true,
        repliedAt: new Date(),
      },
    });

    // Update lead status based on response
    const lead = outreach.lead;
    await prisma.b2bLead.update({
      where: { id: lead.id },
      data: {
        status: response === "YES" ? "warm" : "contacted",
        leadState: response === "YES" ? "engaged" : "recognized",
        transitionedAt: new Date(),
        last_engagement_at: new Date(),
        engagement_score: response === "YES" ? (lead.engagement_score || 0) + 10 : (lead.engagement_score || 0) + 1,
      },
    });

    // Log conversation event
    await prisma.b2bConversationEvent.create({
      data: {
        leadId: lead.id,
        type: response === "YES" ? "REPLIED_YES" : "REPLIED_NO",
        direction: "INBOUND",
        metadata: {
          outreachId: outreach.id,
          token: token,
        },
      },
    });

    // Redirect to success page (simple HTML response for now)
    return NextResponse.json({
      success: true,
      message: `Response recorded: ${response}`,
      leadId: lead.id,
      businessName: lead.businessName,
    });
  } catch (error) {
    console.error("[B2B WEBHOOK] Error:", error);
    return NextResponse.json(
      { error: "Failed to process response" },
      { status: 500 }
    );
  }
}
