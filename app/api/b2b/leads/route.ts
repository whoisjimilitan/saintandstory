import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const leads = await prisma.b2bLead.findMany({
      select: {
        id: true,
        businessName: true,
        email: true,
        businessCategory: true,
        painPoint: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 1000,
    });

    return NextResponse.json({
      success: true,
      leads: leads.map((lead) => ({
        id: lead.id,
        businessName: lead.businessName,
        email: lead.email,
        businessCategory: lead.businessCategory,
        painPoint: lead.painPoint,
        status: lead.status,
        createdAt: lead.createdAt,
      })),
    });
  } catch (error) {
    console.error("[B2B LEADS] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
