import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/operator/referral-network/referrers
 * Returns all referrers with their earnings and activity
 * Query params: ?status=active|inactive|all (default: all)
 */

export async function GET(request: NextRequest) {
  try {
    console.log("[REFERRAL REFERRERS] Fetching all referrers");

    const { userId } = await auth();
    if (!userId) {
      console.error("[REFERRAL REFERRERS] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status") || "all";

    // Build where clause
    const whereClause =
      statusFilter === "all"
        ? {}
        : { status: statusFilter };

    console.log("[REFERRAL REFERRERS] Fetching with filter:", statusFilter);

    // Get all referrers with their stats
    const referrers = await prisma.referrer.findMany({
      where: whereClause,
      include: {
        earnings: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5, // Last 5 earnings
        },
        jobs: {
          select: {
            id: true,
            jobId: true,
            commission: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5, // Last 5 jobs
        },
      },
      orderBy: [
        { lastActiveAt: "desc" },
        { createdAt: "desc" },
      ],
    });

    console.log(`[REFERRAL REFERRERS] Found ${referrers.length} referrers`);

    // Transform and enrich data
    const enrichedReferrers = referrers.map((referrer) => {
      const pendingEarnings = referrer.earnings
        .filter((e) => e.status === "pending")
        .reduce((sum, e) => sum + Number(e.amount), 0);

      const pendingJobs = referrer.jobs.filter(
        (j) => j.status === "new" || j.status === "confirmed"
      ).length;

      return {
        id: referrer.id,
        name: referrer.officeManagerName,
        office: referrer.officeName,
        city: referrer.city,
        code: referrer.referralCode,
        phone: referrer.phone,
        category: referrer.category,
        status: referrer.status,
        whatsappStatus: referrer.whatsappStatus,
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
        commission: Number(referrer.commission),
        whatsappJoinedAt: referrer.whatsappJoinedAt,
        lastActiveAt: referrer.lastActiveAt,
        createdAt: referrer.createdAt,
      };
    });

    console.log("[REFERRAL REFERRERS] ✓ Data enriched and returned");

    return NextResponse.json({
      success: true,
      count: enrichedReferrers.length,
      referrers: enrichedReferrers,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[REFERRAL REFERRERS] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch referrers" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/operator/referral-network/referrers
 * Update referrer status
 * Body: { referrerId, status: "active" | "inactive" | "paused" }
 */
export async function PATCH(request: NextRequest) {
  try {
    console.log("[REFERRAL REFERRERS PATCH] Updating referrer");

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { referrerId, status } = await request.json();

    if (!referrerId || !status) {
      return NextResponse.json(
        { error: "referrerId and status required" },
        { status: 400 }
      );
    }

    const updatedReferrer = await prisma.referrer.update({
      where: { id: referrerId },
      data: { status },
    });

    console.log(`[REFERRAL REFERRERS PATCH] ✓ Referrer ${referrerId} updated to ${status}`);

    return NextResponse.json({
      success: true,
      referrer: updatedReferrer,
    });
  } catch (error) {
    console.error("[REFERRAL REFERRERS PATCH] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update referrer" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/operator/referral-network/referrers
 * Delete a referrer
 * Body: { referrerId }
 */
export async function DELETE(request: NextRequest) {
  try {
    console.log("[REFERRAL REFERRERS DELETE] Deleting referrer");

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { referrerId } = await request.json();

    if (!referrerId) {
      return NextResponse.json(
        { error: "referrerId required" },
        { status: 400 }
      );
    }

    await prisma.referrer.delete({
      where: { id: referrerId },
    });

    console.log(`[REFERRAL REFERRERS DELETE] ✓ Referrer ${referrerId} deleted`);

    return NextResponse.json({
      success: true,
      message: "Referrer deleted",
    });
  } catch (error) {
    console.error("[REFERRAL REFERRERS DELETE] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete referrer" },
      { status: 500 }
    );
  }
}
