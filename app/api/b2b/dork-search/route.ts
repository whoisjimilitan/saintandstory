import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { mapCategoryToPressureType } from "@/lib/b2b-pressure-type-mapper";

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

// Parse conversational dork input into structured parameters
function parseConversationalQuery(input: string) {
  const lower = input.toLowerCase();

  // Extract source (instagram, linkedin, facebook, twitter, google, etc.)
  const sourceMatch = input.match(
    /(?:on|from|via|site:?)\s+(\w+(?:\.\w+)?)/i
  );
  const source = sourceMatch ? sourceMatch[1].replace(".com", "") : "instagram";

  // Extract location (London, Manchester, UK, etc.)
  const locationMatch = input.match(
    /(?:in|london|manchester|birmingham|edinburgh|cardiff|bristol|leeds|newcastle|coventry|glasgow|sheffield|nottingham|leicester|dublin|cork|belfast|galway|limerick|waterford|kildare|meath|louth|monaghan|cavan|fermanagh|tyrone|derry|armagh|down|antrim|donegal|leitrim|sligo|roscommon|mayo|galway|clare|limerick|tipperary|waterford|cork|kerry|wexford|wicklow|carlow|kilkenny|laois|offaly|westmeath|longford|east sussex|west sussex|kent|surrey|hampshire|berkshire|oxfordshire|buckinghamshire|essex|suffolk|norfolk|lincolnshire|cambridgeshire|northamptonshire|bedfordshire|hertfordshire|cornwall|devon|dorset|somerset|gloucestershire|worcestershire|herefordshire|warwickshire|staffordshire|shropshire|cheshire|lancashire|greater manchester|merseyside|yorkshire|humber|lincolnshire|derbyshire|nottinghamshire|leicestershire|rutland|northumberland|durham|cleveland|tyne and wear|cumbria|isle of man|jersey|guernsey)\b/i
  );
  const location = locationMatch ? locationMatch[1] : "";

  // Extract business type/keyword (furniture, plumbing, electricians, etc.)
  const keywordMatch = input.match(
    /(?:find|search|looking for|locate)\s+([a-zA-Z\s]+?)(?:\s+(?:with|on|from|in|via)|$)/i
  );
  let keyword = keywordMatch ? keywordMatch[1].trim() : input.trim();
  // Fallback: if still empty, use first word
  if (!keyword || keyword.length === 0) {
    keyword = input.split(/\s+/)[0] || "business";
  }

  // Extract contact type (phone, email, etc.)
  const hasPhone =
    input.includes("phone") ||
    input.includes("tel") ||
    input.includes("📞") ||
    input.includes("+44");
  const hasEmail =
    input.includes("email") ||
    input.includes("@") ||
    input.includes("gmail");
  const contactType = hasPhone ? "phone" : hasEmail ? "email" : "both";

  // Extract pain signals/context
  const contextSignals: string[] = [];
  if (lower.includes("custom"))
    contextSignals.push("custom orders");
  if (lower.includes("seasonal"))
    contextSignals.push("seasonal peaks");
  if (lower.includes("owner"))
    contextSignals.push("owner-operated");
  if (lower.includes("manual"))
    contextSignals.push("manual coordination");
  if (lower.includes("busy"))
    contextSignals.push("capacity constraints");
  if (lower.includes("small"))
    contextSignals.push("small team");
  if (lower.includes("growing"))
    contextSignals.push("growth constraints");

  return {
    keyword: keyword.trim(),
    source: source.toLowerCase(),
    location: location.trim() || "UK",
    contactType,
    contextSignals: contextSignals.length > 0 ? contextSignals : ["general"],
    rawInput: input
  };
}

// Build dork query from parameters
function buildDorkQuery(params: any): string {
  const siteClause = `site:${params.source}.com`;
  const keywordClause = `"${params.keyword}"`;
  const contactClause =
    params.contactType === "phone"
      ? `("phone:" OR "📞" OR "+44" OR "call:")`
      : params.contactType === "email"
        ? `("@gmail.com" OR "@yahoo.com" OR "@outlook.com" OR "@business.com" OR "contact:")`
        : `("@" OR "phone:" OR "📞")`;

  return `${siteClause} ${keywordClause} ${contactClause}`;
}

// Extract business information from raw data
async function parseResults(
  rawResults: any,
  params: any
): Promise<
  Array<{
    businessName: string;
    email?: string;
    phone?: string;
    website?: string;
    location: string;
    source: string;
    contextSignals: string[];
  }>
> {
  const cleaned: any[] = [];

  // Mock implementation - in production, would parse actual SerpAPI results
  // For now, return structured mock data for testing
  if (rawResults && rawResults.length > 0) {
    return rawResults.map((result: any) => ({
      businessName: result.title || result.name || "Unknown",
      email: result.email || extractEmailFromText(result.snippet || ""),
      phone: result.phone || extractPhoneFromText(result.snippet || ""),
      website: result.link || "",
      location: params.location,
      source: params.source,
      contextSignals: params.contextSignals
    })).filter((r: any) => r.businessName && (r.email || r.phone));
  }

  return cleaned;
}

function extractEmailFromText(text: string): string | undefined {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return emailMatch ? emailMatch[0] : undefined;
}

function extractPhoneFromText(text: string): string | undefined {
  const phoneMatch = text.match(/(?:\+44|0)\d{4}\s?\d{6}|\+44\s?\d{3,4}\s?\d{3,4}\s?\d{3,4}/);
  return phoneMatch ? phoneMatch[0] : undefined;
}

// Identify pressure group for this batch
async function identifyPressureGroup(
  keyword: string,
  contextSignals: string[]
): Promise<string> {
  // Use existing mapper
  const pressureMap: Record<string, string> = {
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
    wedding: "Service Quality Inconsistency",
    event: "Delivery Reliability"
  };

  const keywordLower = keyword.toLowerCase();
  for (const [key, pressure] of Object.entries(pressureMap)) {
    if (keywordLower.includes(key)) {
      return pressure;
    }
  }

  // Default based on context
  if (
    contextSignals.includes("seasonal peaks") ||
    contextSignals.includes("custom orders")
  ) {
    return "Time-Critical Movement";
  }
  if (contextSignals.includes("capacity constraints")) {
    return "Capacity Overflow";
  }

  return "Customer Acquisition Friction";
}

export async function POST(request: NextRequest) {
  try {
    // AUTH
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json() as any;
    const query = body?.query;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query is required and must be a string" },
        { status: 400 }
      );
    }

    // PARSE conversational input
    const params = parseConversationalQuery(query);

    // BUILD dork query (for logging/display)
    const dorkQuery = buildDorkQuery(params);

    // IDENTIFY pressure group
    const pressureGroup = await identifyPressureGroup(
      params.keyword,
      params.contextSignals
    );

    // PARSE results (mock for now, in real implementation would call SerpAPI)
    // For testing, we'll create sample results
    const mockResults = [
      {
        title: `${params.keyword.split(" ")[0]} Services - Local`,
        snippet: "Contact us at: info@example.com or 020 1234 5678",
        link: `https://example-${params.keyword.replace(" ", "-")}.co.uk`,
        email: "info@example.com",
        phone: "+44 20 1234 5678"
      },
      {
        title: `Premium ${params.keyword}`,
        snippet: "📞 Call us: +44 201 234 567 | hello@service.co.uk",
        link: `https://premium-${params.keyword.replace(" ", "-")}.co.uk`,
        email: "hello@service.co.uk",
        phone: "+44 201 234 567"
      }
    ];

    const cleanedResults = await parseResults(mockResults, params);

    // CREATE leads in b2b_leads table (PARALLEL PIPELINE)
    const createdLeads = [];
    const batchId = `dork_${Date.now()}`;

    for (const result of cleanedResults) {
      try {
        const lead = await prisma.b2bLead.create({
          data: {
            businessName: result.businessName,
            email: result.email,
            phone: result.phone,
            website: result.website,
            city: result.location,
            source: "dork_search",
            status: "new",
            leadState: "new",
            businessCategory: params.keyword.split(" ")[0].toLowerCase(),
            notes: `Dork batch: ${batchId} | Pressure: ${pressureGroup}`
          }
        });

        // Lead created - enrichment happens in next batch
        createdLeads.push({
          id: lead.id,
          businessName: lead.businessName,
          email: lead.email,
          phone: lead.phone
        });
      } catch (error) {
        console.error(`Failed to create lead for ${result.businessName}:`, error);
        // Continue with other leads, don't fail entire batch
      }
    }

    return NextResponse.json({
      batchId,
      query,
      dorkQuery,
      params,
      pressureGroup,
      resultsCount: cleanedResults.length,
      createdLeads: createdLeads.length,
      leads: createdLeads,
      readyForPreview: createdLeads.length > 0
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : "";
    console.error("🔥 DORK SEARCH ERROR:", {
      message: errorMsg,
      stack: errorStack,
      name: error instanceof Error ? error.name : "Unknown"
    });
    return NextResponse.json(
      {
        error: `Dork search error: ${errorMsg}`,
        details: errorStack
      },
      { status: 500 }
    );
  }
}
