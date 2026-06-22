import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * BATCH 2 - PHASE 2: Campaign Launch
 *
 * Smart campaign system:
 * - Group leads by pressure type
 * - Show response rates by pressure group
 * - Suggest optimal email for each lead
 * - Send campaign with intelligent pressure pairing
 */

type PressureGroup =
  | "Time-Critical Movement"
  | "Capacity Overflow"
  | "Appointment Scheduling Friction"
  | "Customer Acquisition Friction";

interface CampaignRequest {
  leadIds: string[];
  campaignName?: string;
}

interface LeadWithPressure {
  id: string;
  businessName: string;
  email?: string | null;
  phone?: string | null;
  businessCategory?: string | null;
  pressureGroup?: PressureGroup;
  suggestedPressure?: PressureGroup;
  confidenceScore?: number;
}

// Mock response rate data (in real system, comes from database)
const PRESSURE_RESPONSE_RATES: Record<PressureGroup, number> = {
  "Time-Critical Movement": 0.42,
  "Capacity Overflow": 0.38,
  "Appointment Scheduling Friction": 0.35,
  "Customer Acquisition Friction": 0.28
};

// Pressure group classification rules
const PRESSURE_CLASSIFIER: Record<string, { pressure: PressureGroup; confidence: number }> = {
  furniture: { pressure: "Time-Critical Movement", confidence: 0.95 },
  plumbing: { pressure: "Time-Critical Movement", confidence: 0.95 },
  electrician: { pressure: "Time-Critical Movement", confidence: 0.92 },
  removal: { pressure: "Time-Critical Movement", confidence: 0.90 },
  pharmacy: { pressure: "Time-Critical Movement", confidence: 0.88 },
  dental: { pressure: "Appointment Scheduling Friction", confidence: 0.96 },
  dentist: { pressure: "Appointment Scheduling Friction", confidence: 0.96 },
  doctor: { pressure: "Appointment Scheduling Friction", confidence: 0.90 },
  salon: { pressure: "Appointment Scheduling Friction", confidence: 0.88 },
  solicitor: { pressure: "Customer Acquisition Friction", confidence: 0.85 },
  accountant: { pressure: "Customer Acquisition Friction", confidence: 0.82 },
  estate: { pressure: "Customer Acquisition Friction", confidence: 0.80 },
  coach: { pressure: "Customer Acquisition Friction", confidence: 0.78 },
};

function suggestPressureGroup(businessCategory?: string): { pressure: PressureGroup; confidence: number } {
  if (!businessCategory) {
    return { pressure: "Customer Acquisition Friction", confidence: 0.5 };
  }

  const lower = businessCategory.toLowerCase();
  for (const [keyword, classification] of Object.entries(PRESSURE_CLASSIFIER)) {
    if (lower.includes(keyword)) {
      return classification;
    }
  }

  return { pressure: "Customer Acquisition Friction", confidence: 0.5 };
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as CampaignRequest;
    const { leadIds, campaignName } = body;

    if (!leadIds || leadIds.length === 0) {
      return NextResponse.json(
        { error: "At least one lead ID is required" },
        { status: 400 }
      );
    }

    // Fetch leads from database
    const leads = await prisma.b2bLead.findMany({
      where: { id: { in: leadIds } }
    });

    if (leads.length === 0) {
      return NextResponse.json(
        { error: "No leads found" },
        { status: 404 }
      );
    }

    // Group leads by pressure type
    const groupedByPressure: Record<PressureGroup, LeadWithPressure[]> = {
      "Time-Critical Movement": [],
      "Capacity Overflow": [],
      "Appointment Scheduling Friction": [],
      "Customer Acquisition Friction": []
    };

    leads.forEach((lead) => {
      // Suggest pressure group with confidence score
      const suggestion = suggestPressureGroup(lead.businessCategory);
      const pressure = suggestion.pressure;

      groupedByPressure[pressure].push({
        id: lead.id,
        businessName: lead.businessName,
        email: lead.email,
        phone: lead.phone,
        businessCategory: lead.businessCategory,
        pressureGroup: pressure,
        suggestedPressure: pressure,
        confidenceScore: suggestion.confidence
      });
    });

    // Calculate statistics
    const stats = Object.entries(groupedByPressure).map(([pressure, leadsInGroup]) => ({
      pressure: pressure as PressureGroup,
      count: leadsInGroup.length,
      responseRate: PRESSURE_RESPONSE_RATES[pressure as PressureGroup],
      leads: leadsInGroup
    }));

    // Sort by response rate (descending)
    const sortedStats = stats.sort((a, b) => b.responseRate - a.responseRate);

    // Create campaign
    const campaign = await prisma.b2bCampaign.create({
      data: {
        name: campaignName || `Dork Campaign ${new Date().toLocaleDateString()}`,
        source: "dork_search",
        status: "draft",
        totalLeads: leads.length,
        sentCount: 0,
        responseCount: 0
      }
    });

    // Build campaign summary with recommendations
    const campaignSummary = {
      campaignId: campaign.id,
      campaignName: campaign.name,
      totalLeads: leads.length,
      groupedByPressure: sortedStats.map((stat) => ({
        pressure: stat.pressure,
        count: stat.count,
        responseRate: `${(stat.responseRate * 100).toFixed(0)}%`,
        recommendation: stat.count > 0 ? "Ready to send" : "No leads",
        leads: stat.leads.map((lead) => ({
          id: lead.id,
          businessName: lead.businessName,
          email: lead.email,
          phone: lead.phone,
          suggestedPressure: stat.pressure
        }))
      })),
      readyToSend: true,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      phase: "PHASE 2 - Campaign Preparation",
      campaign: campaignSummary
    });

  } catch (error) {
    console.error("[CAMPAIGN] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Server error: ${message}` },
      { status: 500 }
    );
  }
}
