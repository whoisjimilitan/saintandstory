import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const prospects = await prisma.b2bLead.findMany({
      select: {
        id: true,
        businessName: true,
        businessCategory: true,
        email: true,
        status: true,
        leadState: true,
        pipeline_stage: true,
        city: true,
        createdAt: true,
        last_engagement_at: true,
        engagement_score: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Map to consistent structure with 'stage' field
    const mapped = prospects.map((p: any) => ({
      id: p.id,
      businessName: p.businessName,
      contactName: p.businessCategory,
      stage: p.pipeline_stage || p.leadState || "discover",
      confidenceScore: p.engagement_score || 0,
      lastActivity: p.last_engagement_at || p.createdAt,
      createdAt: p.createdAt,
      status: p.status,
    }));

    return NextResponse.json({
      success: true,
      prospects: mapped,
      count: mapped.length,
    });
  } catch (error) {
    console.error("[B2B PROSPECTS] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch prospects" },
      { status: 500 }
    );
  }
}
