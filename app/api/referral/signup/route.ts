import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppReferrerWelcome } from "@/lib/whatsapp-referrer-messages";

/**
 * Referral Signup API
 * POST /api/referral/signup
 *
 * Receives: phone, officeName, officeManagerName, city, category
 * Returns: referralCode, whatsappLink
 * Sends: Welcome WhatsApp message
 */

export async function POST(request: NextRequest) {
  try {
    console.log("[REFERRAL SIGNUP] Starting signup flow");

    const body = await request.json();
    const { phone, officeName, officeManagerName, city, category } = body;

    if (!phone || !city) {
      console.error("[REFERRAL SIGNUP] Missing required fields: phone, city");
      return NextResponse.json(
        { error: "Missing required fields: phone, city" },
        { status: 400 }
      );
    }

    // Validate phone format
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      console.error("[REFERRAL SIGNUP] Invalid phone format");
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      );
    }

    // Check if referrer already exists
    const existingReferrer = await prisma.referrer.findUnique({
      where: { phone },
    });

    if (existingReferrer) {
      console.log("[REFERRAL SIGNUP] Referrer already exists:", phone);
      return NextResponse.json(
        {
          success: true,
          message: "You're already registered",
          referralCode: existingReferrer.referralCode,
          status: existingReferrer.status,
        },
        { status: 200 }
      );
    }

    // Generate unique referral code (format: SH-EMMA-9254)
    const referralCode = generateReferralCode(officeManagerName || "REF");

    console.log("[REFERRAL SIGNUP] Creating referrer record...", {
      phone,
      officeName,
      city,
      referralCode,
    });

    // Create referrer record
    const referrer = await prisma.referrer.create({
      data: {
        phone,
        officeManagerName: officeManagerName || "Office Manager",
        officeName: officeName || "Business",
        city,
        category: category || "business",
        referralCode,
        commission: 20, // £20 per referral
      },
    });

    console.log("[REFERRAL SIGNUP] ✓ Referrer created:", referrer.id);

    // Send WhatsApp welcome message
    try {
      console.log("[REFERRAL SIGNUP] Sending WhatsApp welcome message...");
      await sendWhatsAppReferrerWelcome(referrer);
      console.log("[REFERRAL SIGNUP] ✓ WhatsApp message queued");

      // Update WhatsApp status
      await prisma.referrer.update({
        where: { id: referrer.id },
        data: {
          whatsappStatus: "pending",
        },
      });
    } catch (whatsappError) {
      console.warn("[REFERRAL SIGNUP] ⚠ WhatsApp send failed (non-critical):", whatsappError);
      // Don't fail the signup if WhatsApp fails
    }

    console.log("[REFERRAL SIGNUP] ✓ Signup complete");

    return NextResponse.json({
      success: true,
      referrerId: referrer.id,
      referralCode: referrer.referralCode,
      message: `Welcome! Your referral code: ${referrer.referralCode}. Check WhatsApp for next steps.`,
      dashboard: `https://saintandstoryltd.co.uk/referral/dashboard?code=${referrer.referralCode}`,
    });
  } catch (error) {
    console.error("[REFERRAL SIGNUP] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Signup failed" },
      { status: 500 }
    );
  }
}

/**
 * Generate unique referral code
 * Format: SH-EMMA-9254
 */
function generateReferralCode(name: string): string {
  // Use first 2 letters of name (uppercase)
  const initials = name.toUpperCase().slice(0, 2).padEnd(2, "S");

  // Use middle part of name or random
  const middle = name.toUpperCase().slice(0, 4).padEnd(4, "H");

  // Random 4-digit number
  const suffix = String(Math.floor(Math.random() * 10000)).padStart(4, "0");

  return `SH-${middle.slice(0, 4)}-${suffix}`;
}
