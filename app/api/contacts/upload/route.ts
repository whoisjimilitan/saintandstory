import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk",
];

export async function POST(request: NextRequest) {
  try {
    console.log("[CONTACTS UPLOAD] Starting CSV upload");

    const { userId } = await auth();
    const user = await currentUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user?.emailAddresses[0]?.emailAddress ?? "";
    if (!ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json(
        { error: "CSV must have header row and at least one data row" },
        { status: 400 }
      );
    }

    // Parse header
    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().toLowerCase());
    const businessNameIdx = headers.findIndex((h) =>
      h.includes("business")
    );
    const contactNameIdx = headers.findIndex((h) =>
      h.includes("contact") || h.includes("name")
    );
    const phoneIdx = headers.findIndex((h) => h.includes("phone"));
    const postcodeIdx = headers.findIndex((h) => h.includes("postcode"));
    const industryIdx = headers.findIndex((h) => h.includes("industry"));
    const emailIdx = headers.findIndex((h) => h.includes("email"));

    if (businessNameIdx === -1 || contactNameIdx === -1 || phoneIdx === -1) {
      return NextResponse.json(
        {
          error:
            "CSV must have Business Name, Contact Name, and Phone columns",
        },
        { status: 400 }
      );
    }

    console.log("[CONTACTS UPLOAD] Parsing CSV data");

    const contacts = [];
    for (let i = 1; i < lines.length; i++) {
      const cells = lines[i].split(",").map((c) => c.trim());

      if (!cells[businessNameIdx] || !cells[contactNameIdx] || !cells[phoneIdx]) {
        continue; // Skip incomplete rows
      }

      contacts.push({
        businessName: cells[businessNameIdx],
        contactName: cells[contactNameIdx],
        phone: cells[phoneIdx],
        postcode: postcodeIdx !== -1 ? cells[postcodeIdx] : "Unknown",
        industry: industryIdx !== -1 ? cells[industryIdx] : null,
        email: emailIdx !== -1 ? cells[emailIdx] : null,
        userId,
        status: "not_called",
      });
    }

    console.log(`[CONTACTS UPLOAD] Creating ${contacts.length} contacts`);

    const created = await prisma.contact.createMany({
      data: contacts,
      skipDuplicates: true,
    });

    console.log(`[CONTACTS UPLOAD] ✓ Created ${created.count} contacts`);

    return NextResponse.json({
      success: true,
      created: created.count,
      message: `Uploaded ${created.count} contacts to call queue`,
    });
  } catch (error) {
    console.error("[CONTACTS UPLOAD] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to upload CSV",
      },
      { status: 500 }
    );
  }
}
