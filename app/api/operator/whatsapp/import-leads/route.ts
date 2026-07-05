import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/operator/whatsapp/import-leads
 *
 * Import prospects from CSV for WhatsApp campaign
 * CSV Format: businessName, phone, contactName (optional), city (optional)
 *
 * REQUEST (FormData):
 * - file: CSV file
 *
 * RESPONSE:
 * {
 *   "success": boolean,
 *   "imported": number,
 *   "failed": number,
 *   "leads": [{id, businessName, phone, ...}]
 * }
 */

export async function POST(request: NextRequest) {
  console.log("[WHATSAPP IMPORT] Starting lead import");

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json(
        { error: "CSV must have header + at least 1 data row" },
        { status: 400 }
      );
    }

    // Parse CSV
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const businessNameIdx = headers.indexOf("businessname");
    const phoneIdx = headers.indexOf("phone");
    const contactNameIdx = headers.indexOf("contactname");
    const cityIdx = headers.indexOf("city");

    if (businessNameIdx === -1 || phoneIdx === -1) {
      return NextResponse.json(
        { error: "CSV must have 'businessName' and 'phone' columns" },
        { status: 400 }
      );
    }

    console.log(
      `[WHATSAPP IMPORT] Parsing ${lines.length - 1} leads from CSV`
    );

    // Process each row
    const importedLeads = [];
    let failedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      const fields = line.split(",").map((f) => f.trim());

      try {
        const businessName = fields[businessNameIdx];
        const phone = fields[phoneIdx];
        const contactName =
          contactNameIdx !== -1 ? fields[contactNameIdx] : null;
        const city = cityIdx !== -1 ? fields[cityIdx] : null;

        if (!businessName || !phone) {
          failedCount++;
          continue;
        }

        // Normalize phone (just numbers)
        const normalizedPhone = phone.replace(/[\D]/g, "");
        if (normalizedPhone.length < 10) {
          console.log(
            `[WHATSAPP IMPORT] Invalid phone for ${businessName}: ${phone}`
          );
          failedCount++;
          continue;
        }

        // Check if lead already exists
        const existing = await prisma.b2bLead.findFirst({
          where: {
            businessName: businessName,
            phone: phone,
          },
        });

        if (existing) {
          console.log(`[WHATSAPP IMPORT] Lead already exists: ${businessName}`);
          importedLeads.push(existing);
          continue;
        }

        // Create new lead
        const lead = await prisma.b2bLead.create({
          data: {
            businessName,
            phone,
            contactName: contactName || null,
            city: city || null,
            channel: "whatsapp",
            status: "new",
            pipeline_stage: "NEW",
            source: "csv-whatsapp-import",
          },
        });

        importedLeads.push(lead);
        console.log(`[WHATSAPP IMPORT] ✓ Created lead: ${businessName}`);
      } catch (error) {
        console.error(`[WHATSAPP IMPORT] Error processing row ${i}:`, error);
        failedCount++;
      }
    }

    console.log(
      `[WHATSAPP IMPORT] ✓ Imported ${importedLeads.length}, Failed: ${failedCount}`
    );

    return NextResponse.json({
      success: true,
      imported: importedLeads.length,
      failed: failedCount,
      leads: importedLeads.map((lead) => ({
        id: lead.id,
        businessName: lead.businessName,
        phone: lead.phone,
        contactName: lead.contactName,
        city: lead.city,
      })),
    });
  } catch (error) {
    console.error("[WHATSAPP IMPORT] ✗ Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
