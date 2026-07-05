import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  console.log("[WHATSAPP CONVERSATIONS] Fetching all conversations");

  try {
    // Get all active WhatsApp conversations
    const leads = await prisma.b2bLead.findMany({
      where: {
        channel: "whatsapp",
      },
      include: {
        conversationEvents: {
          where: { type: "whatsapp" },
          orderBy: { createdAt: "desc" },
          take: 100,
        },
      },
      orderBy: { last_engagement_at: "desc" },
      take: 50,
    });

    const conversations = leads
      .filter((lead) => lead.conversationEvents.length > 0)
      .map((lead) => {
        const messages = lead.conversationEvents
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          .map((event) => ({
            id: event.id,
            body: event.body,
            direction: event.direction as "inbound" | "outbound",
            status: "delivered" as const,
            createdAt: event.createdAt.toISOString(),
          }));

        const lastMessage = lead.conversationEvents[0];
        const unreadCount = lead.conversationEvents.filter(
          (e) => e.direction === "inbound"
        ).length;

        return {
          id: lead.id,
          prospectName: lead.businessName,
          phoneNumber: lead.phone || "Unknown",
          lastMessage: lastMessage?.body || "No messages",
          lastMessageTime: lastMessage?.createdAt.toISOString() || new Date().toISOString(),
          unreadCount,
          messages,
        };
      });

    console.log("[WHATSAPP CONVERSATIONS] Found", conversations.length, "conversations");

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("[WHATSAPP CONVERSATIONS] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
