import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { prospectIds } = await request.json();

    if (!prospectIds || !Array.isArray(prospectIds) || prospectIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid prospectIds array" },
        { status: 400 }
      );
    }

    // Update all prospects to qualified stage
    const updated = await prisma.b2bLead.updateMany({
      where: {
        id: { in: prospectIds },
      },
      data: {
        status: "qualified",
        leadState: "qualified",
      },
    });

    return NextResponse.json({
      success: true,
      qualified: updated.count,
      prospectIds,
    });
  } catch (error) {
    console.error("[BATCH QUALIFY] Error:", error);
    return NextResponse.json(
      { error: "Failed to qualify prospects" },
      { status: 500 }
    );
  }
}
