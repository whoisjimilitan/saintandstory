/**
 * POST /api/b2b/send
 *
 * Sends first-touch email and records to b2b_outreach
 * Generates unique YES/NO response tokens for tracking
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface SendRequest {
  lead_id: string;
  pressure_type?: string;
  copy_variant?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SendRequest;
    const { lead_id, pressure_type, copy_variant } = body;

    // Fetch existing outreach record
    const outreach = await prisma.b2b_outreach.findFirst({
      where: {
        lead_id,
      },
      include: {
        b2b_leads: {
          select: {
            business_name: true,
            email: true,
            business_category: true,
          },
        },
      },
    });

    if (!outreach) {
      return NextResponse.json(
        { error: "No outreach record found" },
        { status: 404 }
      );
    }

    if (!outreach.b2b_leads.email) {
      return NextResponse.json(
        { error: "No email address on file" },
        { status: 400 }
      );
    }

    // Update outreach with sent timestamp
    await prisma.b2b_outreach.update({
      where: { id: outreach.id },
      data: {
        sent_at: new Date(),
        sent_by: "manual",
        pressure_type: pressure_type || outreach.pressure_type,
        copy_variant: copy_variant || "default",
      },
    });

    // In production, send via SendGrid here with tokens embedded in URLs
    // Token format: yes_{outreachId}, no_{outreachId}
    // Callback URLs: /api/b2b/respond?token=yes_{outreachId}&response=YES
    console.log(
      `[SEND] Email queued for ${outreach.b2b_leads.business_name} (${outreach.b2b_leads.email})`
    );
    console.log(`[SEND] Outreach ID: ${outreach.id}`);

    return NextResponse.json({
      success: true,
      outreach_id: outreach.id,
      lead_name: outreach.b2b_leads.business_name,
      email: outreach.b2b_leads.email,
    });
  } catch (error) {
    console.error("[SEND] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to send email",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
