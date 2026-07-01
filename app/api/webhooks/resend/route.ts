import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  console.log("[RESEND WEBHOOK] Received event");

  try {
    const event = await request.json();
    const { type, data } = event;

    console.log(`[RESEND WEBHOOK] Event type: ${type}`);

    // Handle email opened
    if (type === "email.opened") {
      const { id, recipient } = data;
      console.log(`[RESEND WEBHOOK] Email opened: ${recipient}`);

      await prisma.b2bCampaignEmail.updateMany({
        where: { resendMessageId: id },
        data: { openedAt: new Date(), status: "opened" },
      });

      return NextResponse.json({ success: true });
    }

    // Handle email clicked
    if (type === "email.clicked") {
      const { id, recipient } = data;
      console.log(`[RESEND WEBHOOK] Email clicked: ${recipient}`);

      await prisma.b2bCampaignEmail.updateMany({
        where: { resendMessageId: id },
        data: { clickedAt: new Date(), status: "clicked" },
      });

      return NextResponse.json({ success: true });
    }

    // Handle email replied (CRITICAL - THIS COMPLETES THE LOOP)
    if (type === "email.replied") {
      const { id, recipient } = data;
      console.log(`[RESEND WEBHOOK] ✓ EMAIL REPLIED: ${recipient}`);

      // Set repliedAt timestamp - this is what populates RESPONSES page
      const updated = await prisma.b2bCampaignEmail.updateMany({
        where: { resendMessageId: id },
        data: {
          repliedAt: new Date(),
          status: "replied"
        },
      });

      console.log(`[RESEND WEBHOOK] ✓ Updated ${updated.count} records with repliedAt`);

      return NextResponse.json({ success: true, updated });
    }

    // Handle email bounced
    if (type === "email.bounced") {
      const { id, recipient } = data;
      console.log(`[RESEND WEBHOOK] Email bounced: ${recipient}`);

      await prisma.b2bCampaignEmail.updateMany({
        where: { resendMessageId: id },
        data: { status: "bounced" },
      });

      return NextResponse.json({ success: true });
    }

    console.log(`[RESEND WEBHOOK] Unhandled event type: ${type}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[RESEND WEBHOOK] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook error" },
      { status: 500 }
    );
  }
}
