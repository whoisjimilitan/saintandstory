import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { prospectIds, prospectData } = await request.json();

    if (!prospectIds || !Array.isArray(prospectIds) || prospectIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid prospectIds array" },
        { status: 400 }
      );
    }

    // If prospectData is provided (from search results), save them first
    if (prospectData && Array.isArray(prospectData) && prospectData.length > 0) {
      // Upsert prospects - create if doesn't exist, update if does
      for (const prospect of prospectData) {
        await prisma.b2bLead.upsert({
          where: { id: prospect.id },
          update: {
            status: "qualified",
            leadState: "qualified",
          },
          create: {
            id: prospect.id,
            businessName: prospect.businessName || "Unknown Business",
            city: prospect.city || "Unknown City",
            businessCategory: prospect.businessCategory || "unknown",
            email: prospect.email,
            status: "qualified",
            leadState: "qualified",
          },
        });
      }

      return NextResponse.json({
        success: true,
        qualified: prospectData.length,
        prospectIds,
      });
    }

    // Otherwise update existing prospects in database
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
