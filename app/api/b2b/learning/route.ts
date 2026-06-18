import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Get all outreach records with responses
    const outreach = await prisma.b2bOutreach.findMany({
      include: {
        b2b_responses: true,
      },
    });

    // Calculate pressure type metrics
    const pressureTypeMetrics: Record<string, {
      sent_count: number;
      yes_count: number;
      no_count: number;
      yes_rate: number;
    }> = {};

    for (const record of outreach) {
      const type = record.pressure_type || "unknown";
      
      if (!pressureTypeMetrics[type]) {
        pressureTypeMetrics[type] = {
          sent_count: 0,
          yes_count: 0,
          no_count: 0,
          yes_rate: 0,
        };
      }

      pressureTypeMetrics[type].sent_count++;

      const response = record.b2b_responses[0];
      if (response) {
        if (response.response_type === "YES") {
          pressureTypeMetrics[type].yes_count++;
        } else if (response.response_type === "NO") {
          pressureTypeMetrics[type].no_count++;
        }
      }
    }

    // Calculate YES rates
    for (const type in pressureTypeMetrics) {
      const metrics = pressureTypeMetrics[type];
      const total = metrics.yes_count + metrics.no_count;
      metrics.yes_rate = total > 0 ? metrics.yes_count / total : 0;
    }

    // Convert to sorted array
    const pressureTypes = Object.entries(pressureTypeMetrics)
      .map(([type, metrics]) => ({
        pressure_type: type,
        ...metrics,
      }))
      .sort((a, b) => b.yes_rate - a.yes_rate);

    // Calculate copy variant metrics
    const copyVariantMetrics: Record<string, {
      sent_count: number;
      yes_count: number;
      no_count: number;
      yes_rate: number;
    }> = {};

    for (const record of outreach) {
      const variant = record.copy_variant || "UNKNOWN";
      
      if (!copyVariantMetrics[variant]) {
        copyVariantMetrics[variant] = {
          sent_count: 0,
          yes_count: 0,
          no_count: 0,
          yes_rate: 0,
        };
      }

      copyVariantMetrics[variant].sent_count++;

      const response = record.b2b_responses[0];
      if (response) {
        if (response.response_type === "YES") {
          copyVariantMetrics[variant].yes_count++;
        } else if (response.response_type === "NO") {
          copyVariantMetrics[variant].no_count++;
        }
      }
    }

    // Calculate YES rates for variants
    for (const variant in copyVariantMetrics) {
      const metrics = copyVariantMetrics[variant];
      const total = metrics.yes_count + metrics.no_count;
      metrics.yes_rate = total > 0 ? metrics.yes_count / total : 0;
    }

    // Convert to sorted array
    const copyVariants = Object.entries(copyVariantMetrics)
      .map(([variant, metrics]) => ({
        copy_variant: variant,
        ...metrics,
      }))
      .sort((a, b) => b.yes_rate - a.yes_rate);

    return NextResponse.json({
      success: true,
      pressureTypes,
      copyVariants,
    });
  } catch (error) {
    console.error("[B2B LEARNING] Error:", error);
    return NextResponse.json(
      { error: "Failed to load learning metrics" },
      { status: 500 }
    );
  }
}
