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
  postcode?: string;
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
    const city = context.city || "London";
    const location = context.postcode ? `${context.postcode} (${city})` : city;
    const email = `Hi,

Most law firms in ${location} tell me the same thing: files that need the Old Bailey by 5pm usually arrive next morning. It's happened so often it's almost predictable.

Does this match what you're seeing?

YES - We're dealing with this right now
MAYBE - Happens occasionally
NO - Not an issue for us

If it doesn't apply, ignore this.

Best`;

    return {
      subject: "Files to Old Bailey by 5pm—tonight?",
      body: email,
      wordCount: context.postcode ? 64 : 63,
      humanAnchors: {
        observation: `Pattern among law firms in ${location}`,
        insight: "End of day court deadlines create next-morning delivery gap",
        question: "Does this match what you're seeing?",
        inverseIncentive: "If it doesn't apply, ignore this"
      }
    };
  },

  "urgent-prescriptions": (context, industry, blocker) => {
    const city = context.city || "London";
    const email = `Hi,

Most pharmacies in ${city} tell me: urgent prescription needs come in after 3pm, when regular delivery's already stopped for the day.

How often is this actually happening?

YES - Multiple times a week
MAYBE - Occasional calls
NO - Not really for us

If it's not an issue, no response needed.

Best`;

    return {
      subject: "3pm urgent prescription calls?",
      body: email,
      wordCount: 54,
      humanAnchors: {
        observation: `Pattern among pharmacies in ${city}`,
        insight: "3pm+ urgent needs create delivery gap with regular suppliers",
        question: "How often is this actually happening?",
        inverseIncentive: "If it's not an issue, no response needed"
      }
    };
  },

  "cancellation-gaps": (context, industry, blocker) => {
    const city = context.city || "London";
    const email = `Hi,

Most practices in ${city} tell me the same thing: 2-4pm cancellations that free up chair time but that's lost revenue, full stop. One said it costs them about £400 per gap.

Is this something you see regularly?

YES - Happens most weeks
MAYBE - Occasional cancellations
NO - Doesn't really impact us

If this doesn't match your experience, ignore.

Best`;

    return {
      subject: "Afternoon cancellation revenue gaps?",
      body: email,
      wordCount: 63,
      humanAnchors: {
        observation: `Pattern among dental practices in ${city}`,
        insight: "2-4pm cancellations create predictable revenue gaps",
        question: "Is this something you see regularly?",
        inverseIncentive: "If this doesn't match your experience, ignore"
      }
    };
  },

  "weekend-overflow": (context, industry, blocker) => {
    const city = context.city || "London";
    const email = `Hi,

Most removers we speak with in ${city} see the same Saturday pattern: 2pm and one job runs late, next client is 45 minutes away, second move starts behind.

Does this happen on your peak Saturdays?

YES - Happened last few weeks
MAYBE - Occasionally
NO - We manage it fine

If you've got this figured out, ignore this.

Best`;

    return {
      subject: "Saturday 2pm scheduling crunch?",
      body: email,
      wordCount: 59,
      humanAnchors: {
        observation: `Pattern among removers in ${city}`,
        insight: "2pm Saturday double-booking creates cascade delay",
        question: "Does this happen on your peak Saturdays?",
        inverseIncentive: "If you've got this figured out, ignore this"
      }
    };
  },

  "fulfillment-backlog": (context, industry, blocker) => {
    const city = context.city || "London";
    const email = `Hi,

Most e-commerce teams in ${city} we work with hit the same wall: around 5-6pm on busy days, 50+ orders in the warehouse and you've promised 24-hour shipping. Overtime or break the promise.

How often is this actually a problem?

YES - Happens most busy weeks
MAYBE - Few times a month
NO - We handle it smoothly

If this isn't your reality, no need to respond.

Best`;

    return {
      subject: "5pm order pile-up vs promise?",
      body: email,
      wordCount: 60,
      humanAnchors: {
        observation: `Pattern among e-commerce teams in ${city}`,
        insight: "6pm order surge vs 24-hour promise creates pressure",
        question: "How often is this actually a problem?",
        inverseIncentive: "If this isn't your reality, no need to respond"
      }
    };
  },

  "after-hours-access": (context, industry, blocker) => {
    const city = context.city || "London";
    const email = `Hi,

Most emergency plumbers we work with in ${city} get the call around 9pm: kitchen flooded, needs parts delivered tonight to finish the job. That's when parts availability makes or breaks it.

How regularly does this come up?

YES - Multiple times a month
MAYBE - Every few weeks
NO - Rarely an issue

If this doesn't match your business, ignore.

Best`;

    return {
      subject: "9pm emergency call—parts available?",
      body: email,
      wordCount: 61,
      humanAnchors: {
        observation: `Pattern among emergency plumbers in ${city}`,
        insight: "9pm+ emergencies need immediate parts or job fails",
        question: "How regularly does this come up?",
        inverseIncentive: "If this doesn't match your business, ignore"
      }
    };
  },

  "product-stockout": (context, industry, blocker) => {
    const city = context.city || "London";
    const email = `Hi,

Most salons in ${city} tell me the same thing: Wednesday afternoon, someone wants a specific color, you're out. Client's in the chair. Turn them away or make them wait. Both cost you.

Does this actually happen for you?

YES - It's a real problem
MAYBE - Rare but it happens
NO - We're usually stocked

If this isn't your experience, no response needed.

Best`;

    return {
      subject: "Out of stock mid-appointment?",
      body: email,
      wordCount: 61,
      humanAnchors: {
        observation: `Pattern among salons in ${city}`,
        insight: "Mid-day stockouts during peak = direct revenue loss",
        question: "Does this actually happen for you?",
        inverseIncentive: "If this isn't your experience, no response needed"
      }
    };
  },

  "deadline-documents": (context, industry, blocker) => {
    const city = context.city || "London";
    const email = `Hi,

Most accounting practices we work with in ${city} hit the same wall: January 28th, documents from 12 different clients scattered across emails, Drives, storage. Deadline is 31st. Happens every year.

Is this a real pain point for you come January?

YES - It's every year
MAYBE - Sometimes tight
NO - We've got it sorted

If you've got a solid system, ignore this.

Best`;

    return {
      subject: "January document coordination?",
      body: email,
      wordCount: 64,
      humanAnchors: {
        observation: `Pattern among accounting practices in ${city}`,
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

Something I keep hearing about in ${industry.industry.toLowerCase()}: ${blocker.painPoint}.

Does this match what you're dealing with?

YES - Happening right now
MAYBE - Sometimes comes up
NO - Not for us

If it doesn't apply, ignore this.

Best`;

  return {
    subject: `Quick question: ${blocker.emailReference}?`,
    body: email,
    wordCount: 47,
    humanAnchors: {
      observation: `Pattern in ${industry.industry}`,
      insight: blocker.painPoint,
      question: "Does this match what you're dealing with?",
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
