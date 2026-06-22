import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("✅ [DORK-SEARCH] POST handler started");

    const body = await request.json() as any;
    console.log("✅ [DORK-SEARCH] Body parsed:", body);

    const query = body?.query;
    console.log("✅ [DORK-SEARCH] Query:", query);

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query required (string)" },
        { status: 400 }
      );
    }

    // Test response
    return NextResponse.json({
      success: true,
      query,
      message: "Dork search received query successfully"
    });
  } catch (error) {
    console.error("❌ ERROR:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
