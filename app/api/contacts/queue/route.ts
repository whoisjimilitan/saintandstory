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
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user?.emailAddresses[0]?.emailAddress ?? "";
    if (!ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log("[CONTACTS QUEUE] Fetching call queue");

    // Get contacts not yet called
    const queue = await prisma.contact.findMany({
      where: {
        status: "not_called",
      },
      orderBy: { createdAt: "desc" },
      take: 50, // Show top 50 to call
    });

    // Get recent calls for context
    const recentCalls = await prisma.callLog.findMany({
      where: { userId },
      orderBy: { calledAt: "desc" },
      take: 10,
      include: { contact: true },
    });

    console.log(
      `[CONTACTS QUEUE] ✓ Found ${queue.length} contacts in queue`
    );

    return NextResponse.json({
      success: true,
      queue,
      recentCalls: recentCalls.map((log) => ({
        id: log.id,
        businessName: log.contact.businessName,
        contactName: log.contact.contactName,
        phone: log.contact.phone,
        status: log.status,
        notes: log.notes,
        calledAt: log.calledAt,
      })),
      queueCount: queue.length,
    });
  } catch (error) {
    console.error("[CONTACTS QUEUE] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch queue",
      },
      { status: 500 }
    );
  }
}
