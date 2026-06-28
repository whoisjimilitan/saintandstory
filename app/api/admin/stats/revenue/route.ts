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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Standing orders created today (from WhatsApp conversations)
    const standingOrdersToday = await prisma.b2bStandingOrder.count({
      where: {
        createdAt: { gte: today },
      },
    });

    // Calculate standing order revenue today
    // Assuming average standing order value (will be calculated from actual data)
    const standingOrdersData = await prisma.b2bStandingOrder.findMany({
      where: {
        createdAt: { gte: today },
      },
      select: {
        price: true,
      },
    });

    const standingOrderRevenue = standingOrdersData.reduce((sum, order) => {
      return sum + (order.price ? Number(order.price) : 0);
    }, 0);

    // Job revenue today (from driver assignments)
    const jobsData = await prisma.job.findMany({
      where: {
        createdAt: { gte: today },
        price: { not: null },
      },
      select: {
        price: true,
      },
    });

    const jobRevenue = jobsData.reduce((sum, job) => {
      return sum + (job.price ? Number(job.price) : 0);
    }, 0);

    const totalRevenue = standingOrderRevenue + jobRevenue;

    return Response.json({
      totalRevenue: `£${totalRevenue.toFixed(2)}`,
      standingOrderRevenue: `£${standingOrderRevenue.toFixed(2)}`,
      jobRevenue: `£${jobRevenue.toFixed(2)}`,
      standingOrdersCount: standingOrdersToday,
      jobsCount: jobsData.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[REVENUE STATS] Error:", error);
    return Response.json({ error: "Failed to fetch revenue stats" }, { status: 500 });
  }
}
