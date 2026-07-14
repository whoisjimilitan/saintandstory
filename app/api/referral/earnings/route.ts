import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Referrer Earnings Dashboard API
 * GET /api/referral/earnings?code=SH-EMMA-9254
 *
 * Returns: Real-time earnings, referrals sent, pending payouts
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const referralCode = searchParams.get("code");

    if (!referralCode) {
      console.error("[REFERRAL EARNINGS] Missing referral code");
      return NextResponse.json(
        { error: "Missing referral code" },
        { status: 400 }
      );
    }

    console.log("[REFERRAL EARNINGS] Fetching earnings for code:", referralCode);

    // Get referrer
    const referrer = await prisma.referrer.findUnique({
      where: { referralCode },
      include: {
        earnings: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        jobs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!referrer) {
      console.error("[REFERRAL EARNINGS] Referrer not found:", referralCode);
      return NextResponse.json(
        { error: "Referrer not found" },
        { status: 404 }
      );
    }

    // Calculate month-to-date earnings
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyEarnings = await prisma.referrerEarning.aggregate({
      where: {
        referrerId: referrer.id,
        createdAt: {
          gte: monthStart,
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // Calculate pending earnings (unconfirmed jobs)
    const pendingJobs = await prisma.referralJob.findMany({
      where: {
        referrerId: referrer.id,
        status: { in: ["new", "confirmed"] },
      },
    });

    const pendingAmount = pendingJobs.reduce(
      (sum, job) => sum + Number(job.commission),
      0
    );

    // Get recent jobs (all statuses) for dashboard display
    const recentJobsData = await prisma.referralJob.findMany({
      where: {
        referrerId: referrer.id,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    console.log("[REFERRAL EARNINGS] ✓ Earnings fetched successfully");

    return NextResponse.json({
      success: true,
      referrer: {
        id: referrer.id,
        name: referrer.officeManagerName,
        office: referrer.officeName,
        city: referrer.city,
        code: referrer.referralCode,
        status: referrer.status,
        whatsappStatus: referrer.whatsappStatus,
      },
      earnings: {
        total: Number(referrer.totalEarnings),
        thisMonth: Number(monthlyEarnings._sum.amount || 0),
        pending: pendingAmount,
        lastUpdated: new Date(),
      },
      referrals: {
        total: referrer.totalReferrals,
        active: referrer.activeReferrals,
        thisMonth: monthlyEarnings._count,
        pending: pendingJobs.length,
      },
      recentJobs: recentJobsData.map((job) => ({
        id: job.id,
        customer: job.customerName,
        value: Number(job.jobValue),
        commission: Number(job.commission),
        status: job.status,
        createdAt: job.createdAt,
      })),
      commission: Number(referrer.commission),
      nextPayoutDate: getNextPayoutDate(),
    });
  } catch (error) {
    console.error("[REFERRAL EARNINGS] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch earnings" },
      { status: 500 }
    );
  }
}

function getNextPayoutDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString().split("T")[0];
}
