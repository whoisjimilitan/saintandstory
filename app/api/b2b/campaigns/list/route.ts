import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  console.log("[CAMPAIGNS LIST] Fetching campaigns");

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const channel = request.nextUrl.searchParams.get("channel") || undefined;

    // Fetch campaigns
    const campaigns = await prisma.b2bCampaign.findMany({
      where: channel ? { channel } : {},
      orderBy: { sentAt: "desc" },
      include: {
        emails: {
          select: {
            id: true,
            prospectName: true,
            prospectEmail: true,
            status: true,
            emailSentAt: true,
            openedAt: true,
            repliedAt: true,
          },
        },
        whatsapp: {
          select: {
            id: true,
            prospectName: true,
            phoneNumber: true,
            status: true,
            sentAt: true,
            lastMessageAt: true,
            messageCount: true,
          },
        },
      },
    });

    // Calculate stats for each campaign
    const campaignsWithStats = campaigns.map(campaign => {
      const emailStats = {
        sent: campaign.emails.filter(e => e.status === "sent").length,
        opened: campaign.emails.filter(e => e.status === "opened").length,
        replied: campaign.emails.filter(e => e.status === "replied").length,
      };

      const whatsappStats = {
        sent: campaign.whatsapp.filter(w => w.status === "sent").length,
        delivered: campaign.whatsapp.filter(w => w.status === "delivered").length,
        replied: campaign.whatsapp.filter(w => w.status === "replied").length,
      };

      return {
        ...campaign,
        emailStats,
        whatsappStats,
      };
    });

    console.log(`[CAMPAIGNS LIST] Found ${campaignsWithStats.length} campaigns`);

    return NextResponse.json({
      success: true,
      campaigns: campaignsWithStats,
    });
  } catch (error) {
    console.error("[CAMPAIGNS LIST] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}
