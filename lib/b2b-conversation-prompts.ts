/**
 * B2B Operator Conversation Prompts
 *
 * Psychology-based conversation guidance for operators.
 * Based on: Cialdini (persuasion), Kennedy (copywriting), Makepeace (pain/desire framework)
 *
 * Rules:
 * - Start consultative, not salesy
 * - Lead with their situation/pain
 * - Ask questions that surface value
 * - Suggest, don't push
 * - Social proof > features
 */

interface ConversationContext {
  businessName: string;
  category: string;
  painPoint?: string | null;
  hasEngaged?: boolean; // read brief?
  hasPartialOrder?: boolean; // started but didn't finish?
}

/**
 * Opening prompts - Start of conversation
 * Goal: Build rapport, establish why you're calling, reference their situation
 */
export const OPENING_PROMPTS = {
  cold: {
    withPain: (ctx: ConversationContext) => `Hi [name], this is [your name] from Saint & Story. I noticed [company] handles ${ctx.category}—and I saw a review mentioning a delivery issue. We actually solve that for businesses like yours. Got 60 seconds?`,
    withoutPain: (ctx: ConversationContext) => `Hi [name], this is [your name] from Saint & Story. We handle same-day logistics for ${ctx.category} across the area. I wondered if that's something [company] uses?`,
  },
  warm: {
    engagedBrief: (ctx: ConversationContext) => `Hi [name], it's [your name] from Saint & Story—just following up on the brief you looked at. Did you get a chance to review it?`,
    partialOrder: (ctx: ConversationContext) => `Hi [name], it's [your name] from Saint & Story. I noticed you started filling out your standing order—anything I can clarify to make it easier?`,
  },
};

/**
 * Discovery questions - Uncover pain, frequency, decision criteria
 * Psychology: Ask questions that get them thinking about the problem
 */
export const DISCOVERY_QUESTIONS = [
  {
    label: "Frequency trigger",
    prompt: "How often do you handle pickups or deliveries like this? Is it regular, or does it vary?",
    listens_for: ["daily", "weekly", "biweekly", "multiple times", "unpredictable", "growing"],
    follow_up: "That's helpful. With [frequency], having a reliable partner makes a big difference.",
  },
  {
    label: "Current pain",
    prompt: "What's your biggest headache with logistics right now?",
    listens_for: ["timing", "reliability", "cost", "communication", "coordination", "standby"],
    follow_up: "[Pain point] is what we solve for businesses in your space.",
  },
  {
    label: "Decision timeline",
    prompt: "If the right solution came along, when would you want to get started?",
    listens_for: ["immediately", "next week", "next month", "ASAP", "trial basis"],
    follow_up: "Great, we can be live by [timeline].",
  },
  {
    label: "Decision maker confirmation",
    prompt: "Are you the person who makes this decision, or is there someone else I should involve?",
    listens_for: ["yes", "me and my manager", "owner", "no", "check with"],
    follow_up: "Perfect—let's get this set up and then loop in [stakeholder] if needed.",
  },
];

/**
 * Objection handlers - Specific responses to common concerns
 * Psychology: Acknowledge objection, reframe, offer social proof
 */
export const OBJECTION_HANDLERS: Record<string, { acknowledge: string; reframe: string; proof: string }> = {
  cost: {
    acknowledge: "Yeah, price matters—I get it.",
    reframe: "The difference is, you know the cost upfront. No surprises. And you only pay when we move something.",
    proof: "Most clients find it actually saves money because they're not scrambling with backup options.",
  },
  reliability: {
    acknowledge: "Fair question—reliability is everything.",
    reframe: "We confirm your driver in 15 minutes. If something goes wrong, we make it right immediately. That's our guarantee.",
    proof: "We've handled [number] jobs for [industry] in [city]—that track record speaks for itself.",
  },
  commitment: {
    acknowledge: "You don't want to get locked into something you're not sure about.",
    reframe: "It's a standing order, but it's flexible. If you need to pause or change it, we make that simple.",
    proof: "Other clients start with [frequency] and adjust based on what works. No penalty.",
  },
  trust: {
    acknowledge: "You've had bad experiences before, I'm sure.",
    reframe: "I can't change the past, but I can show you how we work: confirmed driver, real-time tracking, proof of delivery every time.",
    proof: "Check out reviews from [industry] businesses—they've seen it work.",
  },
  timing: {
    acknowledge: "It's not urgent right now, I understand.",
    reframe: "That makes sense. But having this in place before you need it means you're never scrambling.",
    proof: "Most clients say they wished they'd set this up sooner.",
  },
};

/**
 * Closing prompts - Move toward confirmation
 * Psychology: Reduce friction, offer easy next step, create small commitment
 */
export const CLOSING_PROMPTS = [
  {
    situation: "prospect_engaged_hesitant",
    prompt: "So if I can get your driver in 15 minutes and same-day delivery, that solves the [pain point]?",
    intent: "Confirm value",
  },
  {
    situation: "prospect_ready_but_incomplete",
    prompt: "Perfect. Let's get your postcodes and preferred time locked in. That way you're live as soon as you need us.",
    intent: "Remove friction, complete order",
  },
  {
    situation: "prospect_needs_approval",
    prompt: "How about this: let me send you the details so you can show [stakeholder], and I'll check back tomorrow?",
    intent: "Create follow-up, empower them",
  },
  {
    situation: "prospect_objecting",
    prompt: "What if we started with [frequency] as a trial? No long-term commitment. Then you see if it works for you.",
    intent: "Lower stakes, build trust",
  },
];

/**
 * Inline operator guidance for B2B Pipeline
 * Shows operator what to say/do at each stage
 */
export const STAGE_GUIDANCE = {
  new: {
    title: "First Contact",
    guidance: "Lead with their pain point or situation. Ask a discovery question. Goal: Get them talking.",
    example: OPENING_PROMPTS.cold.withPain({ businessName: "[Company]", category: "[Industry]" }),
  },
  engaged: {
    title: "Building Confidence",
    guidance: "They're interested. Ask about their specific situation. Reference how you solve it. Suggest next step.",
    example: "So [frequency]—that's perfect for a standing order. Let me walk you through how it works...",
  },
  ready_for_order: {
    title: "Closing",
    guidance: "They're ready. Remove friction. Get the operational details (postcodes, time). Make it easy to say yes.",
    example: "Great. Just need two things: your pickup and delivery postcodes, and when you'd prefer pickup. Then we activate.",
  },
  objecting: {
    title: "Handling Concern",
    guidance: "Acknowledge their concern is valid. Reframe the benefit. Offer proof. Then suggest next step.",
    example: OBJECTION_HANDLERS.cost.acknowledge + " " + OBJECTION_HANDLERS.cost.reframe,
  },
};

/**
 * Get prompt for current conversation stage
 */
export function getOperatorGuidance(stage: keyof typeof STAGE_GUIDANCE) {
  return STAGE_GUIDANCE[stage];
}

/**
 * Get personalized opening based on context
 */
export function getOpeningPrompt(ctx: ConversationContext): string {
  if (ctx.hasEngaged) {
    return ctx.hasPartialOrder
      ? OPENING_PROMPTS.warm.partialOrder(ctx)
      : OPENING_PROMPTS.warm.engagedBrief(ctx);
  }

  return ctx.painPoint
    ? OPENING_PROMPTS.cold.withPain(ctx)
    : OPENING_PROMPTS.cold.withoutPain(ctx);
}

/**
 * Get objection handler
 */
export function handleObjection(objectionType: keyof typeof OBJECTION_HANDLERS): typeof OBJECTION_HANDLERS[keyof typeof OBJECTION_HANDLERS] {
  return OBJECTION_HANDLERS[objectionType] || OBJECTION_HANDLERS.trust;
}
