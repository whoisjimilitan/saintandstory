import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Validate Referral Code Uniqueness
 * POST /api/referral/validate-code
 *
 * Request: { code: string }
 * Response: { available: boolean, message: string }
 */

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { available: false, message: "Code is required" },
        { status: 400 }
      );
    }

    // Validate format: 3-12 characters, alphanumeric + hyphen
    if (code.length < 3 || code.length > 12) {
      return NextResponse.json(
        { available: false, message: "Code must be 3-12 characters" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9-]+$/.test(code)) {
      return NextResponse.json(
        { available: false, message: "Only letters, numbers, and hyphens allowed" },
        { status: 400 }
      );
    }

    console.log("[VALIDATE-CODE] Checking availability for code:", code);

    // Check if code already exists (case-insensitive)
    const existingReferrer = await prisma.referrer.findFirst({
      where: {
        referralCode: {
          equals: code,
          mode: "insensitive",
        },
      },
    });

    if (existingReferrer) {
      console.log("[VALIDATE-CODE] Code taken:", code);
      return NextResponse.json(
        { available: false, message: "This code is already taken. Try a variation." },
        { status: 200 }
      );
    }

    console.log("[VALIDATE-CODE] ✓ Code available:", code);
    return NextResponse.json(
      { available: true, message: "Code is available!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[VALIDATE-CODE] Error:", error);
    return NextResponse.json(
      { available: false, message: "Error checking code availability" },
      { status: 500 }
    );
  }
}
