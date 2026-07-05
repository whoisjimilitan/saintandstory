import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  console.log("[WHATSAPP CAMPAIGNS] Fetching all WhatsApp campaigns");

  try {
    // Get all WhatsApp campaigns with stats
    const campaigns = await prisma.b2bCampaign.findMany({
      where: { channel: "whatsapp" },
      include: {
        whatsappMessages: {
          select: {
            status: true,
          },
        },
      },
      orderBy: { sentAt: "desc" },
      take: 50,
    });

    const formatted = campaigns.map((campaign) => {
      const stats = campaign.whatsappMessages.reduce(
        (acc, msg) => {
          acc.sent++;
          if (msg.status === "delivered") acc.delivered++;
          if (msg.status === "replied") acc.replied++;
          return acc;
        },
        { sent: 0, delivered: 0, replied: 0 }
      );

      return {
        id: campaign.id,
        campaignName: campaign.campaignName,
        sentAt: campaign.sentAt?.toISOString() || new Date().toISOString(),
        totalLeads: campaign.totalLeads,
        ...stats,
      };
    });

    console.log("[WHATSAPP CAMPAIGNS] Found", formatted.length, "campaigns");

    return NextResponse.json({
      success: true,
      campaigns: formatted,
    });
  } catch (error) {
    console.error("[WHATSAPP CAMPAIGNS] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
