import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const {
      businessName,
      email,
      businessCategory,
      contactName,
      website,
    } = await request.json();

    if (!businessName || !email) {
      return NextResponse.json(
        { error: "businessName and email required" },
        { status: 400 }
      );
    }

    // Try to find existing lead by email
    const existing = await prisma.b2bLead.findFirst({
      where: { email },
    });

    if (existing) {
      // Update existing
      const updated = await prisma.b2bLead.update({
        where: { id: existing.id },
        data: {
          businessCategory: businessCategory || existing.businessCategory,
          contactName: contactName || existing.contactName,
          website: website || existing.website,
        },
      });

      return NextResponse.json({
        id: updated.id,
        businessName: updated.businessName,
        email: updated.email,
        created: false,
      });
    } else {
      // Create new
      const created = await prisma.b2bLead.create({
        data: {
          businessName,
          email,
          businessCategory,
          contactName,
          website,
          status: "new",
          source: "campaign",
        },
      });

      return NextResponse.json({
        id: created.id,
        businessName: created.businessName,
        email: created.email,
        created: true,
      });
    }
  } catch (error) {
    console.error("[UPSERT-LEAD] Error:", error);
    return NextResponse.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
