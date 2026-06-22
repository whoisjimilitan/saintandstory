import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { prospects } = await request.json();

    if (!prospects || !Array.isArray(prospects) || prospects.length === 0) {
      return NextResponse.json(
        { error: "Invalid prospects array" },
        { status: 400 }
      );
    }

    // Save/upsert each prospect to database
    const savedIds: string[] = [];

    for (const prospect of prospects) {
      try {
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
      } catch (error) {
        console.error(`Failed to save prospect ${prospect.id}:`, error);
        // Continue with other prospects even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      count: savedIds.length,
      savedIds,
    });
  } catch (error) {
    console.error("[BATCH SAVE] Error:", error);
    return NextResponse.json(
      { error: "Failed to save prospects" },
      { status: 500 }
    );
  }
}
