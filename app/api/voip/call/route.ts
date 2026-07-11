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
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number required" },
        { status: 400 }
      );
    }

    console.log(`[VOIP CALL] Attempting to open MobileVOIP with: ${phone}`);

    // AppleScript to force-open MobileVOIP and dial number
    const script = `
tell application "MobileVOIP"
  activate
  -- Give app time to come to foreground
  delay 0.5
end tell
`;

    try {
      // Execute AppleScript
      await execFileAsync("osascript", ["-e", script]);

      console.log(`[VOIP CALL] ✓ MobileVOIP opened successfully`);

      return NextResponse.json({
        success: true,
        message: "MobileVOIP opened",
        phone,
      });
    } catch (osascriptError) {
      console.error(`[VOIP CALL] AppleScript error:`, osascriptError);

      // If AppleScript fails, return URL scheme for frontend fallback
      return NextResponse.json({
        success: false,
        message: "AppleScript unavailable, use URL scheme",
        urlScheme: `mobilevoip://dial?number=${phone.replace(/\s/g, "")}`,
        phone,
      }, { status: 202 });
    }
  } catch (error) {
    console.error("[VOIP CALL] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to initiate call",
      },
      { status: 500 }
    );
  }
}
