import { NextRequest, NextResponse } from "next/server";
import { initializeTestDriver } from "@/lib/test-driver";

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    await initializeTestDriver();
    return NextResponse.json({
      success: true,
      message: "Test driver initialized",
      email: "test-driver@local.test",
      instructions: "Log in with your normal auth provider using email: test-driver@local.test. The test driver dashboard will be available.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to initialize" },
      { status: 500 }
    );
  }
}
