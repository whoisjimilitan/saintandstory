import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch sent emails with prospect details
    const sentEmails = await prisma.b2bOutreach.findMany({
      where: {
        sentAt: { not: null }
      },
      include: {
        lead: {
          select: {
            id: true,
            businessName: true,
            email: true,
            city: true,
            status: true,
            engagement_score: true
          }
        }
      },
      orderBy: { sentAt: "desc" },
      take: limit,
      skip: offset
    });

    const total = await prisma.b2bOutreach.count({
      where: { sentAt: { not: null } }
    });

    return NextResponse.json({
      success: true,
      sentEmails: sentEmails.map(email => ({
        id: email.id,
        leadId: email.leadId,
        prospectName: email.lead.businessName,
        prospectEmail: email.lead.email,
        city: email.lead.city,
        subject: email.subject,
        sentAt: email.sentAt,
        replied: email.replied,
        repliedAt: email.repliedAt,
        resendMessageId: email.resendMessageId,
        engagementScore: email.lead.engagement_score,
        status: email.lead.status
      })),
      total,
      limit,
      offset
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[SENT EMAILS] Error:", msg);
    return NextResponse.json(
      { error: "Failed to fetch sent emails" },
      { status: 500 }
    );
  }
}
