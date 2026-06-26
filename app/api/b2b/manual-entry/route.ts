import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { ensureB2BSchema } from "@/lib/b2b-schema";
import { runFullPipeline } from "@/lib/four-layer-pipeline";
import type { RawBusinessDiscovery } from "@/lib/four-layer-pipeline";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];

interface ManualEntryRequest {
  business_name: string;
  business_category: string;
  city: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  console.log("[MANUAL-ENTRY] ═══════════════════════════════════════");
  console.log("[MANUAL-ENTRY] Starting manual prospect entry");

  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    console.log("[MANUAL-ENTRY] ✗ FAILED: Not authenticated");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email)) {
    console.log("[MANUAL-ENTRY] ✗ FAILED: Not admin");
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  console.log("[MANUAL-ENTRY] ✓ Auth passed");

  try {
    const body = await request.json() as ManualEntryRequest;

    // Validate required fields
    if (!body.business_name || !body.business_category || !body.city) {
      return NextResponse.json(
        { error: "Required fields: business_name, business_category, city" },
        { status: 400 }
      );
    }

    await ensureB2BSchema();
    console.log("[MANUAL-ENTRY] ✓ B2B schema ensured");

    const sql = neon(process.env.DATABASE_URL!);
    console.log("[MANUAL-ENTRY] ✓ Database connection initialized");

    // Check for duplicates
    console.log(`[MANUAL-ENTRY] Checking if exists: ${body.business_name} in ${body.city}`);

    let isDuplicate = false;
    if (body.email) {
      const emailExists = await sql`
        SELECT id FROM discovered_businesses
        WHERE business_name = ${body.business_name} AND address ILIKE ${`%${body.city}%`}
        LIMIT 1
      `;
      isDuplicate = emailExists.length > 0;
    }

    if (!isDuplicate) {
      const nameExists = await sql`
        SELECT id FROM discovered_businesses
        WHERE business_name = ${body.business_name} AND address ILIKE ${`%${body.city}%`}
        LIMIT 1
      `;
      isDuplicate = nameExists.length > 0;
    }

    if (isDuplicate) {
      console.log(`[MANUAL-ENTRY] → Prospect already exists`);
      return NextResponse.json(
        { error: "Prospect already exists", exists: true },
        { status: 409 }
      );
    }

    console.log(`[MANUAL-ENTRY] → New prospect, processing through four-layer pipeline`);

    try {
      console.log(`[MANUAL-ENTRY] PIPELINE: ${body.business_name}`);

      // Create RawBusinessDiscovery object
      const business: RawBusinessDiscovery = {
        placeId: `manual_${body.business_name.replace(/\s+/g, "_")}_${body.city.replace(/\s+/g, "_")}`,
        name: body.business_name,
        address: `${body.city}, UK`,
        postcode: body.postcode || "",
        category: body.business_category,
        source: "manual",
        reviews: undefined,
        website: body.website,
        phone: body.phone,
        rating: undefined,
        reviewCount: undefined,
        rawData: {
          source: "manual_entry",
          entered_by: email,
          notes: body.notes,
          original_email: body.email
        }
      };

      // Run through four-layer pipeline
      const pipelineResult = await runFullPipeline(sql, business);

      if (pipelineResult.promoted) {
        console.log(`[MANUAL-ENTRY] ✓ PIPELINE SUCCESS: ${body.business_name}`);
        console.log("[MANUAL-ENTRY] ═══════════════════════════════════════");

        // Ensure DB transaction is flushed
        await new Promise(resolve => setTimeout(resolve, 500));

        return NextResponse.json({
          success: true,
          business_name: body.business_name,
          promoted: true,
          message: "Prospect added and promoted through pipeline"
        });
      } else {
        console.log(`[MANUAL-ENTRY] ⚠ PIPELINE PARTIAL: ${body.business_name}`);
        console.log("[MANUAL-ENTRY] ═══════════════════════════════════════");

        return NextResponse.json({
          success: true,
          business_name: body.business_name,
          promoted: false,
          message: "Prospect discovered but not all pipeline stages completed"
        });
      }
    } catch (error) {
      console.error(`[MANUAL-ENTRY] ✗ PIPELINE FAILED: ${body.business_name}`);
      console.error(`[MANUAL-ENTRY] Error:`, error);
      console.log("[MANUAL-ENTRY] ═══════════════════════════════════════");

      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Pipeline failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[MANUAL-ENTRY] ✗ Fatal error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Request failed" },
      { status: 500 }
    );
  }
}
