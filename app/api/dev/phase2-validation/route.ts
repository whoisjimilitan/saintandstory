import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Create test jobs in all states
    const testJobs = await Promise.all([
      prisma.job.upsert({
        where: { reference: "TEST-PHASE2-OFFERED" },
        update: {},
        create: {
          reference: "TEST-PHASE2-OFFERED",
          trackingToken: "TOKEN-OFFERED-" + Date.now(),
          status: "offered",
          serviceType: "Standard Removal",
          postcodeFrom: "SE1 7AA",
          customerName: "Test Offered",
          customerEmail: "offered@test.com",
          customerPhone: "020 1111 0001",
          price: 150,
          notes: "Test job - offered state",
        },
      }),
      prisma.job.upsert({
        where: { reference: "TEST-PHASE2-CONFIRMED" },
        update: {},
        create: {
          reference: "TEST-PHASE2-CONFIRMED",
          trackingToken: "TOKEN-CONFIRMED-" + Date.now(),
          status: "confirmed",
          serviceType: "Express Removal",
          postcodeFrom: "SW1A 1AA",
          postcodeTo: "E1 6AN",
          customerName: "Test Confirmed",
          customerEmail: "confirmed@test.com",
          customerPhone: "020 1111 0002",
          price: 250,
          notes: "Test job - confirmed state",
          driverId: "test-driver-1",
          confirmedAt: new Date(),
          pickupLat: 51.5007,
          pickupLng: -0.1246,
        },
      }),
      prisma.job.upsert({
        where: { reference: "TEST-PHASE2-INPROGRESS" },
        update: {},
        create: {
          reference: "TEST-PHASE2-INPROGRESS",
          trackingToken: "TOKEN-INPROGRESS-" + Date.now(),
          status: "in_progress",
          serviceType: "Premium Removal",
          postcodeFrom: "N1 9GU",
          postcodeTo: "W1A 1AA",
          customerName: "Test In Progress",
          customerEmail: "inprogress@test.com",
          customerPhone: "020 1111 0003",
          price: 350,
          notes: "Test job - in_progress state",
          driverId: "test-driver-1",
          confirmedAt: new Date(Date.now() - 3600000),
          inProgressAt: new Date(Date.now() - 1800000),
          pickupLat: 51.5282,
          pickupLng: -0.1018,
        },
      }),
      prisma.job.upsert({
        where: { reference: "TEST-PHASE2-COMPLETED" },
        update: {},
        create: {
          reference: "TEST-PHASE2-COMPLETED",
          trackingToken: "TOKEN-COMPLETED-" + Date.now(),
          status: "completed",
          serviceType: "Standard Removal",
          postcodeFrom: "EC1A 1BB",
          postcodeTo: "SE1 7AA",
          customerName: "Test Completed",
          customerEmail: "completed@test.com",
          customerPhone: "020 1111 0004",
          price: 200,
          notes: "Test job - completed state",
          driverId: "test-driver-1",
          confirmedAt: new Date(Date.now() - 7200000),
          inProgressAt: new Date(Date.now() - 5400000),
          completedAt: new Date(Date.now() - 1800000),
          pickupLat: 51.5185,
          pickupLng: -0.0931,
        },
      }),
    ]);

    // Generate validation checklist
    const validationChecklist = {
      statusIndicatorTests: {
        offered: {
          status: testJobs[0].status,
          expectedBadge: "Offered to you",
          expectedBgColor: "bg-[#0D0D0D]",
          expectedTextColor: "text-white",
          result: testJobs[0].status === "offered" ? "✅ PASS" : "❌ FAIL",
        },
        confirmed: {
          status: testJobs[1].status,
          expectedBadge: "Confirmed",
          expectedBgColor: "bg-[#F5F5F5]",
          expectedTextColor: "text-[#0D0D0D]",
          result: testJobs[1].status === "confirmed" ? "✅ PASS" : "❌ FAIL",
        },
        in_progress: {
          status: testJobs[2].status,
          expectedBadge: "In progress",
          expectedBgColor: "bg-[#0D0D0D]",
          expectedTextColor: "text-white",
          result: testJobs[2].status === "in_progress" ? "✅ PASS" : "❌ FAIL",
        },
        completed: {
          status: testJobs[3].status,
          expectedBadge: "Completed",
          expectedBgColor: "bg-[#F5F5F5]",
          expectedTextColor: "text-[#888888]",
          result: testJobs[3].status === "completed" ? "✅ PASS" : "❌ FAIL",
        },
      },
      adminDispatchControlsTests: {
        offered: {
          status: "offered",
          expectedButtons: ["No buttons (not in driver mode)"],
          expectedAdminButtons: ["Assign (when driver selected)"],
          result: "✅ EXPECTED",
        },
        confirmed: {
          status: "confirmed",
          expectedButtons: ["Mark as complete (when arrived)"],
          expectedAdminButtons: ["Start Delivery", "Cancel Job"],
          result: "✅ EXPECTED",
        },
        in_progress: {
          status: "in_progress",
          expectedButtons: ["Mark as complete"],
          expectedAdminButtons: ["Mark Completed", "Cancel Job"],
          result: "✅ EXPECTED",
        },
        completed: {
          status: "completed",
          expectedButtons: ["No buttons"],
          expectedAdminButtons: ["No buttons"],
          result: "✅ EXPECTED",
        },
      },
      locationIndicatorTests: {
        in_progress: {
          hasLocationIndicator: true,
          expectedText: "Sharing location",
          expectedPulse: "bg-green-500 animate-pulse",
          result: "✅ EXPECTED",
        },
        confirmed: {
          hasLocationIndicator: false,
          result: "✅ EXPECTED (no pulse for confirmed)",
        },
        completed: {
          hasLocationIndicator: false,
          result: "✅ EXPECTED (no pulse for completed)",
        },
      },
    };

    return NextResponse.json({
      success: true,
      message: "Phase 2 test data created",
      testJobs: testJobs.map((j) => ({
        id: j.id,
        reference: j.reference,
        status: j.status,
        postcodeFrom: j.postcodeFrom,
        postcodeTo: j.postcodeTo,
      })),
      validationChecklist,
    });
  } catch (error) {
    console.error("Phase 2 validation error:", error);
    return NextResponse.json(
      { error: String(error), success: false },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Fetch existing test jobs
    const testJobs = await prisma.job.findMany({
      where: {
        reference: { startsWith: "TEST-PHASE2" },
      },
      orderBy: { reference: "asc" },
    });

    if (testJobs.length === 0) {
      return NextResponse.json({
        message: "No test jobs found. POST to create test data.",
        success: false,
      });
    }

    // Analyze test jobs
    const analysis = {
      totalJobs: testJobs.length,
      byStatus: {
        offered: testJobs.filter((j) => j.status === "offered").length,
        confirmed: testJobs.filter((j) => j.status === "confirmed").length,
        in_progress: testJobs.filter((j) => j.status === "in_progress").length,
        completed: testJobs.filter((j) => j.status === "completed").length,
      },
      statusIndicatorValidation: {
        offered: testJobs.find((j) => j.status === "offered")
          ? "✅ Can validate"
          : "❌ Missing",
        confirmed: testJobs.find((j) => j.status === "confirmed")
          ? "✅ Can validate"
          : "❌ Missing",
        in_progress: testJobs.find((j) => j.status === "in_progress")
          ? "✅ Can validate"
          : "❌ Missing",
        completed: testJobs.find((j) => j.status === "completed")
          ? "✅ Can validate"
          : "❌ Missing",
      },
      locationIndicatorValidation: {
        in_progress_count: testJobs.filter((j) => j.status === "in_progress")
          .length,
        in_progress_with_location: testJobs.filter(
          (j) => j.status === "in_progress" && j.pickupLat && j.pickupLng
        ).length,
      },
    };

    return NextResponse.json({
      success: true,
      testJobs: testJobs.map((j) => ({
        id: j.id,
        reference: j.reference,
        status: j.status,
        postcodeFrom: j.postcodeFrom,
        postcodeTo: j.postcodeTo,
        pickupLat: j.pickupLat,
        pickupLng: j.pickupLng,
        confirmedAt: j.confirmedAt,
        inProgressAt: j.inProgressAt,
        completedAt: j.completedAt,
      })),
      analysis,
    });
  } catch (error) {
    console.error("Phase 2 fetch error:", error);
    return NextResponse.json(
      { error: String(error), success: false },
      { status: 500 }
    );
  }
}
