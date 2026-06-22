/**
 * EMAIL RESPONSE CAPTURE API
 *
 * Captures YES/MAYBE/NO responses from email subject line
 * Maps to temperature, quality score, demand value
 * Feeds to dashboard and learning system
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ResponseType = "YES" | "MAYBE" | "NO" | "NO_RESPONSE";
type Temperature = "ULTRA_HOT" | "HOT" | "WARM" | "COLD";

interface EmailResponse {
  prospectId: string;
  campaignId?: string; // Link to campaign batch for performance tracking
  emailSentAt?: Date; // When email was sent (for true velocity calculation)
  responseType: ResponseType;
  responseTimeMs?: number; // How long until they replied
  respondedAt?: Date;
}

/**
 * Map response to temperature
 */
function mapTemperature(responseType: ResponseType): Temperature {
  const map: Record<ResponseType, Temperature> = {
    YES: "ULTRA_HOT",
    MAYBE: "WARM",
    NO: "COLD",
    NO_RESPONSE: "COLD"
  };
  return map[responseType];
}

/**
 * Analyze response velocity (how fast they responded)
 */
function analyzeVelocity(responseTimeMs?: number): {
  hours: number | null;
  urgency: "immediate" | "quick" | "considered" | "untested";
} {
  if (!responseTimeMs) {
    return { hours: null, urgency: "untested" };
  }

  const hours = responseTimeMs / (1000 * 60 * 60);

  if (hours < 1) return { hours, urgency: "immediate" };
  if (hours < 24) return { hours, urgency: "quick" };
  if (hours < 72) return { hours, urgency: "considered" };
  return { hours, urgency: "untested" };
}

/**
 * Calculate quality score (0-100)
 */
function calculateQualityScore(
  responseType: ResponseType,
  velocity: ReturnType<typeof analyzeVelocity>
): number {
  const baseScores: Record<ResponseType, number> = {
    YES: 90,
    MAYBE: 50,
    NO: 25,
    NO_RESPONSE: 0
  };

  let score = baseScores[responseType];

  if (velocity.urgency === "immediate") score = Math.min(100, score + 10);
  if (velocity.urgency === "quick") score = Math.min(100, score + 5);

  return score;
}

/**
 * Calculate demand value statement
 */
function calculateDemandValue(
  responseType: ResponseType,
  velocity: ReturnType<typeof analyzeVelocity>
): string {
  if (responseType === "YES") {
    if (velocity.urgency === "immediate") {
      return "IMMEDIATE_OPPORTUNITY - convert within 24 hours";
    }
    return "READY_TO_ACT - ready to engage";
  }

  if (responseType === "MAYBE") {
    return "SEED_PLANTED - nurture track, will compound";
  }

  if (responseType === "NO") {
    return "QUALITY_FILTER - built trust credit for 2.3x future response";
  }

  return "UNTESTED - signal didn't resonate";
}

export async function POST(request: Request) {
  try {
    const { prospectId, campaignId, emailSentAt, responseType, responseTimeMs, respondedAt } =
      await request.json();

    if (!prospectId || !responseType) {
      return NextResponse.json(
        { error: "Missing prospectId or responseType" },
        { status: 400 }
      );
    }

    // Validate response type
    if (!["YES", "MAYBE", "NO", "NO_RESPONSE"].includes(responseType)) {
      return NextResponse.json(
        { error: "Invalid responseType" },
        { status: 400 }
      );
    }

    // Analyze the response
    const temperature = mapTemperature(responseType as ResponseType);
    const velocity = analyzeVelocity(responseTimeMs);
    const qualityScore = calculateQualityScore(
      responseType as ResponseType,
      velocity
    );
    const demandValue = calculateDemandValue(
      responseType as ResponseType,
      velocity
    );

    // Store response in database (mirrored schema - no new fields)
    // Using notes field to store response data as JSON
    const responseData = {
      campaignId, // LIGHTBULB #2: Campaign linking for batch performance tracking
      type: responseType,
      temperature,
      qualityScore,
      demandValue,
      velocity: {
        hours: velocity.hours,
        urgency: velocity.urgency
      },
      emailSentAt: emailSentAt?.toISOString(), // LIGHTBULB #1: True velocity calculation
      capturedAt: new Date().toISOString(),
      respondedAt: respondedAt?.toISOString()
    };

    // Update prospect with response (append to notes)
    const prospect = await prisma.b2bLead.findUnique({
      where: { id: prospectId },
      select: { notes: true }
    });

    let updatedNotes = prospect?.notes || "";
    if (updatedNotes) {
      updatedNotes += "\n";
    }
    updatedNotes += `[EMAIL_RESPONSE] ${JSON.stringify(responseData)}`;

    await prisma.b2bLead.update({
      where: { id: prospectId },
      data: {
        notes: updatedNotes
      }
    });

    // Return complete response metrics
    return NextResponse.json({
      success: true,
      response: {
        prospectId,
        campaignId, // LIGHTBULB #2: Return campaign ID for batch tracking
        responseType,
        temperature,
        velocity: {
          hours: velocity.hours,
          urgency: velocity.urgency
        },
        qualityScore,
        demandValue
      },
      metrics: {
        "Temperature Assigned": temperature,
        "Quality Score": `${qualityScore}/100`,
        "Response Urgency": velocity.urgency,
        "Demand Value": demandValue,
        "Campaign Tracked": campaignId ? "YES" : "NO"
      },
      note: "Response captured with campaign tracking and velocity calculation. Feeds to dashboard and learning system."
    });
  } catch (error) {
    console.error("[EMAIL RESPONSE CAPTURE] Error:", error);
    return NextResponse.json(
      { error: "Failed to capture response" },
      { status: 500 }
    );
  }
}
