import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = ["whoisjimi.today@gmail.com"];

async function isAdmin(request: NextRequest) {
  const email = request.headers.get("x-admin-email");
  return email && ADMIN_EMAILS.includes(email);
}

/**
 * FIX #3: Phone Number Enrichment
 * Finds b2b_leads without phone numbers and attempts to populate them
 * Two strategies:
 * 1. If lead has Google Places data cached, extract phone from there
 * 2. If lead has discovery_metadata, look for phone in cached data
 * 3. Flag for manual research (higher priority)
 */

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Find leads without phones
    const leadsWithoutPhones = await sql`
      SELECT
        id,
        business_name,
        city,
        website,
        discovery_metadata,
        created_at
      FROM b2b_leads
      WHERE phone IS NULL OR phone = ''
      ORDER BY created_at DESC
      LIMIT 100
    `;

    if (!Array.isArray(leadsWithoutPhones)) {
      return NextResponse.json({
        status: "error",
        message: "Failed to fetch leads",
      });
    }

    // Check for phone numbers in discovery_metadata
    const enrichable = leadsWithoutPhones
      .map((lead: any) => {
        let extractedPhone = null;

        // Try to extract phone from discovery_metadata JSON
        if (lead.discovery_metadata) {
          try {
            const metadata = typeof lead.discovery_metadata === "string"
              ? JSON.parse(lead.discovery_metadata)
              : lead.discovery_metadata;

            // Look for phone in various metadata fields
            if (metadata.phone) extractedPhone = metadata.phone;
            if (metadata.formatted_phone_number) extractedPhone = metadata.formatted_phone_number;
            if (metadata.places_data?.formatted_phone_number)
              extractedPhone = metadata.places_data.formatted_phone_number;
            if (metadata.internationalFormat) extractedPhone = metadata.internationalFormat;
          } catch (e) {
            // Metadata not JSON, skip
          }
        }

        return {
          id: lead.id,
          business_name: lead.business_name,
          city: lead.city,
          website: lead.website,
          found_phone: extractedPhone,
          needs_manual_research: !extractedPhone,
        };
      })
      .filter((l: any) => l.found_phone); // Only return those we found phones for

    const needing_research = leadsWithoutPhones.length - enrichable.length;

    return NextResponse.json({
      status: "preview",
      total_without_phones: leadsWithoutPhones.length,
      enrichable_from_metadata: enrichable.length,
      need_manual_research: needing_research,
      can_enrich: enrichable,
      next_step: "POST with ?confirm=true to update all found phones",
      note: "This extracts phones from existing Google Places data. For the rest, you need to add phone data source.",
    });
  } catch (error) {
    console.error("[enrich-phone-numbers] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { confirm, dry_run } = await request.json();

    if (!confirm) {
      return NextResponse.json(
        { error: "Pass confirm: true to execute enrichment" },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Find leads without phones
    const leadsWithoutPhones = await sql`
      SELECT
        id,
        business_name,
        discovery_metadata
      FROM b2b_leads
      WHERE (phone IS NULL OR phone = '')
      ORDER BY created_at DESC
      LIMIT 100
    `;

    let enriched = 0;
    let skipped = 0;
    const details = [];

    for (const lead of leadsWithoutPhones) {
      let extractedPhone = null;

      try {
        if (lead.discovery_metadata) {
          const metadata = typeof lead.discovery_metadata === "string"
            ? JSON.parse(lead.discovery_metadata)
            : lead.discovery_metadata;

          if (metadata.phone) extractedPhone = metadata.phone;
          if (metadata.formatted_phone_number) extractedPhone = metadata.formatted_phone_number;
          if (metadata.places_data?.formatted_phone_number)
            extractedPhone = metadata.places_data.formatted_phone_number;
        }
      } catch (e) {
        // Skip if metadata parsing fails
      }

      if (extractedPhone) {
        if (!dry_run) {
          await sql`
            UPDATE b2b_leads
            SET phone = ${extractedPhone}, updated_at = NOW()
            WHERE id = ${lead.id}
          `;
        }
        enriched++;
        details.push({
          id: lead.id,
          business: lead.business_name,
          phone: extractedPhone,
          status: "enriched",
        });
      } else {
        skipped++;
      }
    }

    return NextResponse.json({
      status: dry_run ? "dry_run_complete" : "enrichment_complete",
      summary: {
        total_processed: leadsWithoutPhones.length,
        enriched,
        skipped,
      },
      details: details.slice(0, 20), // Show first 20
      message: `${dry_run ? "DRY RUN: " : ""}Enriched ${enriched} leads with phone numbers from existing metadata`,
    });
  } catch (error) {
    console.error("[enrich-phone-numbers] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
