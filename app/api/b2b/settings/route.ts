import { NextResponse } from "next/server";

// In-memory store for operator settings
// In production, use database
const operatorSettings = {
  max_emails_per_day: 50,
  enabled_pressure_types: [
    "Time-Critical Movement",
    "Capacity Overflow",
    "Service Quality Inconsistency",
    "Geographic Service Gaps",
    "Customer Acquisition Friction",
    "Customer Churn",
    "Delivery Reliability",
    "Appointment Scheduling Friction",
    "Communication Breakdown",
  ],
};

export async function GET() {
  return NextResponse.json({
    settings: operatorSettings,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Update settings
    if (body.max_emails_per_day) {
      operatorSettings.max_emails_per_day = body.max_emails_per_day;
    }
    if (body.enabled_pressure_types) {
      operatorSettings.enabled_pressure_types = body.enabled_pressure_types;
    }

    return NextResponse.json({
      success: true,
      settings: operatorSettings,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
