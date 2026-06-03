import { config } from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

config({ path: path.join(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

async function main() {
  console.log("\n" + "=".repeat(90));
  console.log("LINKING CLERK USERS TO TEST DRIVERS");
  console.log("=".repeat(90) + "\n");

  const mappings = [
    { email: "testdriver1@example.com", clerkId: "user_3Ec0oHTexi9LSCtXc0AX3xMNsnt" },
    { email: "testdriver2@example.com", clerkId: "user_3Ec0oPW73CMdTUz7QE3HfxRixQs" },
    { email: "testdriver3@example.com", clerkId: "user_3Ec0oX96LK18nrIP2LGqdHkmnHh" },
  ];

  for (const mapping of mappings) {
    await prisma.driver.update({
      where: { email: mapping.email },
      data: { clerkUserId: mapping.clerkId },
    });
    console.log(`✓ ${mapping.email} → ${mapping.clerkId}`);
  }

  console.log("\n" + "=".repeat(90));
  console.log("✅ TEST DRIVERS READY TO USE");
  console.log("=".repeat(90) + "\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
