import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { extractProblemTypeFromConfession, getProblemType } from "@/lib/problems-map";
import { inferProblemFromConfession } from "@/lib/confession-inferencer";
import { analyzePsychology, calculateConfidence, determineRoute } from "@/lib/psychology-analyzer";
import { generateBrief, generateEmailBody } from "@/lib/brief-generator";
import { extractContactInfo, getContactCompleteness, filterLegitimateConfession } from "@/lib/confession-scraper";

export const dynamic = "force-dynamic";

interface ProcessRequest {
  confession_text: string;
  company_name?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_linkedin?: string;
  source_platform: "reddit" | "twitter" | "linkedin" | "google_alerts" | "facebook" | "youtube" | "trustpilot" | "quora" | "news";
  source_url?: string;
  location?: string;
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    console.log("[OPERATOR] Unauthorized: no user");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log(`[OPERATOR] Processing confession`);

  try {
    const body = (await request.json()) as ProcessRequest;

    // Validate input
    if (!body.confession_text || !body.source_platform) {
      console.log("[OPERATOR] Missing required fields");
      return NextResponse.json(
        { error: "Missing confession_text or source_platform" },
        { status: 400 }
      );
    }

    // STEP 1: Filter for legitimacy
    const legitimacy = filterLegitimateConfession(body.confession_text);
    if (!legitimacy.is_legitimate && legitimacy.confidence > 0.8) {
      console.log(`[OPERATOR] Rejected: ${legitimacy.reason}`);
      return NextResponse.json(
        { error: "Not a genuine confession", reason: legitimacy.reason },
        { status: 400 }
      );
    }

    // STEP 2: Extract problem type (keyword matching)
    let problemType = extractProblemTypeFromConfession(body.confession_text);
    let inferenceUsed = false;

    // If keyword matching fails, use intelligent inference
    if (!problemType) {
      console.log("[OPERATOR] Keyword matching failed, attempting intelligent inference...");
      const inference = await inferProblemFromConfession(body.confession_text);

      if (inference.inferred_problem_type && inference.confidence >= 0.6) {
        problemType = inference.inferred_problem_type;
        inferenceUsed = true;
        console.log(`[OPERATOR] Inference successful: ${problemType} (confidence: ${inference.confidence})`);
      } else {
        console.log("[OPERATOR] Could not infer problem type with confidence");
        return NextResponse.json(
          { error: "Could not identify problem type (inference confidence too low)",
            inference: inference },
          { status: 400 }
        );
      }
    }

    const problem = getProblemType(problemType);
    if (!problem) {
      console.log("[OPERATOR] Problem type not found in map");
      return NextResponse.json(
        { error: "Problem type not in system" },
        { status: 400 }
      );
    }

    console.log(`[OPERATOR] Extracted problem: ${problemType}`);

    // STEP 3: Analyze psychology
    const psychology = analyzePsychology({
      confession_text: body.confession_text,
      problem_type: problemType,
      company_name: body.company_name,
      location: body.location,
      context: body.contact_email ? `Contact: ${body.contact_email}` : undefined
    });

    if (!psychology) {
      console.log("[OPERATOR] Psychology analysis failed");
      return NextResponse.json(
        { error: "Psychology analysis failed" },
        { status: 500 }
      );
    }

    // STEP 4: Calculate confidence
    const contactCompleteness = getContactCompleteness({
      name: body.contact_name,
      email: body.contact_email,
      phone: body.contact_phone,
      linkedin: body.contact_linkedin,
      company: body.company_name
    });

    // Count keyword matches for brief
    const briefKeywordMatches = problem.psychology_keywords.filter(kw =>
      body.confession_text.toLowerCase().includes(kw.toLowerCase())
    ).length;
    const keywordStrength = Math.min(1, briefKeywordMatches / problem.psychology_keywords.length);

    const confidence = calculateConfidence({
      psychology,
      contact_info_completeness: contactCompleteness,
      keyword_match_strength: keywordStrength
    });

    console.log(`[OPERATOR] Confidence score: ${confidence.toFixed(2)}`);

    // STEP 5: Generate brief
    const brief = generateBrief({
      confession_text: body.confession_text,
      problem_type: problemType,
      contact_name: body.contact_name,
      company_name: body.company_name,
      location: body.location,
      psychology
    });

    if (!brief) {
      console.log("[OPERATOR] Brief generation failed");
      return NextResponse.json(
        { error: "Brief generation failed" },
        { status: 500 }
      );
    }

    // STEP 6: Determine routing
    const route = determineRoute({
      problem_tier: problem.tier,
      confidence
    });

    console.log(`[OPERATOR] Route decision: ${route}`);

    // STEP 7: Save to database
    const opportunity = await prisma.opportunityFeed.create({
      data: {
        companyName: body.company_name || "Unknown",
        contactName: body.contact_name,
        contactEmail: body.contact_email,
        contactPhone: body.contact_phone,
        contactLinkedin: body.contact_linkedin,
        sourcePlatform: body.source_platform,
        sourceUrl: body.source_url,
        postedDate: new Date(),
        originalWording: body.confession_text,
        location: body.location,

        // Extraction
        extractedNeed: problemType,
        extractedUrgency: psychology.urgency_level,
        extractedContext: body.confession_text.substring(0, 500),
        extractedQuote: body.confession_text.substring(0, 200),

        // Problem classification
        problemType,
        psychologyAnalysis: psychology as unknown as Record<string, unknown>,
        prePopulatedReply: problem.pre_populated_reply,

        // Generated brief
        briefHtml: brief.html,
        emailSubject: brief.subject,
        emailBody: generateEmailBody(brief),

        // Routing
        routingTier: problem.tier,
        confidenceScore: confidence,
        approvalStatus: route === "AUTO_SEND" ? "approved" : route === "DISCARD" ? "rejected" : "pending",
        jamesStatus: route === "AUTO_SEND" ? "pending" : undefined,
        rejectionReason: route === "DISCARD" ? "Low confidence" : undefined,

        // Status
        status: route === "DISCARD" ? "rejected" : "discovered"
      }
    });

    console.log(`[OPERATOR] Opportunity created: ${opportunity.id}`);
    console.log(`[OPERATOR] Route: ${route}, Status: ${opportunity.approvalStatus}`);

    return NextResponse.json({
      success: true,
      opportunity_id: opportunity.id,
      problem_type: problemType,
      inference_used: inferenceUsed,
      confidence: confidence,
      route,
      status: opportunity.status,
      approval_status: opportunity.approvalStatus,
      brief_subject: brief.subject,
      pre_populated_reply: problem.pre_populated_reply
    });
  } catch (error) {
    console.error("[OPERATOR] Error processing confession:", error);
    return NextResponse.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}
