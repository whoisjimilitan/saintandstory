import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk",
];

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user?.emailAddresses[0]?.emailAddress ?? "";
    if (!ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { phone, message } = body;

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number required" },
        { status: 400 }
      );
    }

    const encodedMessage = encodeURIComponent(message || "");
    const waChatManagerUrl = `wachatmanager://send?phone=${phone}&text=${encodedMessage}`;

    console.log(`[WHATSAPP] Attempting to open WA Chat Manager: ${waChatManagerUrl}`);

    // Use open -a to force-open WA Chat Manager app
    try {
      await execFileAsync("open", ["-a", "WA Chat Manager", "--url", waChatManagerUrl]);

      console.log(`[WHATSAPP] ✓ WA Chat Manager opened successfully`);

      return NextResponse.json({
        success: true,
        message: "WA Chat Manager opened",
        phone,
      });
    } catch (osascriptError) {
      console.error(`[WHATSAPP] Failed to open app:`, osascriptError);

      // If backend fails, return error (don't provide fallback)
      return NextResponse.json({
        success: false,
        message: "Failed to open WA Chat Manager",
        phone,
      }, { status: 500 });
    }
  } catch (error) {
    console.error("[WHATSAPP] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to open WhatsApp",
      },
      { status: 500 }
    );
  }
}
