/**
 * B2B Standing Order Conversion Emails
 *
 * Psychologically optimized emails that:
 * - Recap what was discussed (familiarity)
 * - Pre-frame the standing order as solution
 * - Include single clear CTA
 * - Reference social proof (other clients)
 * - Make next step frictionless
 */

interface StandingOrderEmailContext {
  businessName: string;
  contactName?: string;
  category: string;
  city: string;
  frequency?: string; // weekly, biweekly, daily
  estimatedJobs?: number;
  companyName?: string;
  prospectBriefUrl?: string;
}

/**
 * STAGE 1: Post-Brief Confirmation Email
 * Sent after prospect opens brief + shows engagement
 * Goal: Recap conversation, establish certainty, move to standing order
 */
const POST_BRIEF_TEMPLATES = [
  (ctx: StandingOrderEmailContext) => ({
    subject: `${ctx.businessName} — standing order ready to confirm`,
    body: `Hi ${ctx.contactName || "there"},

We've put together your standing order for same-day logistics across ${ctx.city}. You'll have a confirmed driver in 15 minutes, every time. Fixed price, no surprises.

All you need to do: confirm the pickup and delivery postcodes, and your preferred day/time. That's it.

${ctx.prospectBriefUrl || "[BRIEF_URL]"}

Talk soon.`,
  }),

  (ctx: StandingOrderEmailContext) => ({
    subject: `${ctx.businessName}: confirm your weekly logistics`,
    body: `Hi ${ctx.contactName || "there"},

We've reviewed everything, and we're ready to get started.

Your standing order is set up: ${ctx.frequency || "weekly"} pickups, same-day delivery, driver confirmed in minutes. Just confirm your postcodes and preferred time, and we activate it immediately.

${ctx.prospectBriefUrl || "[BRIEF_URL]"}

Let me know if you have any questions.`,
  }),

  (ctx: StandingOrderEmailContext) => ({
    subject: `Standing order confirmed for ${ctx.businessName}`,
    body: `Hi ${ctx.contactName || "there"},

You're all set for same-day logistics with us.

We've prepared your standing order. Confirm your pickup postcode, delivery postcode, and preferred day/time—and we'll start immediately.

${ctx.prospectBriefUrl || "[BRIEF_URL]"}

Questions? Just reply.`,
  }),
];

/**
 * STAGE 2: Missing Info Reminder Email
 * Sent if prospect doesn't complete standing order within 2 days
 * Goal: Remove friction, emphasize simplicity, re-engage
 */
const MISSING_INFO_TEMPLATES = [
  (ctx: StandingOrderEmailContext) => ({
    subject: `Quick one — need 2 things from you`,
    body: `Hi ${ctx.contactName || "there"},

Just need your pickup and delivery postcodes to get your standing order live.

Once you confirm those + your preferred time, we're ready to go. Driver confirmed in 15 minutes, every time.

${ctx.prospectBriefUrl || "[BRIEF_URL]"}

Quickest way: fill it out on the page above, or just reply with the postcodes.`,
  }),

  (ctx: StandingOrderEmailContext) => ({
    subject: `${ctx.businessName} — postcodes needed`,
    body: `We're ready to start your standing order—just waiting for your postcodes and preferred time.

Once we have those, your driver is confirmed in 15 minutes, every ${ctx.frequency || "week"}.

${ctx.prospectBriefUrl || "[BRIEF_URL]"}

Send them back whenever you can.`,
  }),
];

/**
 * STAGE 3: Confidence Reinforcement Email
 * Sent if prospect views brief but hesitates
 * Goal: Build confidence with social proof, answer implicit objections
 */
const CONFIDENCE_TEMPLATES = [
  (ctx: StandingOrderEmailContext) => ({
    subject: `Why ${ctx.category} in ${ctx.city} choose us`,
    body: `Hi ${ctx.contactName || "there"},

A few things about how this works:

1. Fixed price — you know the cost upfront. No surprises.
2. Driver confirmed — 15-minute confirmation every time. No "he might not show."
3. Same-day — pickup to delivery, same day. Every time.

We've done this ${ctx.estimatedJobs || "hundreds of times"} for businesses like yours. It just works.

Ready to confirm your standing order?

${ctx.prospectBriefUrl || "[BRIEF_URL]"}`,
  }),

  (ctx: StandingOrderEmailContext) => ({
    subject: `How we guarantee your delivery`,
    body: `Hi ${ctx.contactName || "there"},

Thought you'd want to know exactly what you're getting:

- Fixed price upfront (no hidden fees)
- Confirmed driver assigned in 15 minutes
- Tracking in real time
- Same-day delivery, always

This is how we work with every client. Predictable. Simple.

Your standing order is ready. Just add your postcodes and time:

${ctx.prospectBriefUrl || "[BRIEF_URL]"}`,
  }),
];

/**
 * STAGE 4: Order Confirmation Email
 * Sent once standing order is created
 * Goal: Celebrate the win, set expectations, establish next interaction
 */
const CONFIRMATION_TEMPLATES = [
  (ctx: StandingOrderEmailContext) => ({
    subject: `${ctx.businessName} — standing order confirmed`,
    body: `Hi ${ctx.contactName || "there"},

Your standing order is live.

Here's what happens next:

Every ${ctx.frequency || "week"} on your preferred day, we'll contact your pickup location 30 minutes before arrival. Driver confirmed in 15 minutes, delivery same-day.

You'll get real-time tracking + proof of delivery every time.

Questions? Reply to this email or call. We're here to make this simple.

Looking forward to working with you.`,
  }),

  (ctx: StandingOrderEmailContext) => ({
    subject: `You're all set, ${ctx.businessName}`,
    body: `Perfect. Your standing order is confirmed.

Starting ${ctx.frequency || "next week"}, we'll handle your logistics. Driver in 15 minutes, delivery same-day, same process every time.

You'll see a job confirmation and tracking link before each pickup.

Any questions before we start? Just let me know.`,
  }),
];

/**
 * Select email template based on context and stage
 */
export function generateStandingOrderEmail(
  ctx: StandingOrderEmailContext,
  stage: "post-brief" | "missing-info" | "confidence" | "confirmation"
): { subject: string; body: string } {
  const templates = {
    "post-brief": POST_BRIEF_TEMPLATES,
    "missing-info": MISSING_INFO_TEMPLATES,
    confidence: CONFIDENCE_TEMPLATES,
    confirmation: CONFIRMATION_TEMPLATES,
  };

  const stageTemplates = templates[stage];
  const hash = (ctx.businessName || "").charCodeAt(0) || 0;
  const idx = hash % stageTemplates.length;

  return stageTemplates[idx](ctx);
}

/**
 * Format email for sending via email service
 */
export function formatB2BEmail(
  context: StandingOrderEmailContext,
  stage: "post-brief" | "missing-info" | "confidence" | "confirmation"
): {
  subject: string;
  body: string;
  plaintext: string;
} {
  const { subject, body } = generateStandingOrderEmail(context, stage);

  const htmlBody = body
    .split("\n")
    .map((line) => (line.trim() ? `<p>${line}</p>` : "<br>"))
    .join("");

  return {
    subject,
    body: htmlBody,
    plaintext: body,
  };
}
