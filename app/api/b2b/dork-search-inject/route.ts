/**
 * DORK SEARCH + PIPELINE INJECTION
 *
 * One-click endpoint that:
 * 1. Runs dork search with conversational query
 * 2. Injects 50-100 results directly into pipeline (queue)
 * 3. Ready for operator to approve & send
 */

import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { neon } from "@neondatabase/serverless";

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

// Parse conversational input
function parseConversationalQuery(input: string) {
  const lower = input.toLowerCase();
  const sourceMatch = input.match(/(?:on|from|via|site:?)\s+(\w+(?:\.\w+)?)/i);
  const source = sourceMatch ? sourceMatch[1].replace(".com", "").toLowerCase() : "instagram";

  const keywordMatch = input.match(/(?:find|search|looking for|locate)\s+([a-zA-Z\s]+?)(?:\s+(?:with|on|from|in|via|site)|$)/i);
  let keyword = keywordMatch && keywordMatch[1] ? keywordMatch[1].trim() : input.split(/on|from|via/i)[0].trim() || "business";

  const ukCities = ['london', 'manchester', 'birmingham', 'edinburgh', 'cardiff', 'bristol', 'leeds', 'glasgow'];
  const locationMatch = input.match(new RegExp(`(${ukCities.join('|')})`, 'i'));
  const location = locationMatch ? locationMatch[1] : "UK";

  return { keyword, source, location };
}

// Build dork query
function buildDorkQuery(params: any): string {
  const { keyword, source } = params;

  const emailDomains = [
    "@gmail.com", "@yahoo.com", "@hotmail.com", "@outlook.com", "@aol.com", "@icloud.com", "@mail.com",
  ];

  const ukDomains = [
    "@company.co.uk", "@company.com",
    `@${keyword.toLowerCase().replace(/\s+/g, "")}.co.uk`,
    `@${keyword.toLowerCase().replace(/\s+/g, "")}.com`,
    "@co.uk",
  ];

  const allDomains = [...emailDomains, ...ukDomains].filter((d, i, arr) => arr.indexOf(d) === i);
  const emailQuery = allDomains.map(d => `"${d}"`).join(" OR ");
  const dorkCommand = `site:${source}.com "${keyword}" (${emailQuery})`;

  return dorkCommand;
}

// Search Google
async function searchGoogle(dorkCommand: string): Promise<any[]> {
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
  const searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;

  if (!apiKey || !searchEngineId) {
    console.error("[INJECT] Missing Google credentials");
    return [];
  }

  try {
    const url = new URL("https://www.googleapis.com/customsearch/v1");
    url.searchParams.append("q", dorkCommand);
    url.searchParams.append("key", apiKey);
    url.searchParams.append("cx", searchEngineId);
    url.searchParams.append("num", "10");

    const response = await fetch(url.toString());
    if (!response.ok) return [];

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("[INJECT] Search error:", error);
    return [];
  }
}

// Validate UK location
function isUKLocation(text: string): boolean {
  const lower = text.toLowerCase();
  const usStates = [
    "california", "texas", "florida", "newyork", "pa ", "ny ", "ca ", "tx ", "fl ",
    "or ", "wa ", "az ", "co ", "utah", "nevada", "oregon", "washington",
    "arizona", "colorado", "new york", "pennsylvania", "illinois", "ohio"
  ];
  if (/\b\d{5}(?:-\d{4})?\b/.test(text)) return false;
  for (const state of usStates) {
    if (new RegExp(`\\b${state}\\b`).test(lower)) return false;
  }
  return true;
}

// Extract emails
function extractAllEmails(text: string, businessName: string): string[] {
  const emails = new Set<string>();
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.matchAll(emailRegex);
  for (const match of matches) {
    emails.add(match[0].toLowerCase());
  }

  if (businessName) {
    const companyBase = businessName
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");

    if (companyBase.length > 2) {
      emails.add(`info@${companyBase}.co.uk`);
      emails.add(`info@${companyBase}.com`);
      emails.add(`contact@${companyBase}.co.uk`);
      emails.add(`hello@${companyBase}.co.uk`);
    }
  }

  return Array.from(emails).filter(e => e.includes("@"));
}

// Extract phone
function extractPhone(text: string): string | undefined {
  const phoneMatch = text.match(/(?:\+44|0)\d{3,4}\s?\d{3,4}\s?\d{3,4}|(?:\+44|0)\d{10,11}/);
  return phoneMatch ? phoneMatch[0] : undefined;
}

// Extract city
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

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { query, batchSize = 50 } = await request.json() as { query: string; batchSize?: number };

    if (!query) {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    const actualBatchSize = Math.min(Math.max(batchSize, 10), 100); // Clamp: 10-100
    const queryCountNeeded = Math.ceil(actualBatchSize / 10); // 10 results per query

    console.log(`[INJECT] Starting: query="${query}", target=${actualBatchSize} leads, will run ${queryCountNeeded} searches`);

    const params = parseConversationalQuery(query);
    const allResults: any[] = [];

    // Run multiple queries to reach batch size target
    for (let i = 0; i < queryCountNeeded; i++) {
      const dorkCommand = buildDorkQuery(params);
      const results = await searchGoogle(dorkCommand);
      allResults.push(...results);

      if (results.length === 0) {
        console.log(`[INJECT] No more results at query ${i + 1}`);
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`[INJECT] Retrieved ${allResults.length} raw results`);

    // Parse into businesses
    const businesses: any[] = [];
    const seen = new Set<string>();

    for (const result of allResults) {
      const title = result.title || "";
      const snippet = result.snippet || "";
      const link = result.link || "";
      const fullText = `${title} ${snippet} ${link}`;

      if (!isUKLocation(fullText)) continue;

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
        source: "dork_search_inject",
      });

      if (businesses.length >= actualBatchSize) break;
    }

    console.log(`[INJECT] Parsed ${businesses.length} unique businesses`);

    // Inject into pipeline (create leads)
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
            source: "dork_search_inject",
          },
        });
        created.push(lead);
      } catch (err: any) {
        if (!err.message.includes("Unique constraint")) {
          console.error(`[INJECT] Error creating lead: ${business.business_name}`, err);
        }
      }
    }

    console.log(`[INJECT] Successfully injected ${created.length} leads into pipeline`);

    return NextResponse.json({
      success: true,
      query: query,
      batchSize: actualBatchSize,
      resultsRetrieved: allResults.length,
      businessesParsed: businesses.length,
      leadsInjected: created.length,
      message: `✓ Injected ${created.length} leads into pipeline. Ready for ENRICH.`,
      businesses: businesses.slice(0, 10), // Preview first 10
    });
  } catch (error) {
    console.error("[INJECT] Error:", error);
    return NextResponse.json(
      {
        error: "Injection failed",
        details: error instanceof Error ? error.message : String(error),
        success: false,
      },
      { status: 500 }
    );
  }
}
