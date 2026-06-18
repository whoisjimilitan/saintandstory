import { NextResponse } from "next/server";
import { buildMemoryPatterns } from "@/lib/b2b-memory-builder";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await buildMemoryPatterns();

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Memory patterns rebuilt",
      created: result.created,
      updated: result.updated,
      patternsCount: result.patterns.length,
      patterns: result.patterns,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[MEMORY REBUILD] Error:", error);
    return NextResponse.json(
      { error: "Failed to rebuild memory" },
      { status: 500 }
    );
  }
}
