import Anthropic from "@anthropic-ai/sdk";

interface BriefInput {
  companyName: string;
  extractedNeed: string;
  extractedContext: string;
  extractedQuote: string;
  extractedUrgency: string;
}

export async function generateCourierReadinessBrief(
  input: BriefInput
): Promise<string> {
  const client = new Anthropic();

  const prompt = `You are generating a Courier Readiness Brief for a prospect business.

Company: ${input.companyName}
Their Need: ${input.extractedNeed}
Their Context: ${input.extractedContext}
Their Exact Words: "${input.extractedQuote}"
Urgency Level: ${input.extractedUrgency}

Your task: Create a one-page brief (HTML) that shows we listened and understand their specific situation.

The brief should contain:
1. Header with company name and date
2. "WE NOTICED YOU'RE LOOKING FOR:" followed by their exact quote
3. "WHAT THAT MEANS:" one sentence showing you understood their situation
4. "THE OPERATIONAL APPROACH WE'D RECOMMEND:" 5 specific bullet points about how we'd handle their specific need type
5. "WHY THIS MATTERS:" 2-3 sentences about business impact
6. Contact footer with email: james@saintandstory.co.uk

Important:
- Never mention Saint & Story features or benefits
- Never use marketing language
- Never include a CTA button
- Focus on operational understanding and their need
- Be specific to their industry/context (not generic)
- Keep it clean and professional

Generate the response as complete, valid HTML that is ready to render. Include minimal CSS for clean, premium styling using a single color (use #1f2937 for text, #f9fafb for background).

Start with <!DOCTYPE html> and end with </html>`;

  const response = await client.messages.create({
    model: "claude-opus-4-1-20250805",
    max_tokens: 2000,
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

  // Extract HTML from response
  const htmlMatch = content.text.match(/<!DOCTYPE html[\s\S]*<\/html>/i);
  if (!htmlMatch) {
    throw new Error("No valid HTML found in brief response");
  }

  return htmlMatch[0];
}

export function generateBriefDownloadUrl(briefHtml: string, companyName: string): string {
  // This creates a data URL for the brief that can be opened/downloaded
  const encoded = encodeURIComponent(briefHtml);
  return `data:text/html;charset=utf-8,${encoded}`;
}
