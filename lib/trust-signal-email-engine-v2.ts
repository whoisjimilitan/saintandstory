/**
 * Trust Signal Email Engine V2
 *
 * FINAL ARCHITECTURE
 *
 * Requirements:
 * - Subtle, not salesy
 * - Concise (60-80 words max)
 * - Location-specific ("I noticed you're in [city]")
 * - Psychologically dense (every word earns its place)
 * - One question only (respects their time)
 * - Inverse incentive ("If not, ignore")
 * - Sounds human (like a peer wrote it in 5 minutes)
 *
 * Psychology:
 * - Observation + insight = advisor tone
 * - Pain point (stated subtly) = recognition
 * - Small question = humble ask
 * - Inverse incentive = trust signal
 * - Location + industry = personalization
 */

import {
  getIndustryProfile,
  getBlockerForIndustry,
  type IndustryProfile,
  type Blocker
} from "./industry-blocker-mapper";

export interface EmailContext {
  businessName: string;
  businessCategory?: string;
  city?: string;
}

export interface TrustSignalEmailV2 {
  subject: string;
  body: string;
  wordCount: number;
  humanAnchors: {
    observation: string;
    insight: string;
    question: string;
    inverseIncentive: string;
  };
}

/**
 * Generate concise, psychologically dense email
 */
export function generateTrustSignalEmailV2(context: EmailContext): TrustSignalEmailV2 | null {
  const industry = getIndustryProfile(context.businessCategory);
  const blocker = getBlockerForIndustry(context.businessCategory);

  if (!industry || !blocker) {
    return null;
  }

  const template = CONCISE_EMAIL_TEMPLATES[blocker.name];
  if (!template) {
    return generateGenericEmailV2(context, industry, blocker);
  }

  return template(context, industry, blocker);
}

/**
 * Concise email templates - each 60-80 words, psychologically dense
 *
 * Structure:
 * 1. Greeting + location + observation
 * 2. Insight (the pain point, stated subtly)
 * 3. One question
 * 4. Inverse incentive
 * 5. Sign off
 */
const CONCISE_EMAIL_TEMPLATES: Record<
  string,
  (context: EmailContext, industry: IndustryProfile, blocker: Blocker) => TrustSignalEmailV2
> = {
  "documents-stuck": (context, industry, blocker) => {
    const email = `Hi,

I noticed you're a law firm in ${context.city || "your area"}. Something I keep hearing from partners: files that need court by end of day usually arrive the next morning instead.

Does this happen in your firm?

YES - We're dealing with this this week
MAYBE - Happens a few times a year
NO - Not something we see

If it doesn't apply, ignore this.

Best`;

    return {
      subject: "Court deadline + files on time?",
      body: email,
      wordCount: 65,
      humanAnchors: {
        observation: `Law firm in ${context.city}`,
        insight: "End of day court deadlines create next-morning delivery gap",
        question: "Does this happen in your firm?",
        inverseIncentive: "If it doesn't apply, ignore this"
      }
    };
  },

  "urgent-prescriptions": (context, industry, blocker) => {
    const email = `Hi,

I noticed ${context.businessName} is in ${context.city}. Most pharmacies I speak with see the same pattern: urgent prescription needs come in after 3pm when regular delivery has stopped.

How often does this actually happen for you?

YES - Multiple times a week
MAYBE - Occasional calls
NO - Not really for us

If it's not an issue, no response needed.

Best`;

    return {
      subject: "Urgent prescription after 3pm?",
      body: email,
      wordCount: 64,
      humanAnchors: {
        observation: `Pharmacy in ${context.city}`,
        insight: "3pm+ urgent needs create delivery gap with regular suppliers",
        question: "How often does this happen?",
        inverseIncentive: "If it's not an issue, no response needed"
      }
    };
  },

  "cancellation-gaps": (context, industry, blocker) => {
    const email = `Hi,

I noticed you're a dental practice in ${context.city}. Most practices tell me: cancellations around 2-4pm free up chair time but that revenue gap is real.

Is this something you see regularly?

YES - Happens most weeks
MAYBE - Occasional cancellations
NO - Doesn't really impact us

If this doesn't match your experience, ignore.

Best`;

    return {
      subject: "Afternoon cancellation gaps?",
      body: email,
      wordCount: 63,
      humanAnchors: {
        observation: `Dental practice in ${context.city}`,
        insight: "2-4pm cancellations create predictable revenue gaps",
        question: "Is this something you see regularly?",
        inverseIncentive: "If this doesn't match your experience, ignore"
      }
    };
  },

  "weekend-overflow": (context, industry, blocker) => {
    const email = `Hi,

I noticed ${context.businessName} is in ${context.city}. Saturday pattern most removers see: double bookings around 2pm that push the second job 45 minutes behind.

Does this happen on your peak Saturdays?

YES - Happened last few weeks
MAYBE - Occasionally
NO - We manage it fine

If you've got this figured out, ignore this.

Best`;

    return {
      subject: "Saturday double-booking pressure?",
      body: email,
      wordCount: 64,
      humanAnchors: {
        observation: `Removal company in ${context.city}`,
        insight: "2pm Saturday double-booking creates cascade delay",
        question: "Does this happen on your peak Saturdays?",
        inverseIncentive: "If you've got this figured out, ignore this"
      }
    };
  },

  "fulfillment-backlog": (context, industry, blocker) => {
    const email = `Hi,

I noticed you sell online from ${context.city}. Pattern I see often: 50+ orders in the warehouse by 6pm on a busy day, but you promised 24-hour shipping.

How often is this actually a problem?

YES - Happens most busy weeks
MAYBE - Few times a month
NO - We handle it smoothly

If this isn't your reality, no need to respond.

Best`;

    return {
      subject: "Order backlog vs 24h promise?",
      body: email,
      wordCount: 66,
      humanAnchors: {
        observation: `E-commerce business in ${context.city}`,
        insight: "6pm order surge vs 24-hour promise creates pressure",
        question: "How often is this actually a problem?",
        inverseIncentive: "If this isn't your reality, no need to respond"
      }
    };
  },

  "after-hours-access": (context, industry, blocker) => {
    const email = `Hi,

I noticed you're a plumber in ${context.city}. One thing most emergency plumbers deal with: urgent call at 9pm that needs parts delivered that same night to finish.

How regularly does this come up?

YES - Multiple times a month
MAYBE - Every few weeks
NO - Rarely an issue

If this doesn't match your business, ignore.

Best`;

    return {
      subject: "Emergency call at 9pm—parts tonight?",
      body: email,
      wordCount: 64,
      humanAnchors: {
        observation: `Plumbing business in ${context.city}`,
        insight: "9pm+ emergencies need immediate parts or job fails",
        question: "How regularly does this come up?",
        inverseIncentive: "If this doesn't match your business, ignore"
      }
    };
  },

  "product-stockout": (context, industry, blocker) => {
    const email = `Hi,

I noticed ${context.businessName} is in ${context.city}. Most salons tell me: run out of a popular product mid-day during peak, and you have to turn a client away.

Does this actually happen for you?

YES - It's a real problem
MAYBE - Rare but it happens
NO - We're usually stocked

If this isn't your experience, no response needed.

Best`;

    return {
      subject: "Out of stock during peak hours?",
      body: email,
      wordCount: 63,
      humanAnchors: {
        observation: `Salon in ${context.city}`,
        insight: "Mid-day stockouts during peak = direct revenue loss",
        question: "Does this actually happen for you?",
        inverseIncentive: "If this isn't your experience, no response needed"
      }
    };
  },

  "deadline-documents": (context, industry, blocker) => {
    const email = `Hi,

I noticed you're an accountant in ${context.city}. Tax season pattern: documents needed by 31 January but they're scattered across client emails, drives, storage.

Is this a real pain point for you come January?

YES - It's every year
MAYBE - Sometimes tight
NO - We've got it sorted

If you've got a solid system, ignore this.

Best`;

    return {
      subject: "Tax deadline document gathering?",
      body: email,
      wordCount: 64,
      humanAnchors: {
        observation: `Accountant in ${context.city}`,
        insight: "Tax deadlines create last-minute document coordination pressure",
        question: "Is this a real pain point for you?",
        inverseIncentive: "If you've got a solid system, ignore this"
      }
    };
  }
};

/**
 * Generic email fallback
 */
function generateGenericEmailV2(
  context: EmailContext,
  industry: IndustryProfile,
  blocker: Blocker
): TrustSignalEmailV2 {
  const email = `Hi,

I noticed you're in ${industry.industry.toLowerCase()} in ${context.city || "your area"}. Something I keep hearing about: ${blocker.painPoint}.

Quick question: does this match what you're seeing?

- Yes, this is happening
- Sometimes
- Not this month

If it doesn't apply, ignore this.

Best`;

  return {
    subject: `Quick question: ${blocker.emailReference}?`,
    body: email,
    wordCount: 59,
    humanAnchors: {
      observation: `${industry.industry} in ${context.city}, ${blocker.name}`,
      insight: blocker.painPoint,
      question: "Does this match what you're seeing?",
      inverseIncentive: "If it doesn't apply, ignore this"
    }
  };
}

/**
 * Validate email for density and authenticity
 */
export function validateEmailV2(email: TrustSignalEmailV2): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check word count (should be 60-80 words)
  if (email.wordCount < 55 || email.wordCount > 85) {
    issues.push(`Word count ${email.wordCount} (target 60-80)`);
  }

  // Check for salesy keywords
  const salesyKeywords = [
    "amazing",
    "revolutionary",
    "game-changing",
    "disrupt",
    "exclusive",
    "limited time",
    "act now",
    "don't miss",
    "unlock",
    "transform"
  ];
  const bodySalesy = salesyKeywords.some((kw) =>
    email.body.toLowerCase().includes(kw)
  );
  if (bodySalesy) {
    issues.push("Contains salesy language");
  }

  // Check for inverse incentive
  const hasInverse = email.body.toLowerCase().includes("ignore") ||
    email.body.toLowerCase().includes("if it doesn't");
  if (!hasInverse) {
    issues.push("Missing inverse incentive");
  }

  // Check for location
  const hasLocation = email.body.includes("in ") && email.body.match(/in\s+\w+/);
  if (!hasLocation) {
    issues.push("Missing location personalization");
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}
