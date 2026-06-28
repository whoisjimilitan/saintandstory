import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

export async function GET() {
  const { userId, sessionClaims } = await auth();

  if (!userId || !sessionClaims?.email || !ADMIN_EMAILS.includes(sessionClaims.email as string)) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Real data from database
    const inCampaign = await prisma.b2bLead.count({
      where: { channel: "email" },
    });

    // Opened today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const openedToday = await prisma.b2bEmailEvent.count({
      where: {
        eventType: "opened",
        createdAt: { gte: today },
      },
    });

    // Clicked today
    const clickedToday = await prisma.b2bEmailLinkClick.count({
      where: {
        createdAt: { gte: today },
      },
    });

    // Replied today
    const repliedToday = await prisma.b2bResponse.count({
      where: {
        createdAt: { gte: today },
      },
    });

    return Response.json({
      inCampaign,
      openedToday,
      clickedToday,
      repliedToday,
      openRate: inCampaign > 0 ? Math.round((openedToday / inCampaign) * 100) : 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[EMAIL STATS] Error:", error);
    return Response.json({ error: "Failed to fetch email stats" }, { status: 500 });
  }
}
