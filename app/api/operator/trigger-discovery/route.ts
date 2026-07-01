import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

const OPERATOR_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk",
];

/**
 * OPERATOR TRIGGER: Start autonomous discovery now
 *
 * Called from /operator/settings when operator clicks "Start Discovery"
 * Reads enabled tiers from request, triggers the admin discovery endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = user?.emailAddresses[0]?.emailAddress;
    if (!userEmail || !OPERATOR_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: "Not an operator" }, { status: 403 });
    }

    const body = await request.json();
    const { tiers } = body;

    if (!Array.isArray(tiers)) {
      return NextResponse.json(
        { error: "Tiers array required" },
        { status: 400 }
      );
    }

    console.log(`[OPERATOR-TRIGGER] ${userEmail} starting discovery for tiers:`,
      tiers.filter((t: any) => t.enabled).map((t: any) => `Tier ${t.tier}`)
    );

    // Call admin discovery endpoint
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const discoveryRes = await fetch(
      `${baseUrl}/api/admin/trigger-tier-discovery`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": userEmail,
        },
        body: JSON.stringify({ tiers }),
      }
    );

    if (!discoveryRes.ok) {
      const responseText = await discoveryRes.text();
      console.error(`[OPERATOR-TRIGGER] Admin endpoint returned ${discoveryRes.status}:`, responseText.substring(0, 500));

      let errorMessage = "Discovery failed";
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || "Discovery failed";
      } catch {
        errorMessage = `Discovery failed (HTTP ${discoveryRes.status})`;
      }

      return NextResponse.json(
        {
          error: errorMessage,
          success: false,
        },
        { status: 500 }
      );
    }

    let discoveryData;
    try {
      discoveryData = await discoveryRes.json();
    } catch (jsonError) {
      console.error(`[OPERATOR-TRIGGER] Failed to parse discovery response:`, jsonError);
      return NextResponse.json(
        { error: "Failed to parse discovery response", success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Started autonomous discovery. ${discoveryData.leadsFound} leads found.`,
      ...discoveryData,
    });
  } catch (error) {
    console.error("[OPERATOR-TRIGGER] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Trigger failed",
        success: false,
      },
      { status: 500 }
    );
  }
}
