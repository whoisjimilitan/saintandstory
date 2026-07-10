import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk",
];

export async function POST(request: NextRequest) {
  console.log("[MARK SENT] Starting...");

  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { referrerId } = body;

    if (!referrerId) {
      return NextResponse.json(
        { error: "referrerId is required" },
        { status: 400 }
      );
    }

    console.log("[MARK SENT] Updating referrer:", referrerId);

    const updated = await prisma.referrer.update({
      where: { id: referrerId },
      data: {
        sentAt: new Date(),
      },
    });

    console.log("[MARK SENT] ✓ Updated:", updated.id);

    return NextResponse.json({
      success: true,
      referrerId: updated.id,
      sentAt: updated.sentAt,
    });
  } catch (error) {
    console.error("[MARK SENT] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update",
      },
      { status: 500 }
    );
  }
}
