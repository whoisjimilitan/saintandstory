import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { inferProblemFromCategory } from "@/lib/confession-inferencer";
import { getProblemType } from "@/lib/problems-map";
import { analyzePsychology, calculateConfidence } from "@/lib/psychology-analyzer";
import { generateBrief, generateEmailBody } from "@/lib/brief-generator";

export const dynamic = "force-dynamic";

interface ProspectInput {
  id?: string;
  businessName: string;
  email?: string;
  phone?: string;
  city?: string;
  postcode?: string;
  category?: string;
  contactName?: string;
}

/**
 * Bulk create OpportunityFeed records from discovered prospects
 *
 * This is the key endpoint that unifies ALL prospect sources:
 * - Search results (Google Places, Companies House, CRM)
 * - Manual adds
 * - CSV uploads
 *
 * All flow through here to create persistent records.
 */
export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { prospects } = body as { prospects: ProspectInput[] };

    if (!prospects || prospects.length === 0) {
      return NextResponse.json(
        { error: "No prospects provided" },
        { status: 400 }
      );
    }

    console.log(`[OPPORTUNITY-FEED-CREATE] Creating ${prospects.length} opportunity records`);

    const created = [];
    const errors = [];

    for (const prospect of prospects) {
      try {
        // Step 1: Check if already exists in OpportunityFeed (deduplication)
        const existing = await prisma.opportunityFeed.findFirst({
          where: {
            companyName: prospect.businessName,
            contactEmail: prospect.email
          }
        });

        if (existing) {
          console.log(`[OPPORTUNITY-FEED-CREATE] Prospect already exists: ${prospect.businessName}`);
          created.push({
            id: existing.id,
            businessName: prospect.businessName,
            status: "already_exists",
            opportunityId: existing.id
          });
          continue;
        }

        // Step 2: Infer problem type from business category
        const categoryInference = inferProblemFromCategory(prospect.category || "");
        const problemType = categoryInference.primary_problem || "court_deadline_delivery";
        const problem = getProblemType(problemType);

        if (!problem) {
          throw new Error(`Invalid problem type: ${problemType}`);
        }

        // Step 3: Analyze psychology
        const confession = `${prospect.businessName} in ${prospect.city || "UK"} (${prospect.category || "Business"})`;
        const psychology = analyzePsychology({
          confession_text: confession,
          problem_type: problemType,
          company_name: prospect.businessName,
          location: prospect.city
        });

        if (!psychology) {
          throw new Error("Failed to analyze psychology");
        }

        // Step 4: Calculate confidence
        const contactCompleteness = prospect.email ? 0.8 : prospect.phone ? 0.6 : 0.3;
        const confidence = calculateConfidence({
          psychology,
          contact_info_completeness: contactCompleteness,
          keyword_match_strength: 0.75
        });

        // Step 5: Generate brief
        const brief = generateBrief({
          confession_text: confession,
          problem_type: problemType,
          contact_name: prospect.contactName,
          company_name: prospect.businessName,
          location: prospect.city,
          psychology
        });

        if (!brief) {
          throw new Error("Failed to generate brief");
        }

        // Step 6: Create OpportunityFeed record
        const opportunity = await prisma.opportunityFeed.create({
          data: {
            companyName: prospect.businessName,
            contactEmail: prospect.email,
            contactPhone: prospect.phone,
            location: prospect.city,
            postcode: prospect.postcode,
            sourcePlatform: "operator_search", // Mark as from operator discovery
            postedDate: new Date(),
            originalWording: confession,
            extractedNeed: problemType,
            extractedUrgency: psychology.urgency_level,
            extractedContext: confession,
            extractedQuote: confession.substring(0, 200),
            problemType,
            psychologyAnalysis: psychology as unknown as Record<string, unknown>,
            prePopulatedReply: problem.pre_populated_reply,
            briefHtml: brief.html,
            emailSubject: brief.subject,
            emailBody: generateEmailBody(brief),
            routingTier: problem.tier,
            confidenceScore: confidence,
            approvalStatus: "pending",
            status: "discovered"
          }
        });

        created.push({
          id: opportunity.id,
          businessName: prospect.businessName,
          problemType,
          confidence: Math.round(confidence * 100),
          status: "created",
          opportunityId: opportunity.id
        });

        console.log(`[OPPORTUNITY-FEED-CREATE] Created opportunity: ${prospect.businessName} (${problemType})`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[OPPORTUNITY-FEED-CREATE] Error processing ${prospect.businessName}: ${errorMsg}`);
        errors.push({
          businessName: prospect.businessName,
          error: errorMsg
        });
      }
    }

    const successCount = created.filter(c => c.status === "created").length;
    const existingCount = created.filter(c => c.status === "already_exists").length;

    console.log(`[OPPORTUNITY-FEED-CREATE] Complete. Created: ${successCount}, Already existed: ${existingCount}, Errors: ${errors.length}`);

    return NextResponse.json({
      success: true,
      created: successCount,
      alreadyExists: existingCount,
      errors: errors.length,
      opportunities: created,
      errorDetails: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error("[OPPORTUNITY-FEED-CREATE] Server error:", error);
    return NextResponse.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}
