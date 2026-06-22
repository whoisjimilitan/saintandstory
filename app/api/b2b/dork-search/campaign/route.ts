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
  email?: string;
  phone?: string;
  businessCategory?: string;
  pressureGroup?: PressureGroup;
}

// Mock response rate data (in real system, comes from database)
const PRESSURE_RESPONSE_RATES: Record<PressureGroup, number> = {
  "Time-Critical Movement": 0.42,
  "Capacity Overflow": 0.38,
  "Appointment Scheduling Friction": 0.35,
  "Customer Acquisition Friction": 0.28
};

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
      // Infer pressure group from business category or default
      let pressure: PressureGroup = "Customer Acquisition Friction";

      if (lead.businessCategory) {
        const category = lead.businessCategory.toLowerCase();
        if (["furniture", "plumbing", "electrician", "removal", "pharmacy"].includes(category)) {
          pressure = "Time-Critical Movement";
        } else if (["dental", "dentist"].includes(category)) {
          pressure = "Appointment Scheduling Friction";
        }
      }

      groupedByPressure[pressure].push({
        id: lead.id,
        businessName: lead.businessName,
        email: lead.email,
        phone: lead.phone,
        businessCategory: lead.businessCategory,
        pressureGroup: pressure
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
