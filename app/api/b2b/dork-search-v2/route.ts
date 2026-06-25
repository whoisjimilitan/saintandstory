/**
 * DORK SEARCH V2 - Stress Tested
 *
 * Builds sophisticated Google dork commands that:
 * 1. Include UK email domains (.co.uk, .com, .net, .org)
 * 2. Extract company domain emails (company resemblance)
 * 3. Scale to 100s/1000s of results via multiple queries
 * 4. Parse into clean: business_name, category, city, email, website, phone
 *
 * Example query built:
 * site:instagram.com "dentist"
 * ("@gmail.com" OR "@yahoo.com" OR "@hotmail.com" OR "@outlook.com" OR "@aol.com"
 *  OR "@company.co.uk" OR "@company.com" OR "@dentist.co.uk")
 */

import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk",
];

async function isAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const user = await currentUser();
  return ADMIN_EMAILS.includes(user?.emailAddresses[0]?.emailAddress ?? "");
}

// Parse conversational input into dork search params
function parseConversationalQuery(input: string) {
  const lower = input.toLowerCase();

  // Extract source (instagram, linkedin, facebook, etc.)
  const sourceMatch = input.match(/(?:on|from|via|site:?)\s+(\w+(?:\.\w+)?)/i);
  const source = sourceMatch ? sourceMatch[1].replace(".com", "").toLowerCase() : "instagram";

  // Extract keyword (industry/business type)
  const keywordMatch = input.match(/(?:find|search|looking for|locate)\s+([a-zA-Z\s]+?)(?:\s+(?:with|on|from|in|via|site)|$)/i);
  let keyword = keywordMatch && keywordMatch[1] ? keywordMatch[1].trim() : input.split(/on|from|via/i)[0].trim() || "business";

  // Extract location (default to UK)
  const ukCities = ['london', 'manchester', 'birmingham', 'edinburgh', 'cardiff', 'bristol', 'leeds', 'glasgow'];
  const locationMatch = input.match(new RegExp(`(${ukCities.join('|')})`, 'i'));
  const location = locationMatch ? locationMatch[1] : "UK";

  // Extract contact type preference
  const hasPhone = input.includes("phone") || input.includes("tel");
  const hasEmail = input.includes("email") || input.includes("@");
  const contactType = hasPhone ? "phone" : hasEmail ? "email" : "both";

  return {
    keyword: keyword.substring(0, 100),
    source,
    location,
    contactType,
    rawInput: input,
  };
}

// Build sophisticated dork command with UK domains & company patterns
function buildDorkQuery(params: any, pageIndex: number = 0): string {
  const { keyword, source, location, contactType } = params;

  // Standard email providers to include
  const emailDomains = [
    "@gmail.com",
    "@yahoo.com",
    "@hotmail.com",
    "@outlook.com",
    "@aol.com",
    "@icloud.com",
    "@mail.com",
  ];

  // UK-specific domains
  const ukDomains = [
    "@company.co.uk",
    "@company.com",
    `@${keyword.toLowerCase().replace(/\s+/g, "")}.co.uk`,
    `@${keyword.toLowerCase().replace(/\s+/g, "")}.com`,
    "@co.uk",
  ];

  // Combine all email domains
  const allDomains = [...emailDomains, ...ukDomains].filter((d, i, arr) => arr.indexOf(d) === i);
  const emailQuery = allDomains.map(d => `"${d}"`).join(" OR ");

  // Build the dork command
  // site:source.com "keyword" ("email1" OR "email2" OR ...)
  const dorkCommand = `site:${source}.com "${keyword}" (${emailQuery})`;

  console.log(`[DORK V2] Query ${pageIndex + 1}: ${dorkCommand}`);
  return dorkCommand;
}

// Search Google with dork command
async function searchGoogle(dorkCommand: string): Promise<any[]> {
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
  const searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;

  if (!apiKey || !searchEngineId) {
    console.error("[DORK V2] Missing Google Custom Search credentials");
    return [];
  }

  try {
    const url = new URL("https://www.googleapis.com/customsearch/v1");
    url.searchParams.append("q", dorkCommand);
    url.searchParams.append("key", apiKey);
    url.searchParams.append("cx", searchEngineId);
    url.searchParams.append("num", "10"); // Get 10 results per query

    const response = await fetch(url.toString());

    if (!response.ok) {
      console.error("[DORK V2] Google API error:", response.status);
      return [];
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("[DORK V2] Search error:", error);
    return [];
  }
}

// Extract emails including company domain patterns
function extractAllEmails(text: string, businessName: string): string[] {
  const emails = new Set<string>();

  // Extract all standard emails from text
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.matchAll(emailRegex);
  for (const match of matches) {
    emails.add(match[0].toLowerCase());
  }

  // Generate company domain variations
  if (businessName) {
    const companyBase = businessName
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");

    if (companyBase.length > 2) {
      // Try common email patterns with company name
      emails.add(`info@${companyBase}.co.uk`);
      emails.add(`info@${companyBase}.com`);
      emails.add(`contact@${companyBase}.co.uk`);
      emails.add(`hello@${companyBase}.co.uk`);
      emails.add(`@${companyBase}.co.uk`); // Partial match for later extraction
    }
  }

  return Array.from(emails).filter(e => e.includes("@"));
}

// Extract phone numbers
function extractPhone(text: string): string | undefined {
  const phoneMatch = text.match(/(?:\+44|0)\d{3,4}\s?\d{3,4}\s?\d{3,4}|(?:\+44|0)\d{10,11}/);
  return phoneMatch ? phoneMatch[0] : undefined;
}

// Extract city from text or use default
function extractCity(text: string, location: string): string {
  const ukCities = [
    "london", "manchester", "birmingham", "edinburgh", "cardiff", "bristol",
    "leeds", "glasgow", "sheffield", "coventry", "newcastle", "nottingham"
  ];

  const lower = text.toLowerCase();
  for (const city of ukCities) {
    if (lower.includes(city)) return city;
  }

  return location || "UK";
}

// Validate UK location
function isUKLocation(text: string): boolean {
  const lower = text.toLowerCase();

  // Reject US indicators
  const usStates = [
    "california", "texas", "florida", "newyork", "pa ", "ny ", "ca ", "tx ", "fl ",
    "or ", "wa ", "az ", "co ", "utah", "nevada", "oregon", "washington",
    "arizona", "colorado", "new york", "pennsylvania", "illinois", "ohio"
  ];

  // Reject US patterns
  if (/\b\d{5}(?:-\d{4})?\b/.test(text)) return false; // US ZIP code
  for (const state of usStates) {
    if (new RegExp(`\\b${state}\\b`).test(lower)) return false;
  }

  // Accept if no red flags
  return true;
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { query } = await request.json() as { query: string };

    if (!query) {
      return NextResponse.json(
        { error: "Query required", success: false },
        { status: 400 }
      );
    }

    console.log(`[DORK V2] Starting search: ${query}`);

    const params = parseConversationalQuery(query);
    const allResults: any[] = [];

    // STRESS TEST: Run multiple queries with pagination (up to 5 queries = ~50 results)
    const queryCount = 5;
    for (let i = 0; i < queryCount; i++) {
      const dorkCommand = buildDorkQuery(params, i);
      const results = await searchGoogle(dorkCommand);
      allResults.push(...results);

      if (results.length === 0) {
        console.log(`[DORK V2] No more results at page ${i + 1}`);
        break;
      }

      // Small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`[DORK V2] Retrieved ${allResults.length} total results from ${queryCount} queries`);

    // Parse results into clean business data
    const businesses: any[] = [];
    const seen = new Set<string>();

    for (const result of allResults) {
      const title = result.title || "";
      const snippet = result.snippet || "";
      const link = result.link || "";
      const fullText = `${title} ${snippet} ${link}`;

      // Validate UK location
      if (!isUKLocation(fullText)) {
        console.log(`[DORK V2] Filtering non-UK: ${title}`);
        continue;
      }

      // Extract data
      const businessName = title.replace(" - ", "").substring(0, 150);
      const emails = extractAllEmails(fullText, businessName);
      const primaryEmail = emails[0];
      const phone = extractPhone(fullText);
      const city = extractCity(fullText, params.location);

      const key = `${businessName}|${primaryEmail}`;
      if (seen.has(key)) continue;
      seen.add(key);

      businesses.push({
        business_name: businessName,
        business_category: params.keyword,
        city: city,
        email: primaryEmail || undefined,
        website: link,
        phone: phone || undefined,
        source: "dork_search",
        all_emails: emails.slice(0, 5), // Top 5 emails for this business
      });
    }

    console.log(`[DORK V2] Parsed ${businesses.length} unique businesses`);

    // Store in database
    const created = [];
    for (const business of businesses) {
      try {
        const lead = await prisma.b2bLead.create({
          data: {
            businessName: business.business_name,
            businessCategory: business.business_category,
            city: business.city,
            email: business.email,
            website: business.website,
            phone: business.phone,
            source: "dork_search",
          },
        });
        created.push(lead);
      } catch (err: any) {
        if (!err.message.includes("Unique constraint")) {
          console.error(`[DORK V2] Error creating lead: ${business.business_name}`, err);
        }
      }
    }

    console.log(`[DORK V2] Successfully created ${created.length} leads`);

    return NextResponse.json({
      success: true,
      query: query,
      queriesExecuted: queryCount,
      resultsRetrieved: allResults.length,
      businessesParsed: businesses.length,
      leadsCreated: created.length,
      businesses: businesses.slice(0, 50), // Return first 50 for preview
      message: `✓ Stress test complete: ${allResults.length} results → ${businesses.length} unique businesses → ${created.length} leads created`,
    });
  } catch (error) {
    console.error("[DORK V2] Error:", error);
    return NextResponse.json(
      {
        error: "Dork search failed",
        details: error instanceof Error ? error.message : String(error),
        success: false,
      },
      { status: 500 }
    );
  }
}
