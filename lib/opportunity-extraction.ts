import Anthropic from "@anthropic-ai/sdk";

interface ExtractionResult {
  need: string;
  urgency: "High" | "Medium" | "Low";
  context: string;
  quote: string;
}

export async function extractOpportunityData(
  companyName: string,
  originalWording: string
): Promise<ExtractionResult> {
  const client = new Anthropic();

  const prompt = `You are extracting business opportunity data from a public statement.

Company: ${companyName}

Original Statement:
"${originalWording}"

Extract ONLY these four fields. Do not invent. Do not assume. Extract only what is explicitly stated.

1. NEED - What did they say they need? (courier, delivery, logistics, transport, driver, etc.)
2. URGENCY - How urgent is it? Rate as High, Medium, or Low based on language indicators (words like "urgent", "immediately", "ASAP", "problem", "struggling", "issue" = High; words like "looking for", "exploring", "considering" = Medium; general statements = Low)
3. CONTEXT - What industry/situation? (e.g., "Legal practice in Manchester", "Healthcare clinic", "E-commerce business")
4. QUOTE - Select 1-2 exact sentences from their statement that best capture the need.

Respond in JSON only:
{
  "need": "...",
  "urgency": "High|Medium|Low",
  "context": "...",
  "quote": "..."
}`;

  const response = await client.messages.create({
    model: "claude-opus-4-1-20250805",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in extraction response");
  }

  const extracted = JSON.parse(jsonMatch[0]) as ExtractionResult;

  // Validate extracted data
  if (!extracted.need || !extracted.urgency || !extracted.context || !extracted.quote) {
    throw new Error("Incomplete extraction - missing required fields");
  }

  return extracted;
}
