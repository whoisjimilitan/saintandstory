import { NextResponse } from "next/server";
import { runDiscoveryPipeline } from "@/lib/discovery/pipeline";

export const maxDuration = 300;

export async function POST(req: Request) {
  const body = await req.json();
  const { niche, location } = body;

  if (!niche || !location) {
    return NextResponse.json(
      { error: "niche and location are required" },
      { status: 400 }
    );
  }

  if (!process.env.GOOGLE_MAPS_API_KEY) {
    return NextResponse.json(
      { error: "GOOGLE_MAPS_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const result = await runDiscoveryPipeline({ niche, location });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[discovery/run]", err);
    return NextResponse.json(
      {
        error: "Pipeline failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
