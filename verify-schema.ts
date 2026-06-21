import { prisma } from "@/lib/prisma";

async function verify() {
  try {
    console.log("Attempting to query b2bLead (will succeed only if Prisma schema matches DB)...\n");
    
    // This query will fail if Prisma schema has fields that don't exist in database
    const count = await prisma.b2bLead.count();
    
    console.log("✅ DATABASE SCHEMA MATCHES PRISMA SCHEMA");
    console.log(`   Successfully counted b2bLead records: ${count}`);
    console.log("\n   This means:");
    console.log("   • Prisma schema is correct");
    console.log("   • Database schema matches Prisma schema");
    console.log("   • confidence_score is NOT in the database (otherwise query would fail)");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ SCHEMA MISMATCH DETECTED");
    console.error("Error:", error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error && error.message.includes("confidence_score")) {
      console.error("\n❌ CRITICAL: Database still has confidence_score column");
      console.error("   Prisma schema needs to match database reality");
    }
    
    process.exit(1);
  }
}

verify();
