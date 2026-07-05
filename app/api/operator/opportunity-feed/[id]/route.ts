import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("[OPPORTUNITY FEED] Updating opportunity:", params.id);

  try {
    const body = await request.json();
    const { emailSubject, emailBody } = body;

    if (!emailSubject || !emailBody) {
      return NextResponse.json(
        { error: "emailSubject and emailBody are required" },
        { status: 400 }
      );
    }

    // Update the opportunity
    const updated = await prisma.opportunityFeed.update({
      where: { id: params.id },
      data: {
        emailSubject,
        emailBody,
        updatedAt: new Date(),
      },
    });

    console.log("[OPPORTUNITY FEED] Updated successfully:", params.id);

    return NextResponse.json({
      success: true,
      opportunity: updated,
    });
  } catch (error) {
    console.error("[OPPORTUNITY FEED] Update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
