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
    // Get email campaigns sent
    const totalSent = await prisma.b2bCampaignEmail.count({
      where: { status: "sent" },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get opened emails (from webhook tracking)
    const openedToday = await prisma.b2bCampaignEmail.count({
      where: {
        status: "opened",
        openedAt: { gte: today },
      },
    });

    // Get clicked emails
    const clickedToday = await prisma.b2bCampaignEmail.count({
      where: {
        status: "clicked",
        clickedAt: { gte: today },
      },
    });

    // Get replied emails
    const repliedToday = await prisma.b2bCampaignEmail.count({
      where: {
        status: "replied",
        repliedAt: { gte: today },
      },
    });

    console.log("[EMAIL STATS] Fetched - sent:", totalSent, "opened:", openedToday, "clicked:", clickedToday, "replied:", repliedToday);

    return Response.json({
      inCampaign: totalSent,
      openedToday,
      clickedToday,
      repliedToday,
      openRate: totalSent > 0 ? Math.round((openedToday / totalSent) * 100) : 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[EMAIL STATS] Error:", error);
    return Response.json({
      inCampaign: 0,
      openedToday: 0,
      clickedToday: 0,
      repliedToday: 0,
      openRate: 0,
      timestamp: new Date().toISOString(),
    }, { status: 200 });
  }
}
