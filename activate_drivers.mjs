import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

console.log("=== DRIVER B2B ACTIVATION ===\n");

// Get all production drivers (profile_live = true)
const productionDrivers = await sql`
  SELECT id, full_name, b2b_opt_in, profile_live
  FROM drivers
  WHERE profile_live = true
`;

console.log(`Production drivers (profile_live=true): ${productionDrivers.length}`);
console.log(`Currently with B2B opt-in: ${productionDrivers.filter(d => d.b2b_opt_in).length}`);
console.log(`Need activation: ${productionDrivers.filter(d => !d.b2b_opt_in).length}\n`);

// Activate all production drivers
const activated = await sql`
  UPDATE drivers
  SET b2b_opt_in = true
  WHERE profile_live = true
  RETURNING id, full_name, b2b_opt_in
`;

console.log("=== ACTIVATED ===");
activated.forEach(d => {
  console.log(`✓ ${d.full_name}: b2b_opt_in=${d.b2b_opt_in}`);
});

// Verify
const verify = await sql`
  SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN b2b_opt_in THEN 1 ELSE 0 END) as b2b_enabled
  FROM drivers
  WHERE profile_live = true
`;

console.log(`\n=== VERIFICATION ===`);
console.log(`Total production drivers: ${verify[0].total}`);
console.log(`With B2B opt-in: ${verify[0].b2b_enabled}`);
console.log(`Status: ${verify[0].total === verify[0].b2b_enabled ? '✅ 100% ACTIVATED' : '❌ INCOMPLETE'}`);
