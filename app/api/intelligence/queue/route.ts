import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  console.log("[INTELLIGENCE QUEUE] Fetching approval queue");

  try {
    const queue = await prisma.approvalQueue.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    console.log("[INTELLIGENCE QUEUE] Found", queue.length, "pending items");

    return NextResponse.json({
      success: true,
      count: queue.length,
      queue,
    });
  } catch (error) {
    console.error("[INTELLIGENCE QUEUE] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log("[INTELLIGENCE QUEUE] Approving opportunity");

  try {
    const body = await request.json();
    const { queueId, action } = body;

    if (!queueId || !action) {
      return NextResponse.json(
        { error: "queueId and action are required" },
        { status: 400 }
      );
    }

    const queueEntry = await prisma.approvalQueue.findUnique({
      where: { id: queueId },
    });

    if (!queueEntry) {
      return NextResponse.json({ error: "Queue entry not found" }, { status: 404 });
    }

    if (action === "approve") {
      // Mark as approved
      const updated = await prisma.approvalQueue.update({
        where: { id: queueId },
        data: {
          status: "approved",
          approvedAt: new Date(),
        },
      });

      // Get the processed opportunity to send email
      const processed = await prisma.processedOpportunity.findUnique({
        where: { id: queueEntry.processedOpportunityId },
      });

      if (processed) {
        // TODO: Send email via Resend
        // For now, just log
        console.log("[INTELLIGENCE QUEUE] Email would be sent to:", processed.businessName);

        // Mark as sent
        await prisma.processedOpportunity.update({
          where: { id: processed.id },
          data: {
            status: "sent",
            sentAt: new Date(),
          },
        });

        await prisma.approvalQueue.update({
          where: { id: queueId },
          data: { status: "sent", sentAt: new Date() },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Opportunity approved and email queued",
      });
    } else if (action === "reject") {
      const updated = await prisma.approvalQueue.update({
        where: { id: queueId },
        data: {
          status: "rejected",
          rejectedAt: new Date(),
          rejectionReason: body.reason || "Rejected by operator",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Opportunity rejected",
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[INTELLIGENCE QUEUE] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
