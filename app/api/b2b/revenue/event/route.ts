import { NextResponse } from "next/server";
import { recordRevenueEvent } from "@/lib/b2b-revenue-attribution";

interface RevenueEventRequest {
  leadId: string;
  type: "CONVERSION" | "PAYMENT" | "DEAL_WON" | "DEAL_LOST";
  value: number;
  currency?: string;
  campaignId?: string;
  linkedMemoryPatternId?: string;
  metadata?: any;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RevenueEventRequest;

    if (!body.leadId || !body.type || !body.value) {
      return NextResponse.json(
        { error: "Missing required fields: leadId, type, value" },
        { status: 400 }
      );
    }

    const result = await recordRevenueEvent(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      eventId: result.eventId,
      message: "Revenue event recorded",
    });
  } catch (error) {
    console.error("[B2B REVENUE EVENT] Error:", error);
    return NextResponse.json(
      { error: "Failed to record revenue event" },
      { status: 500 }
    );
  }
}
