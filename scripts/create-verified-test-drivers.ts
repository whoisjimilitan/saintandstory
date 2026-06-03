import { config } from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

config({ path: path.join(process.cwd(), ".env.local") });

const CLERK_API_KEY = process.env.CLERK_SECRET_KEY;
const CLERK_API_URL = "https://api.clerk.com/v1";
const prisma = new PrismaClient();

async function createClerkUserVerified(email: string, name: string) {
  const response = await fetch(`${CLERK_API_URL}/users`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${CLERK_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: [email],
      first_name: name.split(" ")[0],
      last_name: name.split(" ")[1] || "",
      password: "TestDriver123!",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(JSON.stringify(error));
  }

  const user = await response.json();

  // Mark email as verified immediately
  try {
    await fetch(`${CLERK_API_URL}/users/${user.id}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${CLERK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_verified: true,
      }),
    });
  } catch (e) {
    console.log("  (Email auto-verification skipped)");
  }

  return user;
}

async function main() {
  console.log("\n" + "=".repeat(90));
  console.log("CREATING TEST DRIVERS (READY TO LOG IN)");
  console.log("=".repeat(90) + "\n");

  try {
    // Clean up
    await prisma.driver.deleteMany({
      where: { email: { in: ["testdriver.1@example.com", "testdriver.2@example.com", "testdriver.3@example.com"] } },
    });

    const users = [
      { email: "testdriver.1@example.com", name: "Alex Johnson" },
      { email: "testdriver.2@example.com", name: "Sarah Smith" },
      { email: "testdriver.3@example.com", name: "Mike Williams" },
    ];

    const createdUsers: { email: string; id: string; name: string }[] = [];

    console.log("Creating test drivers...\n");
    for (const user of users) {
      const result = await createClerkUserVerified(user.email, user.name);
      createdUsers.push({ email: user.email, id: result.id, name: user.name });
      console.log(`✓ ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: TestDriver123!`);
      console.log(`  ID: ${result.id}\n`);
    }

    console.log("Creating jobs for drivers...\n");
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];

      const job = await prisma.job.create({
        data: {
          reference: `DEMO-${String(i + 1).padStart(6, "0")}`,
          trackingToken: `tk-${user.id}`,
          customerName: `Customer for ${user.name}`,
          customerEmail: `customer-${i + 1}@example.com`,
          customerPhone: "+441234567890",
          serviceType: "removal",
          postcodeFrom: "SW1A 1AA",
          postcodeTo: "N1 1AA",
          price: 150 + i * 50,
          status: "offered",
        },
      });

      const driver = await prisma.driver.create({
        data: {
          email: user.email,
          fullName: user.name,
          clerkUserId: user.id,
          phone: "+441234567890",
          area: "London",
          profileLive: true,
        },
      });

      await prisma.job.update({
        where: { id: job.id },
        data: { driverId: driver.id },
      });

      console.log(`✓ ${job.reference} assigned to ${user.name}`);
    }

    console.log("\n" + "=".repeat(90));
    console.log("✅ READY TO TEST");
    console.log("=".repeat(90));
    console.log("\nGO TO: https://saintandstoryltd.co.uk/dashboard/driver\n");
    createdUsers.forEach((u) => {
      console.log(`${u.name}`);
      console.log(`  Email: ${u.email}`);
      console.log(`  Password: TestDriver123!\n`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
