import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const counts = await prisma.b2bLead.groupBy({
      by: ["leadState"],
      where: {
        createdAt: {
          gte: today,
        },
      },
      _count: true,
    });

    const countMap = new Map(
      counts.map((c) => [c.leadState || "new", c._count])
    );

    const stages = [
      { name: "Discover", count: countMap.get("new") || 0 },
      { name: "Enrich", count: countMap.get("recognised") || 0 },
      { name: "Qualify", count: countMap.get("understood") || 0 },
      { name: "Learn", count: countMap.get("prioritised") || 0 },
      { name: "Improve", count: countMap.get("activated") || 0 },
    ];

    return NextResponse.json(stages);
  } catch (error) {
    console.error("[Morning Brief Knowledge Loop Error]", error);
    return NextResponse.json(
      { error: "Failed to load knowledge loop" },
      { status: 500 }
    );
  }
}
