import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const topPressureTypes = await prisma.b2bLead.groupBy({
      by: ["businessCategory"],
      where: {
        createdAt: {
          gte: today,
        },
      },
      _count: true,
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 3,
    });

    const items = topPressureTypes.map((pt) => {
      const category = pt.businessCategory || "Business";
      const count = pt._count;

      return {
        theme: `${category} — Demand Accelerating`,
        description: `${count} newly identified ${category.toLowerCase()} businesses match existing standing order patterns. High-confidence opportunity for immediate outreach.`,
        actionText: "Review Opportunities →",
        actionHref: "/operator/discover",
      };
    });

    if (items.length < 3) {
      items.push({
        theme: "Review Pipeline Status",
        description:
          "Current opportunities in qualification phase require attention. Check pipeline for stalled conversations.",
        actionText: "View Pipeline →",
        actionHref: "/operator/pipeline",
      });
    }

    return NextResponse.json(items.slice(0, 3));
  } catch (error) {
    console.error("[Morning Brief Priority Queue Error]", error);
    return NextResponse.json(
      { error: "Failed to load priority queue" },
      { status: 500 }
    );
  }
}
