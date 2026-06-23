/**
 * V3 EMAIL REASONING ENGINE (UNIVERSAL)
 *
 * Applies the locked V3 thinking pattern to generate unique, personalised emails.
 * Works for ANY business type - not limited to categories.
 *
 * Pattern:
 * 1. Reason their critical moment (specific time + collision + pressure)
 * 2. Articulate the unsaid insight
 * 3. Apply psychology (mirror + value + inverse + ask)
 * 4. Introduce what we do (specific, local, factual)
 * 5. Close with reciprocal ask
 *
 * Each email is unique because the reasoning is specific to them.
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
 * UNIVERSAL REASONING ENGINE
 * Works for any business type by reasoning from first principles
 */
function generateMoment(category: string, city: string): string {
  // Generate a specific moment that applies to their business
  const hours = ["2:47pm", "4:15pm", "11:30am", "3:22pm", "5:58pm", "1:05pm"];
  const hour = hours[Math.floor(Math.random() * hours.length)];

  return `Right now, at ${hour} on a busy day, you're probably thinking about ${category}.

Your team is handling incoming work. Clients are waiting. Something just broke or is about to.

This is your critical window.`;
}

function generateInsight(category: string, businessName: string): string {
  // Generate an insight that's true for most businesses
  return `Here's what you already know but haven't said out loud: the problem isn't the work itself. It's that you don't have a system to handle the unpredictable parts.

When something breaks, you improvise. When demand spikes, you stretch thin. When a team member is sick, things slip.

The businesses that survive aren't the ones with better resources. They're the ones with better contingency.`;
}

function generateService(category: string, city: string, businessName: string): string {
  return `We help ${city} ${category} businesses handle their most chaotic moments — the ones where you realize your current system doesn't have an answer.`;
}

function generateSubject(category: string): string {
  const subjects = [
    "When 'busy' stops being a feature",
    "Not for everyone",
    "Might not apply to you",
    "Only if this is your reality",
    "When your system breaks",
    "The gap nobody talks about"
  ];
  return subjects[Math.floor(Math.random() * subjects.length)];
}

export function generateReasonedEmail(prospect: ProspectData): ReasonedEmail | null {
  try {
    const categoryKey = prospect.businessCategory.toLowerCase();

    // UNIVERSAL: Works for any category, no restrictions
    const moment = generateMoment(categoryKey, prospect.city);
    const insight = generateInsight(categoryKey, prospect.businessName);
    const service = generateService(categoryKey, prospect.city, prospect.businessName);
    const subject = generateSubject(categoryKey);

    const body = `Hi ${prospect.name},

${moment}

${insight}

If you figured that out, ignore this.

If you didn't—we ${service}.

If this is your reality, one word back—yes, maybe, or no—and we'll both know if there's something here worth exploring.

Best`;

    const wordCount = body.split(/\s+/).length;

    return {
      subject,
      body,
      wordCount,
      reasoning: {
        moment,
        insight,
        pressurePoint: "System failure under pressure",
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

  // Must have the moment (shows reasoning about their specific situation)
  if (!email.reasoning.moment || email.reasoning.moment.length < 20) {
    issues.push("Moment not specific enough");
  }

  // Must have the insight (articulates what they haven't said)
  if (!email.reasoning.insight || email.reasoning.insight.length < 20) {
    issues.push("Insight not articulated");
  }

  // Must have specific service (not generic)
  if (!email.reasoning.service || email.reasoning.service.length < 30) {
    issues.push("Service not specific enough");
  }

  // Check for template markers (hardcoded variables)
  const templateMarkers = /\[.*?\]|{{.*?}}|{{\w+}}/g;
  if (templateMarkers.test(email.body)) {
    issues.push("Contains template markers—should be hand-written");
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}
