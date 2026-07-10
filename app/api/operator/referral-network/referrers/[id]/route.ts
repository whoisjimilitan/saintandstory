import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/operator/referral-network/referrers/[id]
 * Get detailed information about a specific referrer
 * Includes all earnings, jobs, and activity
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log("[REFERRAL REFERRER DETAIL] Fetching referrer:", id);

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get referrer with all relations
    const referrer = await prisma.referrer.findUnique({
      where: { id },
      include: {
        earnings: {
          orderBy: { createdAt: "desc" },
        },
        jobs: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!referrer) {
      console.error("[REFERRAL REFERRER DETAIL] Referrer not found:", id);
      return NextResponse.json(
        { error: "Referrer not found" },
        { status: 404 }
      );
    }

    // Calculate monthly breakdown
    const monthlyBreakdown: Record<string, { earnings: number; referrals: number }> = {};
    referrer.earnings.forEach((earning) => {
      const month = earning.referralMonth.toISOString().split("T")[0];
      if (!monthlyBreakdown[month]) {
        monthlyBreakdown[month] = { earnings: 0, referrals: 0 };
      }
      monthlyBreakdown[month].earnings += Number(earning.amount);
    });

    referrer.jobs.forEach((job) => {
      const month = job.createdAt.toISOString().split("T")[0];
      if (!monthlyBreakdown[month]) {
        monthlyBreakdown[month] = { earnings: 0, referrals: 0 };
      }
      monthlyBreakdown[month].referrals += 1;
    });

    console.log("[REFERRAL REFERRER DETAIL] ✓ Data retrieved successfully");

    // Calculate pending earnings
    const pendingEarnings = referrer.earnings
      .filter((e) => e.status === "pending")
      .reduce((sum, e) => sum + Number(e.amount), 0);

    // Calculate pending jobs
    const pendingJobs = referrer.jobs.filter(
      (j) => j.status === "new" || j.status === "confirmed"
    ).length;

    return NextResponse.json({
      success: true,
      referrer: {
        id: referrer.id,
        name: referrer.officeManagerName,
        office: referrer.officeName,
        city: referrer.city,
        phone: referrer.phone,
        code: referrer.referralCode,
        category: referrer.category,
        status: referrer.status,
        whatsappStatus: referrer.whatsappStatus,
        commission: Number(referrer.commission),
        createdAt: referrer.createdAt,
        updatedAt: referrer.updatedAt,
        whatsappJoinedAt: referrer.whatsappJoinedAt,
        lastActiveAt: referrer.lastActiveAt,
        earnings: {
          total: Number(referrer.totalEarnings),
          thisMonth: Number(referrer.monthlyEarnings),
          pending: pendingEarnings,
          recentEarnings: referrer.earnings.slice(0, 3).map((e) => ({
            id: e.id,
            amount: Number(e.amount),
            status: e.status,
            date: e.createdAt,
          })),
        },
        referrals: {
          total: referrer.totalReferrals,
          active: referrer.activeReferrals,
          pending: pendingJobs,
          recentJobs: referrer.jobs.slice(0, 3).map((j) => ({
            id: j.id,
            jobId: j.jobId,
            commission: Number(j.commission),
            status: j.status,
            date: j.createdAt,
          })),
        },
      },
      monthlyBreakdown,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[REFERRAL REFERRER DETAIL] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch referrer details" },
      { status: 500 }
    );
  }
}
