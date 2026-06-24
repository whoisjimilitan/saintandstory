import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Parse conversational dork input into structured parameters
function parseConversationalQuery(input: string) {
  if (!input || typeof input !== "string") {
    return {
      keyword: "business",
      source: "instagram",
      location: "UK",
      contactType: "both",
      contextSignals: ["general"],
      rawInput: input,
    };
  }

  const lower = input.toLowerCase();

  // Extract source (instagram, linkedin, facebook, etc.)
  const sourceMatch = input.match(/(?:on|from|via|site:?)\s+(\w+(?:\.\w+)?)/i);
  const source = sourceMatch ? sourceMatch[1].replace(".com", "").toLowerCase() : "instagram";

  // Extract location - using capture group properly
  const locationMatch = input.match(
    /(london|manchester|birmingham|edinburgh|cardiff|bristol|leeds|newcastle|coventry|glasgow|sheffield|nottingham|leicester|dublin|cork|belfast|galway|limerick|waterford|kildare|meath|louth|monaghan|cavan|fermanagh|tyrone|derry|armagh|down|antrim|donegal|leitrim|sligo|roscommon|mayo|clare|tipperary|kerry|wexford|wicklow|carlow|kilkenny|laois|offaly|westmeath|longford|east sussex|west sussex|kent|surrey|hampshire|berkshire|oxfordshire|buckinghamshire|essex|suffolk|norfolk|lincolnshire|cambridgeshire|northamptonshire|bedfordshire|hertfordshire|cornwall|devon|dorset|somerset|gloucestershire|worcestershire|herefordshire|warwickshire|staffordshire|shropshire|cheshire|lancashire|greater manchester|merseyside|yorkshire|derbyshire|nottinghamshire|leicestershire|rutland|northumberland|durham|tyne and wear|cumbria|isle of man|jersey|guernsey)\b/i
  );
  const location = locationMatch ? locationMatch[1] : "UK";

  // Extract keyword - improved regex
  const keywordMatch = input.match(/(?:find|search|looking for|locate)\s+([a-zA-Z\s]+?)(?:\s+(?:with|on|from|in|via|site)|$)/i);
  const keyword = keywordMatch && keywordMatch[1] ? keywordMatch[1].trim() : input.split(/on|from|via/i)[0].trim() || "business";

  // Extract contact type
  const hasPhone = input.includes("phone") || input.includes("tel") || input.includes("📞") || input.includes("+44");
  const hasEmail = input.includes("email") || input.includes("@") || input.includes("gmail");
  const contactType = hasPhone ? "phone" : hasEmail ? "email" : "both";

  return {
    keyword: keyword.substring(0, 100),
    source,
    location,
    contactType,
    contextSignals: [],
    rawInput: input,
  };
}

// Google Custom Search API integration
async function searchGoogle(params: any): Promise<any[]> {
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
  const searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;

  if (!apiKey || !searchEngineId) {
    console.error("[DORK SEARCH] Missing Google Custom Search credentials");
    return [];
  }

  try {
    // Build search query
    const query = `${params.keyword} ${params.source} ${params.location}`;

    // Call Google Custom Search API
    const url = new URL("https://www.googleapis.com/customsearch/v1");
    url.searchParams.append("q", query);
    url.searchParams.append("key", apiKey);
    url.searchParams.append("cx", searchEngineId);
    url.searchParams.append("num", "10"); // Get 10 results

    const response = await fetch(url.toString());

    if (!response.ok) {
      console.error("[DORK SEARCH] Google API error:", response.status);
      return [];
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("[DORK SEARCH] Search error:", error);
    return [];
  }
}

// Extract clean business information from search results
function parseSearchResults(results: any[], params: any): Array<{
  businessName: string;
  email?: string;
  phone?: string;
  website: string;
  location: string;
  source: string;
}> {
  const cleaned: any[] = [];

  for (const result of results) {
    const businessName = result.title || "Unknown";
    const website = result.link || "";
    const snippet = result.snippet || "";

    // Extract contact info from snippet (may be empty)
    const email = extractEmailFromText(snippet);
    const phone = extractPhoneFromText(snippet);

    // Include ALL results with business name
    // Email/phone are optional - they may not be in snippet
    if (businessName && website) {
      cleaned.push({
        businessName: businessName.replace(" - ", "").substring(0, 150),
        email: email || undefined,
        phone: phone || undefined,
        website,
        location: params.location,
        source: params.source,
      });
    }
  }

  return cleaned;
}

function extractEmailFromText(text: string): string | undefined {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return emailMatch ? emailMatch[0] : undefined;
}

function extractPhoneFromText(text: string): string | undefined {
  const phoneMatch = text.match(/(?:\+44|0)\d{3,4}\s?\d{3,4}\s?\d{3,4}|(?:\+44|0)\d{10,11}/);
  return phoneMatch ? phoneMatch[0] : undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { query?: string };
    const query = body?.query?.trim();

    if (!query) {
      return NextResponse.json(
        { error: "Search query required", success: false },
        { status: 400 }
      );
    }

    // Parse user input into search parameters
    const params = parseConversationalQuery(query);

    // Execute Google Custom Search
    console.log(`[DORK SEARCH] Searching: "${query}"`);
    const searchResults = await searchGoogle(params);

    if (searchResults.length === 0) {
      return NextResponse.json({
        success: true,
        leadsCreated: 0,
        leads: [],
        parsed: {
          businessType: params.keyword,
          source: params.source,
          contactType: params.contactType,
        },
        message: "No results found. Try a different search query.",
      });
    }

    // Clean and structure results
    const cleanedResults = parseSearchResults(searchResults, params);

    // Create leads in database
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
            businessCategory: params.keyword,
            notes: `Dork search: "${query}" | Source: ${result.source} | Batch: ${batchId}`,
          },
        });

        createdLeads.push({
          id: lead.id,
          businessName: lead.businessName,
          email: lead.email,
          phone: lead.phone,
        });
      } catch (error) {
        console.error(`[DORK SEARCH] Failed to create lead:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      batchId,
      query,
      leadsCreated: createdLeads.length,
      leads: createdLeads,
      parsed: {
        businessType: params.keyword,
        source: params.source,
        contactType: params.contactType,
      },
      message: `Created ${createdLeads.length} leads from search results.`,
    });
  } catch (error) {
    console.error("[DORK SEARCH] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Search failed",
        success: false,
      },
      { status: 500 }
    );
  }
}
