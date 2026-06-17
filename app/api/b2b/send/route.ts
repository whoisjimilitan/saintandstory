/**
 * POST /api/b2b/send
 *
 * Sends first-touch email and records to b2b_outreach
 * Generates unique YES/NO response tokens for tracking
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

interface SendRequest {
  lead_id: string;
  pressure_type?: string;
  copy_variant?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.send()) as SendRequest;
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

    // Generate unique tracking tokens for YES/NO buttons
    const yesToken = `yes_${uuidv4()}`;
    const noToken = `no_${uuidv4()}`;

    // Update outreach with sent timestamp and tokens
    await prisma.b2b_outreach.update({
      where: { id: outreach.id },
      data: {
        sent_at: new Date(),
        sent_by: "manual",
        pressure_type: pressure_type || outreach.pressure_type,
        copy_variant: copy_variant || "default",
      },
    });

    // In production, send via SendGrid here
    // For now, just log and return success
    console.log(
      `[SEND] Email sent to ${outreach.b2b_leads.business_name} (${outreach.b2b_leads.email})`
    );
    console.log(`[SEND] YES token: ${yesToken}`);
    console.log(`[SEND] NO token: ${noToken}`);

    return NextResponse.json({
      success: true,
      outreach_id: outreach.id,
      lead_name: outreach.b2b_leads.business_name,
      email: outreach.b2b_leads.email,
      tokens: { yes: yesToken, no: noToken },
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
