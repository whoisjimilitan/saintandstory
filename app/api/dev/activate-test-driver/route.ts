import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { TEST_DRIVER_EMAIL } from "@/lib/test-driver";

const prisma = new PrismaClient();

async function activate() {
  // First check if driver exists
  const existing = await prisma.driver.findUnique({
    where: { email: TEST_DRIVER_EMAIL },
  });

  if (!existing) {
    // Debug: check what drivers exist
    const allDrivers = await prisma.driver.findMany({
      select: { id: true, email: true },
      take: 5,
    });
    return {
      error: "Test driver not found",
      hint: "Run /api/dev/init-test-driver first",
      checked_email: TEST_DRIVER_EMAIL,
      debug_sample_drivers: allDrivers.map(d => d.email),
    };
  }

  // Activate the driver
  const result = await prisma.driver.update({
    where: { email: TEST_DRIVER_EMAIL },
    data: {
      profileLive: true,
      subscriptionStatus: "active",
    },
  });

  return {
    success: true,
    message: "Test driver activated ✅",
    driver: result,
  };
}

export async function GET() {
  try {
    const result = await activate();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to activate" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const result = await activate();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to activate" },
      { status: 500 }
    );
  }
}
