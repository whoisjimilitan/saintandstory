import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  console.log("[WHATSAPP START CHAT] Creating new conversation");

  try {
    const body = await request.json();
    const { phoneNumber, prospectName } = body;

    if (!phoneNumber || !prospectName) {
      return NextResponse.json(
        { error: "phoneNumber and prospectName are required" },
        { status: 400 }
      );
    }

    // Check if lead already exists
    let lead = await prisma.b2bLead.findFirst({
      where: { phone: phoneNumber },
    });

    // Create lead if doesn't exist
    if (!lead) {
      lead = await prisma.b2bLead.create({
        data: {
          businessName: prospectName,
          phone: phoneNumber,
          channel: "whatsapp",
          status: "new",
          pipeline_stage: "NEW",
          source: "manual-chat",
        },
      });
      console.log("[WHATSAPP START CHAT] Created new lead:", lead.id);
    } else {
      console.log("[WHATSAPP START CHAT] Using existing lead:", lead.id);
    }

    // Fetch full conversation for response
    const conversation = await prisma.b2bLead.findUnique({
      where: { id: lead.id },
      include: {
        conversationEvents: {
          where: { type: "whatsapp" },
          orderBy: { createdAt: "desc" },
          take: 100,
        },
      },
    });

    if (!conversation) {
      throw new Error("Failed to fetch conversation");
    }

    const messages = conversation.conversationEvents
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((event) => ({
        id: event.id,
        body: event.body,
        direction: event.direction as "inbound" | "outbound",
        status: "delivered" as const,
        createdAt: event.createdAt.toISOString(),
      }));

    const responseConversation = {
      id: conversation.id,
      prospectName: conversation.businessName,
      phoneNumber: conversation.phone || phoneNumber,
      lastMessage: messages[messages.length - 1]?.body || "Chat started",
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      messages,
    };

    console.log("[WHATSAPP START CHAT] ✓ Conversation ready:", {
      leadId: lead.id,
      prospectName,
    });

    return NextResponse.json({
      success: true,
      conversation: responseConversation,
    });
  } catch (error) {
    console.error("[WHATSAPP START CHAT] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start conversation" },
      { status: 500 }
    );
  }
}
