import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { inferProblemFromConfession } from "@/lib/confession-inferencer";
import { getProblemType } from "@/lib/problems-map";
import { analyzePsychology, calculateConfidence, determineRoute } from "@/lib/psychology-analyzer";
import { generateBrief, generateEmailBody } from "@/lib/brief-generator";
import { filterLegitimateConfession, extractContactInfo, getContactCompleteness } from "@/lib/confession-scraper";

export const dynamic = "force-dynamic";

/**
 * Automated Confession Harvester
 *
 * This endpoint:
 * 1. Harvests confessions from sources (mocked for now, integrate real sources)
 * 2. Filters for legitimacy
 * 3. Infers problems
 * 4. Generates briefs
 * 5. Creates opportunities
 * 6. Routes to queue
 *
 * This is the PRODUCTION flow - NOT manual pasting.
 * Real implementation integrates Reddit API, Twitter API, LinkedIn scraper, etc.
 *
 * Can be called:
 * - Periodically (every 30 min via cron)
 * - On-demand (POST /api/operator/confessions/harvest)
 */

interface HarvestedConfession {
  text: string;
  source: string;
  source_url?: string;
  posted_at: Date;
  author?: string;
  company_name?: string;
  email?: string;
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[HARVEST] Starting confession harvest");

  try {
    // STEP 1: Harvest confessions from sources
    // TODO: Replace with real implementations:
    // - Reddit API: /r/business, /r/smallbusiness, /r/startups
    // - Twitter API: keyword search for delivery problems
    // - LinkedIn: company page posts mentioning issues
    // - Google Alerts: forwarded to email or webhook
    // - Facebook Groups: business owner groups
    // - News RSS: logistics/delivery topics
    // For now, this is a stub that shows the flow

    const confessions: HarvestedConfession[] = [];

    console.log(`[HARVEST] Found ${confessions.length} confessions to process`);

    if (confessions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No new confessions found",
        confessions_processed: 0,
        opportunities_created: 0
      });
    }

    // STEP 2: Process each confession
    let created = 0;
    let rejected = 0;
    const errors = [];

    for (const confession of confessions) {
      try {
        // Filter legitimacy
        const legitimacy = filterLegitimateConfession(confession.text);
        if (!legitimacy.is_legitimate && legitimacy.confidence > 0.8) {
          console.log(
            `[HARVEST] Rejected ${confession.source}: ${legitimacy.reason}`
          );
          rejected++;
          continue;
        }

        // Infer problem
        const inference = await inferProblemFromConfession(confession.text);

        if (!inference.inferred_problem_type || inference.confidence < 0.6) {
          console.log(`[HARVEST] Could not infer problem from: ${confession.text.substring(0, 50)}`);
          rejected++;
          continue;
        }

        const problemType = inference.inferred_problem_type;
        const problem = getProblemType(problemType);

        if (!problem) {
          console.log(`[HARVEST] Problem type not in map: ${problemType}`);
          rejected++;
          continue;
        }

        // Analyze psychology
        const psychology = analyzePsychology({
          confession_text: confession.text,
          problem_type: problemType,
          company_name: confession.company_name
        });

        if (!psychology) {
          rejected++;
          continue;
        }

        // Calculate confidence
        const contactCompleteness = getContactCompleteness({
          name: confession.author,
          email: confession.email,
          company: confession.company_name
        });

        const confidence = calculateConfidence({
          psychology,
          contact_info_completeness: contactCompleteness,
          keyword_match_strength: 0.75
        });

        // Determine route
        const route = determineRoute({
          problem_tier: problem.tier,
          confidence
        });

        // Generate brief
        const brief = generateBrief({
          confession_text: confession.text,
          problem_type: problemType,
          company_name: confession.company_name,
          psychology
        });

        if (!brief) {
          rejected++;
          continue;
        }

        // Create opportunity
        await prisma.opportunityFeed.create({
          data: {
            companyName: confession.company_name || "Unknown",
            contactEmail: confession.email,
            sourcePlatform: confession.source,
            sourceUrl: confession.source_url,
            postedDate: confession.posted_at,
            originalWording: confession.text,
            extractedNeed: problemType,
            extractedUrgency: psychology.urgency_level,
            extractedContext: confession.text.substring(0, 500),
            extractedQuote: confession.text.substring(0, 200),
            problemType,
            psychologyAnalysis: psychology as unknown as Record<string, unknown>,
            prePopulatedReply: problem.pre_populated_reply,
            briefHtml: brief.html,
            emailSubject: brief.subject,
            emailBody: generateEmailBody(brief),
            routingTier: problem.tier,
            confidenceScore: confidence,
            approvalStatus: route === "AUTO_SEND" ? "approved" : route === "DISCARD" ? "rejected" : "pending",
            jamesStatus: route === "AUTO_SEND" ? "pending" : undefined,
            status: route === "DISCARD" ? "rejected" : "discovered"
          }
        });

        created++;
        console.log(`[HARVEST] Created opportunity from ${confession.source}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[HARVEST] Error processing confession: ${errorMsg}`);
        errors.push({
          source: confession.source,
          error: errorMsg
        });
      }
    }

    console.log(
      `[HARVEST] Complete. Created: ${created}, Rejected: ${rejected}, Errors: ${errors.length}`
    );

    return NextResponse.json({
      success: true,
      confessions_processed: confessions.length,
      opportunities_created: created,
      rejected,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("[HARVEST] Server error:", error);
    return NextResponse.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/operator/confessions/harvest
 *
 * Returns status of harvester:
 * - Last run time
 * - Opportunities created this week
 * - Health status
 */
export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get stats from last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const recentOpportunities = await prisma.opportunityFeed.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        sourcePlatform: { not: "manual_test" }
      },
      select: { id: true }
    });

    const pendingApproval = await prisma.opportunityFeed.findMany({
      where: { approvalStatus: "pending" },
      select: { id: true }
    });

    return NextResponse.json({
      success: true,
      harvester_status: "operational",
      last_run: "System running with automated harvest (TODO: integrate real sources)",
      statistics: {
        opportunities_created_7d: recentOpportunities.length,
        pending_approval: pendingApproval.length,
        sources_integrated: [
          "manual_test (for testing only)",
          "TODO: Reddit",
          "TODO: Twitter",
          "TODO: LinkedIn",
          "TODO: Google Alerts",
          "TODO: Facebook Groups"
        ]
      }
    });
  } catch (error) {
    console.error("[HARVEST] Status error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
