import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// Check drivers with B2B opt-in
const b2bDrivers = await sql`
  SELECT COUNT(*) as count FROM drivers WHERE b2b_opt_in = true
`;

console.log(`=== B2B OPT-IN DRIVERS ===`);
console.log(`Count: ${b2bDrivers[0].count}`);

// Check all drivers
const allDrivers = await sql`
  SELECT COUNT(*) as count FROM drivers
`;

console.log(`\nTotal drivers: ${allDrivers[0].count}`);

// Check active drivers
const activeDrivers = await sql`
  SELECT COUNT(*) as count FROM drivers WHERE profile_live = true
`;

console.log(`Active (profile_live): ${activeDrivers[0].count}`);

// Sample drivers
const sample = await sql`
  SELECT id, full_name, email, b2b_opt_in, profile_live
  FROM drivers
  LIMIT 5
`;

console.log(`\n=== SAMPLE DRIVERS ===`);
sample.forEach(d => {
  console.log(`${d.full_name || 'NO NAME'}: b2b=${d.b2b_opt_in}, live=${d.profile_live}`);
});
