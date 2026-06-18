import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const prospects = await prisma.b2bLead.findMany({
      select: {
        id: true,
        businessName: true,
        businessCategory: true,
        email: true,
        status: true,
        leadState: true,
        city: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      prospects,
      count: prospects.length,
    });
  } catch (error) {
    console.error("[B2B PROSPECTS] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch prospects" },
      { status: 500 }
    );
  }
}
