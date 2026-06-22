import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { prospects } = await request.json();

    console.log("[BATCH SAVE] Received:", prospects?.length, "prospects");

    if (!prospects || !Array.isArray(prospects) || prospects.length === 0) {
      console.error("[BATCH SAVE] Invalid prospects array");
      return NextResponse.json(
        { error: "Invalid prospects array" },
        { status: 400 }
      );
    }

    // Save/upsert each prospect to database
    const savedIds: string[] = [];
    const errors: string[] = [];

    for (const prospect of prospects) {
      try {
        console.log("[BATCH SAVE] Upserting prospect:", prospect.id, prospect.businessName);

        const saved = await prisma.b2bLead.upsert({
          where: { id: prospect.id },
          update: {
            // Update with any new data
            businessName: prospect.businessName,
            city: prospect.city,
            businessCategory: prospect.businessCategory,
            email: prospect.email,
          },
          create: {
            id: prospect.id,
            businessName: prospect.businessName || "Unknown Business",
            city: prospect.city || "Unknown City",
            businessCategory: prospect.businessCategory || "unknown",
            email: prospect.email,
            status: "discovered",
            leadState: "new",
          },
        });

        savedIds.push(saved.id);
        console.log("[BATCH SAVE] Saved:", saved.id);
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        console.error(`[BATCH SAVE] Failed to save prospect ${prospect.id}:`, msg);
        errors.push(`${prospect.id}: ${msg}`);
      }
    }

    console.log("[BATCH SAVE] Complete. Saved:", savedIds.length, "Failed:", errors.length);

    return NextResponse.json({
      success: true,
      count: savedIds.length,
      savedIds,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[BATCH SAVE] Error:", msg);
    return NextResponse.json(
      { error: `Failed to save prospects: ${msg}` },
      { status: 500 }
    );
  }
}
