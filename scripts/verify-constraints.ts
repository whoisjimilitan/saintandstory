import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyConstraints() {
  console.log("🔒 VERIFYING SAFETY CONSTRAINTS\n");

  try {
    // Check for constraints in information_schema
    const constraints = await prisma.$queryRaw`
      SELECT constraint_name, table_name, column_name
      FROM information_schema.constraint_column_usage
      WHERE constraint_name LIKE 'uq_%'
      ORDER BY table_name, constraint_name
    `;

    console.log("Constraints found:\n");
    console.table(constraints);

    // Specifically check for our two constraints
    const hasQBConstraint = (constraints as any[]).some(
      c => c.constraint_name === 'uq_qualified_discovered_business'
    );
    const hasBLConstraint = (constraints as any[]).some(
      c => c.constraint_name === 'uq_b2b_leads_qualified_business'
    );

    console.log("\n" + "=".repeat(60));
    console.log("CONSTRAINT STATUS:");
    console.log("=".repeat(60));
    console.log(`✓ uq_qualified_discovered_business: ${hasQBConstraint ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`✓ uq_b2b_leads_qualified_business: ${hasBLConstraint ? '✅ EXISTS' : '❌ MISSING'}`);

    if (!hasQBConstraint || !hasBLConstraint) {
      console.log("\n⚠️  CONSTRAINTS NOT FULLY IN PLACE");
      console.log("Phase 2.2 cannot proceed without both constraints.\n");
      process.exit(1);
    } else {
      console.log("\n✅ ALL SAFETY CONSTRAINTS IN PLACE\n");
    }

  } catch (error) {
    console.error("Error verifying constraints:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyConstraints();
