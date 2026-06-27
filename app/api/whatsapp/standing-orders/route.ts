import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { linkConversationToStandingOrder } from "@/lib/whatsapp-conversation";

/**
 * POST /api/whatsapp/standing-orders
 *
 * Create standing order from WhatsApp conversation
 *
 * REQUEST BODY:
 * {
 *   "conversationId": string
 *   "phoneNumber": string
 *   "businessName": string
 *   "frequency": "daily" | "weekly" | "biweekly" | "monthly"
 *   "price": number
 *   "postcode": string
 * }
 *
 * RESPONSE:
 * {
 *   "success": boolean
 *   "standingOrderId": string
 *   "businessName": string
 * }
 */

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk",
];

export async function POST(request: NextRequest) {
  console.log("[STANDING ORDER] Creating from WhatsApp conversation");

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
    const body = await request.json();
    const {
      conversationId,
      phoneNumber,
      businessName,
      frequency,
      price,
      postcode,
    } = body;

    if (!conversationId || !phoneNumber || !businessName || !frequency || !price || !postcode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate standing order ID
    const standingOrderId = `so_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // TODO: Create in database
    // INSERT INTO b2b_standing_orders (id, phone, frequency, price, postcode, whatsapp_conversation_id, created_at)
    // VALUES (standingOrderId, phoneNumber, frequency, price, postcode, conversationId, NOW())

    // Link conversation to standing order
    linkConversationToStandingOrder(conversationId, standingOrderId);

    console.log(`[STANDING ORDER] Created: ${standingOrderId} for ${businessName}`);

    // Audit logging
    try {
      await fetch("/api/audit/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "standing_order_created_from_whatsapp",
          details: {
            standingOrderId,
            conversationId,
            phoneNumber,
            businessName,
            frequency,
            price,
            postcode,
          },
        }),
      }).catch(() => {
        // Silently fail
      });
    } catch (auditError) {
      // Continue
    }

    return NextResponse.json({
      success: true,
      standingOrderId,
      businessName,
      frequency,
      price,
      postcode,
    });
  } catch (error) {
    console.error("[STANDING ORDER] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create standing order",
      },
      { status: 500 }
    );
  }
}
