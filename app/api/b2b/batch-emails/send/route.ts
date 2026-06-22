import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface EmailToSend {
  prospectId: string;
  subject: string;
  body: string;
  toEmail?: string;
}

export async function POST(request: Request) {
  try {
    const { emails } = await request.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: "Invalid emails array" },
        { status: 400 }
      );
    }

    const sent: Array<{ prospectId: string; success: boolean }> = [];

    // Process each email
    for (const email of emails) {
      try {
        // Fetch prospect to get email address
        const prospect = await prisma.b2bLead.findUnique({
          where: { id: email.prospectId },
          select: { id: true, email: true, businessName: true },
        });

        if (!prospect?.email) {
          sent.push({ prospectId: email.prospectId, success: false });
          continue;
        }

        // TODO: Send email via actual email service (Resend, SendGrid, etc.)
        // For now, we'll just record the intent
        console.log(`[EMAIL SEND] To: ${prospect.email}, Subject: ${email.subject}`);

        // Update prospect record
        await prisma.b2bLead.update({
          where: { id: email.prospectId },
          data: {
            pipeline_stage: "propose",
            leadState: "emailed",
            last_engagement_at: new Date(),
            notes: `Email sent: "${email.subject}"`,
          },
        });

        sent.push({ prospectId: email.prospectId, success: true });
      } catch (error) {
        console.error(`[EMAIL SEND] Failed for ${email.prospectId}:`, error);
        sent.push({ prospectId: email.prospectId, success: false });
      }
    }

    const successCount = sent.filter((s) => s.success).length;

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: sent.length - successCount,
      results: sent,
    });
  } catch (error) {
    console.error("[BATCH EMAIL SEND] Error:", error);
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    );
  }
}
