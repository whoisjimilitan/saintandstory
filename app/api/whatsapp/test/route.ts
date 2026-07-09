import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk",
];

const META_API_VERSION = "v18.0";
const META_GRAPH_URL = "https://graph.instagram.com";

export async function POST(request: NextRequest) {
  console.log("[WHATSAPP TEST] Starting test");

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
    const { phoneNumber, message } = body;

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: "phoneNumber and message are required" },
        { status: 400 }
      );
    }

    // Get credentials
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    console.log("[WHATSAPP TEST] Checking credentials...");
    console.log("[WHATSAPP TEST] Phone ID present:", !!phoneNumberId);
    console.log("[WHATSAPP TEST] Access Token present:", !!accessToken);

    if (!phoneNumberId || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "WhatsApp credentials not configured",
          debug: {
            phoneNumberId: phoneNumberId ? "SET" : "MISSING",
            accessToken: accessToken ? "SET" : "MISSING",
          },
        },
        { status: 500 }
      );
    }

    // Format phone number
    const cleaned = phoneNumber.replace(/\D/g, "");
    let formattedPhone = cleaned;
    if (cleaned.startsWith("0")) {
      formattedPhone = "44" + cleaned.slice(1);
    } else if (!cleaned.startsWith("44")) {
      formattedPhone = "44" + cleaned;
    }

    console.log("[WHATSAPP TEST] Original:", phoneNumber);
    console.log("[WHATSAPP TEST] Formatted:", formattedPhone);

    // Call Meta API
    const metaUrl = `${META_GRAPH_URL}/${META_API_VERSION}/${phoneNumberId}/messages`;
    console.log("[WHATSAPP TEST] Calling Meta API...");

    const metaResponse = await fetch(metaUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "text",
        text: {
          body: message,
        },
      }),
    });

    const metaData = await metaResponse.json();

    console.log("[WHATSAPP TEST] Response status:", metaResponse.status);
    console.log("[WHATSAPP TEST] Response data:", JSON.stringify(metaData, null, 2));

    if (!metaResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Meta API error",
          status: metaResponse.status,
          debug: metaData,
        },
        { status: metaResponse.status }
      );
    }

    const messageId = metaData.messages?.[0]?.id;

    return NextResponse.json({
      success: true,
      messageId,
      formattedPhone,
      message: "WhatsApp test message sent successfully",
    });
  } catch (error) {
    console.error("[WHATSAPP TEST] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
