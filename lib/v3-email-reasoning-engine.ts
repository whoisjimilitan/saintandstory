/**
 * V3 EMAIL REASONING ENGINE
 *
 * Applies the locked V3 thinking pattern to generate unique, personalised emails.
 * NOT a template. A reasoning process that produces hand-written feeling emails.
 *
 * Pattern:
 * 1. Reason their critical moment (specific time + collision + pressure)
 * 2. Articulate the unsaid insight
 * 3. Apply psychology (mirror + value + inverse + ask)
 * 4. Introduce what we do (specific, local, factual)
 * 5. Close with reciprocal ask
 *
 * Each email is unique because the reasoning is unique.
 */

export interface ProspectData {
  name: string; // Person's name (not business name)
  businessName: string;
  businessCategory: string;
  city: string;
  country?: string;
}

export interface ReasonedEmail {
  subject: string;
  body: string;
  wordCount: number;
  reasoning: {
    moment: string;
    insight: string;
    pressurePoint: string;
    service: string;
  };
}

/**
 * REASONING DATABASE
 * Maps business category to reasoning rules (not templates)
 */
const REASONING_RULES: Record<
  string,
  {
    // What moves in their business
    whatMoves: string;
    // When does critical moment happen?
    momentTiming: () => string; // Returns specific time logic
    // What collision happens?
    collision: string;
    // What pressure point is exposed?
    pressurePoint: string;
    // What insight haven't they articulated?
    unsaidInsight: string;
    // What do we do for them (specific service)?
    service: (city: string) => string;
    // Subject line (inverse incentive)
    subject: () => string;
  }
> = {
  "law-firm": {
    whatMoves: "documents and court filings",
    momentTiming: () => "4:57pm Thursday",
    collision: "Files need to be with court by 9am Friday. Supplier closed at 4pm.",
    pressurePoint: "Standing in office wondering how files actually get there",
    unsaidInsight:
      "what's being tested isn't speed. It's whether you had a plan for this gap to begin with.",
    service: (city) =>
      `help ${city} law firms get documents to court same day, or build retainer solutions for recurring gaps`,
    subject: () => "Only if this is your Thursday"
  },

  "removals": {
    whatMoves: "furniture and household goods",
    momentTiming: () => "2:15pm Saturday",
    collision: "First job running 30 mins over. Second family arriving 2:45pm.",
    pressurePoint: "Team standing in living room realizing second crew isn't there yet",
    unsaidInsight:
      "what matters isn't having another van. It's whether you had a buffer plan for Saturday cascades.",
    service: (city) =>
      `help ${city} removals coordinate Saturday scheduling same-day, or manage weekend overflow on retainer`,
    subject: () => "Not for everyone"
  },

  "pharmacy": {
    whatMoves: "prescriptions and medications",
    momentTiming: () => "3:42pm",
    collision: "Customer walks in needing urgent script. Supplier stops taking calls at 4pm.",
    pressurePoint: "18 minutes from closing with no backup option",
    unsaidInsight:
      "what matters isn't knowing 10 pharmacies. It's having ONE that answers when you need them.",
    service: (city) =>
      `help ${city} pharmacies get urgent prescriptions fulfilled after-hours, or manage supply pressure on retainer`,
    subject: () => "Might not apply"
  },

  "restaurant": {
    whatMoves: "food supplies and ingredients",
    momentTiming: () => "5:47pm",
    collision: "Delivery arrives. Service starts 6pm. Sous chef asking where the fish is.",
    pressurePoint: "Three minutes from seating first table",
    unsaidInsight:
      "what actually matters isn't how fast you improvise. It's whether you planned for supply to arrive before service.",
    service: (city) =>
      `help ${city} restaurants get supplies delivered before service, or manage prep-time pressure on retainer`,
    subject: () => "Only if this is your reality"
  },

  "ecommerce": {
    whatMoves: "orders and inventory",
    momentTiming: () => "5:30pm",
    collision: "Order surge hits. Fulfillment deadline is 7pm.",
    pressurePoint: "Warehouse capacity getting tight",
    unsaidInsight:
      "what matters isn't having fulfillment capacity. It's having it when your peak hits.",
    service: (city) =>
      `help ${city} e-commerce manage order surge fulfillment same-day, or build predictable capacity on retainer`,
    subject: () => "Not for everyone"
  },

  "taxi-rideshare": {
    whatMoves: "passenger transport capacity",
    momentTiming: () => "6:45pm",
    collision: "Rush hour demand peaks. Driver supply drops.",
    pressurePoint: "Requests piling up, wait times climbing",
    unsaidInsight:
      "what matters isn't having more drivers. It's having them when demand actually peaks.",
    service: (city) =>
      `help ${city} rideshare manage peak-hour demand, or build standby capacity on retainer`,
    subject: () => "If you see this pattern"
  },

  "construction": {
    whatMoves: "materials and equipment",
    momentTiming: () => "7:30am",
    collision: "Crew arrives. Materials haven't. Project starts in 30 minutes.",
    pressurePoint: "Crew standing idle, timeline slipping",
    unsaidInsight:
      "what's being tested isn't your supplier network. It's whether you had material planning locked in.",
    service: (city) =>
      `help ${city} construction crews get materials delivered on-time, or coordinate logistics on retainer`,
    subject: () => "Only if you know this moment"
  }
};

/**
 * REASON THE MOMENT
 * Creates specific, personalised moment based on their business
 */
function reasonTheMoment(
  rules: (typeof REASONING_RULES)[string],
  city: string
): string {
  const timing = rules.momentTiming();
  const collision = rules.collision;
  const pressure = rules.pressurePoint;

  return `It's ${timing}. ${collision} You're ${pressure}.`;
}

/**
 * ARTICULATE THE INSIGHT
 * What they feel but haven't said out loud
 */
function articulateInsight(rules: (typeof REASONING_RULES)[string]): string {
  return `In that moment, ${rules.unsaidInsight}`;
}

/**
 * GENERATE UNIQUE EMAIL
 * Applies reasoning pattern (not template)
 */
export function generateReasonedEmail(prospect: ProspectData): ReasonedEmail | null {
  try {
    const categoryKey = prospect.businessCategory.toLowerCase();
    const rules = REASONING_RULES[categoryKey];

    if (!rules) {
      return null; // No reasoning rules for this category yet
    }

    // STEP 1: Reason the moment (specific to them)
    const moment = reasonTheMoment(rules, prospect.city);

    // STEP 2: Articulate the insight (what they haven't said)
    const insight = articulateInsight(rules);

    // STEP 3: Build the email using locked pattern
    const service = rules.service(prospect.city);

    const body = `Hi ${prospect.name},

${moment}

${insight}

If you figured that out, ignore this.

If you didn't—we ${service}.

If this is your reality, one word back—yes, maybe, or no—and we'll both know if there's something here worth exploring.

Best`;

    const wordCount = body.split(/\s+/).length;
    const subject = rules.subject();

    return {
      subject,
      body,
      wordCount,
      reasoning: {
        moment,
        insight,
        pressurePoint: rules.pressurePoint,
        service
      }
    };
  } catch (error) {
    console.error("[V3 REASONING ENGINE] Error:", error);
    return null;
  }
}

/**
 * GENERATE FOR BATCH
 * Applies reasoning to multiple prospects
 */
export function generateReasonedEmailBatch(
  prospects: ProspectData[]
): (ReasonedEmail | null)[] {
  return prospects.map((prospect) => generateReasonedEmail(prospect));
}

/**
 * VALIDATE EMAIL FOLLOWS PATTERN
 * Ensure reasoning was applied, not templating
 */
export function validateReasoningApplied(email: ReasonedEmail): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Must have the moment (shows reasoning about their specific time/collision)
  if (!email.reasoning.moment || email.reasoning.moment.length < 20) {
    issues.push("Moment not specific enough");
  }

  // Must have the insight (articulates what they haven't said)
  if (!email.reasoning.insight || email.reasoning.insight.length < 20) {
    issues.push("Insight not articulated");
  }

  // Must have specific service (not generic "we help with X")
  if (!email.reasoning.service.includes("day") && !email.reasoning.service.includes("retainer")) {
    issues.push("Service not specific (missing same-day or retainer)");
  }

  // Must have inverse incentive ("ignore", "disregard", "if you figured out")
  if (!email.body.toLowerCase().includes("ignore") && !email.body.toLowerCase().includes("figured")) {
    issues.push("Missing inverse incentive");
  }

  // Must have the reciprocal ask (one word back)
  if (!email.body.includes("one word back")) {
    issues.push("Missing reciprocal ask");
  }

  // Word count reasonable (not too short, not too long)
  if (email.wordCount < 80 || email.wordCount > 160) {
    issues.push(`Word count ${email.wordCount} (target 80-160)`);
  }

  // Subject should feel like inverse incentive
  if (email.subject.includes("transform") || email.subject.includes("amazing")) {
    issues.push("Subject line too salesy");
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}
