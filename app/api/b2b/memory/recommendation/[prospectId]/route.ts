import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ prospectId: string }> }
) {
  try {
    const { prospectId } = await params;

    // Get prospect
    const prospect = await prisma.b2bLead.findUnique({
      where: { id: prospectId as any },
    });

    if (!prospect) {
      return NextResponse.json(
        { error: "Prospect not found" },
        { status: 404 }
      );
    }

    // Get high-confidence memory patterns
    const patterns = await prisma.b2bMemoryPattern.findMany({
      where: {
        confidenceScore: { gte: 50 },
      },
      orderBy: { confidenceScore: "desc" },
    });

    if (patterns.length === 0) {
      return NextResponse.json({
        success: true,
        prospectId,
        recommendation: {
          message: "No high-confidence patterns yet. Continue gathering data.",
          actions: [],
        },
      });
    }

    const actions: string[] = [];
    const bestVariant = patterns.find((p) => p.type === "VARIANT_WINNER");
    const bestPressure = patterns.find((p) => p.type === "PRESSURE_TYPE_WINNER");
    const bestSequence = patterns.find((p) => p.type === "SEQUENCE_PATTERN");

    if (bestVariant) {
      const val = bestVariant.value as any;
      actions.push(
        `Use Variant ${val.variantId} (${val.yesRate}% conversion)`
      );
    }

    if (bestPressure) {
      const val = bestPressure.value as any;
      actions.push(
        `Apply ${val.pressureType} pressure messaging (${val.yesRate}% YES rate)`
      );
    }

    if (bestSequence) {
      const val = bestSequence.value as any;
      actions.push(
        `Follow sequence: ${val.sequence} (${val.successRate}% success)`
      );
    }

    return NextResponse.json({
      success: true,
      prospectId,
      prospect: {
        name: prospect.businessName,
        category: prospect.businessCategory,
      },
      recommendation: {
        message: "Based on system memory, here's what should work:",
        actions,
        confidence: Math.round(
          patterns.reduce((sum, p) => sum + Number(p.confidenceScore), 0) /
            patterns.length
        ),
      },
    });
  } catch (error) {
    console.error("[B2B MEMORY RECOMMENDATION] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendation" },
      { status: 500 }
    );
  }
}
