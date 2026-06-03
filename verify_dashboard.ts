import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import path from "path";

config({ path: path.join(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

async function verifyDashboard() {
  console.log("\n" + "=".repeat(90));
  console.log("ADMIN DASHBOARD VERIFICATION");
  console.log("=".repeat(90));
  
  // Get all pending_review jobs
  const pendingJobs = await prisma.$queryRaw`
    SELECT id, reference, customer_email, customer_name, postcode_from, postcode_to, status, created_at
    FROM jobs
    WHERE status = 'pending_review'
    ORDER BY created_at DESC
    LIMIT 10
  `;
  
  console.log(`\n✅ Found ${(pendingJobs as any[]).length} pending review job(s) on admin dashboard:\n`);
  
  (pendingJobs as any[]).forEach((job, i) => {
    console.log(`${i + 1}. ${job.reference}`);
    console.log(`   Customer: ${job.customer_name}`);
    console.log(`   Email: ${job.customer_email}`);
    console.log(`   Route: ${job.postcode_from} → ${job.postcode_to}`);
    console.log(`   Created: ${job.created_at}\n`);
  });
  
  console.log("=".repeat(90));
  console.log(`✅ ADMIN DASHBOARD NOW SHOWS ${(pendingJobs as any[]).length} JOBS`);
  console.log("=".repeat(90) + "\n");
  
  await prisma.$disconnect();
}

verifyDashboard().catch(console.error);
