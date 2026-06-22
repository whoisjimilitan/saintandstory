import { NextResponse } from "next/server";

/**
 * BATCH 1 - PHASE 1: Basic POST endpoint
 * Goal: Prove the route works with simple JSON parsing
 *
 * No auth, no complex logic, just:
 * 1. Parse JSON body
 * 2. Extract query
 * 3. Return response
 */

export async function POST(request: Request) {
  try {
    // Step 1: Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Step 2: Extract and validate query
    const query = body?.query;

    if (!query) {
      return NextResponse.json(
        { error: "query parameter is required" },
        { status: 400 }
      );
    }

    if (typeof query !== "string") {
      return NextResponse.json(
        { error: "query must be a string" },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();

    if (trimmedQuery.length === 0) {
      return NextResponse.json(
        { error: "query cannot be empty" },
        { status: 400 }
      );
    }

    // Step 3: Return success with parsed data
    return NextResponse.json({
      success: true,
      query: trimmedQuery,
      timestamp: new Date().toISOString(),
      phase: "PHASE 1 - Testing basic endpoint"
    });

  } catch (error) {
    console.error("[DORK-SEARCH] Uncaught error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Server error: ${message}` },
      { status: 500 }
    );
  }
}
