import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RespondRequest {
  outreachId: string;
  responseType: "YES" | "NO";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RespondRequest;

    if (!body.outreachId || !body.responseType) {
      return NextResponse.json(
        { error: "Missing required fields: outreachId, responseType" },
        { status: 400 }
      );
    }

    const outreach = await prisma.b2bOutreach.findUnique({
      where: { id: body.outreachId as any },
      include: { lead: true },
    });

    if (!outreach) {
      return NextResponse.json(
        { error: "Outreach record not found" },
        { status: 404 }
      );
    }

    if (outreach.replied) {
      return NextResponse.json(
        { error: "Response already recorded for this outreach" },
        { status: 409 }
      );
    }

    // Mark outreach as replied
    const updatedOutreach = await prisma.b2bOutreach.update({
      where: { id: body.outreachId as any },
      data: {
        replied: true,
        repliedAt: new Date(),
      },
    });

    // Update lead status based on response
    await prisma.b2bLead.update({
      where: { id: outreach.lead.id },
      data: {
        status: body.responseType === "YES" ? "warm" : "contacted",
        leadState: body.responseType === "YES" ? "engaged" : "recognized",
        transitionedAt: new Date(),
      },
    });

    // Log conversation event: REPLIED_YES or REPLIED_NO (Layer 4 - Conversation Intelligence)
    const eventType = body.responseType === "YES" ? "REPLIED_YES" : "REPLIED_NO";
    await prisma.b2bConversationEvent.create({
      data: {
        leadId: outreach.lead.id,
        type: eventType,
        direction: "INBOUND",
        metadata: {
          outreachId: updatedOutreach.id,
          respondedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      outreachId: updatedOutreach.id,
      responseType: body.responseType,
    });
  } catch (error) {
    console.error("[B2B RESPOND] Error:", error);
    return NextResponse.json(
      { error: "Failed to record response" },
      { status: 500 }
    );
  }
}
