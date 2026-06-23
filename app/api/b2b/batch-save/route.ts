import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

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

    // Save/create each prospect to database
    const savedIds: string[] = [];
    const errors: string[] = [];

    for (const prospect of prospects) {
      try {
        console.log("[BATCH SAVE] Creating prospect:", prospect.businessName);

        // Generate a new UUID for the database
        const dbId = randomUUID();

        // Store the original search result ID in googlePlaceId field if it's a Google Places ID
        const isGooglePlaceId = prospect.id?.startsWith("ChIJ");

        const created = await prisma.b2bLead.create({
          data: {
            id: dbId,
            businessName: prospect.businessName || "Unknown Business",
            city: prospect.city || "Unknown City",
            businessCategory: prospect.businessCategory || "unknown",
            email: prospect.email,
            googlePlaceId: isGooglePlaceId ? prospect.id : undefined,
            status: "discovered",
            leadState: "new",
          },
        });

        console.log("[BATCH SAVE] Created with DB ID:", created.id);

        // VERIFY it was actually saved by querying it back immediately
        const verify = await prisma.b2bLead.findUnique({
          where: { id: created.id },
        });

        if (verify) {
          console.log("[BATCH SAVE] ✅ VERIFIED - prospect exists in DB:", verify.id);
          savedIds.push(created.id);
        } else {
          console.error("[BATCH SAVE] ❌ VERIFICATION FAILED - created but NOT in DB:", created.id);
          errors.push(`${prospect.businessName}: Created but verification failed`);
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        console.error(`[BATCH SAVE] Failed to save prospect ${prospect.businessName}:`, msg);
        errors.push(`${prospect.businessName}: ${msg}`);
      }
    }

    console.log("[BATCH SAVE] Complete. Saved:", savedIds.length, "Failed:", errors.length);

    if (savedIds.length === 0) {
      return NextResponse.json(
        { error: `Failed to save any prospects. Errors: ${errors.join(", ")}` },
        { status: 400 }
      );
    }

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
