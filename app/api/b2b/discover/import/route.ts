import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ensureB2BSchema } from "@/lib/b2b-schema";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];

async function isAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const user = await currentUser();
  return ADMIN_EMAILS.includes(user?.emailAddresses[0]?.emailAddress ?? "");
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "Only CSV files are supported" },
        { status: 400 }
      );
    }

    const csvText = await file.text();
    const lines = csvText.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json(
        { error: "CSV must contain at least a header and one data row" },
        { status: 400 }
      );
    }

    await ensureB2BSchema();

    // Parse CSV header
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const businessNameIdx = headers.indexOf("businessname");
    const cityIdx = headers.indexOf("city");
    const industryIdx = headers.indexOf("industry");
    const contactNameIdx = headers.indexOf("contactname");

    if (businessNameIdx === -1) {
      return NextResponse.json(
        { error: "CSV must contain 'businessName' column" },
        { status: 400 }
      );
    }

    const importedLeads = [];
    const timestamp = new Date();

    // Parse CSV data rows
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());

      if (values.length < 1 || !values[businessNameIdx]) {
        continue;
      }

      const lead = {
        businessName: values[businessNameIdx],
        city: cityIdx !== -1 ? values[cityIdx] : undefined,
        industry: industryIdx !== -1 ? values[industryIdx] : undefined,
        contactName: contactNameIdx !== -1 ? values[contactNameIdx] : undefined,
        source: "csv_import",
        status: "imported",
        confidenceScore: 65,
        createdAt: timestamp,
      };

      try {
        const created = await prisma.b2bLead.create({
          data: lead as any,
        });
        importedLeads.push(created);
      } catch (err) {
        // Log but continue with other leads
        console.error(`[DISCOVER_IMPORT] Failed to create lead: ${err}`);
      }
    }

    return NextResponse.json({
      results: importedLeads,
      totalCount: importedLeads.length,
      importedCount: importedLeads.length,
      message: `Successfully imported ${importedLeads.length} leads`,
    });
  } catch (error) {
    console.error("[DISCOVER_IMPORT] Error:", error);
    return NextResponse.json(
      { error: "Failed to import leads" },
      { status: 500 }
    );
  }
}
