import { prisma } from "@/lib/prisma";

export const TEST_DRIVER_ID = "test-driver-001";
export const TEST_DRIVER_EMAIL = "mz_kay2006@hotmail.co.uk";
export const TEST_DRIVER_NAME = "Test Driver";

/**
 * Initialize test driver in database (dev-only)
 * Call this once during setup or on first dev load
 */
export async function initializeTestDriver(): Promise<{ success: boolean; message: string }> {
  try {
    // Check if test driver exists
    const existing = await prisma.driver.findUnique({
      where: { email: TEST_DRIVER_EMAIL },
    });

    if (existing) {
      console.log("[TEST-DRIVER] ✓ Test driver already exists");
      return { success: true, message: "Test driver already exists" };
    }

    // Create test driver
    const result = await prisma.driver.create({
      data: {
        email: TEST_DRIVER_EMAIL,
        fullName: TEST_DRIVER_NAME,
        phone: "07000 TEST 000",
        area: "London",
        vehicleType: "Van",
      },
    });

    console.log("[TEST-DRIVER] ✓ Test driver initialized", result.id);
    return { success: true, message: "Test driver initialized" };
  } catch (error) {
    console.error("[TEST-DRIVER] ✗ Failed to initialize:", error);
    return { success: false, message: error instanceof Error ? error.message : "Failed to initialize" };
  }
}

/**
 * Check if current user is test driver
 */
export function isTestDriver(email?: string): boolean {
  return email === TEST_DRIVER_EMAIL;
}
