import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/operator/referral-network/stats
 * Returns comprehensive referral network statistics
 */

export async function GET(request: NextRequest) {
  try {
    console.log("[REFERRAL STATS] Fetching comprehensive referral network stats");

    const { userId } = await auth();
    if (!userId) {
      console.error("[REFERRAL STATS] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Total referrers
    const totalReferrers = await prisma.referrer.count();
    const activeReferrers = await prisma.referrer.count({
      where: { status: "active" },
    });
    const inactiveReferrers = await prisma.referrer.count({
      where: { status: { in: ["inactive", "paused"] } },
    });

    // Earnings
    const allEarnings = await prisma.referrerEarning.aggregate({
      _sum: { amount: true },
    });
    const totalEarningsPaid = Number(allEarnings._sum.amount || 0);

    // This month earnings
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEarnings = await prisma.referrerEarning.aggregate({
      where: {
        createdAt: { gte: monthStart },
      },
      _sum: { amount: true },
    });
    const monthTotal = Number(thisMonthEarnings._sum.amount || 0);

    // Total referrals processed
    const totalReferrals = await prisma.referralJob.count();
    const completedReferrals = await prisma.referralJob.count({
      where: { status: "completed" },
    });
    const pendingReferrals = await prisma.referralJob.count({
      where: { status: { in: ["new", "confirmed"] } },
    });

    // Average commission
    const avgCommission =
      totalReferrals > 0
        ? Number(totalEarningsPaid) / totalReferrals
        : 0;

    // WhatsApp status breakdown
    const whatsappActive = await prisma.referrer.count({
      where: { whatsappStatus: "active" },
    });
    const whatsappPending = await prisma.referrer.count({
      where: { whatsappStatus: "pending" },
    });

    console.log("[REFERRAL STATS] ✓ Stats calculated successfully");

    return NextResponse.json({
      success: true,
      referrers: {
        total: totalReferrers,
        active: activeReferrers,
        inactive: inactiveReferrers,
      },
      earnings: {
        totalPaid: totalEarningsPaid,
        thisMonth: monthTotal,
        avgPerReferral: avgCommission,
      },
      referrals: {
        total: totalReferrals,
        completed: completedReferrals,
        pending: pendingReferrals,
      },
      whatsapp: {
        active: whatsappActive,
        pending: whatsappPending,
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[REFERRAL STATS] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
