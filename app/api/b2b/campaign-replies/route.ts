import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  console.log("[CAMPAIGN REPLIES] Fetching replied emails");

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch emails that have been replied to
    const repliedEmails = await prisma.b2bCampaignEmail.findMany({
      where: {
        repliedAt: { not: null },
      },
      include: {
        campaign: {
          select: {
            campaignName: true,
            sentAt: true,
          },
        },
      },
      orderBy: { repliedAt: "desc" },
    });

    const replies = repliedEmails.map(email => ({
      id: email.id,
      campaignName: email.campaign.campaignName,
      prospectName: email.prospectName,
      prospectEmail: email.prospectEmail,
      subject: email.subject,
      category: email.category || "Unknown",
      tier: email.tier || 0,
      emailSentAt: email.emailSentAt?.toISOString() || "",
      repliedAt: email.repliedAt?.toISOString() || "",
      body: email.body,
    }));

    console.log(`[CAMPAIGN REPLIES] Found ${replies.length} replied emails`);

    return NextResponse.json({
      success: true,
      replies,
    });
  } catch (error) {
    console.error("[CAMPAIGN REPLIES] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch replies" },
      { status: 500 }
    );
  }
}
