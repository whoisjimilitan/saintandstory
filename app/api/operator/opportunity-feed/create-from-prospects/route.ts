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
        console.log(`[OPPORTUNITY-FEED-CREATE] Processing: ${prospect.businessName}`);

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
        console.log(`[OPPORTUNITY-FEED-CREATE] Inferring problem from category: ${prospect.category || "Business"}`);
        const categoryInference = inferProblemFromCategory(prospect.category || "");
        const problemType = categoryInference.primary_problem || "court_deadline_delivery";
        const problem = getProblemType(problemType);

        if (!problem) {
          throw new Error(`Invalid problem type: ${problemType}`);
        }
        console.log(`[OPPORTUNITY-FEED-CREATE] Inferred problem: ${problemType}`);

        // Step 3: Analyze psychology
        const confession = `${prospect.businessName} in ${prospect.city || "UK"} (${prospect.category || "Business"})`;
        console.log(`[OPPORTUNITY-FEED-CREATE] Analyzing psychology...`);
        const psychology = analyzePsychology({
          confession_text: confession,
          problem_type: problemType,
          company_name: prospect.businessName,
          location: prospect.city
        });

        if (!psychology) {
          throw new Error("Failed to analyze psychology");
        }
        console.log(`[OPPORTUNITY-FEED-CREATE] Psychology analyzed. Urgency: ${psychology.urgency_level}`);

        // Step 4: Calculate confidence
        const contactCompleteness = prospect.email ? 0.8 : prospect.phone ? 0.6 : 0.3;
        const confidence = calculateConfidence({
          psychology,
          contact_info_completeness: contactCompleteness,
          keyword_match_strength: 0.75
        });
        console.log(`[OPPORTUNITY-FEED-CREATE] Confidence: ${Math.round(confidence * 100)}%`);

        // Step 5: Generate brief
        console.log(`[OPPORTUNITY-FEED-CREATE] Generating brief...`);
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
        console.log(`[OPPORTUNITY-FEED-CREATE] Brief generated. Subject: ${brief.subject.substring(0, 50)}...`);

        // Step 6: Create OpportunityFeed record
        console.log(`[OPPORTUNITY-FEED-CREATE] Creating database record...`);

        // Build data object, only including defined fields (Prisma doesn't accept undefined)
        const createData: any = {
          companyName: prospect.businessName,
          sourcePlatform: "operator_search",
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
        };

        // Add optional fields only if defined
        if (prospect.email) createData.contactEmail = prospect.email;
        if (prospect.phone) createData.contactPhone = prospect.phone;
        if (prospect.contactName) createData.contactName = prospect.contactName;
        if (prospect.city) createData.location = prospect.city;
        if (prospect.postcode) createData.postcode = prospect.postcode;

        const opportunity = await prisma.opportunityFeed.create({
          data: createData
        });

        created.push({
          id: opportunity.id,
          businessName: prospect.businessName,
          problemType,
          confidence: Math.round(confidence * 100),
          status: "created",
          opportunityId: opportunity.id
        });

        console.log(`[OPPORTUNITY-FEED-CREATE] ✓ Created opportunity: ${prospect.businessName} (ID: ${opportunity.id})`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : "";
        console.error(`[OPPORTUNITY-FEED-CREATE] ✗ Error processing ${prospect.businessName}: ${errorMsg}`);
        console.error(`[OPPORTUNITY-FEED-CREATE] Stack: ${errorStack}`);
        errors.push({
          businessName: prospect.businessName,
          error: errorMsg,
          stack: errorStack
        });
      }
    }

    const successCount = created.filter(c => c.status === "created").length;
    const existingCount = created.filter(c => c.status === "already_exists").length;

    console.log(`[OPPORTUNITY-FEED-CREATE] Complete. Created: ${successCount}, Already existed: ${existingCount}, Errors: ${errors.length}`);

    console.log(`[OPPORTUNITY-FEED-CREATE] Final result: ${successCount} created, ${existingCount} already exist, ${errors.length} errors`);

    return NextResponse.json({
      success: true,
      created: successCount,
      alreadyExists: existingCount,
      errors: errors.length,
      opportunities: created,
      errorDetails: errors.length > 0 ? errors : undefined,
      message: successCount === 0 && errors.length > 0
        ? `All prospects failed processing. Check Vercel logs for details.`
        : successCount > 0
        ? `Successfully created ${successCount} opportunities`
        : "No new opportunities created"
    });
  } catch (error) {
    console.error("[OPPORTUNITY-FEED-CREATE] Server error:", error);
    return NextResponse.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}
