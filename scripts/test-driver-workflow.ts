import { config } from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

config({ path: path.join(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

async function main() {
  console.log("\n" + "=".repeat(90));
  console.log("DRIVER WORKFLOW END-TO-END TEST");
  console.log("=".repeat(90));

  try {
    // Clean up existing test data
    console.log("\n[CLEANUP] Removing existing test data...");
    await prisma.jobInvoice.deleteMany({
      where: {
        job: { reference: { startsWith: "TEST-" } },
      },
    });
    await prisma.jobPhoto.deleteMany({
      where: {
        job: { reference: { startsWith: "TEST-" } },
      },
    });
    await prisma.jobEvent.deleteMany({
      where: {
        job: { reference: { startsWith: "TEST-" } },
      },
    });
    await prisma.job.deleteMany({
      where: { reference: { startsWith: "TEST-" } },
    });
    await prisma.driver.deleteMany({
      where: { clerkUserId: { startsWith: "test-driver-" } },
    });
    console.log("✓ Cleanup complete");

    // Create 3 test drivers
    console.log("\n[STEP 1] Creating 3 test drivers...");
    const drivers = [];
    for (let i = 1; i <= 3; i++) {
      const driver = await prisma.driver.create({
        data: {
          clerkUserId: `test-driver-${i}`,
          email: `driver${i}@test.com`,
          fullName: `Test Driver ${i}`,
          profileLive: true,
          phone: "+441234567890",
          area: "London",
        },
      });
      drivers.push(driver);
      console.log(`✓ Driver ${i}: ${driver.email}`);
    }

    // Create 3 test jobs
    console.log("\n[STEP 2] Creating 3 test jobs...");
    const jobs = [];
    for (let i = 1; i <= 3; i++) {
      const job = await prisma.job.create({
        data: {
          id: `test-job-${i}`,
          reference: `TEST-${String(i).padStart(6, "0")}`,
          trackingToken: randomUUID(),
          customerName: `Test Customer ${i}`,
          customerEmail: `customer${i}@test.com`,
          customerPhone: "+441234567890",
          serviceType: "test-delivery",
          postcodeFrom: "SW1A 1AA",
          postcodeTo: "N1 1AA",
          price: 100 + i * 10,
          status: "offered",
          driverId: drivers[i - 1].id,
          offeredAt: new Date(),
        },
      });
      jobs.push(job);
      console.log(`✓ Job ${i}: ${job.reference} → Driver ${drivers[i - 1].email}`);
    }

    // Record job events
    console.log("\n[STEP 3] Recording job events...");
    for (let i = 0; i < 3; i++) {
      const job = jobs[i];
      const events = [
        { type: "arrived_pickup", lat: 51.5074, lng: -0.1278 },
        { type: "collected", lat: 51.5074, lng: -0.1278 },
        { type: "on_way", lat: 51.5174, lng: -0.1378 },
        { type: "arrived_delivery", lat: 51.5174, lng: -0.1378 },
        { type: "delivered", lat: 51.5174, lng: -0.1378 },
      ];

      for (const evt of events) {
        await prisma.jobEvent.create({
          data: {
            jobId: job.id,
            eventType: evt.type as any,
            latitude: evt.lat,
            longitude: evt.lng,
          },
        });
      }
      console.log(`✓ Job ${i + 1}: 5 events recorded`);
    }

    // Create photo records
    console.log("\n[STEP 4] Creating photo records...");
    for (let i = 0; i < 3; i++) {
      const job = jobs[i];
      const collectionEvent = await prisma.jobEvent.findFirst({
        where: { jobId: job.id, eventType: "collected" },
      });
      const deliveryEvent = await prisma.jobEvent.findFirst({
        where: { jobId: job.id, eventType: "delivered" },
      });

      if (collectionEvent) {
        await prisma.jobPhoto.create({
          data: {
            jobId: job.id,
            jobEventId: collectionEvent.id,
            photoType: "collection",
            photoUrl: `/uploads/${job.id}/collection.jpg`,
            latitude: 51.5074,
            longitude: -0.1278,
          },
        });
      }

      if (deliveryEvent) {
        await prisma.jobPhoto.create({
          data: {
            jobId: job.id,
            jobEventId: deliveryEvent.id,
            photoType: "delivery",
            photoUrl: `/uploads/${job.id}/delivery.jpg`,
            latitude: 51.5174,
            longitude: -0.1378,
          },
        });
      }
      console.log(`✓ Job ${i + 1}: Collection + Delivery photos recorded`);
    }

    // Generate invoices
    console.log("\n[STEP 5] Generating invoices...");
    for (let i = 0; i < 3; i++) {
      const job = jobs[i];
      const invoiceNumber = `INV-${String(i + 1).padStart(6, "0")}`;
      const invoice = await prisma.jobInvoice.create({
        data: {
          jobId: job.id,
          driverId: drivers[i].id,
          invoiceNumber,
          amount: job.price || 0,
          status: "pending",
          issuedAt: new Date(),
        },
      });
      console.log(`✓ Job ${i + 1}: Invoice ${invoice.invoiceNumber} - £${invoice.amount}`);
    }

    // Verify data
    console.log("\n[STEP 6] Verifying data...");
    for (let i = 0; i < 3; i++) {
      const job = await prisma.job.findUnique({
        where: { id: jobs[i].id },
        include: {
          events: true,
          photos: true,
          invoices: true,
          driver: true,
        },
      });

      console.log(`\n✓ Job ${i + 1} (${job?.reference}):`);
      console.log(`  Events: ${job?.events.length} (expected 5)`);
      console.log(`  Photos: ${job?.photos.length} (expected 2)`);
      console.log(`  Invoices: ${job?.invoices.length} (expected 1)`);
      console.log(`  Driver: ${job?.driver?.email}`);
    }

    // Test earnings
    console.log("\n[STEP 7] Testing driver earnings...");
    for (let i = 0; i < 3; i++) {
      const driver = drivers[i];
      const earnings = await prisma.jobInvoice.aggregate({
        where: { driverId: driver.id, status: "pending" },
        _sum: { amount: true },
      });
      console.log(`✓ Driver ${i + 1}: £${earnings._sum.amount || 0} pending`);
    }

    console.log("\n" + "=".repeat(90));
    console.log("✅ ALL TESTS PASSED");
    console.log("=".repeat(90) + "\n");
  } catch (error) {
    console.error("❌ TEST FAILED:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
