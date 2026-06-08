import { neon } from "@neondatabase/serverless";

export const TEST_DRIVER_ID = "test-driver-001";
export const TEST_DRIVER_EMAIL = "mz_kay2006@hotmail.co.uk";
export const TEST_DRIVER_NAME = "Test Driver";

/**
 * Initialize test driver in database (dev-only)
 * Call this once during setup or on first dev load
 */
export async function initializeTestDriver() {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Check if test driver exists
    const existing = await sql`
      SELECT id FROM drivers WHERE email = ${TEST_DRIVER_EMAIL} LIMIT 1
    `;

    if (existing.length > 0) return; // Already exists

    // Create test driver
    await sql`
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
    `;

    console.log("[TEST-DRIVER] ✓ Test driver initialized");
  } catch (error) {
    console.error("[TEST-DRIVER] ✗ Failed to initialize:", error);
  }
}

/**
 * Check if current user is test driver
 */
export function isTestDriver(email?: string): boolean {
  return email === TEST_DRIVER_EMAIL;
}
