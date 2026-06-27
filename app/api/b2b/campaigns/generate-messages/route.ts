import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { generateOutreachMessage, OutreachContext } from "@/lib/outreach-message-generator";
import { formatCampaignResponse, renderCampaignTree } from "@/lib/outreach-response-formatter";

/**
 * POST /api/b2b/campaigns/generate-messages
 *
 * Generates outreach messages for a multi-source campaign.
 * Auto-detects best strategy for each lead.
 * Returns strategy breakdown and message previews.
 *
 * REQUEST BODY:
 * {
 *   "campaignName": string
 *   "leads": [
 *     {
 *       "firstName": string
 *       "email"?: string
 *       "groupName"?: string
 *       "company"?: string
 *       "linkedinProfile"?: string
 *       "description"?: string
 *       "businessType"?: string
 *       "phoneNumber"?: string
 *     }
 *   ]
 * }
 *
 * RESPONSE:
 * {
 *   "success": boolean
 *   "campaignName": string
 *   "totalLeads": number
 *   "messages": [
 *     {
 *       "firstName": string
 *       "message": string
 *       "strategy": string
 *       "channel": string
 *       "isValid": boolean
 *     }
 *   ]
 *   "strategyBreakdown": {
 *     "ai_personalized": number
 *     "template": number
 *     "email": number
 *     "linkedin": number
 *     "generic": number
 *   }
 *   "channelBreakdown": {
 *     "whatsapp": number
 *     "email": number
 *     "linkedin": number
 *     "sms": number
 *   }
 *   "validityReport": {
 *     "valid": number
 *     "invalid": number
 *     "invalidMessages": [
 *       { "firstName": string, "reason": string }
 *     ]
 *   }
 * }
 */

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];

export async function POST(request: NextRequest) {
  console.log("[CAMPAIGN MESSAGES] ═══════════════════════════════════════");
  console.log("[CAMPAIGN MESSAGES] Starting campaign message generation");

  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    console.log("[CAMPAIGN MESSAGES] ✗ FAILED: Not authenticated");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email)) {
    console.log("[CAMPAIGN MESSAGES] ✗ FAILED: Not admin");
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  console.log("[CAMPAIGN MESSAGES] ✓ Auth passed");

  try {
    const { campaignName, leads } = await request.json() as {
      campaignName: string;
      leads: Array<Partial<OutreachContext>>;
    };

    if (!campaignName || !leads || leads.length === 0) {
      return NextResponse.json(
        {
          error: "Missing required fields: campaignName, leads array"
        },
        { status: 400 }
      );
    }

    console.log(`[CAMPAIGN MESSAGES] Campaign: ${campaignName}`);
    console.log(`[CAMPAIGN MESSAGES] Total leads: ${leads.length}`);

    const messages = [];
    const strategyCount: Record<string, number> = {
      ai_personalized: 0,
      template: 0,
      email: 0,
      linkedin: 0,
      generic: 0
    };
    const channelCount: Record<string, number> = {
      whatsapp: 0,
      email: 0,
      linkedin: 0,
      sms: 0
    };
    const invalidMessages = [];
    let validCount = 0;
    let invalidCount = 0;

    // Generate messages for each lead
    for (const lead of leads) {
      try {
        const context: OutreachContext = {
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phoneNumber: lead.phoneNumber,
          groupName: lead.groupName,
          company: lead.company,
          linkedinProfile: lead.linkedinProfile,
          description: lead.description,
          businessType: lead.businessType,
          maxChars: 180
        };

        const message = await generateOutreachMessage(context);

        strategyCount[message.strategy]++;
        channelCount[message.channel]++;

        if (message.isValid) {
          validCount++;
        } else {
          invalidCount++;
          invalidMessages.push({
            firstName: lead.firstName || "Unknown",
            reason: `Strategy: ${message.strategy}, Invalid psychology validation`
          });
        }

        messages.push({
          firstName: lead.firstName || "Unknown",
          message: message.message,
          charCount: message.charCount,
          strategy: message.strategy,
          channel: message.channel,
          isValid: message.isValid,
          psychology: message.psychology
        });

        console.log(
          `[CAMPAIGN MESSAGES] ✓ ${lead.firstName}: ${message.strategy} → ${message.channel} (${message.charCount} chars)`
        );
      } catch (error) {
        console.error(
          `[CAMPAIGN MESSAGES] ✗ Error generating message for ${lead.firstName}:`,
          error
        );
        invalidCount++;
        invalidMessages.push({
          firstName: lead.firstName || "Unknown",
          reason: `Error during generation: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }

    // Format response with psychological confidence building
    const formattedResponse = formatCampaignResponse(campaignName, messages as any[]);
    const treeDisplay = renderCampaignTree(formattedResponse);

    console.log("[CAMPAIGN MESSAGES] ═══════════════════════════════════════");
    console.log("[CAMPAIGN MESSAGES]" + treeDisplay);
    console.log("[CAMPAIGN MESSAGES] ═══════════════════════════════════════");

    return NextResponse.json({
      success: true,
      formatted: {
        campaignName: formattedResponse.campaignName,
        totalLeads: formattedResponse.totalLeads,
        messageGenerationSummary: formattedResponse.messageGenerationSummary,
        strategyGroups: formattedResponse.strategyGroups.map(g => ({
          strategy: g.strategy,
          count: g.count,
          sampleMessage: g.sample.message,
          confidenceChecks: g.confidenceChecks,
          description: g.description
        })),
        grandSummary: formattedResponse.grandSummary,
        validityReport: formattedResponse.validityReport,
        actions: formattedResponse.actions
      },
      // Keep raw data for programmatic access
      raw: {
        messages,
        strategyBreakdown: strategyCount,
        channelBreakdown: channelCount
      }
    });
  } catch (error) {
    console.error("[CAMPAIGN MESSAGES] ✗ Fatal error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate messages" },
      { status: 500 }
    );
  }
}
