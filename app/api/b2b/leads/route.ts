import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk",
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim().toLowerCase();

    const leads = await prisma.b2bLead.findMany({
      where: query ? {
        OR: [
          { businessName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { city: { contains: query, mode: "insensitive" } },
        ]
      } : undefined,
      select: {
        id: true,
        businessName: true,
        email: true,
        city: true,
        contactName: true,
        businessCategory: true,
        painPoint: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      leads: leads.map((lead) => ({
        id: lead.id,
        businessName: lead.businessName,
        email: lead.email,
        city: lead.city,
        contactName: lead.contactName,
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

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !ADMIN_EMAILS.includes(user?.emailAddresses[0]?.emailAddress ?? "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("id");

    if (!leadId) {
      return NextResponse.json({ error: "Lead ID required" }, { status: 400 });
    }

    await prisma.b2bLead.delete({
      where: { id: leadId },
    });

    return NextResponse.json({ success: true, message: "Lead deleted" });
  } catch (error) {
    console.error("[B2B LEADS DELETE] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 500 }
    );
  }
}
