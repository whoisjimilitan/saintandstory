import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  console.log("[TESTING] Simulate reply endpoint");

  try {
    // Get the first unsent campaign email
    const email = await prisma.b2bCampaignEmail.findFirst({
      where: {
        status: "sent",
        repliedAt: null,
      },
    });

    if (!email) {
      return NextResponse.json(
        { error: "No unsent emails found. Send a campaign first." },
        { status: 404 }
      );
    }

    // Simulate a reply by setting repliedAt
    const updated = await prisma.b2bCampaignEmail.update({
      where: { id: email.id },
      data: {
        repliedAt: new Date(),
        status: "replied",
      },
    });

    console.log(`[TESTING] ✓ Simulated reply for ${updated.prospectEmail}`);

    return NextResponse.json({
      success: true,
      message: `Simulated reply from ${updated.prospectEmail}`,
      email: updated,
    });
  } catch (error) {
    console.error("[TESTING] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error" },
      { status: 500 }
    );
  }
}
