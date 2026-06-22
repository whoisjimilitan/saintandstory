import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * BATCH 1 - PHASE 3: Lead Creation
 * Goal: Parse query, generate mock results, create leads in database
 */

const PRESSURE_MAP: Record<string, string> = {
  furniture: "Time-Critical Movement",
  plumbing: "Time-Critical Movement",
  electrician: "Time-Critical Movement",
  removal: "Time-Critical Movement",
  pharmacy: "Time-Critical Movement",
  dental: "Appointment Scheduling Friction",
  dentist: "Appointment Scheduling Friction",
  solicitor: "Customer Acquisition Friction",
  accountant: "Customer Acquisition Friction",
  estate: "Customer Acquisition Friction",
};

function parseQuery(input: string) {
  const lower = input.toLowerCase();

  let businessType = "";
  for (const [key, _] of Object.entries(PRESSURE_MAP)) {
    if (lower.includes(key)) {
      businessType = key;
      break;
    }
  }
  if (!businessType) {
    businessType = input.split(/\s+/)[0] || "business";
  }

  let source = "google";
  if (lower.includes("instagram")) source = "instagram";
  else if (lower.includes("linkedin")) source = "linkedin";
  else if (lower.includes("facebook")) source = "facebook";
  else if (lower.includes("twitter")) source = "twitter";

  let contactType = "both";
  if (lower.includes("email")) contactType = "email";
  else if (lower.includes("phone")) contactType = "phone";

  const pressureGroup = PRESSURE_MAP[businessType] || "Customer Acquisition Friction";

  return {
    businessType,
    source,
    contactType,
    pressureGroup,
    rawQuery: input
  };
}

// Generate mock results based on parsed query
function generateMockResults(parsed: any, count: number = 3) {
  const businesses = [];
  for (let i = 1; i <= count; i++) {
    businesses.push({
      businessName: `${parsed.businessType.charAt(0).toUpperCase()}${parsed.businessType.slice(1)} Store ${i}`,
      email: parsed.contactType !== "phone" ? `contact${i}@store${i}.co.uk` : undefined,
      phone: parsed.contactType !== "email" ? `+44 20 ${1000 + i} ${2000 + i}` : undefined,
      website: `https://store${i}.co.uk`,
      city: "London",
      source: parsed.source
    });
  }
  return businesses;
}

export async function POST(request: Request) {
  try {
    // Parse request
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const query = body?.query;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        { error: "query parameter is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Phase 2: Parse query
    const parsed = parseQuery(query.trim());

    // Phase 3: Generate mock results
    const mockResults = generateMockResults(parsed, 3);

    // Phase 3: Create leads in database
    const createdLeads = [];
    const batchId = `dork_${Date.now()}`;

    for (const result of mockResults) {
      try {
        const lead = await prisma.b2bLead.create({
          data: {
            businessName: result.businessName,
            email: result.email,
            phone: result.phone,
            website: result.website,
            city: result.city,
            source: "dork_search",
            status: "new",
            leadState: "new",
            businessCategory: parsed.businessType,
            notes: `Dork batch: ${batchId} | Source: ${parsed.source} | Pressure: ${parsed.pressureGroup}`
          }
        });

        createdLeads.push({
          id: lead.id,
          businessName: lead.businessName,
          email: lead.email,
          phone: lead.phone
        });
      } catch (createError) {
        console.error(`Failed to create lead for ${result.businessName}:`, createError);
        // Continue with other leads
      }
    }

    return NextResponse.json({
      success: true,
      phase: "PHASE 3 - Lead Creation",
      query: query.trim(),
      parsed: {
        businessType: parsed.businessType,
        source: parsed.source,
        contactType: parsed.contactType,
        pressureGroup: parsed.pressureGroup
      },
      batchId,
      resultsGenerated: mockResults.length,
      leadsCreated: createdLeads.length,
      leads: createdLeads,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("[DORK-SEARCH-PHASE3] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Server error: ${message}` },
      { status: 500 }
    );
  }
}
