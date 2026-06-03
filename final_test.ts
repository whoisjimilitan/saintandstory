import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import path from "path";
import { randomUUID } from "crypto";

config({ path: path.join(process.cwd(), ".env.local") });

async function finalTest() {
  const sql = neon(process.env.DATABASE_URL!);
  
  console.log("\n" + "=".repeat(90));
  console.log("FINAL VERIFICATION TEST");
  console.log("=".repeat(90));
  
  const testEmail = `final-test-${Date.now()}@example.com`;
  
  // Submit via API
  console.log("\n[TEST] Submitting job via production API...");
  console.log(`Email: ${testEmail}`);
  
  const response = await fetch("https://saintandstoryltd.co.uk/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      serviceType: "removal",
      largeItems: ["sofa"],
      timeframe: "ASAP",
      helpLoading: "yes",
      duration: "2 hours",
      postcode_from: "SW1A 1AA",
      postcode_to: "N1 1AA",
      email: testEmail,
      phone: "+441234567890",
      phoneConsent: true,
      fullName: "Final Test",
      marketingOptIn: false,
      utm: { source: "final" },
      is_driver: false
    }),
  });
  
  console.log(`API Response: ${response.status}`);
  
  // Wait and check
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const jobRows = await sql`
    SELECT reference, status, created_at
    FROM jobs
    WHERE customer_email = ${testEmail}
    LIMIT 1
  `;
  
  if ((jobRows as any[]).length > 0) {
    console.log(`✅ SUCCESS - Job created: ${(jobRows as any[])[0].reference}`);
  } else {
    console.log(`❌ FAILED - No job found`);
  }
}

finalTest().catch(console.error);
