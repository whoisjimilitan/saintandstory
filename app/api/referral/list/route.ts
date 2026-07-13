import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk",
];

export async function GET(request: NextRequest) {
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
    console.log("[REFERRAL LIST] Fetching all referrers...");

    const referrers = await prisma.referrer.findMany({
      orderBy: { createdAt: "desc" },
    });

    const pending = referrers.filter((r) => !r.sentAt);
    const sent = referrers.filter((r) => r.sentAt);

    console.log(`[REFERRAL LIST] Found ${pending.length} pending, ${sent.length} sent`);

    return NextResponse.json({
      success: true,
      pending: pending.map((r) => ({
        id: r.id,
        name: r.officeManagerName,
        office: r.officeName,
        phone: r.phone,
        city: r.city,
        code: r.referralCode,
        createdAt: r.createdAt,
      })),
      sent: sent.map((r) => ({
        id: r.id,
        name: r.officeManagerName,
        office: r.officeName,
        phone: r.phone,
        city: r.city,
        code: r.referralCode,
        createdAt: r.createdAt,
        sentAt: r.sentAt,
      })),
    });
  } catch (error) {
    console.error("[REFERRAL LIST] Error:", error);
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("[REFERRAL LIST] Full error message:", errorMsg);
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        details: error instanceof Error ? error.stack : "No stack trace",
      },
      { status: 500 }
    );
  }
}
