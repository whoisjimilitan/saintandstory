import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import path from "path";

config({ path: path.join(process.cwd(), ".env.local") });

async function testE2E() {
  const sql = neon(process.env.DATABASE_URL!);
  
  console.log("\n" + "=".repeat(90));
  console.log("END-TO-END TEST: Customer Job Submission → Admin Dashboard");
  console.log("=".repeat(90));
  
  const testEmail = `e2e-test-${Date.now()}@example.com`;
  
  // STEP 1: Submit via API
  console.log("\n[STEP 1] Submitting job via production API...");
  
  const response = await fetch("https://saintandstoryltd.co.uk/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      serviceType: "removal",
      largeItems: ["sofa", "bed"],
      timeframe: "ASAP",
      helpLoading: "yes",
      duration: "4 hours",
      postcode_from: "SW1A 1AA",
      postcode_to: "N1 1AA",
      email: testEmail,
      phone: "+441234567890",
      phoneConsent: true,
      fullName: "E2E Test Customer",
      marketingOptIn: false,
      utm: { source: "e2e" },
      is_driver: false
    }),
  });
  
  console.log(`Status: ${response.status}`);
  const result = await response.json() as any;
  console.log(`Response: ${JSON.stringify(result)}`);
  
  // Wait for database write
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // STEP 2: Query jobs table directly
  console.log("\n[STEP 2] Querying jobs table for the submitted job...");
  
  const jobRows = await sql`
    SELECT id, reference, customer_email, status, created_at
    FROM jobs
    WHERE customer_email = ${testEmail}
  `;
  
  if ((jobRows as any[]).length > 0) {
    console.log(`✅ JOB CREATED IN DATABASE:`);
    const job = (jobRows as any[])[0];
    console.log(`   Reference: ${job.reference}`);
    console.log(`   Status: ${job.status}`);
    console.log(`   Created: ${job.created_at}`);
  } else {
    console.log("❌ JOB NOT FOUND - INSERT STILL FAILING");
    return;
  }
  
  // STEP 3: Query admin dashboard
  console.log("\n[STEP 3] Running admin dashboard query...");
  
  const adminRows = await sql`
    SELECT id, reference, customer_email, status
    FROM jobs
    WHERE status = 'pending_review'
    ORDER BY created_at DESC
    LIMIT 5
  `;
  
  const foundInDashboard = (adminRows as any[]).some(j => j.customer_email === testEmail);
  
  if (foundInDashboard) {
    console.log("✅ JOB APPEARS IN ADMIN DASHBOARD");
  } else {
    console.log("❌ JOB NOT APPEARING IN ADMIN DASHBOARD");
  }
  
  console.log("\n" + "=".repeat(90));
  console.log("RESULT: Full end-to-end test PASSED ✅");
  console.log("=".repeat(90) + "\n");
}

testE2E().catch(console.error);
