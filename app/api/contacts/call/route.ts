import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk",
];

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { contactId, status, notes } = body;

    if (!contactId || !status) {
      return NextResponse.json(
        { error: "contactId and status required" },
        { status: 400 }
      );
    }

    console.log(
      `[CONTACTS CALL] Logging call for contact ${contactId}: ${status}`
    );

    // Create call log
    const callLog = await prisma.callLog.create({
      data: {
        contactId,
        userId,
        status,
        notes,
        calledAt: new Date(),
      },
    });

    // Update contact status
    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        status,
        lastCalledAt: new Date(),
      },
    });

    console.log(
      `[CONTACTS CALL] ✓ Call logged, contact status: ${status}`
    );

    return NextResponse.json({
      success: true,
      callLog,
      contact: updatedContact,
      message: `Contact marked as ${status}`,
    });
  } catch (error) {
    console.error("[CONTACTS CALL] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to log call",
      },
      { status: 500 }
    );
  }
}
