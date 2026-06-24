import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch prospects for each action queue
    const [readyToQualify, readyToEmail, awaitingReply, readyToClose] = await Promise.all([
      // Queue 1: Ready to Qualify (discovered, not yet qualified)
      prisma.b2bLead.findMany({
        where: {
          pipeline_stage: "discover",
          leadState: "new",
        },
        select: {
          id: true,
          businessName: true,
          city: true,
          email: true,
          createdAt: true,
          confidenceScore: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
      }),

      // Queue 2: Ready to Email (qualified, not yet emailed)
      prisma.b2bLead.findMany({
        where: {
          pipeline_stage: "qualify",
          leadState: "qualified",
        },
        select: {
          id: true,
          businessName: true,
          city: true,
          email: true,
          createdAt: true,
          confidenceScore: true,
        },
        orderBy: {
          confidenceScore: "desc",
        },
        take: 50,
      }),

      // Queue 3: Awaiting Reply (emailed, not yet replied)
      prisma.b2bLead.findMany({
        where: {
          pipeline_stage: "propose",
          leadState: "emailed",
        },
        select: {
          id: true,
          businessName: true,
          city: true,
          email: true,
          email_sent_at: true,
          confidenceScore: true,
        },
        orderBy: {
          email_sent_at: "desc",
        },
        take: 50,
      }),

      // Queue 4: Ready to Close (replied, ready for offer)
      prisma.b2bLead.findMany({
        where: {
          pipeline_stage: "propose",
          leadState: "replied",
        },
        select: {
          id: true,
          businessName: true,
          city: true,
          email: true,
          last_engagement_at: true,
          confidenceScore: true,
        },
        orderBy: {
          last_engagement_at: "desc",
        },
        take: 50,
      }),
    ]);

    return NextResponse.json({
      success: true,
      queues: {
        readyToQualify: {
          count: readyToQualify.length,
          prospects: readyToQualify,
          action: "Review & Qualify",
        },
        readyToEmail: {
          count: readyToEmail.length,
          prospects: readyToEmail,
          action: "Send Emails",
        },
        awaitingReply: {
          count: awaitingReply.length,
          prospects: awaitingReply,
          action: "Follow Up",
        },
        readyToClose: {
          count: readyToClose.length,
          prospects: readyToClose,
          action: "Make Offer",
        },
      },
    });
  } catch (error) {
    console.error("[PIPELINE-QUEUES] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pipeline queues" },
      { status: 500 }
    );
  }
}
