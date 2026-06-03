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
  console.log("TESTING THE EXACT INSERT STATEMENT FROM createJob()");
  console.log("=".repeat(90) + "\n");
  
  const reference = "TEST-" + Math.random().toString(36).substring(7);
  const trackingToken = randomUUID();
  
  const lead = {
    id: randomUUID(),
    created_at: new Date().toISOString(),
    fullName: "Test Customer",
    email: `test-${Date.now()}@example.com`,
    phone: "+441234567890",
    serviceType: "removal",
    postcode_from: "SW1A 1AA",
    postcode_to: "N1 1AA",
    largeItems: ["sofa", "bed"],
    timeframe: "ASAP",
    helpLoading: "yes",
    duration: "4 hours",
  };
  
  console.log("Testing INSERT with:");
  console.log(`  Reference: ${reference}`);
  console.log(`  Tracking Token: ${trackingToken}`);
  console.log(`  Customer Email: ${lead.email}`);
  console.log(`  Lead ID: ${lead.id}\n`);
  
  try {
    console.log("Executing INSERT INTO jobs...\n");
    
    const result = await sql`
      INSERT INTO jobs (
        reference, tracking_token, customer_name, customer_email, customer_phone,
        service_type, postcode_from, postcode_to, large_items,
        timeframe, help_loading, duration, status, lead_id
      ) VALUES (
        ${reference}, ${trackingToken},
        ${lead.fullName},
        ${lead.email},
        ${lead.phone},
        ${lead.serviceType},
        ${lead.postcode_from},
        ${lead.postcode_to},
        ${JSON.stringify(lead.largeItems)},
        ${lead.timeframe},
        ${lead.helpLoading},
        ${lead.duration},
        'pending_review',
        ${lead.id}
      )
    `;
    
    console.log("✅ INSERT SUCCEEDED!");
    console.log("Result:", result);
  } catch (error: any) {
    console.log("❌ INSERT FAILED WITH ERROR:");
    console.log("\nError Message:", error.message);
    console.log("\nError Code:", error.code);
    console.log("\nFull Error:", error);
  }
}

testInsert().catch(console.error);
