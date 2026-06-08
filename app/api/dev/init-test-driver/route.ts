import { NextRequest, NextResponse } from "next/server";
import { initializeTestDriver } from "@/lib/test-driver";

async function init() {
  try {
    await initializeTestDriver();
    return {
      success: true,
      message: "Test driver initialized ✅",
      email: "mz_kay2006@hotmail.co.uk",
      next_step: "Visit /api/dev/activate-test-driver to activate the profile",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to initialize",
    };
  }
}

export async function GET() {
  const result = await init();
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const result = await init();
  return NextResponse.json(result);
}
