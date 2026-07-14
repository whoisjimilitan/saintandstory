import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk",
];

export async function DELETE(request: NextRequest) {
  console.log("[REFERRAL DELETE] Starting...");

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

    console.log("[REFERRAL DELETE] Deleting referrer:", referrerId);

    const deleted = await prisma.referrer.delete({
      where: { id: referrerId },
    });

    console.log("[REFERRAL DELETE] ✓ Deleted:", deleted.id);

    return NextResponse.json({
      success: true,
      referrerId: deleted.id,
    });
  } catch (error) {
    console.error("[REFERRAL DELETE] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete",
      },
      { status: 500 }
    );
  }
}
