import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { inferProblemFromCategory, inferProblemFromConfession } from "@/lib/confession-inferencer";
import { getProblemType } from "@/lib/problems-map";
import { analyzePsychology, calculateConfidence, determineRoute } from "@/lib/psychology-analyzer";
import { generateBrief, generateEmailBody } from "@/lib/brief-generator";

export const dynamic = "force-dynamic";

interface SearchInferRequest {
  postcode?: string;
  city?: string;
  keyword?: string;
  limit?: number;
}

/**
 * Search prospects by location/keyword, infer their problems, process through pipeline.
 *
 * This is the game-changer: Find prospects in a postcode → infer problems based on category
 * → send problem-specific briefs.
 *
 * POST /api/operator/opportunity-feed/search-and-infer
 * Body: { postcode: "SW1A1AA", limit: 50 }
 *
 * Returns: List of opportunities ready for approval, organized by problem type.
 */

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    console.log("[SEARCH & INFER] Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[SEARCH & INFER] Starting search and inference");

  try {
    const body = (await request.json()) as SearchInferRequest;

    if (!body.postcode && !body.city && !body.keyword) {
      return NextResponse.json(
        { error: "Provide at least one: postcode, city, or keyword" },
        { status: 400 }
      );
    }

    // STEP 1: Search B2bLead table
    const prospects = await prisma.b2bLead.findMany({
      where: {
        ...(body.keyword && {
          OR: [
            { businessName: { contains: body.keyword, mode: "insensitive" } },
            { businessCategory: { contains: body.keyword, mode: "insensitive" } }
          ]
        }),
        ...(body.postcode && {
          postcode: { startsWith: body.postcode.toUpperCase() }
        }),
        ...(body.city && {
          city: { contains: body.city, mode: "insensitive" }
        })
      },
      select: {
        id: true,
        businessName: true,
        businessCategory: true,
        email: true,
        phone: true,
        city: true,
        postcode: true,
        painPoint: true
      },
      take: Math.min(body.limit || 100, 500)
    });

    console.log(`[SEARCH & INFER] Found ${prospects.length} prospects`);

    if (prospects.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: "No prospects found matching search criteria",
        opportunities: []
      });
    }

    // STEP 2: Process each prospect through problem inference + pipeline
    const opportunities = [];
    const errors = [];

    for (const prospect of prospects) {
      try {
        // Infer problem from business category
        const categoryInference = inferProblemFromCategory(prospect.businessCategory || "");

        if (!categoryInference.primary_problem) {
          console.log(`[SEARCH & INFER] Could not infer problem for: ${prospect.businessName}`);
          continue;
        }

        const problemType = categoryInference.primary_problem;
        const problem = getProblemType(problemType);

        if (!problem) {
          console.log(`[SEARCH & INFER] Problem type not in map: ${problemType}`);
          continue;
        }

        console.log(
          `[SEARCH & INFER] ${prospect.businessName} → ${problemType} (confidence: ${categoryInference.confidence})`
        );

        // STEP 3: Analyze psychology
        const confession = `${prospect.businessName} in ${prospect.city || "UK"} (${prospect.businessCategory || "Business"})`;
        const psychology = analyzePsychology({
          confession_text: confession,
          problem_type: problemType,
          company_name: prospect.businessName,
          location: prospect.city || undefined
        });

        if (!psychology) {
          console.log(`[SEARCH & INFER] Psychology analysis failed for ${prospect.businessName}`);
          continue;
        }

        // STEP 4: Calculate confidence (combine category inference + psychology)
        const baseConfidence = categoryInference.confidence;
        const contactCompleteness = prospect.email ? 0.8 : prospect.phone ? 0.6 : 0.3;
        const confidence = calculateConfidence({
          psychology,
          contact_info_completeness: contactCompleteness,
          keyword_match_strength: 0.7
        });

        // STEP 5: Determine route
        const route = determineRoute({
          problem_tier: problem.tier,
          confidence
        });

        // STEP 6: Generate brief
        const brief = generateBrief({
          confession_text: confession,
          problem_type: problemType,
          contact_name: prospect.businessName,
          company_name: prospect.businessName,
          location: prospect.city || undefined,
          psychology
        });

        if (!brief) {
          console.log(`[SEARCH & INFER] Brief generation failed for ${prospect.businessName}`);
          continue;
        }

        // STEP 7: Create opportunity
        const opportunity = await prisma.opportunityFeed.create({
          data: {
            companyName: prospect.businessName,
            contactEmail: prospect.email,
            contactPhone: prospect.phone,
            sourcePlatform: "postcode_search",
            sourceUrl: undefined,
            postedDate: new Date(),
            originalWording: confession,
            location: prospect.city,
            extractedNeed: problemType,
            extractedUrgency: psychology.urgency_level,
            extractedContext: prospect.painPoint || confession,
            extractedQuote: confession.substring(0, 200),
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
            rejectionReason: route === "DISCARD" ? "Low confidence from search" : undefined,
            status: route === "DISCARD" ? "rejected" : "discovered"
          }
        });

        opportunities.push({
          id: opportunity.id,
          company: prospect.businessName,
          problem_type: problemType,
          confidence: confidence,
          route,
          email: prospect.email
        });

        console.log(`[SEARCH & INFER] Created opportunity for ${prospect.businessName}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[SEARCH & INFER] Error processing ${prospect.businessName}: ${errorMsg}`);
        errors.push({
          company: prospect.businessName,
          error: errorMsg
        });
      }
    }

    console.log(
      `[SEARCH & INFER] Complete. Created: ${opportunities.length}, Errors: ${errors.length}`
    );

    return NextResponse.json({
      success: true,
      prospects_found: prospects.length,
      opportunities_created: opportunities.length,
      opportunities,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("[SEARCH & INFER] Error:", error);
    return NextResponse.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}
