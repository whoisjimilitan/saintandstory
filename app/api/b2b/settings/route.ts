import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PRESSURE_TYPES = [
  "Delivery delays",
  "Staff turnover",
  "Cash flow",
  "Customer complaints",
  "Operations chaos",
];

export async function GET(request: Request) {
  try {
    const settings = await (prisma as any).b2b_settings.findMany();
    
    // Initialize defaults for missing pressure types
    const settingsMap = Object.fromEntries(
      settings.map((s: any) => [s.pressure_type, s])
    );

    for (const type of PRESSURE_TYPES) {
      if (!settingsMap[type]) {
        settingsMap[type] = {
          pressure_type: type,
          enabled: true,
          max_emails_per_day: 50,
          allowed_variants: "BOTH",
        };
      }
    }

    return NextResponse.json({
      success: true,
      settings: settingsMap,
      globalMaxEmails: 50, // Static for now, can be made dynamic later
    });
  } catch (error) {
    console.error("[B2B SETTINGS GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.settings || !Array.isArray(body.settings)) {
      return NextResponse.json(
        { error: "Invalid request: settings array required" },
        { status: 400 }
      );
    }

    // Save each setting
    for (const setting of body.settings) {
      if (!PRESSURE_TYPES.includes(setting.pressure_type)) {
        return NextResponse.json(
          { error: `Invalid pressure_type: ${setting.pressure_type}` },
          { status: 400 }
        );
      }

      await (prisma as any).b2b_settings.upsert({
        where: { pressure_type: setting.pressure_type },
        update: {
          enabled: setting.enabled,
          max_emails_per_day: setting.max_emails_per_day,
          allowed_variants: setting.allowed_variants,
        },
        create: {
          pressure_type: setting.pressure_type,
          enabled: setting.enabled,
          max_emails_per_day: setting.max_emails_per_day,
          allowed_variants: setting.allowed_variants,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Settings saved",
    });
  } catch (error) {
    console.error("[B2B SETTINGS POST] Error:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
