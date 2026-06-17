import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enrichLeadWithOutreach } from "@/lib/b2b-enrichment-orchestrator";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const text = await file.text();
    const lines = text.split("\n");

    let processed = 0;
    let duplicates = 0;
    let errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(",").map((s) => s.trim());
      if (parts.length < 5) {
        errors.push(`Row ${i + 1}: insufficient fields`);
        continue;
      }

      const [name, category, city, postcode, email, phone] = parts;

      try {
        // Check for duplicates
        const existing = await prisma.b2b_leads.findFirst({
          where: { email },
        });

        if (existing) {
          duplicates++;
          continue;
        }

        // Create lead
        const lead = await prisma.b2b_leads.create({
          data: {
            business_name: name,
            business_category: category,
            city,
            postcode,
            email,
            phone: phone || null,
            engagement_score: 30,
            lead_tier: "B",
            pipeline_stage: "NEW",
            source: "import",
            updated_at: new Date(),
          },
        });

        // Trigger enrichment automatically
        try {
          await enrichLeadWithOutreach(lead.id);
        } catch (enrichErr) {
          console.error(`[IMPORT] Enrichment failed for ${lead.id}:`, enrichErr);
        }

        processed++;
      } catch (err) {
        errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }

    return NextResponse.json({
      total_rows: lines.length - 1,
      rows_processed: processed,
      rows_duplicates: duplicates,
      rows_errors: errors.length,
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    console.error("[IMPORT] Error:", error);
    return NextResponse.json(
      { error: "Import failed" },
      { status: 500 }
    );
  }
}
