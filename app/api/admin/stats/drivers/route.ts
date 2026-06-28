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
    const totalDrivers = await prisma.driver.count();

    // Active drivers: profileLive = true AND lastSeenAt within last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const driversOnline = await prisma.driver.count({
      where: {
        profileLive: true,
        lastSeenAt: { gte: fifteenMinutesAgo },
      },
    });

    // Available today: lastSeenAt is today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const driversAvailableToday = await prisma.driver.count({
      where: {
        lastSeenAt: { gte: today },
        subscriptionStatus: "active",
      },
    });

    const availabilityPercentage =
      totalDrivers > 0 ? Math.round((driversOnline / totalDrivers) * 100) : 0;

    return Response.json({
      totalDrivers,
      driversOnline,
      driversAvailableToday,
      availabilityPercentage,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[DRIVER STATS] Error:", error);
    return Response.json({ error: "Failed to fetch driver stats" }, { status: 500 });
  }
}
