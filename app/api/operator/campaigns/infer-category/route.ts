import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic();

const CATEGORIES = [
  "Legal",
  "Healthcare",
  "Estate Agents",
  "Accounting",
  "Construction",
  "Hospitality",
  "Retail",
  "Beauty",
  "Veterinary",
  "Dental",
  "Manufacturing",
  "Film/Production",
  "Office Supplies",
  "Architecture",
  "Catering",
  "Property/Lettings",
  "Art/Auction",
  "Other",
];

export async function POST(request: NextRequest) {
  let businessName = "Unknown";

  try {
    const { businessName: bName, description, website } = await request.json();
    businessName = bName;

    if (!businessName) {
      return NextResponse.json(
        { error: "businessName required" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("[INFER-CATEGORY] ANTHROPIC_API_KEY not configured, defaulting to 'Other'");
      return NextResponse.json({
        businessName,
        category: "Other",
        inferred: false,
        reason: "API not configured",
        timestamp: new Date().toISOString(),
      });
    }

    const contextParts = [businessName];
    if (description) contextParts.push(`Description: ${description}`);
    if (website) contextParts.push(`Website: ${website}`);

    const prompt = `Given this business info, infer which category it belongs to from the valid list.

${contextParts.join("\n")}

Valid categories: ${CATEGORIES.join(", ")}

Respond with ONLY the category name, nothing else. Must be one of the valid categories above.`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 50,
      messages: [{ role: "user", content: prompt }],
    });

    let category = (message.content[0] as any).text.trim();

    if (!CATEGORIES.includes(category)) {
      category = "Other";
    }

    return NextResponse.json({
      businessName,
      category,
      inferred: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[INFER-CATEGORY] Error:", error);
    return NextResponse.json({
      businessName,
      category: "Other",
      inferred: false,
      reason: "Inference failed, using default",
      timestamp: new Date().toISOString(),
    });
  }
}
