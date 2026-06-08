import { neon } from "@neondatabase/serverless";

export const TEST_DRIVER_ID = "test-driver-001";
export const TEST_DRIVER_EMAIL = "mz_kay2006@hotmail.co.uk";
export const TEST_DRIVER_NAME = "Test Driver";

/**
 * Initialize test driver in database (dev-only)
 * Call this once during setup or on first dev load
 */
export async function initializeTestDriver(): Promise<{ success: boolean; message: string }> {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Check if test driver exists
    const existing = await sql`
      SELECT id FROM drivers WHERE email = ${TEST_DRIVER_EMAIL} LIMIT 1
    `;

    if (existing.length > 0) {
      console.log("[TEST-DRIVER] ✓ Test driver already exists");
      return { success: true, message: "Test driver already exists" };
    }

    // Create test driver
    const result = await sql`
      INSERT INTO drivers (
        email,
        name,
        phone,
        city,
        vehicle_type,
        availability,
        bio,
        created_at,
        updated_at
      ) VALUES (
        ${TEST_DRIVER_EMAIL},
        ${TEST_DRIVER_NAME},
        '07000 TEST 000',
        'London',
        'Van',
        'Available',
        'Test driver account for development. Not a real driver.',
        NOW(),
        NOW()
      )
      RETURNING id, email
    `;

    console.log("[TEST-DRIVER] ✓ Test driver initialized", result);
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
