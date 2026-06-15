import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { ensureB2BSchema } from "@/lib/b2b-schema";
import { getDeliveryTypeForIndustry } from "@/lib/industry-delivery-mapping";
import { runFullPipeline } from "@/lib/four-layer-pipeline";
import type { RawBusinessDiscovery } from "@/lib/four-layer-pipeline";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];

interface CSVLead {
  business_name: string;
  business_category: string;
  city: string;
  email?: string;
  website?: string;
  phone?: string;
  pain_point?: string;
  review_rating?: string;
}

function parseCSV(text: string): CSVLead[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  // Parse header
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
  const leads: CSVLead[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map(v => v.trim());
    if (values.length < 3) continue; // Skip incomplete rows

    const row: CSVLead = {
      business_name: values[headers.indexOf("business_name")] || "",
      business_category: values[headers.indexOf("business_category")] || "",
      city: values[headers.indexOf("city")] || "",
      email: values[headers.indexOf("email")] || undefined,
      website: values[headers.indexOf("website")] || undefined,
      phone: values[headers.indexOf("phone")] || undefined,
      pain_point: values[headers.indexOf("pain_point")] || undefined,
      review_rating: values[headers.indexOf("review_rating")] || undefined,
    };

    if (row.business_name && row.business_category && row.city) {
      leads.push(row);
    }
  }

  return leads;
}

export async function POST(request: NextRequest) {
  console.log("[CSV-IMPORT] ═══════════════════════════════════════");
  console.log("[CSV-IMPORT] Starting CSV import workflow");

  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    console.log("[CSV-IMPORT] ✗ FAILED: Not authenticated");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email)) {
    console.log("[CSV-IMPORT] ✗ FAILED: Not admin");
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  console.log("[CSV-IMPORT] ✓ Auth passed");

  try {
    const { csvData } = await request.json() as { csvData: string };

    if (!csvData) {
      return NextResponse.json({ error: "CSV data required" }, { status: 400 });
    }

    const leads = parseCSV(csvData);
    console.log(`[CSV-IMPORT] Parsed ${leads.length} rows from CSV`);

    if (leads.length === 0) {
      return NextResponse.json({
        error: "No valid leads found in CSV",
        hint: "Expected columns: business_name, business_category, city, email, website, phone",
      }, { status: 400 });
    }

    await ensureB2BSchema();
    console.log("[CSV-IMPORT] ✓ B2B schema ensured");

    const sql = neon(process.env.DATABASE_URL!);
    console.log("[CSV-IMPORT] ✓ Database connection initialized");

    const added: string[] = [];
    const BASE_URL = "https://saintandstoryltd.co.uk";
    let skippedExisting = 0;
    let pipelineAttempts = 0;
    let pipelineSuccesses = 0;
    let pipelineFailures = 0;

    for (const lead of leads) {
      // Normalize category to niche key
      const niche = lead.business_category.toLowerCase().replace(/\s+/g, "-");
      const deliveryType = getDeliveryTypeForIndustry(lead.business_category) || "General";

      // Check for duplicates by email or business_name + city
      console.log(`[CSV-IMPORT] Checking if exists: ${lead.business_name} in ${lead.city}`);

      let isDuplicate = false;
      if (lead.email) {
        const emailExists = await sql`SELECT id FROM discovered_businesses WHERE business_name = ${lead.business_name} AND address ILIKE ${`%${lead.city}%`} LIMIT 1`;
        isDuplicate = emailExists.length > 0;
      }

      if (!isDuplicate) {
        const nameExists = await sql`
          SELECT id FROM discovered_businesses
          WHERE business_name = ${lead.business_name} AND address ILIKE ${`%${lead.city}%`}
          LIMIT 1
        `;
        isDuplicate = nameExists.length > 0;
      }

      if (isDuplicate) {
        console.log(`[CSV-IMPORT]   → Already exists, skipping`);
        skippedExisting++;
        continue;
      }

      console.log(`[CSV-IMPORT]   → New business, processing through four-layer pipeline`);

      try {
        pipelineAttempts++;
        console.log(`[CSV-IMPORT] PIPELINE ATTEMPT #${pipelineAttempts}: ${lead.business_name}`);

        // Create RawBusinessDiscovery object
        const business: RawBusinessDiscovery = {
          placeId: `csv_${lead.business_name.replace(/\s+/g, "_")}_${lead.city.replace(/\s+/g, "_")}`,
          name: lead.business_name,
          address: `${lead.city}, UK`,
          postcode: lead.city,
          category: lead.business_category,
          source: "csv",
          reviews: undefined,
          website: lead.website,
          phone: lead.phone,
          rating: lead.review_rating ? parseFloat(lead.review_rating) : undefined,
          reviewCount: undefined,
          rawData: {
            source: "csv_import",
            pain_point: lead.pain_point,
            original_email: lead.email
          }
        };

        // Run through four-layer pipeline
        const pipelineResult = await runFullPipeline(sql, business);

        if (pipelineResult.promoted) {
          pipelineSuccesses++;
          console.log(`[CSV-IMPORT]   ✓ PIPELINE SUCCESS: ${lead.business_name}`);
          added.push(lead.business_name);
        } else {
          pipelineFailures++;
          console.log(`[CSV-IMPORT]   ⚠ PIPELINE PARTIAL: ${lead.business_name} (discovered but not all layers)`);
          added.push(lead.business_name); // Count partial success
        }
      } catch (error) {
        pipelineFailures++;
        console.error(`[CSV-IMPORT]   ✗ PIPELINE FAILED: ${lead.business_name}`);
        console.error(`[CSV-IMPORT]   Error:`, error);
      }
    }

    console.log("[CSV-IMPORT] ═══════════════════════════════════════");
    console.log("[CSV-IMPORT] SUMMARY");
    console.log("[CSV-IMPORT]   Total rows parsed:", leads.length);
    console.log("[CSV-IMPORT]   Skipped (already in DB):", skippedExisting);
    console.log("[CSV-IMPORT]   Pipeline attempts:", pipelineAttempts);
    console.log("[CSV-IMPORT]   Pipeline successes:", pipelineSuccesses);
    console.log("[CSV-IMPORT]   Pipeline failures:", pipelineFailures);
    console.log("[CSV-IMPORT]   Final added count:", added.length);
    console.log("[CSV-IMPORT] ═══════════════════════════════════════");

    // Ensure DB transaction is flushed
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({ added, count: added.length, success: true });
  } catch (error) {
    console.error("[CSV-IMPORT] ✗ Fatal error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import failed" },
      { status: 500 }
    );
  }
}
