import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { jobId, eventType, latitude, longitude } = body;

  try {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.driverId !== (await getDriverId(userId))) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const event = await prisma.jobEvent.create({
      data: {
        jobId,
        eventType,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      },
    });

    // Update job timestamps based on event
    const updateData: Record<string, any> = {};
    if (eventType === "arrived_pickup") updateData.arrivedPickupAt = new Date();
    if (eventType === "collected") updateData.collectedAt = new Date();
    if (eventType === "arrived_delivery") updateData.arrivedDeliveryAt = new Date();
    if (eventType === "delivered") updateData.completedAt = new Date();

    if (Object.keys(updateData).length > 0) {
      await prisma.job.update({ where: { id: jobId }, data: updateData });
    }

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

async function getDriverId(clerkUserId: string) {
  const driver = await prisma.driver.findUnique({
    where: { clerkUserId },
  });
  return driver?.id;
}
