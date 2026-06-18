import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const patterns = await prisma.b2bMemoryPattern.findMany({
      orderBy: { confidenceScore: "desc" },
      include: {
        memoryLogs: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: patterns.length,
      patterns: patterns.map((p) => ({
        id: p.id,
        type: p.type,
        key: p.key,
        value: p.value,
        confidenceScore: p.confidenceScore,
        evidenceCount: p.evidenceCount,
        campaignId: p.campaignId,
        lastUpdated: p.updatedAt,
        logs: p.memoryLogs,
      })),
    });
  } catch (error) {
    console.error("[B2B MEMORY PATTERNS] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch memory patterns" },
      { status: 500 }
    );
  }
}
