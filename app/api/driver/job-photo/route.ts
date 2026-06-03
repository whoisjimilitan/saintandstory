import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const jobId = formData.get("jobId") as string;
  const eventType = formData.get("eventType") as string;
  const latitude = formData.get("latitude") as string;
  const longitude = formData.get("longitude") as string;
  const file = formData.get("file") as File;

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  try {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Create event
    const event = await prisma.jobEvent.create({
      data: {
        jobId,
        eventType,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      },
    });

    // Generate URL (in production, upload to S3/Vercel Blob)
    const photoUrl = `/uploads/${jobId}/${Date.now()}-${file.name}`;

    // Create photo record
    await prisma.jobPhoto.create({
      data: {
        jobId,
        jobEventId: event.id,
        photoType: eventType === "collected" ? "collection" : "delivery",
        photoUrl,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      },
    });

    // Update job with photo URL
    const photoField = eventType === "collected" ? "collectionPhotoUrl" : "deliveryPhotoUrl";
    await prisma.job.update({
      where: { id: jobId },
      data: {
        [photoField]: photoUrl,
        ...(eventType === "collected" && { collectedAt: new Date() }),
        ...(eventType === "delivered" && { completedAt: new Date() }),
      },
    });

    return NextResponse.json({ success: true, eventId: event.id, photoUrl });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
