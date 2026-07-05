import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface OpportunityInput {
  businessName: string;
  originalStatement: string;
  opportunityType: "direct_need" | "business_trigger";
  sourcePlatform: string;
  website?: string;
  industry?: string;
}

interface IntelligenceOutput {
  deducedNeed: string;
  recommendedBrief: string;
  whyTheyNeedIt: string;
  emailSubject: string;
  emailBody: string;
  briefTitle: string;
  confidence: "high" | "medium" | "low";
}

const BRIEF_TYPES = [
  "Same-Day Courier",
  "Dedicated Driver",
  "Regular Collections",
  "Medical Logistics",
  "Temperature Controlled",
  "Legal Courier",
  "E-Commerce Fulfillment",
  "Growth Logistics",
  "Warehouse Operations",
  "Long Haul",
];

export async function intelligentlyProcessOpportunity(
  input: OpportunityInput
): Promise<IntelligenceOutput> {
  console.log("[INTELLIGENCE] Processing opportunity:", input.businessName);

  const systemPrompt = `You are the Saint & Story Opportunity Intelligence Engine.
Your job is to deeply understand what a business truly needs based on their public statement.

The business has either:
A. Explicitly said they need courier/logistics help
B. Announced something that creates a logistics need (expansion, new warehouse, hiring logistics staff, etc)

Your task:
1. Deduce their ACTUAL need (not what they said, but what they REALLY need)
2. Choose the best brief type from: ${BRIEF_TYPES.join(", ")}
3. Explain why they need it (personalized)
4. Generate a personalized email using this template:
   "Hi [NAME], A little birdie told me about [SPECIFIC PROBLEM]. I went ahead and made you a [BRIEF TYPE]: [LINK PLACEHOLDER]. [ONE PUNCHY LINE specific to their situation]. Want me to build the full version? If not, keep this one. James"
5. Create a brief title specific to their need

You must respond with JSON only, no other text.`;

  const userPrompt = `Analyze this opportunity:

Business: ${input.businessName}
Industry: ${input.industry || "Unknown"}
Website: ${input.website || "Not provided"}
Source: ${input.sourcePlatform}
Type: ${input.opportunityType}

Their statement:
"${input.originalStatement}"

Respond with this JSON structure (ONLY JSON, no markdown, no explanation):
{
  "deducedNeed": "What they actually need in 1-2 sentences",
  "recommendedBrief": "One of: ${BRIEF_TYPES.join(", ")}",
  "whyTheyNeedIt": "Personalized reason why Saint & Story helps them specifically (2-3 sentences)",
  "emailSubject": "Subject line",
  "emailBody": "Full email body using the template provided",
  "briefTitle": "Custom brief title for their specific situation",
  "confidence": "high|medium|low"
}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-opus-4-1-20250805",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON response
    const parsed = JSON.parse(responseText);

    console.log("[INTELLIGENCE] ✓ Processed:", {
      business: input.businessName,
      brief: parsed.recommendedBrief,
      confidence: parsed.confidence,
    });

    return {
      deducedNeed: parsed.deducedNeed,
      recommendedBrief: parsed.recommendedBrief,
      whyTheyNeedIt: parsed.whyTheyNeedIt,
      emailSubject: parsed.emailSubject,
      emailBody: parsed.emailBody,
      briefTitle: parsed.briefTitle,
      confidence: parsed.confidence,
    };
  } catch (error) {
    console.error("[INTELLIGENCE] Error processing opportunity:", error);
    throw error;
  }
}

export async function generateBriefHTML(
  briefType: string,
  businessName: string,
  deducedNeed: string
): Promise<string> {
  console.log("[INTELLIGENCE] Generating brief for:", businessName);

  const prompt = `Generate a professional, concise Courier Readiness Brief in HTML.

Brief Type: ${briefType}
Business: ${businessName}
Their Need: ${deducedNeed}

Create a one-page HTML brief that:
1. Opens with personalized greeting (Hi [${businessName}] team)
2. Acknowledges their specific situation
3. Shows 3-4 key benefits of their recommended service
4. Includes a simple call-to-action
5. Is professional but friendly
6. Uses Saint & Story branding colors (dark navy #0D0D0D, white #FFFFFF, light gray #F9F9F9)
7. Is readable on mobile and desktop

Return ONLY the HTML code, no explanation.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-opus-4-1-20250805",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const html =
      response.content[0].type === "text" ? response.content[0].text : "";

    console.log("[INTELLIGENCE] ✓ Brief generated for:", businessName);
    return html;
  } catch (error) {
    console.error("[INTELLIGENCE] Error generating brief:", error);
    throw error;
  }
}
