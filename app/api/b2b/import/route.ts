import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ImportLead {
  business_name: string;
  email: string;
  category: string;
  pressure_type: string;
}

interface ImportRequest {
  leads: ImportLead[];
}

const VALID_PRESSURE_TYPES = [
  "Delivery delays",
  "Staff turnover",
  "Cash flow",
  "Customer complaints",
  "Operations chaos",
];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ImportRequest;

    if (!body.leads || !Array.isArray(body.leads)) {
      return NextResponse.json(
        { error: "Invalid request: leads array required" },
        { status: 400 }
      );
    }

    if (body.leads.length === 0) {
      return NextResponse.json(
        { error: "Leads array cannot be empty" },
        { status: 400 }
      );
    }

    const errors: string[] = [];
    let successCount = 0;
    let failedCount = 0;

    // Process each lead
    for (let i = 0; i < body.leads.length; i++) {
      const lead = body.leads[i];
      const rowNumber = i + 2; // CSV row number (header is row 1)

      try {
        // Validate required fields
        if (!lead.business_name?.trim()) {
          errors.push(`Row ${rowNumber}: business_name is required`);
          failedCount++;
          continue;
        }

        if (!lead.email?.trim()) {
          errors.push(`Row ${rowNumber}: email is required`);
          failedCount++;
          continue;
        }

        if (!lead.category?.trim()) {
          errors.push(`Row ${rowNumber}: category is required`);
          failedCount++;
          continue;
        }

        if (!lead.pressure_type?.trim()) {
          errors.push(`Row ${rowNumber}: pressure_type is required`);
          failedCount++;
          continue;
        }

        // Validate email format (basic)
        if (!lead.email.includes("@")) {
          errors.push(`Row ${rowNumber}: invalid email format`);
          failedCount++;
          continue;
        }

        // Validate pressure type
        if (!VALID_PRESSURE_TYPES.includes(lead.pressure_type)) {
          errors.push(
            `Row ${rowNumber}: invalid pressure_type "${lead.pressure_type}"`
          );
          failedCount++;
          continue;
        }

        // Check for duplicate email
        const existing = await prisma.b2bLead.findFirst({
          where: { email: lead.email.toLowerCase() },
        });

        if (existing) {
          errors.push(`Row ${rowNumber}: email already exists (${lead.email})`);
          failedCount++;
          continue;
        }

        // Create lead
        await (prisma.b2bLead as any).create({
          data: {
            business_name: lead.business_name,
            email: lead.email.toLowerCase(),
            business_category: lead.category,
            pain_point: lead.pressure_type,
            status: "new",
            lead_state: "new",
            engagement_score: 0,
          },
        });

        successCount++;
      } catch (err) {
        errors.push(
          `Row ${rowNumber}: ${err instanceof Error ? err.message : "Unknown error"}`
        );
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      successCount,
      failed: failedCount,
      errors: errors.slice(0, 50), // Limit to 50 errors in response
      totalProcessed: body.leads.length,
    });
  } catch (error) {
    console.error("[B2B IMPORT] Error:", error);
    return NextResponse.json(
      { error: "Failed to import leads" },
      { status: 500 }
    );
  }
}
