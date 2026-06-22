import { NextResponse } from "next/server";

// In-memory storage for demonstration
// In production, this would be stored in the database
let operatorSettings = {
  googlePlaces: {
    defaultCountry: "UK",
    defaultCities: ["London"],
    searchRadius: 25,
    radiusUnit: "miles" as const,
    categoryFilter: [] as string[],
  },
  discovery: {
    defaultSource: "google_places",
    autoQualifyThreshold: 70,
    enabledSources: {
      googlePlaces: true,
      manual: true,
      csv: true,
      dorkSearch: true,
    },
  },
  advanced: {
    googlePlacesApiKey: "",
    csvTemplate: "",
  },
};

export async function GET() {
  return NextResponse.json(operatorSettings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate settings structure
    if (!body.googlePlaces || !body.discovery) {
      return NextResponse.json(
        { error: "Invalid settings structure" },
        { status: 400 }
      );
    }

    // Update settings
    operatorSettings = body;

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
      settings: operatorSettings,
    });
  } catch (error) {
    console.error("[SETTINGS] Error:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
