import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("[BRIEF SERVER] Serving brief for:", params.id);

  try {
    const brief = await prisma.generatedBrief.findFirst({
      where: {
        publicUrl: `/api/intelligence/brief/${params.id}`,
      },
    });

    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }

    return new NextResponse(brief.htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("[BRIEF SERVER] Error:", error);
    return NextResponse.json(
      { error: "Failed to serve brief" },
      { status: 500 }
    );
  }
}
