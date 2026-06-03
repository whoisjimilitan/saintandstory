import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import path from "path";

config({ path: path.join(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

async function diagnose() {
  console.log("\n" + "=".repeat(90));
  console.log("PRODUCTION JOB SUBMISSION DIAGNOSTIC");
  console.log("=".repeat(90));
  
  const testEmail = `test-${Date.now()}@example.com`;
  
  // STEP 1: Submit a test job to the production API
  console.log("\n[STEP 1] Submitting test job to production API...");
  
  const testJobPayload = {
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
    fullName: "Test Customer",
    marketingOptIn: false,
    utm: { source: "test", medium: "cli" },
    is_driver: false
  };
  
  console.log(`Email: ${testEmail}`);
  
  try {
    const response = await fetch("https://saintandstoryltd.co.uk/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testJobPayload),
    });
    
    const responseText = await response.text();
    console.log(`API Response Status: ${response.status}`);
    console.log(`API Response Body: ${responseText}`);
  } catch (err) {
    console.log(`API Error: ${err}`);
  }
  
  // Wait a moment for the database write
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // STEP 2: Check if the job exists in the database using raw SQL
  console.log("\n" + "-".repeat(90));
  console.log("[STEP 2] Checking JOBS table (raw SQL)...\n");
  
  const jobsRows = await prisma.$queryRaw`
    SELECT id, reference, customer_email, status, created_at
    FROM jobs
    WHERE customer_email = ${testEmail}
    ORDER BY created_at DESC
  `;
  
  console.log(`Query: SELECT * FROM jobs WHERE customer_email = '${testEmail}'`);
  console.log(`Result: Found ${(jobsRows as any[]).length} job(s)`);
  if ((jobsRows as any[]).length > 0) {
    (jobsRows as any[]).forEach((row, i) => {
      console.log(`  Job ${i + 1}: ${JSON.stringify(row)}`);
    });
  } else {
    console.log("  ❌ NO JOBS FOUND FOR THIS EMAIL");
  }
  
  // STEP 3: Check the admin dashboard query
  console.log("\n" + "-".repeat(90));
  console.log("[STEP 3] Admin dashboard query (exact from app/dashboard/admin/page.tsx)...\n");
  
  const adminRows = await prisma.$queryRaw`
    SELECT j.*,
      (SELECT COUNT(*) FROM jobs j2 WHERE j2.customer_email = j.customer_email AND j2.id != j.id) as previous_jobs
    FROM jobs j
    WHERE j.status = 'pending_review'
    ORDER BY j.created_at DESC
    LIMIT 5
  `;
  
  console.log(`Query (exact from dashboard):`);
  console.log(`  SELECT j.*,`);
  console.log(`    (SELECT COUNT(*) FROM jobs j2 WHERE j2.customer_email = j.customer_email AND j2.id != j.id) as previous_jobs`);
  console.log(`  FROM jobs j`);
  console.log(`  WHERE j.status = 'pending_review'`);
  console.log(`  ORDER BY j.created_at DESC`);
  console.log(`  LIMIT 50`);
  
  console.log(`\nResult: Found ${(adminRows as any[]).length} total jobs with status='pending_review'`);
  
  if ((adminRows as any[]).length === 0) {
    console.log("\n⚠️  CRITICAL: Admin dashboard query returns 0 rows");
  } else {
    console.log("\nFirst 3 jobs visible to admin:");
    (adminRows as any[]).slice(0, 3).forEach((job, i) => {
      console.log(`\n  Job ${i + 1}:`);
      console.log(`    Reference: ${job.reference}`);
      console.log(`    Status: ${job.status}`);
      console.log(`    Email: ${job.customer_email}`);
    });
  }
  
  // STEP 4: Check if job exists with ANY status
  console.log("\n" + "-".repeat(90));
  console.log("[STEP 4] Checking ALL jobs for this email (any status)...\n");
  
  const allJobsRows = await prisma.$queryRaw`
    SELECT id, reference, customer_email, status, created_at
    FROM jobs
    WHERE customer_email = ${testEmail}
  `;
  
  if ((allJobsRows as any[]).length > 0) {
    console.log(`✅ Job(s) EXIST with status breakdown:`);
    (allJobsRows as any[]).forEach((job) => {
      console.log(`  - Status: "${job.status}" | Created: ${job.created_at}`);
    });
  } else {
    console.log("❌ NO JOBS EXIST AT ALL FOR THIS EMAIL");
    console.log("\nThe INSERT statement FAILED to create the job row.");
  }
  
  // STEP 5: Check Prisma raw query to see actual insert behavior
  console.log("\n" + "-".repeat(90));
  console.log("[STEP 5] Checking if jobs table has any recent rows...\n");
  
  const recentJobs = await prisma.$queryRaw`
    SELECT id, reference, customer_email, status, created_at
    FROM jobs
    ORDER BY created_at DESC
    LIMIT 5
  `;
  
  console.log(`Recent jobs in database (last 5):`);
  (recentJobs as any[]).forEach((job) => {
    console.log(`  - ${job.reference} | Status: ${job.status} | Email: ${job.customer_email}`);
  });
  
  console.log("\n" + "=".repeat(90));
  
  await prisma.$disconnect();
}

diagnose().catch(console.error);
