import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import {
  getFollowUpRecommendation,
  getFollowUpTemplate,
  getLeadsNeedingFollowUp,
} from "@/lib/adaptive-followup";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk",
];

async function isAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  const user = await currentUser();
  return ADMIN_EMAILS.includes(user?.emailAddresses[0]?.emailAddress ?? "");
}

/**
 * GET /api/b2b/intelligence/adaptive-followup?lead_id=X
 * Get follow-up recommendation for a specific lead
 *
 * GET /api/b2b/intelligence/adaptive-followup?candidates=true
 * Get all leads that should receive follow-ups
 *
 * DORMANT: Not automatically called. Data collection only.
 */
export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get("lead_id");
  const getCandidates = searchParams.get("candidates") === "true";

  const sql = neon(process.env.DATABASE_URL!);

  try {
    if (leadId) {
      // Get recommendation for specific lead
      const recommendation = await getFollowUpRecommendation(sql, leadId);

      const response: any = {
        lead_id: leadId,
        recommendation,
      };

      // Include template if follow-up recommended
      if (
        recommendation.should_send_followup &&
        recommendation.followup_type
      ) {
        const template = getFollowUpTemplate(recommendation.followup_type);
        response.template = template;
        response.note =
          "DORMANT: Template shown for preview only. Not activated for auto-send.";
      }

      return NextResponse.json(response);
    } else if (getCandidates) {
      // Get all leads that could use follow-ups
      const candidates = await getLeadsNeedingFollowUp(sql);

      const recommendationsWithTemplates = candidates.map((item) => ({
        lead_id: item.lead_id,
        recommendation: item.recommendation,
        template:
          item.recommendation.followup_type &&
          item.recommendation.should_send_followup
            ? getFollowUpTemplate(item.recommendation.followup_type)
            : null,
      }));

      return NextResponse.json({
        total_candidates: recommendationsWithTemplates.length,
        candidates: recommendationsWithTemplates,
        note: "DORMANT: Data shown for preview. Not activated for auto-send.",
        breakdown: {
          meeting_request: recommendationsWithTemplates.filter(
            (c) => c.recommendation.followup_type === "meeting_request"
          ).length,
          case_study: recommendationsWithTemplates.filter(
            (c) => c.recommendation.followup_type === "case_study"
          ).length,
          educational: recommendationsWithTemplates.filter(
            (c) => c.recommendation.followup_type === "educational"
          ).length,
          subject_test: recommendationsWithTemplates.filter(
            (c) => c.recommendation.followup_type === "subject_test"
          ).length,
        },
      });
    } else {
      return NextResponse.json(
        {
          error: "Specify either lead_id or candidates=true",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[ADAPTIVE-FOLLOWUP API] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to get recommendation",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
