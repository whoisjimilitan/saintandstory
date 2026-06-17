import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get all B2B leads
    const totalLeads = await prisma.b2bLead.count();

    // Get leads by status
    const leadsByStatus = await prisma.b2bLead.groupBy({
      by: ["status"],
      _count: true,
    });

    // Get outreach statistics
    const totalOutreach = await prisma.b2bOutreach.count();
    const sentOutreach = await prisma.b2bOutreach.count({
      where: { sentAt: { not: null } },
    });
    const repliedOutreach = await prisma.b2bOutreach.count({
      where: { replied: true },
    });

    // Calculate reply rate
    const replyRate = sentOutreach > 0 ? (repliedOutreach / sentOutreach) * 100 : 0;

    const metrics = {
      leads: {
        total: totalLeads,
        byStatus: leadsByStatus.reduce(
          (acc, item) => ({
            ...acc,
            [item.status || "unknown"]: item._count,
          }),
          {}
        ),
      },
      outreach: {
        total: totalOutreach,
        sent: sentOutreach,
        replied: repliedOutreach,
        replyRate: Math.round(replyRate * 100) / 100,
      },
    };

    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error("[B2B METRICS] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
