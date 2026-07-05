import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  console.log("[UNIFIED REPLIES] Fetching email + WhatsApp replies");

  try {
    // Fetch email replies
    const emailReplies = await prisma.b2bCampaignEmail.findMany({
      where: {
        repliedAt: { not: null },
      },
      select: {
        id: true,
        prospectName: true,
        prospectEmail: true,
        category: true,
        tier: true,
        emailSentAt: true,
        repliedAt: true,
        subject: true,
        body: true,
      },
      orderBy: { repliedAt: "desc" },
      take: 100,
    });

    // Fetch WhatsApp replies (inbound messages)
    const whatsappReplies = await prisma.b2bConversationEvent.findMany({
      where: {
        type: "whatsapp",
        direction: "inbound",
      },
      select: {
        id: true,
        leadId: true,
        body: true,
        createdAt: true,
        lead: {
          select: {
            businessName: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Normalize both to unified format
    const normalized = [
      ...emailReplies.map((r) => ({
        id: r.id,
        channel: "email" as const,
        prospectName: r.prospectName,
        from: r.prospectEmail,
        message: r.body,
        timestamp: r.repliedAt?.toISOString() || new Date().toISOString(),
        category: r.category,
        tier: r.tier,
        sentAt: r.emailSentAt?.toISOString(),
      })),
      ...whatsappReplies.map((r) => ({
        id: r.id,
        channel: "whatsapp" as const,
        prospectName: r.lead?.businessName || "Unknown",
        from: r.lead?.phone || "Unknown",
        message: r.body,
        timestamp: r.createdAt.toISOString(),
        category: undefined,
        tier: undefined,
        sentAt: undefined,
      })),
    ];

    // Sort by timestamp descending
    normalized.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    console.log(
      "[UNIFIED REPLIES] Found",
      emailReplies.length,
      "email and",
      whatsappReplies.length,
      "WhatsApp replies"
    );

    return NextResponse.json({
      success: true,
      total: normalized.length,
      replies: normalized,
    });
  } catch (error) {
    console.error("[UNIFIED REPLIES] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
