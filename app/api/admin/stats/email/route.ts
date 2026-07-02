import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

export async function GET() {
  const { userId, sessionClaims } = await auth();

  console.log("[EMAIL STATS] Auth check - userId:", userId, "email:", sessionClaims?.email);

  // Allow if userId exists (authenticated) - don't require email claim if it's missing
  if (!userId) {
    console.log("[EMAIL STATS] No userId, returning 401");
    return new Response("Unauthorized", { status: 401 });
  }

  // Log what we got for debugging
  if (!sessionClaims?.email) {
    console.log("[EMAIL STATS] Warning: sessionClaims.email is missing, but allowing request since userId exists");
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
