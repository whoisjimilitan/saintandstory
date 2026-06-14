import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// Check both orders directly
const orders = await sql`
  SELECT id, business_name, pickup_postcode, delivery_postcode, active
  FROM b2b_standing_orders
  WHERE id IN (
    '3c881ea0-1ea6-4b9c-a239-76184fd9bacc',
    'f5604593-b9a0-4162-8aa1-1a4c08790c7b'
  )
`;

console.log("=== STANDING ORDER VERIFICATION ===\n");
orders.forEach(o => {
  console.log(`${o.business_name}:`);
  console.log(`  Pickup:   ${o.pickup_postcode}`);
  console.log(`  Delivery: ${o.delivery_postcode}`);
  console.log(`  Active:   ${o.active}`);
  console.log('');
});

// Count with missing data
const withMissing = await sql`
  SELECT COUNT(*) as broken FROM b2b_standing_orders
  WHERE active = true 
  AND (pickup_postcode IS NULL OR delivery_postcode IS NULL)
`;

console.log(`Active with missing postcodes: ${withMissing[0].broken}`);

// Count with valid data
const withValid = await sql`
  SELECT COUNT(*) as healthy FROM b2b_standing_orders
  WHERE active = true 
  AND pickup_postcode IS NOT NULL 
  AND delivery_postcode IS NOT NULL
`;

console.log(`Active with complete postcodes: ${withValid[0].healthy}`);
