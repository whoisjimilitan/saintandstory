/**
 * Brief Enrichment System
 * Psychology-driven prospect brief generation using signal-based intelligence
 *
 * Grounded in Clayton Makepeace, Glenn Livingston, Gary Bencivenga, Dan Kennedy,
 * and Victor Schwab's frameworks on human psychology and motivation.
 *
 * This layer enriches prospect briefs with human-centered psychology while maintaining
 * professional, consulting-focused tone. No UI changes—intelligence layer only.
 *
 * Core Principle: People don't buy products. They buy transformation of self-esteem.
 *
 * Four Esteem Categories (Glenn Livingston):
 * I.   Self-Actualization & Healthy Narcissism (accomplishment, control, success, pride)
 * II.  Interpersonal Love & Romance (acceptance, belonging, being valued)
 * III. Nurturant & Parental Esteem (responsibility, reliability, making impact)
 * IV.  Altruism & Societal Esteem (legacy, contributing to society)
 *
 * Categories I & III drive business decision-making (control + responsibility).
 */

import { Lead } from "./b2b-types";

/**
 * Esteem Drivers mapped to business signals
 */
const ESTEEM_DRIVERS = {
  // Category I: Self-Actualization (business owner perspective)
  CONTROL: "being in control of operations and destiny",
  ACCOMPLISHMENT: "achieving measurable business results",
  PRIDE: "feeling pride in how business operates and serves customers",
  SUCCESS: "financial success and business growth",
  FREEDOM: "freedom from operational constraints and firefighting",

  // Category III: Nurturant (responsibility to team/customers)
  RELIABILITY: "being reliable and dependable to customers and team",
  RESPONSIBILITY: "taking care of team and customer expectations",
  IMPACT: "making meaningful impact on customers' success",
  TRUSTWORTHINESS: "being worthy of trust and respect",
};

/**
 * Emotional drivers from Makepeace (fears/frustrations that motivate action)
 */
const EMOTIONAL_DRIVERS = {
  FEARS: {
    FAILURE: "Fear of failure (looking bad to customers, losing business)",
    INADEQUACY: "Feeling inadequate (not living up to potential)",
    LOSS: "Fear of loss (market share, customers, reputation)",
    FALLING_BEHIND: "Fear of falling behind competitors",
  },
  FRUSTRATIONS: {
    POWERLESS: "Feeling powerless or trapped by operational constraints",
    UNAPPRECIATED: "Feeling unappreciated by customers due to service gaps",
    INADEQUATE_SUPPORT: "Frustrated by inadequate operational support",
    TIME_WASTED: "Frustrated with time wasted on preventable problems",
  },
  DESIRES: {
    CONTROL: "To feel in control of operations",
    SUCCESSFUL: "To feel successful in business",
    RESPECTED: "To be respected by customers and market",
    ALIVE: "To feel alive and excited about business growth",
    FULFILLED: "To feel professionally fulfilled",
  },
};

/**
 * Signal context from lead data
 */
interface SignalContext {
  painPoint: string | null;
  reviewRating: number | null;
  industryCategory: string | null;
  city: string | null;
}

/**
 * Enriched brief output
 */
interface EnrichedBrief {
  headline: string;
  currentReality: string;
  operationalInsight: string;
  psychologyPrimedSuggestion: string;
  callToAction: string;
  appliedPsychology: string[];
}

/**
 * Extract signal context from lead
 */
function extractSignalContext(lead: Lead): SignalContext {
  return {
    painPoint: lead.pain_point || null,
    reviewRating: lead.review_rating || null,
    industryCategory: lead.business_category || null,
    city: lead.city || null,
  };
}

/**
 * HEADLINE: Attention-grabbing using opportunity + accomplishment
 *
 * Psychology: Appeal to Category I (self-actualization—control, accomplishment, success)
 * Frameworks: Victor Schwab (pride of accomplishment), Livingston (self-actualization)
 * Copywriting: Lead with benefit (growth), not feature (delivery service)
 */
function generateHeadline(context: SignalContext): { text: string; psychology: string[] } {
  const psychology: string[] = [];

  // When there's a pain point, frame as opportunity to fix it and feel accomplished
  if (context.painPoint) {
    psychology.push(ESTEEM_DRIVERS.ACCOMPLISHMENT);
    psychology.push(EMOTIONAL_DRIVERS.DESIRES.CONTROL);

    return {
      text: `Your ${context.industryCategory} can eliminate ${context.painPoint}—and take control back.`,
      psychology,
    };
  }

  // Clean business: frame as growth opportunity
  psychology.push(ESTEEM_DRIVERS.SUCCESS);
  psychology.push(EMOTIONAL_DRIVERS.DESIRES.ALIVE);

  return {
    text: `Your ${context.industryCategory} is positioned for growth. Here's how to make it happen.`,
    psychology,
  };
}

/**
 * CURRENT REALITY: Summarize business state using signals
 *
 * Psychology: Build credibility (authority), acknowledge their perspective (empathy)
 * Frameworks: Bencivenga (recognition of situation), Makepeace (naming frustrations)
 * Copywriting: Show you understand them first, before offering solution
 */
function summarizeCurrentReality(context: SignalContext): { text: string; psychology: string[] } {
  const psychology: string[] = [];
  const parts: string[] = [];

  if (context.reviewRating) {
    if (context.reviewRating >= 4) {
      parts.push(`Your customers trust you—they rate you highly (${context.reviewRating} stars).`);
      psychology.push(ESTEEM_DRIVERS.TRUSTWORTHINESS);
    } else if (context.reviewRating === 3) {
      parts.push(`Your customers provide consistent feedback (${context.reviewRating} stars).`);
      psychology.push(EMOTIONAL_DRIVERS.FRUSTRATIONS.UNAPPRECIATED);
    } else {
      parts.push(`Your customers have flagged specific challenges (${context.reviewRating} stars).`);
      psychology.push(EMOTIONAL_DRIVERS.FEARS.FAILURE);
    }
  } else {
    parts.push(`Your ${context.industryCategory} is focused on service excellence.`);
  }

  if (context.painPoint) {
    parts.push(`They've specifically mentioned: ${context.painPoint}.`);
    psychology.push(EMOTIONAL_DRIVERS.FRUSTRATIONS.POWERLESS);
  } else {
    parts.push(`Your operations run smoothly—no friction signals detected.`);
  }

  return {
    text: parts.join(" "),
    psychology,
  };
}

/**
 * OPERATIONAL INSIGHT: Explain opportunity using "When" (not "If")
 *
 * Psychology: Confidence-building (when vs if = certainty), opportunity framing
 * Frameworks: Kennedy (when vs if—assume confidence), Livingston (accomplishment)
 * Copywriting: Position as certainty, not possibility. Frame as unlock, not fix.
 */
function explainOperationalInsight(context: SignalContext): { text: string; psychology: string[] } {
  const psychology: string[] = [];

  if (context.painPoint && context.reviewRating && context.reviewRating <= 3) {
    // Pain + negative reviews = immediate urgency
    psychology.push(EMOTIONAL_DRIVERS.DESIRES.CONTROL);
    psychology.push(ESTEEM_DRIVERS.PRIDE);

    return {
      text: `When you address ${context.painPoint}, your customers will feel the difference immediately. That improvement directly translates to pride in your operation and respect from your market.`,
      psychology,
    };
  }

  if (context.painPoint) {
    // Pain without customer complaint = hidden opportunity
    psychology.push(EMOTIONAL_DRIVERS.DESIRES.SUCCESSFUL);
    psychology.push(ESTEEM_DRIVERS.FREEDOM);

    return {
      text: `Your team knows about ${context.painPoint}. When you systematically address it, you free your team from reactive firefighting and unlock capacity for the growth you've been planning.`,
      psychology,
    };
  }

  // No pain = emphasize leverage and compound growth
  psychology.push(ESTEEM_DRIVERS.ACCOMPLISHMENT);
  psychology.push(EMOTIONAL_DRIVERS.DESIRES.FULFILLED);

  return {
    text: `With your operations already running clean, you're positioned differently than your competitors. When you optimize for scale, your customers experience reliability they've come to expect—and you experience the growth you deserve.`,
    psychology,
  };
}

/**
 * PSYCHOLOGY-PRIMED SUGGESTION: Solution with natural action trigger
 *
 * Psychology: Reciprocity (mutual benefit), authority (specialists), responsibility (caring for customers/team)
 * Frameworks: Kennedy (affinity—who vs what), Livingston (Category III—nurturant responsibility)
 * Copywriting: Emphasize partnership, mutual success, proven expertise
 */
function generatePsychologyPrimedSuggestion(context: SignalContext): { text: string; psychology: string[] } {
  const psychology: string[] = [];
  psychology.push(ESTEEM_DRIVERS.RESPONSIBILITY); // Taking care of customers/team
  psychology.push(ESTEEM_DRIVERS.IMPACT); // Making meaningful impact

  return {
    text: `When you work with specialists who've solved this exact challenge for businesses like yours in ${context.city || "your market"}, the impact compounds. Your customers get the reliability they need. Your team gets systems that work. Your business gets the reputation and growth that comes from consistency.`,
    psychology,
  };
}

/**
 * CALL TO ACTION: Clear next step, low friction, confidence-building
 *
 * Psychology: Clarity (removes doubt), ease (low commitment), confidence (we know what we're talking about)
 * Frameworks: Schwab (clarity, ease of action), Livingston (simplicity)
 * Copywriting: One simple step. No pressure. Just conversation.
 */
function generateCallToAction(): { text: string; psychology: string[] } {
  const psychology = [
    ESTEEM_DRIVERS.CONTROL, // They stay in control
    EMOTIONAL_DRIVERS.DESIRES.ALIVE, // It's exciting to explore
  ];

  return {
    text: `Let's have a straightforward 20-minute conversation. We'll identify where your biggest operational opportunity actually lives and what making it happen looks like for your business. No pitch. No pressure. Just clarity.`,
    psychology,
  };
}

/**
 * Generate enriched brief grounded in psychology frameworks
 *
 * Structure:
 * 1. Headline — Appeal to accomplishment + success
 * 2. Current Reality — Build credibility by showing you understand them
 * 3. Operational Insight — Frame opportunity with "when" confidence
 * 4. Psychology-Primed Suggestion — Mutual benefit, proven expertise, responsibility
 * 5. Call to Action — Clear, low-friction, confidence-building
 *
 * No UI changes. Pure intelligence-layer enrichment.
 */
export function generateEnrichedBrief(lead: Lead): EnrichedBrief {
  const context = extractSignalContext(lead);

  const headlineData = generateHeadline(context);
  const realityData = summarizeCurrentReality(context);
  const insightData = explainOperationalInsight(context);
  const suggestionData = generatePsychologyPrimedSuggestion(context);
  const ctaData = generateCallToAction();

  // Collect all applied psychology frameworks
  const appliedPsychology = Array.from(new Set([
    ...headlineData.psychology,
    ...realityData.psychology,
    ...insightData.psychology,
    ...suggestionData.psychology,
    ...ctaData.psychology,
  ]));

  return {
    headline: headlineData.text,
    currentReality: realityData.text,
    operationalInsight: insightData.text,
    psychologyPrimedSuggestion: suggestionData.text,
    callToAction: ctaData.text,
    appliedPsychology,
  };
}

/**
 * Audit logging: Which psychology frameworks were applied to each lead
 * Ensures deterministic, repeatable enrichment for testing and verification
 */
export function logBriefEnrichment(leadId: string, brief: EnrichedBrief): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[BRIEF-ENRICHMENT] Lead ${leadId}:`);
    console.log(`  Headline: ${brief.headline.substring(0, 60)}...`);
    console.log(`  Applied Psychology Frameworks:`);
    brief.appliedPsychology.forEach(p => console.log(`    • ${p}`));
    console.log(`  CTA: ${brief.callToAction.substring(0, 60)}...`);
  }
}
