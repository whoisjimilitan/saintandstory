import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

console.log("=== STANDING ORDER REPAIR ===\n");

// Sterling Law - EC4Y 0DT
const sterling = await sql`
  UPDATE b2b_standing_orders
  SET pickup_postcode = 'EC4Y 0DT', delivery_postcode = 'EC4Y 0DT'
  WHERE id = '3c881ea0-1ea6-4b9c-a239-76184fd9bacc'
  RETURNING id, business_name, pickup_postcode, delivery_postcode
`;

console.log("Sterling Law");
console.log(`  ID: ${sterling[0].id}`);
console.log(`  Previous: pickup=NULL, delivery=NULL`);
console.log(`  Updated:  pickup=${sterling[0].pickup_postcode}, delivery=${sterling[0].delivery_postcode}`);
console.log('');

// Test Business - N17 8AD
const test = await sql`
  UPDATE b2b_standing_orders
  SET pickup_postcode = 'N17 8AD', delivery_postcode = 'N17 8AD'
  WHERE id = 'f5604593-b9a0-4162-8aa1-1a4c08790c7b'
  RETURNING id, business_name, pickup_postcode, delivery_postcode
`;

console.log("Test Business");
console.log(`  ID: ${test[0].id}`);
console.log(`  Previous: pickup=NULL, delivery=NULL`);
console.log(`  Updated:  pickup=${test[0].pickup_postcode}, delivery=${test[0].delivery_postcode}`);
console.log('');

// Verify
const verify = await sql`
  SELECT COUNT(*) as count FROM b2b_standing_orders
  WHERE active = true AND (pickup_postcode IS NULL OR delivery_postcode IS NULL)
`;

console.log("=== VERIFICATION ===");
console.log(`Active standing orders with missing postcodes: ${verify[0].count}`);
console.log(`Status: ${verify[0].count === 0 ? '✅ ALL REPAIRED' : '❌ STILL BROKEN'}`);
