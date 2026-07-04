import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseOpportunityCsv } from "@/lib/opportunity-csv-parser";

export async function POST(request: NextRequest) {
  console.log("[OPPORTUNITY FEED] Import started");

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.log("[OPPORTUNITY FEED] No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".csv")) {
      console.log("[OPPORTUNITY FEED] Invalid file type:", file.name);
      return NextResponse.json({ error: "File must be CSV format" }, { status: 400 });
    }

    // Read file content
    const csvContent = await file.text();
    console.log("[OPPORTUNITY FEED] CSV file read, size:", csvContent.length);

    // Parse CSV
    let rows;
    try {
      rows = parseOpportunityCsv(csvContent);
    } catch (error) {
      console.log("[OPPORTUNITY FEED] CSV parsing failed:", error);
      return NextResponse.json(
        { error: `CSV parsing failed: ${error instanceof Error ? error.message : String(error)}` },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      console.log("[OPPORTUNITY FEED] CSV is empty");
      return NextResponse.json({ error: "CSV contains no data rows" }, { status: 400 });
    }

    console.log("[OPPORTUNITY FEED] CSV parsed successfully, rows:", rows.length);

    // Store in database
    const created: string[] = [];
    const failed: string[] = [];

    for (const row of rows) {
      try {
        await prisma.opportunityFeed.create({
          data: {
            companyName: row.companyName,
            website: row.website,
            contactName: row.contactName,
            contactEmail: row.contactEmail,
            sourcePlatform: row.sourcePlatform,
            sourceUrl: row.sourceUrl,
            postedDate: new Date(row.postedDate),
            originalWording: row.originalWording,
            confidence: row.confidence,
            status: "imported",
          },
        });
        created.push(row.companyName);
      } catch (error) {
        failed.push(
          `${row.companyName}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    console.log("[OPPORTUNITY FEED] Import complete. Created:", created.length, "Failed:", failed.length);

    return NextResponse.json(
      {
        success: true,
        imported: created.length,
        failed: failed.length,
        failedRows: failed,
        companies: created,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[OPPORTUNITY FEED] Import error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
