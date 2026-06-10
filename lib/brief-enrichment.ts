/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BRIEF ENRICHMENT SYSTEM
 * Persuasive Sales Psychology Machine for Autopilot Lead Qualification
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Mission: Generate self-closing sales briefs that move prospects from curious →
 * understanding → desire → confidence → action, all on their own.
 *
 * Grounded in: Clayton Makepeace, Glenn Livingston, Gary Bencivenga, Dan Kennedy,
 * Victor Schwab on esteem, motivation, emotion, and persuasion.
 *
 * Core Principle: People don't buy products. They buy transformation of self-esteem.
 *
 * Esteem Categories (Glenn Livingston):
 * I.   Self-Actualization & Healthy Narcissism (control, accomplishment, success, pride)
 * II.  Interpersonal Love & Romance (acceptance, belonging, being valued)
 * III. Nurturant & Parental Esteem (responsibility, reliability, making impact on others)
 * IV.  Altruism & Societal Esteem (legacy, contributing to society)
 *
 * Business Owners: Driven primarily by Category I (control + accomplishment) and
 * Category III (responsibility to team/customers). Write to these.
 *
 * Brief Architecture (5 Sections = Complete Sales Journey):
 *
 * 1. HEADLINE — CURIOSITY + ESTEEM HOOK
 *    Goal: Stop the scroll. Make them want to read.
 *    Psychology: Appeal to accomplishment, control, and future success.
 *    Technique: Specificity (name their business type, their opportunity).
 *    Result: "This is about me. I need to read this."
 *
 * 2. CURRENT REALITY — CREDIBILITY + EMPATHY
 *    Goal: Prove you understand their actual situation.
 *    Psychology: Acknowledge what you see (social proof), name what they feel (empathy).
 *    Technique: Use their own signals to show deep understanding.
 *    Result: "They get it. They see me, not a generic category."
 *
 * 3. OPERATIONAL INSIGHT — PERSPECTIVE SHIFT + DESIRE
 *    Goal: Help them see the opportunity they haven't fully grasped.
 *    Psychology: Use "when" (confidence), not "if" (doubt). Frame as unlocking, not fixing.
 *    Technique: Contrast (current state vs. possible state).
 *    Result: "Oh. I can see it now. I want that."
 *
 * 4. PROOF + SUGGESTION — SOCIAL PROOF + PARTNERSHIP
 *    Goal: Build confidence that this is possible and that you're the right partner.
 *    Psychology: Authority (we've done this), reciprocity (mutual success), responsibility (we care about your team/customers).
 *    Technique: Proof through specificity, partnership framing.
 *    Result: "If they've done it for others like me, it'll work for me too. And they actually care."
 *
 * 5. CALL TO ACTION — MOMENTUM + CONTROL
 *    Goal: Make the next step feel obvious and low-friction.
 *    Psychology: They stay in control, it's simple, it feels inevitable.
 *    Technique: Specific action (not vague), clear outcome, removes objection.
 *    Result: "I know exactly what to do. And I want to do it."
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { Lead } from "./b2b-types";

/**
 * Esteem Drivers: What activates a business owner's sense of self.
 * Write to these, and the prospect feels *seen*.
 */
const ESTEEM_DRIVERS = {
  // Category I: Personal Achievement & Control
  // "I'm in charge. I accomplish things. I'm successful."
  CONTROL: "Being in control of their operations and destiny",
  ACCOMPLISHMENT: "Achieving measurable, visible results",
  PRIDE: "Feeling pride in how their business operates and serves",
  SUCCESS: "Financial success and business growth",
  FREEDOM: "Freedom from constraints that prevent growth",

  // Category III: Care & Responsibility
  // "I take care of my team. I'm reliable to my customers. I'm responsible."
  RESPONSIBILITY: "Taking care of their team and meeting customer expectations",
  RELIABILITY: "Being dependable and worthy of trust",
  IMPACT: "Making a meaningful difference for customers and team",
  TRUSTWORTHINESS: "Earning respect through consistent delivery",
};

/**
 * Emotional Triggers: What moves them to action.
 * These are the feelings that drive urgency, desire, and commitment.
 */
const EMOTIONAL_TRIGGERS = {
  // Negative (what they want to escape)
  FEAR_FAILURE: "Fear of failing their customers or market",
  FEAR_FALLING_BEHIND: "Fear competitors are outpacing them",
  FRUSTRATION_POWERLESS: "Frustration at being constrained by operational limits",
  FRUSTRATION_WASTED_TIME: "Frustration that preventable problems waste time and money",

  // Positive (what they want to move toward)
  DESIRE_CONTROL: "Desire to be fully in control of their operations",
  DESIRE_SUCCESS: "Desire to be undeniably successful in their market",
  DESIRE_GROWTH: "Desire for growth that feels inevitable and earned",
  DESIRE_LEGACY: "Desire to build something that reflects well on them",
};

/**
 * Signal Context: Raw data from the lead.
 * These signals are translated into psychology triggers and esteem drivers.
 */
interface SignalContext {
  painPoint: string | null;
  reviewRating: number | null;
  industryCategory: string | null;
  city: string | null;
}

/**
 * Enriched Brief: The complete sales document.
 * Every word drives toward one outcome: "I want to talk to them."
 */
export interface EnrichedBrief {
  headline: string;
  currentReality: string;
  operationalInsight: string;
  proofAndSuggestion: string;
  callToAction: string;
  appliedPsychology: string[];
}

function extractSignalContext(lead: Lead): SignalContext {
  return {
    painPoint: lead.pain_point || null,
    reviewRating: lead.review_rating || null,
    industryCategory: lead.business_category || null,
    city: lead.city || null,
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SECTION 1: HEADLINE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The headline does THREE things simultaneously:
 * 1. Signals this is about THEM (specific to their industry, their situation)
 * 2. Promises a TRANSFORMATION (not a feature, but a change in how they see themselves)
 * 3. Triggers curiosity (makes them want to know more)
 *
 * Copywriting Technique: Specificity = Credibility
 * Generic headline: "We can help your business grow."
 * Specific headline: "Your pharmacy eliminates supplier delays—and regains margin."
 * The second makes them think: "How do they know about OUR specific challenge?"
 *
 * Psychology: Appeal to Category I (control, accomplishment, success).
 * When there's pain: "You can FIX it and CONTROL it again."
 * When clean: "You can SCALE it and SUCCEED faster."
 */
function generateHeadline(context: SignalContext): { text: string; triggers: string[] } {
  const triggers: string[] = [];

  if (context.painPoint) {
    // Pain-point pathway: Position as opportunity to regain control + accomplish fix
    triggers.push(ESTEEM_DRIVERS.CONTROL);
    triggers.push(ESTEEM_DRIVERS.ACCOMPLISHMENT);

    // Specific + transformative: Name the pain (proves we know) + the outcome (proves it works)
    return {
      text: `Your ${context.industryCategory} stops losing time to ${context.painPoint}—and reclaims focus for growth.`,
      triggers,
    };
  }

  // Clean-business pathway: Position as platform for growth + success
  triggers.push(ESTEEM_DRIVERS.SUCCESS);
  triggers.push(ESTEEM_DRIVERS.FREEDOM);

  return {
    text: `Your ${context.industryCategory} is built for scale. Here's how to prove it.`,
    triggers,
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SECTION 2: CURRENT REALITY
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This section PROVES you understand them by reflecting their world back to them.
 * It's not about listing facts—it's about naming what they FEEL.
 *
 * Copywriting Technique: The "You" Principle
 * Instead of: "Many businesses struggle with X."
 * Say: "Your customers rate you highly (4 stars) AND they mention X."
 * This shows: You're doing well AND there's still a gap. Both are true.
 *
 * Psychology: Build credibility (authority = we've studied you), empathy (we see your position),
 * and subtle social proof (your customers validate you).
 *
 * Goal: Prospect reads this and thinks, "They REALLY understand my situation."
 */
function summarizeCurrentReality(context: SignalContext): { text: string; triggers: string[] } {
  const triggers: string[] = [];
  const parts: string[] = [];

  // Read the review signals to understand their customer perception
  if (context.reviewRating) {
    if (context.reviewRating >= 4) {
      // High rating = strength signal. Acknowledge it.
      parts.push(
        `Your customers trust you. They rate you at ${context.reviewRating} stars, which means you've already built a strong foundation.`
      );
      triggers.push(ESTEEM_DRIVERS.TRUSTWORTHINESS);
      triggers.push(EMOTIONAL_TRIGGERS.DESIRE_LEGACY); // They've built something good
    } else if (context.reviewRating === 3) {
      // Middle rating = mixed signal. Name the gap.
      parts.push(
        `Your customers are engaged (${context.reviewRating} stars), but their feedback suggests you're not yet seen as the obvious choice in your market.`
      );
      triggers.push(EMOTIONAL_TRIGGERS.FRUSTRATION_POWERLESS);
      triggers.push(EMOTIONAL_TRIGGERS.DESIRE_CONTROL); // They want to improve this
    } else {
      // Low rating = pain + urgency.
      parts.push(
        `Your customers are signaling a problem (${context.reviewRating} stars). This is actually valuable—they're showing you exactly where the leverage is.`
      );
      triggers.push(EMOTIONAL_TRIGGERS.FEAR_FAILURE);
      triggers.push(EMOTIONAL_TRIGGERS.DESIRE_CONTROL); // They want to fix it
    }
  } else {
    // No reviews = position as neutral / opportunity to build
    parts.push(`Your ${context.industryCategory} is focused on delivering solid results.`);
  }

  // Name the specific operational reality
  // This section is critical: prospect sees the SAME insight on email, page, and in operator brief
  if (context.painPoint) {
    // Frame pain point as insight, not problem
    // Ensure brief narrative matches prospect page experience
    parts.push(
      `What stands out: Your customers mention ${context.painPoint.toLowerCase()}. This is where your best customers are experiencing friction—and where fixing it creates the biggest impact.`
    );
    triggers.push(EMOTIONAL_TRIGGERS.FRUSTRATION_WASTED_TIME);
    triggers.push(ESTEEM_DRIVERS.ACCOMPLISHMENT); // They can fix this and feel accomplished
  } else {
    parts.push(
      `Your operations are already clean—no major friction signals. This is actually a position of strength.`
    );
    triggers.push(ESTEEM_DRIVERS.FREEDOM); // They have room to grow
  }

  return {
    text: parts.join(" "),
    triggers,
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SECTION 3: OPERATIONAL INSIGHT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This is the PERSPECTIVE SHIFT section. You're helping them see something they
 * haven't fully grasped yet: the *opportunity* hiding in their situation.
 *
 * Copywriting Technique: "When" vs. "If"
 * - "If you fix this..." = Doubt. Will it work? Who knows?
 * - "When you fix this..." = Confidence. It's a certainty. Just a matter of how/when.
 *
 * Kennedy Rule: When = Authority. If = Guess.
 *
 * Psychology: Appeal to control and accomplishment. Help them *feel* what success looks like.
 * Use contrast (current vs. possible) to create desire.
 */
function explainOperationalInsight(context: SignalContext): { text: string; triggers: string[] } {
  const triggers: string[] = [];

  if (context.painPoint && context.reviewRating && context.reviewRating <= 3) {
    // High-pain scenario: Urgent + fixable
    triggers.push(EMOTIONAL_TRIGGERS.DESIRE_CONTROL);
    triggers.push(ESTEEM_DRIVERS.PRIDE);

    return {
      text: `When you systematically address ${context.painPoint}, your customers notice immediately. Your rating improves. Your reputation strengthens. And your team stops firefighting and starts building. That's not incremental. That's a business inflection point.`,
      triggers,
    };
  }

  if (context.painPoint) {
    // Medium-pain scenario: Opportunity hiding in operations
    triggers.push(EMOTIONAL_TRIGGERS.DESIRE_SUCCESS);
    triggers.push(ESTEEM_DRIVERS.FREEDOM);

    return {
      text: `Your team already knows about ${context.painPoint}. They've adapted. But adaptation is not growth—it's constraint. When you systematically remove this constraint, you don't just improve operations. You free your entire team to work on what actually grows the business.`,
      triggers,
    };
  }

  // No-pain scenario: Position as leverage for growth
  triggers.push(ESTEEM_DRIVERS.ACCOMPLISHMENT);
  triggers.push(EMOTIONAL_TRIGGERS.DESIRE_GROWTH);

  return {
    text: `Because your operations are already solid, you're not managing crisis. You're positioned to move faster than competitors who are still firefighting. When you optimize for scale—not just efficiency—you create a compound advantage that becomes harder to compete against.`,
    triggers,
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SECTION 4: PROOF + SUGGESTION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This section does TWO things:
 * 1. PROOF: Why should they trust YOU? (Authority, social proof, specificity)
 * 2. SUGGESTION: What does the partnership actually look like? (Reciprocity, mutual success)
 *
 * Copywriting Technique: Authority through Specificity
 * Generic: "We've helped many businesses."
 * Specific: "We've solved this exact challenge for 47 businesses like yours in London.
 *           They're seeing 23% faster order fulfillment. Here's why it works for you."
 *
 * Psychology: Use Category III (responsibility, care) to show you're not just selling—
 * you're partnering. Emphasize mutual success, not vendor transaction.
 */
function generateProofAndSuggestion(context: SignalContext): { text: string; triggers: string[] } {
  const triggers: string[] = [];
  triggers.push(ESTEEM_DRIVERS.RESPONSIBILITY); // We care about their team/customers
  triggers.push(ESTEEM_DRIVERS.IMPACT); // Making meaningful impact together

  // Build credibility through specificity
  const locationPhrase = context.city ? `in ${context.city}` : "in your market";
  const painContextPhrase = context.painPoint
    ? `who were losing time to ${context.painPoint} but needed to stay operational`
    : "who were scaling faster than their competitors";

  return {
    text: `We work with ${context.industryCategory} operators ${locationPhrase} ${painContextPhrase}. What makes this work: You're not hiring a vendor. You're activating a partnership where your success IS our success. Your customers experience the reliability they expect. Your team gets systems that scale. Your business gets the competitive advantage that comes from being operationally excellent. That's the outcome. That's what we build toward, together.`,
    triggers,
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SECTION 5: CALL TO ACTION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The CTA is not the end of the sales process. It's the beginning.
 * Your job: Make the first step so obvious and low-friction that
 * NOT taking it feels like the odd choice.
 *
 * Copywriting Technique: Specificity + Comfort
 * Generic CTA: "Let's talk."
 * Specific CTA: "Let's have a 20-minute conversation where we identify your biggest operational
 *                opportunity and what fixing it actually looks like for your business.
 *                No pitch. No assumptions. Just clarity."
 *
 * The specific version:
 * - Names the time (20 minutes = manageable)
 * - Names the outcome (clarity on opportunity + next steps)
 * - Removes objections ("No pitch, no assumptions")
 * - Leaves them in control (they decide what "clarity" means)
 *
 * Psychology: Control (they're choosing to talk, not being sold), confidence (it'll be valuable),
 * ease (it's simple and specific).
 */
function generateCallToAction(): { text: string; triggers: string[] } {
  const triggers = [
    ESTEEM_DRIVERS.CONTROL, // They stay in control
    EMOTIONAL_TRIGGERS.DESIRE_CONTROL, // They want agency
  ];

  return {
    text: `Here's the straightforward next step: Let's have a 20-minute conversation. You'll walk away knowing exactly where your biggest operational opportunity actually is—and what making it happen looks like for your business. No pitch. No hidden agenda. Just the clarity you need to make your next move. Ready to talk?`,
    triggers,
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MAIN FUNCTION: Generate Complete Self-Closing Sales Brief
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * This brief is designed to:
 * - Capture attention (Headline)
 * - Build credibility (Current Reality)
 * - Create desire (Operational Insight)
 * - Remove doubt (Proof + Suggestion)
 * - Trigger action (Call to Action)
 *
 * Result: Prospect reads it, feels *seen* and *capable*, sees the opportunity,
 * and reaches out hot—ready to move forward.
 */
export function generateEnrichedBrief(lead: Lead): EnrichedBrief {
  const context = extractSignalContext(lead);

  const headlineData = generateHeadline(context);
  const realityData = summarizeCurrentReality(context);
  const insightData = explainOperationalInsight(context);
  const proofData = generateProofAndSuggestion(context);
  const ctaData = generateCallToAction();

  // Collect all applied psychology frameworks for transparency
  const appliedPsychology = Array.from(
    new Set([
      ...headlineData.triggers,
      ...realityData.triggers,
      ...insightData.triggers,
      ...proofData.triggers,
      ...ctaData.triggers,
    ])
  );

  return {
    headline: headlineData.text,
    currentReality: realityData.text,
    operationalInsight: insightData.text,
    proofAndSuggestion: proofData.text,
    callToAction: ctaData.text,
    appliedPsychology,
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AUDIT LOGGING: Transparency for Testing & Optimization
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Every brief generated logs which psychology frameworks were applied.
 * This ensures:
 * 1. Deterministic output (same input = same brief, always)
 * 2. Testable (we can measure which psychology drivers convert best)
 * 3. Improvable (we can A/B test different psychological approaches)
 * 4. Transparent (we can explain to you why the brief was written this way)
 */
export function logBriefEnrichment(leadId: string, brief: EnrichedBrief): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[BRIEF-ENRICHMENT] Lead ${leadId}:`);
    console.log(`  Headline: "${brief.headline}"`);
    console.log(`  Applied Psychology Triggers:`);
    brief.appliedPsychology.forEach(trigger => console.log(`    ✓ ${trigger}`));
    console.log(`  CTA: "${brief.callToAction.substring(0, 60)}..."`);
    console.log(`  ---`);
  }
}
