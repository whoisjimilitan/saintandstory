import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// Get full standing order details
const orders = await sql`
  SELECT 
    so.id,
    so.lead_id,
    so.business_name,
    so.contact_email,
    so.contact_phone,
    so.pickup_postcode,
    so.delivery_postcode,
    so.active,
    bl.postcode as lead_postcode,
    bl.city,
    bl.business_category
  FROM b2b_standing_orders so
  LEFT JOIN b2b_leads bl ON so.lead_id = bl.id
  WHERE so.id IN (
    '3c881ea0-1ea6-4b9c-a239-76184fd9bacc',
    'f5604593-b9a0-4162-8aa1-1a4c08790c7b'
  )
`;

console.log("=== STANDING ORDER INSPECTION ===\n");

orders.forEach(order => {
  console.log(`ORDER ID: ${order.id}`);
  console.log(`Business: ${order.business_name}`);
  console.log(`Lead ID: ${order.lead_id}`);
  console.log(`Active: ${order.active}`);
  console.log(`\nOrder Postcodes:`);
  console.log(`  Pickup:   ${order.pickup_postcode || 'NULL'}`);
  console.log(`  Delivery: ${order.delivery_postcode || 'NULL'}`);
  console.log(`\nLinked Lead Data:`);
  console.log(`  Lead Postcode: ${order.lead_postcode || 'NULL'}`);
  console.log(`  City: ${order.city || 'NULL'}`);
  console.log(`  Category: ${order.business_category || 'NULL'}`);
  console.log(`  Contact Email: ${order.contact_email || 'NULL'}`);
  console.log(`  Contact Phone: ${order.contact_phone || 'NULL'}`);
  console.log('\n---\n');
});
