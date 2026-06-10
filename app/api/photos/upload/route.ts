import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const photoType = formData.get("type") as string; // "verification" | "pickup" | "delivery"
    const jobId = formData.get("jobId") as string | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!photoType || !["verification", "pickup", "delivery"].includes(photoType)) {
      return NextResponse.json({ error: "Invalid photo type" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const filename = `${photoType}-${userId}-${timestamp}-${random}.${file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp"}`;

    // Convert file to buffer
    const buffer = await file.arrayBuffer();

    // Store file with metadata
    const sql = neon(process.env.DATABASE_URL!);

    if (photoType === "verification") {
      // Update driver verification
      await sql`
        UPDATE drivers
        SET verification_photo_url = ${filename},
            verification_submitted_at = NOW(),
            verification_status = 'pending'
        WHERE clerk_user_id = ${userId}
      `;
    } else if (photoType === "pickup" && jobId) {
      // Update job pickup photo
      await sql`
        UPDATE jobs
        SET pickup_photo_url = ${filename},
            pickup_photo_taken_at = NOW()
        WHERE id = ${jobId}
      `;
    } else if (photoType === "delivery" && jobId) {
      // Update job delivery photo
      await sql`
        UPDATE jobs
        SET delivery_photo_url = ${filename},
            delivery_photo_taken_at = NOW()
        WHERE id = ${jobId}
      `;
    }

    // Store file reference in a simple file storage (could be upgraded to S3/Blob)
    // For now, store the filename as the URL (in production, integrate with actual storage)
    const fileUrl = `/photos/${filename}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Photo Upload] Error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
