import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const orders = await sql`
  SELECT id, business_name, pickup_postcode, delivery_postcode
  FROM b2b_standing_orders
  WHERE id IN (
    '3c881ea0-1ea6-4b9c-a239-76184fd9bacc',
    'f5604593-b9a0-4162-8aa1-1a4c08790c7b'
  )
`;

console.log("=== STANDING ORDER REPAIR VERIFICATION ===\n");

orders.forEach(o => {
  const hasPickup = o.pickup_postcode && o.pickup_postcode.trim();
  const hasDelivery = o.delivery_postcode && o.delivery_postcode.trim();
  const isComplete = hasPickup && hasDelivery;
  
  console.log(`${o.business_name}:`);
  console.log(`  Pickup:   ${o.pickup_postcode || 'NULL'} ${hasPickup ? '✅' : '❌'}`);
  console.log(`  Delivery: ${o.delivery_postcode || 'NULL'} ${hasDelivery ? '✅' : '❌'}`);
  console.log(`  Status:   ${isComplete ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
  console.log('');
});

// Check drivers
const drivers = await sql`
  SELECT COUNT(*) as total, 
         SUM(CASE WHEN b2b_opt_in THEN 1 ELSE 0 END) as enabled
  FROM drivers
  WHERE profile_live = true
`;

console.log("=== DRIVER B2B ACTIVATION VERIFICATION ===\n");
console.log(`Total production drivers: ${drivers[0].total}`);
console.log(`With B2B opt-in:         ${drivers[0].enabled}`);
console.log(`Status:                  ${drivers[0].total === drivers[0].enabled ? '✅ ALL ACTIVATED' : '❌ INCOMPLETE'}`);
