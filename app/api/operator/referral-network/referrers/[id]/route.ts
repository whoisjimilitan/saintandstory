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
      },
      summary: {
        totalEarnings: Number(referrer.totalEarnings),
        monthlyEarnings: Number(referrer.monthlyEarnings),
        totalReferrals: referrer.totalReferrals,
        activeReferrals: referrer.activeReferrals,
      },
      earnings: referrer.earnings.map((e) => ({
        id: e.id,
        amount: Number(e.amount),
        status: e.status,
        jobId: e.jobId,
        month: e.referralMonth,
        createdAt: e.createdAt,
        paidAt: e.paidAt,
      })),
      jobs: referrer.jobs.map((j) => ({
        id: j.id,
        jobId: j.jobId,
        customerName: j.customerName,
        customerPhone: j.customerPhone,
        customerEmail: j.customerEmail,
        jobValue: Number(j.jobValue),
        commission: Number(j.commission),
        status: j.status,
        confirmedAt: j.confirmedAt,
        completedAt: j.completedAt,
        createdAt: j.createdAt,
      })),
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
