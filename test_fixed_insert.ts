import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import path from "path";
import { randomUUID } from "crypto";

config({ path: path.join(process.cwd(), ".env.local") });

async function testInsert() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log("❌ DATABASE_URL not found");
    return;
  }
  
  const sql = neon(dbUrl);
  
  console.log("\n" + "=".repeat(90));
  console.log("TESTING FIXED INSERT STATEMENT (WITH id, created_at, updated_at)");
  console.log("=".repeat(90) + "\n");
  
  const jobId = randomUUID();
  const reference = "TEST-" + Math.random().toString(36).substring(7).toUpperCase();
  const trackingToken = randomUUID();
  const leadId = randomUUID();
  const now = new Date().toISOString();
  
  const testEmail = `test-fixed-${Date.now()}@example.com`;
  
  console.log("Testing INSERT with:");
  console.log(`  Job ID: ${jobId}`);
  console.log(`  Reference: ${reference}`);
  console.log(`  Tracking Token: ${trackingToken}`);
  console.log(`  Customer Email: ${testEmail}`);
  console.log(`  Lead ID: ${leadId}\n`);
  
  try {
    console.log("Executing INSERT INTO jobs (WITH id, created_at, updated_at)...\n");
    
    const result = await sql`
      INSERT INTO jobs (
        id, reference, tracking_token, customer_name, customer_email, customer_phone,
        service_type, postcode_from, postcode_to, large_items,
        timeframe, help_loading, duration, status, lead_id, created_at, updated_at
      ) VALUES (
        ${jobId}, ${reference}, ${trackingToken},
        'Test Customer Fixed',
        ${testEmail},
        '+441234567890',
        'removal',
        'SW1A 1AA',
        'N1 1AA',
        ${'["sofa", "bed"]'},
        'ASAP',
        'yes',
        '4 hours',
        'pending_review',
        ${leadId},
        ${now},
        ${now}
      )
    `;
    
    console.log("✅ INSERT SUCCEEDED!\n");
    
    // Now verify the job exists in the database
    console.log("Verifying job was created...\n");
    
    const jobRows = await sql`
      SELECT id, reference, customer_email, status, created_at
      FROM jobs
      WHERE id = ${jobId}
    `;
    
    if (jobRows.length > 0) {
      console.log("✅ JOB FOUND IN DATABASE:");
      console.log(`   ID: ${jobRows[0].id}`);
      console.log(`   Reference: ${jobRows[0].reference}`);
      console.log(`   Email: ${jobRows[0].customer_email}`);
      console.log(`   Status: ${jobRows[0].status}`);
      console.log(`   Created: ${jobRows[0].created_at}\n`);
    } else {
      console.log("❌ Job not found after insertion!");
    }
    
    // Check if it appears in admin dashboard query
    console.log("Checking if job appears in admin dashboard query...\n");
    
    const adminResults = await sql`
      SELECT id, reference, customer_email, status
      FROM jobs
      WHERE id = ${jobId} AND status = 'pending_review'
    `;
    
    if (adminResults.length > 0) {
      console.log("✅ JOB APPEARS IN ADMIN DASHBOARD!");
      console.log(`   Reference: ${adminResults[0].reference}`);
      console.log(`   Status: ${adminResults[0].status}`);
    } else {
      console.log("❌ Job not appearing in admin dashboard");
    }
    
  } catch (error: any) {
    console.log("❌ INSERT FAILED:");
    console.log("Error Message:", error.message);
    console.log("Full Error:", error);
  }
}

testInsert().catch(console.error);
