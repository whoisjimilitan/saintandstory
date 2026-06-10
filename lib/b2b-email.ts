import { getWeeklyJobCount } from "./b2b-stats";

interface EmailContext {
  businessName: string;
  category: string;
  city: string;
  painPoint?: string | null;
  painPointImplication?: string | null;  // Relief layer: what it means operationally
  landingPageUrl: string;
}

/**
 * Generate relief layer implication from pain point and business context.
 * Transforms raw pain point into operational burden insight.
 * Example: "delivery delays" → "you end up managing pickups personally"
 */
export function generatePainPointImplication(painPoint: string | null | undefined, category: string | null | undefined): string | null {
  if (!painPoint) return null;

  const lower = painPoint.toLowerCase();

  // Recognition pattern: "[pain] becomes something you manage personally"
  if (lower.includes("delivery") || lower.includes("logistics") || lower.includes("transport")) {
    return "delivery coordination personally when volume grows";
  }

  if (lower.includes("stock") || lower.includes("inventory") || lower.includes("supply")) {
    return "inventory management personally instead of focusing on growth";
  }

  if (lower.includes("deadline") || lower.includes("timing") || lower.includes("schedule")) {
    return "timeline management personally becomes your responsibility";
  }

  if (lower.includes("dispatch") || lower.includes("coordination") || lower.includes("scheduling")) {
    return "operational coordination personally when you should be selling";
  }

  if (lower.includes("collection") || lower.includes("pickup")) {
    return "collection logistics personally when volume increases";
  }

  // Fallback: generic burden framing
  return `${painPoint.toLowerCase()} becomes something you manage personally`;
}

// 10 human-written variants — assigned by business name hash so each lead gets a consistent email style
const COLD_TEMPLATES = [
  (ctx: EmailContext, jobs: number) =>
    `We handle same-day logistics for ${ctx.category} in ${ctx.city} — ${jobs} jobs last week. Fixed price, driver confirmed in 15 minutes. Worth a quick look? ${ctx.landingPageUrl}`,

  (ctx: EmailContext, jobs: number) =>
    `Quick one — we do same-day pickups and deliveries for ${ctx.category} across ${ctx.city}. ${jobs} jobs last week, always fixed price. Might be useful: ${ctx.landingPageUrl}`,

  (ctx: EmailContext, jobs: number) =>
    `We've been handling logistics for ${ctx.category} in ${ctx.city} — ${jobs} runs last week, all fixed price. Thought ${ctx.businessName} might find it useful. ${ctx.landingPageUrl}`,

  (ctx: EmailContext, jobs: number) =>
    `Same-day logistics for ${ctx.category} in ${ctx.city}. ${jobs} jobs last week, driver confirmed in under 15 minutes, fixed price. Is that something ${ctx.businessName} needs? ${ctx.landingPageUrl}`,

  (ctx: EmailContext, jobs: number) =>
    `We run logistics for ${ctx.category} in ${ctx.city} — ${jobs} jobs last week, all fixed price. No contract. Just call when you need it. ${ctx.landingPageUrl}`,
];

const PAIN_TEMPLATES = [
  (ctx: EmailContext, jobs: number) =>
    `We noticed some delivery friction on your Google listing — we handle exactly this for ${ctx.category} in ${ctx.city}. ${jobs} jobs last week, driver in 15 minutes, fixed price. ${ctx.landingPageUrl}`,

  (ctx: EmailContext, jobs: number) =>
    `Saw a review about a delivery issue at ${ctx.businessName} — we solve this for ${ctx.category} in ${ctx.city} every week. ${jobs} jobs last week, fixed price, driver confirmed fast. ${ctx.landingPageUrl}`,

  (ctx: EmailContext, jobs: number) =>
    `We came across some feedback about your deliveries. We handle same-day logistics for ${ctx.category} in ${ctx.city} — ${jobs} jobs last week, fixed price, confirmed in minutes. Worth a quick look: ${ctx.landingPageUrl}`,

  (ctx: EmailContext, jobs: number) =>
    `Noticed a delivery review on your listing — this is exactly what we handle for ${ctx.category} across ${ctx.city}. ${jobs} jobs last week, always fixed price. ${ctx.landingPageUrl}`,

  (ctx: EmailContext, jobs: number) =>
    `Your Google listing mentioned a delivery issue — we do same-day logistics for ${ctx.category} in ${ctx.city}. ${jobs} jobs last week. Driver in 15 minutes, fixed price. ${ctx.landingPageUrl}`,
];

// RELIEF-LAYER TEMPLATES: Recognition + Relief + Trust + Action
// These create understanding (recognition), acknowledge burden (relief), build trust, and invite conversation
const RELIEF_TEMPLATES = [
  (ctx: EmailContext, jobs: number) =>
    `One thing that stood out about ${ctx.businessName}: customers mention ${ctx.painPointImplication || "delivery timing"}. ${
      ctx.painPointImplication
        ? `Businesses like yours often end up managing that personally. `
        : ``
    }We've built our process around removing that pressure. Quick question — is that something you're dealing with? ${ctx.landingPageUrl}`,

  (ctx: EmailContext, jobs: number) =>
    `This might sound familiar: ${ctx.businessName}'s customers value ${ctx.painPointImplication || "reliability"}. And when you grow, that becomes something you coordinate personally. We handle exactly that for ${ctx.category} businesses. Worth exploring? ${ctx.landingPageUrl}`,

  (ctx: EmailContext, jobs: number) =>
    `One thing that stood out from customer reviews at ${ctx.businessName} — they consistently mention ${ctx.painPointImplication || "timing"} as critical. Businesses like yours find that's what ends up on your plate personally. We've solved this for ${jobs}+ deliveries. Quick question — does that resonate? ${ctx.landingPageUrl}`,

  (ctx: EmailContext, jobs: number) =>
    `Customers of ${ctx.businessName} are clear about what matters: ${ctx.painPointImplication || "delivery reliability"}}. The challenge most businesses face: as volume grows, that becomes something you manage personally. We remove that layer. Worth a conversation? ${ctx.landingPageUrl}`,
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

async function generateWithGemini(ctx: EmailContext, jobs: number, hasPainPoint: boolean): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const prompt = hasPainPoint
    ? `Write a 2-sentence cold email to ${ctx.businessName}, a ${ctx.category} business in ${ctx.city}. They recently had a delivery issue based on a Google review. We handle same-day logistics for ${ctx.category} businesses — ${jobs} jobs last week, driver confirmed in 15 minutes, fixed price. Include a link placeholder [LINK]. Sound like a real person, not a salesperson. No greetings, no sign-off, just 2 sentences.`
    : `Write a 2-sentence cold email to ${ctx.businessName}, a ${ctx.category} business in ${ctx.city}. We handle same-day logistics for ${ctx.category} businesses — ${jobs} jobs last week across the UK, driver confirmed in 15 minutes, always fixed price. Include a link placeholder [LINK]. Sound like a real person reaching out, not a template. No greetings, no sign-off, just 2 sentences.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 150 },
        }),
      }
    );
    const data = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (text) return text.replace("[LINK]", ctx.landingPageUrl);
  } catch { /* fall through to template */ }
  return null;
}

export async function generateEmail(
  ctx: EmailContext
): Promise<{ subject: string; body: string }> {
  const jobs = getWeeklyJobCount();
  const hasReliefContext = !!(ctx.painPoint && ctx.painPointImplication);
  const hasPainPoint = !!ctx.painPoint;

  // Prefer relief-layer templates (recognition + relief + trust + action)
  // Fall back to pain templates if no implication
  // Fall back to cold templates if no pain point
  const templates = hasReliefContext
    ? RELIEF_TEMPLATES
    : hasPainPoint
      ? PAIN_TEMPLATES
      : COLD_TEMPLATES;

  const idx = hashString(ctx.businessName) % templates.length;

  // Try Gemini first (if relief context)
  const aiBody = hasReliefContext ? await generateWithGemini(ctx, jobs, true) : null;
  const body = aiBody ?? templates[idx](ctx, jobs);

  const subjectVariants = hasReliefContext
    ? [
        `${ctx.businessName} — one thing stood out`,
        `Quick question for ${ctx.businessName}`,
        `${ctx.businessName} — this might sound familiar`,
        `${ctx.businessName} — we think we can help`,
        `Worth exploring — ${ctx.businessName}`,
      ]
    : hasPainPoint
      ? [
          `${ctx.businessName} — delivery sorted`,
          `Re: ${ctx.businessName} delivery`,
          `Logistics for ${ctx.businessName}`,
          `${ctx.businessName} — quick one`,
          `${ctx.city} logistics for ${ctx.category}`,
        ]
      : [
          `${ctx.businessName} — logistics question`,
          `Same-day logistics · ${ctx.businessName}`,
          `Quick question — ${ctx.businessName}`,
          `${ctx.city} ${ctx.category} logistics`,
          `${ctx.businessName} — worth a look`,
        ];

  const subject = subjectVariants[idx % subjectVariants.length];

  return { subject, body };
}
