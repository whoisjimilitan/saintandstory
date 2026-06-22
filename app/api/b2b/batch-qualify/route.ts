import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { prospectIds } = await request.json();

    console.log("[QUALIFY] Received prospectIds:", prospectIds);

    if (!prospectIds || !Array.isArray(prospectIds) || prospectIds.length === 0) {
      console.error("[QUALIFY] Invalid prospectIds");
      return NextResponse.json(
        { error: "Invalid prospectIds array" },
        { status: 400 }
      );
    }

    console.log("[QUALIFY] Updating", prospectIds.length, "prospects to qualified...");

    // Update all prospects to qualified status
    const updated = await prisma.b2bLead.updateMany({
      where: {
        id: { in: prospectIds },
      },
      data: {
        status: "qualified",
        leadState: "qualified",
      },
    });

    console.log("[QUALIFY] Updated", updated.count, "prospects");

    return NextResponse.json({
      success: true,
      qualified: updated.count,
      prospectIds,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[BATCH QUALIFY] Error:", msg);
    return NextResponse.json(
      { error: `Failed to qualify prospects: ${msg}` },
      { status: 500 }
    );
  }
}
