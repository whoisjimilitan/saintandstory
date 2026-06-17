import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ outreachId: string }> }
) {
  try {
    const { outreachId } = await params;
    const outreach = await prisma.b2b_outreach.findUnique({
      where: { id: outreachId },
      include: {
        b2b_leads: {
          select: {
            business_name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!outreach) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(outreach);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch" },
      { status: 500 }
    );
  }
}
