import { Anthropic } from "@anthropic-ai/sdk";
import { neon } from "@neondatabase/serverless";

/**
 * AI Prospect Brief 2.0
 *
 * For every prospect, generate AI-powered conversation brief:
 * - Why they likely need the service
 * - What pain points were detected
 * - Suggested first conversation
 * - Likely objections + suggested responses
 * - Probability to convert
 *
 * Used for: Pre-call prep, conversation strategy
 * NOT ACTIVATED: Behind feature flag for testing
 */

export interface ProspectBriefAI {
  prospect_name: string;
  industry: string;
  why_they_need_it: string;
  detected_pain_points: string[];
  suggested_conversation_start: string;
  likely_objections: Array<{
    objection: string;
    suggested_response: string;
  }>;
  probability_to_convert: number;
  confidence_level: "high" | "medium" | "low";
  key_talking_points: string[];
  conversation_time_estimate: string;
}

/**
 * Generate AI prospect brief using Claude
 */
export async function generateProspectBriefAI(
  prospect: {
    business_name: string;
    business_category: string;
    pain_point: string | null;
    pain_point_review: string | null;
    city: string | null;
    engagement_score: number;
    opportunity_score: number;
  }
): Promise<ProspectBriefAI> {
  const client = new Anthropic();

  const prompt = `You are a B2B sales strategist preparing a conversation brief for a salesperson.

Prospect Details:
- Business Name: ${prospect.business_name}
- Industry/Category: ${prospect.business_category}
- Location: ${prospect.city || "Not specified"}
- Detected Pain Point: ${prospect.pain_point || "Not detected"}
- Pain Point Evidence: ${prospect.pain_point_review || "No specific evidence"}
- Engagement Score: ${prospect.engagement_score}/100 (email opens/clicks)
- Business Fit Score: ${prospect.opportunity_score}/100 (qualification match)

Generate a JSON response with the following structure (ONLY valid JSON, no markdown):
{
  "why_they_need_it": "2-3 sentence explanation of why this specific business likely needs the service",
  "detected_pain_points": ["pain point 1", "pain point 2", "pain point 3"],
  "suggested_conversation_start": "Exact opening line the salesperson should use to start the conversation",
  "likely_objections": [
    {
      "objection": "Likely objection or concern they'll raise",
      "suggested_response": "How to address this objection with facts/benefits"
    }
  ],
  "probability_to_convert": 0.0-1.0,
  "confidence_level": "high|medium|low",
  "key_talking_points": ["point 1", "point 2", "point 3"],
  "conversation_time_estimate": "15-30 minutes|30-45 minutes|45-60 minutes"
}

Base the probability_to_convert on engagement_score (0-100) and opportunity_score (0-100).
If either score is below 40, probability should be lower.
If both are above 60, probability should be higher.

Ensure the suggested_conversation_start is personalized, specific, and non-salesy.
Make likely_objections realistic for the industry and pain point.`;

  try {
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    const parsed = JSON.parse(content.text);

    return {
      prospect_name: prospect.business_name,
      industry: prospect.business_category,
      why_they_need_it: parsed.why_they_need_it,
      detected_pain_points: parsed.detected_pain_points,
      suggested_conversation_start: parsed.suggested_conversation_start,
      likely_objections: parsed.likely_objections,
      probability_to_convert: parsed.probability_to_convert,
      confidence_level: parsed.confidence_level,
      key_talking_points: parsed.key_talking_points,
      conversation_time_estimate: parsed.conversation_time_estimate,
    };
  } catch (error) {
    console.error("[PROSPECT-BRIEF-AI] Error generating brief:", error);
    throw error;
  }
}

/**
 * Get or generate AI brief for a lead
 * Caches result for 24 hours
 */
export async function getProspectBriefAI(
  sql: any,
  leadId: string
): Promise<ProspectBriefAI | null> {
  try {
    // Get lead data
    const leads = await sql`
      SELECT
        id, business_name, business_category, pain_point, pain_point_review,
        city, engagement_score, opportunity_score
      FROM b2b_leads
      WHERE id = ${leadId}
      LIMIT 1
    `;

    if (!leads || leads.length === 0) {
      return null;
    }

    const lead = leads[0];

    // Check if cached brief exists and is fresh (less than 24 hours old)
    const cachedBrief = await sql`
      SELECT brief_data, created_at
      FROM b2b_prospect_brief_cache
      WHERE lead_id = ${leadId}
        AND created_at > NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (cachedBrief && cachedBrief.length > 0) {
      return JSON.parse(cachedBrief[0].brief_data as string);
    }

    // Generate new brief
    const brief = await generateProspectBriefAI({
      business_name: lead.business_name,
      business_category: lead.business_category,
      pain_point: lead.pain_point,
      pain_point_review: lead.pain_point_review,
      city: lead.city,
      engagement_score: lead.engagement_score || 0,
      opportunity_score: lead.opportunity_score || 0,
    });

    // Cache the brief
    await sql`
      INSERT INTO b2b_prospect_brief_cache (lead_id, brief_data)
      VALUES (${leadId}, ${JSON.stringify(brief)})
      ON CONFLICT (lead_id) DO UPDATE SET
        brief_data = ${JSON.stringify(brief)},
        created_at = NOW()
    `;

    return brief;
  } catch (error) {
    console.error("[PROSPECT-BRIEF-AI] Error getting brief:", error);
    return null;
  }
}

/**
 * Clear cached briefs for a lead (e.g., when engagement changes)
 */
export async function clearCachedBrief(
  sql: any,
  leadId: string
): Promise<void> {
  try {
    await sql`
      DELETE FROM b2b_prospect_brief_cache
      WHERE lead_id = ${leadId}
    `;
  } catch (error) {
    console.error("[PROSPECT-BRIEF-AI] Error clearing cache:", error);
  }
}
