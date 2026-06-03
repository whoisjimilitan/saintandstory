import { config } from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

config({ path: path.join(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

async function main() {
  console.log("\n" + "=".repeat(90));
  console.log("CREATE TEST DRIVERS FOR MANUAL TESTING");
  console.log("=".repeat(90));

  try {
    // Clean up existing test drivers
    console.log("\n[STEP 1] Cleaning up existing test drivers...");
    await prisma.driver.deleteMany({
      where: { email: { in: ["testdriver1@example.com", "testdriver2@example.com", "testdriver3@example.com"] } },
    });
    console.log("✓ Cleanup complete");

    // Create 3 test drivers with placeholder Clerk IDs
    console.log("\n[STEP 2] Creating test drivers...");
    const drivers = [
      {
        email: "testdriver1@example.com",
        fullName: "Alex Johnson",
        clerkUserId: "user_test_driver_1",
        password: "TestDriver123!",
      },
      {
        email: "testdriver2@example.com",
        fullName: "Sarah Smith",
        clerkUserId: "user_test_driver_2",
        password: "TestDriver123!",
      },
      {
        email: "testdriver3@example.com",
        fullName: "Mike Williams",
        clerkUserId: "user_test_driver_3",
        password: "TestDriver123!",
      },
    ];

    for (const driverData of drivers) {
      const driver = await prisma.driver.create({
        data: {
          email: driverData.email,
          fullName: driverData.fullName,
          clerkUserId: driverData.clerkUserId,
          profileLive: true,
          phone: "+441234567890",
          area: "London",
        },
      });
      console.log(`✓ ${driver.fullName} (${driver.email})`);
      console.log(`  Password: ${driverData.password}`);
      console.log(`  Clerk ID: ${driver.clerkUserId}`);
    }

    // Create test jobs assigned to these drivers
    console.log("\n[STEP 3] Creating test jobs for drivers...");
    const driverEmails = drivers.map((d) => d.email);
    const createdDrivers = await prisma.driver.findMany({
      where: { email: { in: driverEmails } },
    });

    for (let i = 0; i < createdDrivers.length; i++) {
      const job = await prisma.job.create({
        data: {
          reference: `DEMO-${String(i + 1).padStart(6, "0")}`,
          trackingToken: `tracking-${i + 1}`,
          customerName: `Demo Customer ${i + 1}`,
          customerEmail: `customer${i + 1}@example.com`,
          customerPhone: "+441234567890",
          serviceType: "removal",
          postcodeFrom: "SW1A 1AA",
          postcodeTo: "N1 1AA",
          price: 150 + i * 50,
          status: "offered",
          driverId: createdDrivers[i].id,
          offeredAt: new Date(),
        },
      });
      console.log(`✓ Job ${job.reference} assigned to ${createdDrivers[i].fullName}`);
    }

    console.log("\n" + "=".repeat(90));
    console.log("✅ TEST DRIVERS READY");
    console.log("=".repeat(90));
    console.log("\nNEXT STEPS:");
    console.log("1. Go to Clerk Dashboard: https://dashboard.clerk.com");
    console.log("2. Create these test users with matching emails:");
    drivers.forEach((d) => {
      console.log(`   • Email: ${d.email}`);
      console.log(`     Password: ${d.password}`);
    });
    console.log("\n3. Copy the Clerk User ID for each user");
    console.log("4. Run: npx tsx scripts/link-clerk-ids.ts");
    console.log("5. Log in to /dashboard/driver with test driver email\n");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
