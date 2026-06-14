import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// Check standing orders with missing postcodes
const missing = await sql`
  SELECT id, lead_id, business_name, pickup_postcode, delivery_postcode, active
  FROM b2b_standing_orders
  WHERE pickup_postcode IS NULL OR delivery_postcode IS NULL
  LIMIT 20
`;

console.log(`=== STANDING ORDERS WITH MISSING POSTCODES ===\n`);
console.log(`Count: ${missing.length}\n`);

missing.forEach(order => {
  console.log(`ID: ${order.id}`);
  console.log(`Business: ${order.business_name}`);
  console.log(`Pickup: ${order.pickup_postcode || 'NULL'}`);
  console.log(`Delivery: ${order.delivery_postcode || 'NULL'}`);
  console.log(`Active: ${order.active}`);
  console.log('---');
});

// Check total standing orders
const total = await sql`
  SELECT COUNT(*) as count FROM b2b_standing_orders
`;

console.log(`\n=== STANDING ORDER SUMMARY ===`);
console.log(`Total standing orders: ${total[0].count}`);

const active = await sql`
  SELECT COUNT(*) as count FROM b2b_standing_orders WHERE active = true
`;

console.log(`Active: ${active[0].count}`);

const withPostcodes = await sql`
  SELECT COUNT(*) as count FROM b2b_standing_orders 
  WHERE active = true 
  AND pickup_postcode IS NOT NULL 
  AND delivery_postcode IS NOT NULL
`;

console.log(`Active with postcodes: ${withPostcodes[0].count}`);
