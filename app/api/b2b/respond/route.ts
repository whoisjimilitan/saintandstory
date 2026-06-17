/**
 * GET /api/b2b/respond?token=XXX&response=YES|NO
 *
 * Handles YES/NO button clicks from emails
 * Records response, updates lead status, redirects to prospect brief
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const response = searchParams.get("response");

    if (!token || !response || !["YES", "NO"].includes(response)) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    // Extract outreach_id from token (format: yes_OUTREACH_ID or no_OUTREACH_ID)
    const parts = token.split("_");
    if (parts.length < 2) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 }
      );
    }

    const outreachId = parts.slice(1).join("_"); // Handle UUIDs with underscores

    // Check if already responded (deduplication)
    const existing = await prisma.b2b_responses.findFirst({
      where: {
        outreach_id: outreachId,
      },
    });

    if (existing) {
      // Already responded - redirect anyway
      return NextResponse.redirect(
        new URL(`/b2b/prospect-brief/${outreachId}?responded=true`, request.url)
      );
    }

    // Record response
    const responseRecord = await prisma.b2b_responses.create({
      data: {
        outreach_id: outreachId,
        response_type: response,
      },
    });

    // Get the outreach to find the lead_id
    const outreach = await prisma.b2b_outreach.findUnique({
      where: { id: outreachId },
      select: { lead_id: true },
    });

    if (!outreach) {
      return NextResponse.json(
        { error: "Outreach not found" },
        { status: 404 }
      );
    }

    // Update lead status
    await prisma.b2b_leads.update({
      where: { id: outreach.lead_id },
      data: {
        pipeline_stage: "RESPONDED",
      },
    });

    // Redirect to prospect brief page
    return NextResponse.redirect(
      new URL(`/b2b/prospect-brief/${outreachId}?response=${response}`, request.url)
    );
  } catch (error) {
    console.error("[RESPOND] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to record response",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
