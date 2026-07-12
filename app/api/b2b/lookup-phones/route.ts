import { NextRequest, NextResponse } from "next/server";
import { detectPhoneType } from "@/lib/phone-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, website } = body;

    if (!businessName && !website) {
      return NextResponse.json(
        { error: "businessName or website required" },
        { status: 400 }
      );
    }

    console.log(`[LOOKUP-PHONES] Finding phones for: ${businessName || website}`);

    const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;

    if (!apiKey || !searchEngineId) {
      console.log("[LOOKUP-PHONES] Google Custom Search not configured");
      return NextResponse.json({
        success: true,
        phones: {
          mobile: [],
          landline: [],
          all: []
        },
        message: "Phone lookup service not configured"
      });
    }

    // Build search query: for website use site: operator, for business name use quoted search
    const query = website ? `site:${website} phone OR tel OR contact` : `"${businessName}" phone UK`;

    const url = new URL("https://www.googleapis.com/customsearch/v1");
    url.searchParams.append("q", query);
    url.searchParams.append("key", apiKey);
    url.searchParams.append("cx", searchEngineId);
    url.searchParams.append("num", "10");

    const response = await fetch(url.toString());

    if (!response.ok) {
      console.error(`[LOOKUP-PHONES] Search failed: ${response.status}`);
      return NextResponse.json({
        success: true,
        phones: {
          mobile: [],
          landline: [],
          all: []
        }
      });
    }

    const data = await response.json();
    const results = data.items || [];

    // Extract all phone numbers from search results
    const extractedPhones = new Set<string>();

    for (const result of results) {
      const text = (result.title || "") + " " + (result.snippet || "");

      // Match UK phone numbers: various formats
      const phoneMatches = text.match(
        /(?:\+44|0044|0)?[0-9]{3,4}[\s\-]?[0-9]{3,4}[\s\-]?[0-9]{3,4}|(?:\+44|0044)[0-9]{10}|0[0-9]{10}/g
      );

      if (phoneMatches) {
        for (let phone of phoneMatches) {
          // Clean up
          phone = phone.replace(/[\s\-()]/g, "");

          // Validate it's a real UK number (11+ digits)
          if (phone.length >= 11 && /^(?:\+44|0044|0)?[0-9]{10,11}$/.test(phone)) {
            extractedPhones.add(phone);
          }
        }
      }
    }

    // Categorize into mobile and landline
    const phones = {
      mobile: [] as string[],
      landline: [] as string[],
      all: Array.from(extractedPhones)
    };

    for (const phone of extractedPhones) {
      const type = detectPhoneType(phone);
      if (type === "mobile") {
        phones.mobile.push(phone);
      } else if (type === "landline") {
        phones.landline.push(phone);
      }
    }

    console.log(`[LOOKUP-PHONES] Found ${phones.mobile.length} mobile, ${phones.landline.length} landline`);

    return NextResponse.json({
      success: true,
      phones,
      query,
      resultsScanned: results.length
    });
  } catch (error) {
    console.error("[LOOKUP-PHONES] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lookup failed" },
      { status: 500 }
    );
  }
}
