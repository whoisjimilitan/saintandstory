import { config } from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

config({ path: path.join(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

async function main() {
  console.log("\n" + "=".repeat(90));
  console.log("FINALIZING TEST DRIVER SETUP");
  console.log("=".repeat(90) + "\n");

  try {
    // Clean up old jobs
    await prisma.job.deleteMany({
      where: { reference: { startsWith: "DEMO-" } },
    });

    const users = [
      { email: "testdriver.1@example.com", id: "user_3Ec1dR1wJSUUIbD1LQ2HyIXkRK7", name: "Alex Johnson" },
      { email: "testdriver.2@example.com", id: "user_3Ec1dewxBMYaH5p3GHxlDe1wQjY", name: "Sarah Smith" },
      { email: "testdriver.3@example.com", id: "user_3Ec1dm1G9R22BbFhe1OY9PAZXHn", name: "Mike Williams" },
    ];

    // Create drivers in database
    console.log("Creating database records...\n");
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      const driver = await prisma.driver.upsert({
        where: { email: user.email },
        update: { clerkUserId: user.id },
        create: {
          email: user.email,
          fullName: user.name,
          clerkUserId: user.id,
          phone: "+441234567890",
          area: "London",
          profileLive: true,
        },
      });

      const job = await prisma.job.create({
        data: {
          reference: `DEMO-${String(i + 1).padStart(6, "0")}`,
          trackingToken: `tk-${Date.now()}-${i}`,
          customerName: `Customer for ${user.name}`,
          customerEmail: `customer-${i + 1}@example.com`,
          customerPhone: "+441234567890",
          serviceType: "removal",
          postcodeFrom: "SW1A 1AA",
          postcodeTo: "N1 1AA",
          price: 150 + i * 50,
          status: "offered",
          driverId: driver.id,
        },
      });

      console.log(`✓ ${user.name} (${user.email})`);
      console.log(`  Job: ${job.reference} - £${job.price}`);
    }

    console.log("\n" + "=".repeat(90));
    console.log("✅ TEST DRIVERS READY TO USE");
    console.log("=".repeat(90));
    console.log("\nLOGIN URL: https://saintandstoryltd.co.uk/dashboard/driver\n");
    
    users.forEach((u) => {
      console.log(`${u.name}`);
      console.log(`  Email: ${u.email}`);
      console.log(`  Password: TestDriver123!`);
      console.log();
    });

    console.log("WHAT YOU CAN DO:");
    console.log("1. Click a job");
    console.log("2. Record 'Arrived at Pickup'");
    console.log("3. Record 'Collected Parcel' (upload photo)");
    console.log("4. Record 'On My Way'");
    console.log("5. Record 'Arrived at Delivery'");
    console.log("6. Record 'Delivered' (upload photo)");
    console.log("7. View earnings dashboard with auto-generated invoice\n");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
