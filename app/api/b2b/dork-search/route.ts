import { NextResponse } from "next/server";

/**
 * BATCH 1 - PHASE 2: Query Parsing + Pressure Group Identification
 * Goal: Parse natural language query into structured data
 */

// Pressure group mapping
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

  // Extract business type
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

  // Extract source (instagram, linkedin, etc)
  let source = "google";
  if (lower.includes("instagram")) source = "instagram";
  else if (lower.includes("linkedin")) source = "linkedin";
  else if (lower.includes("facebook")) source = "facebook";
  else if (lower.includes("twitter")) source = "twitter";

  // Extract contact type
  let contactType = "both";
  if (lower.includes("email")) contactType = "email";
  else if (lower.includes("phone")) contactType = "phone";

  // Get pressure group
  const pressureGroup = PRESSURE_MAP[businessType] || "Customer Acquisition Friction";

  return {
    businessType,
    source,
    contactType,
    pressureGroup,
    rawQuery: input
  };
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

    // PHASE 2: Parse query
    const parsed = parseQuery(query.trim());

    // Return structured response
    return NextResponse.json({
      success: true,
      phase: "PHASE 2 - Query Parsing",
      query: query.trim(),
      parsed: {
        businessType: parsed.businessType,
        source: parsed.source,
        contactType: parsed.contactType,
        pressureGroup: parsed.pressureGroup
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("[DORK-SEARCH-PHASE2] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Server error: ${message}` },
      { status: 500 }
    );
  }
}
