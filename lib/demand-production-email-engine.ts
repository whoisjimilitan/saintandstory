/**
 * DEMAND PRODUCTION EMAIL ENGINE
 *
 * Core Philosophy:
 * - Emails sound like a peer/colleague wrote them in 5 minutes
 * - Every email creates MEASURABLE demand through YES/MAYBE/NO responses
 * - Responses map to temperature: YES=ULTRA_HOT, MAYBE=WARM, NO=COLD
 * - No guessing. Response tells operator exactly what they created.
 *
 * Psychology Locked:
 * ✅ "We're quick to trust someone who talks us out of spending more"
 * ✅ Trust signals work by showing you ACTED AGAINST SHORT-TERM GAIN
 * ✅ "You don't need that" with authority builds more trust than "Yes!" with enthusiasm
 * ✅ Restraint reads as security. Enthusiasm reads as insecurity.
 * ✅ Saying no builds loyalty
 *
 * Structure:
 * 1. "I noticed..." opener (observation, not pitch)
 * 2. Specific scenario (natural detail, not generic)
 * 3. YES/MAYBE/NO with descriptive labels (operator sees temperature)
 * 4. Inverse incentive (restraint signal)
 * 5. Sign off (brief, human)
 */

export interface EmailContext {
  businessName: string;
  businessCategory?: string;
  city?: string;
  pressureSignal?: string; // The specific signal chosen for THIS business
}

export interface DemandProductionEmail {
  subject: string;
  body: string;
  wordCount: number;
  pressureSignal: string; // What signal is this email using?
  responseStructure: {
    yesLabel: string;
    maybeLabel: string;
    noLabel: string;
  };
  temperatureMap: {
    YES: "ULTRA_HOT";
    MAYBE: "WARM";
    NO: "COLD";
  };
  humanAnchors: {
    observation: string;
    scenario: string;
    question: string;
    inverseIncentive: string;
  };
}

/**
 * EMAIL TEMPLATES - Based on BATCH 2 style (restoring what worked)
 *
 * Each template:
 * - Sounds like a peer wrote it
 * - Specific to their pain
 * - Has YES/MAYBE/NO structure
 * - Has inverse incentive
 * - Measurable (response = temperature)
 */

const DEMAND_PRODUCTION_TEMPLATES = {
  "law-firm": {
    "deadline-certainty": (ctx: EmailContext): DemandProductionEmail => ({
      subject: "Court deadline + files on time?",
      body: `Hi,

I noticed you're a law firm in ${ctx.city || "your area"}. Something I keep hearing from partners: files that need court by end of day usually arrive the next morning instead.

Does this happen in your firm?

YES - We're dealing with this this week
MAYBE - Happens a few times a year
NO - Not something we see

If it doesn't apply, ignore this.

Best`,
      wordCount: 65,
      pressureSignal: "deadline-certainty",
      responseStructure: {
        yesLabel: "We're dealing with this this week",
        maybeLabel: "Happens a few times a year",
        noLabel: "Not something we see"
      },
      temperatureMap: {
        YES: "ULTRA_HOT",
        MAYBE: "WARM",
        NO: "COLD"
      },
      humanAnchors: {
        observation: `Law firm in ${ctx.city}`,
        scenario: "Files that need court by end of day arrive next morning",
        question: "Does this happen in your firm?",
        inverseIncentive: "If it doesn't apply, ignore this"
      }
    })
  },

  "removals": {
    "weekend-overflow": (ctx: EmailContext): DemandProductionEmail => ({
      subject: "Saturday double bookings?",
      body: `Hi,

I noticed ${ctx.businessName} in ${ctx.city}. Most removers see the same pattern: double bookings around 2pm Saturday that push the second job 45 minutes behind.

Does this happen on your peak Saturdays?

YES - Happened last few weeks
MAYBE - Occasionally
NO - We manage it fine

If you've got this figured out, ignore this.

Best`,
      wordCount: 62,
      pressureSignal: "weekend-overflow",
      responseStructure: {
        yesLabel: "Happened last few weeks",
        maybeLabel: "Occasionally",
        noLabel: "We manage it fine"
      },
      temperatureMap: {
        YES: "ULTRA_HOT",
        MAYBE: "WARM",
        NO: "COLD"
      },
      humanAnchors: {
        observation: `Removals company in ${ctx.city}`,
        scenario: "2pm Saturday double bookings push second job 45 minutes late",
        question: "Does this happen on your peak Saturdays?",
        inverseIncentive: "If you've got this figured out, ignore this"
      }
    })
  },

  "pharmacy": {
    "urgent-prescriptions": (ctx: EmailContext): DemandProductionEmail => ({
      subject: "Urgent prescription after 3pm?",
      body: `Hi,

I noticed ${ctx.businessName} is in ${ctx.city}. Most pharmacies I speak with see the same pattern: urgent prescription needs come in after 3pm when regular delivery has stopped.

How often does this actually happen for you?

YES - Multiple times a week
MAYBE - Occasional calls
NO - Not really for us

If it's not an issue, no response needed.

Best`,
      wordCount: 64,
      pressureSignal: "urgent-prescriptions",
      responseStructure: {
        yesLabel: "Multiple times a week",
        maybeLabel: "Occasional calls",
        noLabel: "Not really for us"
      },
      temperatureMap: {
        YES: "ULTRA_HOT",
        MAYBE: "WARM",
        NO: "COLD"
      },
      humanAnchors: {
        observation: `Pharmacy in ${ctx.city}`,
        scenario: "Urgent needs after 3pm when regular delivery stopped",
        question: "How often does this happen?",
        inverseIncentive: "If it's not an issue, no response needed"
      }
    })
  },

  "restaurant": {
    "prep-timing": (ctx: EmailContext): DemandProductionEmail => ({
      subject: "Meal prep deadline pressure?",
      body: `Hi,

I noticed ${ctx.businessName} in ${ctx.city}. Something most restaurant owners mention: food arrives, prep deadline hits, and service is about to to start.

How often is supply timing the pressure point?

YES - Every service day
MAYBE - A few times a week
NO - Rarely an issue

If this isn't on your radar, ignore.

Best`,
      wordCount: 56,
      pressureSignal: "prep-timing",
      responseStructure: {
        yesLabel: "Every service day",
        maybeLabel: "A few times a week",
        noLabel: "Rarely an issue"
      },
      temperatureMap: {
        YES: "ULTRA_HOT",
        MAYBE: "WARM",
        NO: "COLD"
      },
      humanAnchors: {
        observation: `Restaurant in ${ctx.city}`,
        scenario: "Food arrives, prep deadline hits, service starting",
        question: "How often is supply timing the pressure point?",
        inverseIncentive: "If this isn't on your radar, ignore"
      }
    })
  },

  "ecommerce": {
    "fulfillment-surge": (ctx: EmailContext): DemandProductionEmail => ({
      subject: "End-of-day fulfillment peak?",
      body: `Hi,

I noticed ${ctx.businessName} in ${ctx.city}. Most e-commerce teams see it: end of day order surge hits, fulfillment capacity gets tight.

How regularly does this create pressure?

YES - Happens most days
MAYBE - Few times a week
NO - We've got it covered

If you're not seeing this bottleneck, disregard.

Best`,
      wordCount: 58,
      pressureSignal: "fulfillment-surge",
      responseStructure: {
        yesLabel: "Happens most days",
        maybeLabel: "Few times a week",
        noLabel: "We've got it covered"
      },
      temperatureMap: {
        YES: "ULTRA_HOT",
        MAYBE: "WARM",
        NO: "COLD"
      },
      humanAnchors: {
        observation: `E-commerce in ${ctx.city}`,
        scenario: "EOD order surge hits, fulfillment capacity tightens",
        question: "How regularly does this create pressure?",
        inverseIncentive: "If you're not seeing this bottleneck, disregard"
      }
    })
  }
};

/**
 * GENERATE EMAIL
 *
 * Takes context + pressure signal → returns demand-production email
 * Email is PEER-LIKE (not marketing), MEASURABLE (YES/MAYBE/NO), TRANSPARENT
 */
export function generateDemandProductionEmail(
  ctx: EmailContext
): DemandProductionEmail | null {
  try {
    const category = ctx.businessCategory?.toLowerCase() || "default";
    const signal = ctx.pressureSignal || "default";

    const categoryTemplates = DEMAND_PRODUCTION_TEMPLATES[category as keyof typeof DEMAND_PRODUCTION_TEMPLATES];
    if (!categoryTemplates) {
      return generateGenericDemandEmail(ctx);
    }

    const templateFn = categoryTemplates[signal as keyof typeof categoryTemplates];
    if (!templateFn) {
      return generateGenericDemandEmail(ctx);
    }

    return templateFn(ctx);
  } catch (error) {
    console.error("[DEMAND EMAIL] Error:", error);
    return null;
  }
}

/**
 * FALLBACK: Generic template (uses reasoning for any industry)
 */
function generateGenericDemandEmail(ctx: EmailContext): DemandProductionEmail {
  return {
    subject: "Quick question about your operations?",
    body: `Hi,

I noticed ${ctx.businessName} in ${ctx.city}. Most businesses mention timing as a pressure point during peak periods.

Does this match what you're seeing?

YES - This is an issue
MAYBE - Occasionally
NO - We've got it handled

If this doesn't apply, ignore.

Best`,
    wordCount: 45,
    pressureSignal: ctx.pressureSignal || "generic",
    responseStructure: {
      yesLabel: "This is an issue",
      maybeLabel: "Occasionally",
      noLabel: "We've got it handled"
    },
    temperatureMap: {
      YES: "ULTRA_HOT",
      MAYBE: "WARM",
      NO: "COLD"
    },
    humanAnchors: {
      observation: `Business in ${ctx.city}`,
      scenario: "Timing as pressure point during peaks",
      question: "Does this match what you're seeing?",
      inverseIncentive: "If this doesn't apply, ignore"
    }
  };
}

/**
 * VALIDATE EMAIL (makes sure it maintains demand-production principles)
 */
export function validateDemandEmail(email: DemandProductionEmail): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Must have YES/MAYBE/NO structure
  if (!email.body.includes("YES") || !email.body.includes("MAYBE") || !email.body.includes("NO")) {
    issues.push("Missing YES/MAYBE/NO response structure");
  }

  // Must have inverse incentive
  if (!email.body.toLowerCase().includes("ignore") && !email.body.toLowerCase().includes("disregard")) {
    issues.push("Missing inverse incentive (restraint signal)");
  }

  // Must start with "I noticed" or similar
  if (!email.body.toLowerCase().includes("noticed")) {
    issues.push("Missing observational opener");
  }

  // Must have specific detail (not generic)
  if (email.wordCount < 45) {
    issues.push("Too short - may lack specific detail");
  }

  // No salesy keywords
  const salesyWords = ["amazing", "revolutionary", "transform", "unlock", "exclusive"];
  const hasSalesy = salesyWords.some(w => email.body.toLowerCase().includes(w));
  if (hasSalesy) {
    issues.push("Contains marketing language");
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}
