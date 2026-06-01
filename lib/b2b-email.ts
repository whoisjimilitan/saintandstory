import { getWeeklyJobCount } from "./b2b-stats";

interface EmailContext {
  businessName: string;
  category: string;
  city: string;
  painPoint?: string | null;
  landingPageUrl: string;
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
  const hasPainPoint = !!ctx.painPoint;
  const templates = hasPainPoint ? PAIN_TEMPLATES : COLD_TEMPLATES;
  const idx = hashString(ctx.businessName) % templates.length;

  // Try Gemini first
  const aiBody = await generateWithGemini(ctx, jobs, hasPainPoint);
  const body = aiBody ?? templates[idx](ctx, jobs);

  const subjectVariants = hasPainPoint
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
