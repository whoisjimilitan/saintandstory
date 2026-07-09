import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppReferrerJobConfirmed } from "@/lib/whatsapp-referrer-messages";

/**
 * Job Referral Confirmation Webhook
 * POST /api/referral/job-confirmation
 *
 * Called when a job is booked with a referral code
 * Creates earnings record and sends WhatsApp confirmation
 *
 * Body: { jobId, referralCode, customerName, customerPhone, customerEmail, jobValue }
 */

export async function POST(request: NextRequest) {
  try {
    console.log("[REFERRAL JOB CONFIRMATION] Processing job confirmation");

    const body = await request.json();
    const {
      jobId,
      referralCode,
      customerName,
      customerPhone,
      customerEmail,
      jobValue,
    } = body;

    if (!jobId || !referralCode || !jobValue) {
      console.error("[REFERRAL JOB CONFIRMATION] Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields: jobId, referralCode, jobValue" },
        { status: 400 }
      );
    }

    console.log("[REFERRAL JOB CONFIRMATION] Looking up referrer:", referralCode);

    // Find referrer by code
    const referrer = await prisma.referrer.findUnique({
      where: { referralCode },
    });

    if (!referrer) {
      console.error("[REFERRAL JOB CONFIRMATION] Referrer not found:", referralCode);
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 404 }
      );
    }

    console.log("[REFERRAL JOB CONFIRMATION] ✓ Referrer found:", referrer.id);

    // Calculate commission (referrer's commission amount, not company's margin)
    const commission = Number(jobValue) * (Number(referrer.commission) / 100);

    console.log("[REFERRAL JOB CONFIRMATION] Creating referral job record...");

    // Create referral job record
    const referralJob = await prisma.referralJob.create({
      data: {
        jobId,
        referrerId: referrer.id,
        customerName,
        customerPhone,
        customerEmail,
        jobValue: Number(jobValue),
        commission: Number(commission),
        status: "new",
      },
    });

    console.log("[REFERRAL JOB CONFIRMATION] ✓ Referral job created:", referralJob.id);

    // Create earning record
    const earning = await prisma.referrerEarning.create({
      data: {
        referrerId: referrer.id,
        jobId: referralJob.id,
        amount: Number(commission),
        status: "pending",
        referralMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    });

    console.log("[REFERRAL JOB CONFIRMATION] ✓ Earning record created:", earning.id);

    // Update referrer stats
    await prisma.referrer.update({
      where: { id: referrer.id },
      data: {
        totalReferrals: { increment: 1 },
        activeReferrals: { increment: 1 },
        totalEarnings: { increment: Number(commission) },
        monthlyEarnings: { increment: Number(commission) },
        lastActiveAt: new Date(),
      },
    });

    console.log("[REFERRAL JOB CONFIRMATION] ✓ Referrer stats updated");

    // Send WhatsApp confirmation
    try {
      console.log("[REFERRAL JOB CONFIRMATION] Sending WhatsApp confirmation...");
      await sendWhatsAppReferrerJobConfirmed(referrer, {
        customerName,
        jobValue: Number(jobValue),
        commission: Number(commission),
      });
      console.log("[REFERRAL JOB CONFIRMATION] ✓ WhatsApp confirmation sent");
    } catch (whatsappError) {
      console.warn("[REFERRAL JOB CONFIRMATION] ⚠ WhatsApp send failed:", whatsappError);
      // Don't fail the whole operation if WhatsApp fails
    }

    console.log("[REFERRAL JOB CONFIRMATION] ✓ Job confirmation complete");

    return NextResponse.json({
      success: true,
      referralJob: {
        id: referralJob.id,
        jobId,
        referrerId: referrer.id,
        commission: Number(commission),
        referrerName: referrer.officeManagerName,
      },
      earning: {
        id: earning.id,
        amount: Number(commission),
        status: earning.status,
      },
      message: `Earning confirmed: £${commission.toFixed(2)} added to ${referrer.officeManagerName}'s account`,
    });
  } catch (error) {
    console.error("[REFERRAL JOB CONFIRMATION] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to confirm job",
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Check if referral code is valid
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const referralCode = searchParams.get("code");

    if (!referralCode) {
      return NextResponse.json(
        { error: "Missing referral code" },
        { status: 400 }
      );
    }

    const referrer = await prisma.referrer.findUnique({
      where: { referralCode },
      select: {
        id: true,
        officeManagerName: true,
        officeName: true,
        city: true,
        commission: true,
        status: true,
      },
    });

    if (!referrer) {
      return NextResponse.json(
        { valid: false, error: "Invalid referral code" },
        { status: 404 }
      );
    }

    if (referrer.status !== "active") {
      return NextResponse.json(
        { valid: false, error: "Referrer is not active" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      valid: true,
      referrer: {
        name: referrer.officeManagerName,
        office: referrer.officeName,
        city: referrer.city,
        commission: referrer.commission,
      },
    });
  } catch (error) {
    console.error("[REFERRAL JOB CONFIRMATION GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to validate referral code" },
      { status: 500 }
    );
  }
}
