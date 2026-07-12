import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface WidgetMessagePayload {
  message: string;
  city: string;
  timestamp: string;
  source: string;
  userAgent: string;
  referrer: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: WidgetMessagePayload = await request.json();

    console.log(`[WIDGET] ════════════════════════════`);
    console.log(`[WIDGET] Message from website`);
    console.log(`[WIDGET] City: ${body.city}`);
    console.log(`[WIDGET] Message: ${body.message}`);
    console.log(`[WIDGET] Referrer: ${body.referrer}`);

    // Store in database for operator dashboard
    const widgetMessage = await prisma.widgetMessage.create({
      data: {
        message: body.message,
        city: body.city,
        userAgent: body.userAgent,
        referrer: body.referrer,
        timestamp: new Date(body.timestamp),
        source: body.source,
      },
    });

    console.log(`[WIDGET] ✓ Logged to database (ID: ${widgetMessage.id})`);

    return NextResponse.json({
      success: true,
      id: widgetMessage.id,
      message: "Message logged",
    });
  } catch (error) {
    console.error("[WIDGET] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to log message",
      },
      { status: 500 }
    );
  }
}
