/**
 * Get count of new replies that need qualification
 * Used by queue page for smart notification badge
 */

import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk",
];

async function isAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const user = await currentUser();
  return ADMIN_EMAILS.includes(user?.emailAddresses[0]?.emailAddress ?? "");
}

export async function GET(request: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized", replyCount: 0 }, { status: 401 });
    }

    // Count leads that have been emailed but not yet qualified
    // These represent prospects who have received emails and may have replied
    const repliedLeads = await prisma.b2bLead.findMany({
      where: {
        email_sent_at: { not: null }, // Email was sent
        leadState: { not: "qualified" }, // Not yet processed/qualified
      },
      select: { id: true, businessName: true, email: true },
      orderBy: { email_sent_at: "desc" },
      take: 100,
    });

    // This is a simplified count - in a full implementation,
    // would track actual received responses via webhook
    const replyCount = repliedLeads.length;

    return NextResponse.json({
      success: true,
      replyCount,
      message: `${replyCount} new replies need qualification`,
      leadsWithReplies: repliedLeads.slice(0, 5), // Show top 5 for quick view
    });
  } catch (error) {
    console.error("[REPLY-COUNT] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reply count", success: false, replyCount: 0 },
      { status: 500 }
    );
  }
}
