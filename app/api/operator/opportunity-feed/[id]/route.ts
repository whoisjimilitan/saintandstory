import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`[OPPORTUNITY FEED] Updating opportunity: ${params.id}`);

  try {
    const body = await request.json();
    const { approvalAction, emailSubject, emailBody, rejectionReason } = body;

    // Handle approval workflow (approve/reject)
    if (approvalAction === "approve") {
      const updated = await prisma.opportunityFeed.update({
        where: { id: params.id },
        data: {
          approvalStatus: "approved",
          jamesStatus: "pending",
          updatedAt: new Date()
        }
      });

      console.log(`[OPPORTUNITY FEED] Approved: ${params.id}`);

      return NextResponse.json({
        success: true,
        message: "Opportunity approved for sending",
        opportunity: updated
      });
    }

    if (approvalAction === "reject") {
      const updated = await prisma.opportunityFeed.update({
        where: { id: params.id },
        data: {
          approvalStatus: "rejected",
          rejectionReason: rejectionReason || "Rejected by operator",
          updatedAt: new Date()
        }
      });

      console.log(`[OPPORTUNITY FEED] Rejected: ${params.id}`);

      return NextResponse.json({
        success: true,
        message: "Opportunity rejected",
        opportunity: updated
      });
    }

    // Handle email editing (before approval)
    if (emailSubject || emailBody) {
      const updated = await prisma.opportunityFeed.update({
        where: { id: params.id },
        data: {
          emailSubject: emailSubject || undefined,
          emailBody: emailBody || undefined,
          updatedAt: new Date()
        }
      });

      console.log(`[OPPORTUNITY FEED] Updated email content: ${params.id}`);

      return NextResponse.json({
        success: true,
        message: "Email content updated",
        opportunity: updated
      });
    }

    return NextResponse.json(
      { error: "No valid action provided (approvalAction, emailSubject, emailBody)" },
      { status: 400 }
    );
  } catch (error) {
    console.error(`[OPPORTUNITY FEED] Update error: ${params.id}`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`[OPPORTUNITY FEED] Fetching opportunity: ${params.id}`);

  try {
    const opportunity = await prisma.opportunityFeed.findUnique({
      where: { id: params.id }
    });

    if (!opportunity) {
      return NextResponse.json(
        { error: "Opportunity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      opportunity
    });
  } catch (error) {
    console.error(`[OPPORTUNITY FEED] Fetch error: ${params.id}`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
