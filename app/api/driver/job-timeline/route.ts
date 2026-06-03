import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobId = request.nextUrl.searchParams.get("jobId");
  if (!jobId) return NextResponse.json({ error: "Missing jobId" }, { status: 400 });

  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        events: {
          include: {
            photos: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const timeline = job.events.map(event => ({
      id: event.id,
      type: event.eventType,
      timestamp: event.createdAt,
      latitude: event.latitude,
      longitude: event.longitude,
      photos: event.photos.map(p => ({
        id: p.id,
        url: p.photoUrl,
        type: p.photoType,
      })),
    }));

    return NextResponse.json(timeline);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
