import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RespondRequest {
  outreachId?: string;
  leadId?: string;
  responseType: "YES" | "MAYBE" | "NO";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RespondRequest;

    if (!body.responseType) {
      return NextResponse.json(
        { error: "Missing required fields: responseType" },
        { status: 400 }
      );
    }

    if (!body.outreachId && !body.leadId) {
      return NextResponse.json(
        { error: "Missing required fields: outreachId or leadId" },
        { status: 400 }
      );
    }

    let outreach;

    if (body.outreachId) {
      outreach = await prisma.b2bOutreach.findUnique({
        where: { id: body.outreachId as any },
        include: { lead: true },
      });
    } else if (body.leadId) {
      // Find the most recent unreplied outreach for this lead
      outreach = await prisma.b2bOutreach.findFirst({
        where: {
          leadId: body.leadId as any,
          replied: false,
        },
        include: { lead: true },
        orderBy: { sentAt: "desc" },
      });
    }

    if (!outreach) {
      return NextResponse.json(
        { error: "No unreplied outreach found for this lead" },
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
    const statusMap = {
      YES: { status: "warm", leadState: "engaged" },
      MAYBE: { status: "warm", leadState: "curious" },
      NO: { status: "contacted", leadState: "recognized" },
    };

    const statusUpdate = statusMap[body.responseType];

    await prisma.b2bLead.update({
      where: { id: outreach.lead.id },
      data: {
        status: statusUpdate.status,
        leadState: statusUpdate.leadState,
        transitionedAt: new Date(),
      },
    });

    // Log conversation event: REPLIED_YES, REPLIED_MAYBE, or REPLIED_NO (Layer 4 - Conversation Intelligence)
    const eventTypeMap = {
      YES: "REPLIED_YES",
      MAYBE: "REPLIED_MAYBE",
      NO: "REPLIED_NO",
    };

    const eventType = eventTypeMap[body.responseType];

    await prisma.b2bConversationEvent.create({
      data: {
        leadId: outreach.lead.id,
        type: eventType,
        direction: "INBOUND",
        metadata: {
          outreachId: updatedOutreach.id,
          respondedAt: new Date().toISOString(),
          engagementBoost: body.responseType === "MAYBE" ? 5 : 0,
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
