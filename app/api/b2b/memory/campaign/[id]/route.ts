import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

    const patterns = await prisma.b2bMemoryPattern.findMany({
      where: { campaignId },
      orderBy: { confidenceScore: "desc" },
    });

    // Separate by type
    const bestVariant = patterns.find((p) => p.type === "VARIANT_WINNER");
    const bestPressureType = patterns.find((p) => p.type === "PRESSURE_TYPE_WINNER");
    const bestSequences = patterns.filter((p) => p.type === "SEQUENCE_PATTERN");

    const bestVariantData = bestVariant ? {
      variantId: (bestVariant.value as any).variantId,
      yesRate: (bestVariant.value as any).yesRate,
      confidence: Number(bestVariant.confidenceScore),
    } : null;

    const bestPressureTypeData = bestPressureType ? {
      type: (bestPressureType.value as any).pressureType,
      yesRate: (bestPressureType.value as any).yesRate,
      confidence: Number(bestPressureType.confidenceScore),
    } : null;

    return NextResponse.json({
      success: true,
      campaignId,
      memory: {
        bestVariant: bestVariantData,
        bestPressureType: bestPressureTypeData,
        bestSequences: bestSequences.map((p) => ({
          sequence: (p.value as any).sequence,
          successRate: (p.value as any).successRate,
          confidence: Number(p.confidenceScore),
        })),
      },
    });
  } catch (error) {
    console.error("[B2B MEMORY CAMPAIGN] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign memory" },
      { status: 500 }
    );
  }
}
