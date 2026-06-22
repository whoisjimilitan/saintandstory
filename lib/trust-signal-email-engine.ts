/**
 * Trust Signal Email Engine
 *
 * Combines:
 * - Industry-specific blocker detection
 * - Trust Signal First framework (restraint + inverse incentive)
 * - Human anchors (specific observation, useful insight, credibility signal)
 * - RRTA framework (Recognition → Relief → Trust → Action)
 *
 * Email structure: Makes recipient feel UNDERSTOOD, not SOLD
 *
 * Non-negotiable rule:
 * - Never optimize for immediate conversion
 * - Optimize for perceived trustworthiness
 * - Include genuine inverse incentive (restraint)
 * - Sound like a peer, not a salesman
 */

import {
  INDUSTRY_BLOCKERS,
  getIndustryProfile,
  getBlockerForIndustry,
  type IndustryProfile,
  type Blocker
} from "./industry-blocker-mapper";

export interface PrecisionEmailContext {
  businessName: string;
  businessCategory?: string;
  email?: string;
  industry?: IndustryProfile;
  blocker?: Blocker;
}

export interface TrustSignalEmail {
  subject: string;
  body: string;
  framework: "Trust Signal First";
  pattern: "Inverse Incentive";
  humanAnchors: {
    specificObservation: string;
    usefulInsight: string;
    trustSignal: string;
  };
  blockerReference: string;
  confidence: number;
  readyForPreview: boolean;
}

/**
 * Generate precise, trust-signal-first email based on industry blocker
 *
 * Structure:
 * 1. Recognition (specific observation about their blocker)
 * 2. Relief (acknowledge the pain without overselling)
 * 3. Trust Signal (inverse incentive - show restraint)
 * 4. Action (single, low-friction ask)
 */
export function generateTrustSignalEmail(
  context: PrecisionEmailContext
): TrustSignalEmail | null {
  const industry = context.industry || getIndustryProfile(context.businessCategory);
  const blocker = context.blocker || getBlockerForIndustry(context.businessCategory);

  if (!industry || !blocker) {
    return null;
  }

  // Build email based on specific industry blocker
  const email = buildEmailForBlocker(context.businessName, industry, blocker);

  return {
    ...email,
    framework: "Trust Signal First",
    pattern: "Inverse Incentive",
    blockerReference: blocker.emailReference,
    confidence: blocker.confidence,
    readyForPreview: true
  };
}

/**
 * Build email tailored to specific blocker
 */
function buildEmailForBlocker(
  businessName: string,
  industry: IndustryProfile,
  blocker: Blocker
): Omit<TrustSignalEmail, "framework" | "pattern" | "blockerReference" | "confidence" | "readyForPreview"> {
  const templates = BLOCKER_EMAIL_TEMPLATES[blocker.name];

  if (!templates) {
    return buildGenericTrustSignalEmail(businessName, industry, blocker);
  }

  return templates(businessName, industry, blocker);
}

/**
 * Generic trust signal email fallback
 */
function buildGenericTrustSignalEmail(
  businessName: string,
  industry: IndustryProfile,
  blocker: Blocker
): Omit<TrustSignalEmail, "framework" | "pattern" | "blockerReference" | "confidence" | "readyForPreview"> {
  return {
    subject: `Quick question: ${blocker.emailReference}`,
    body: `Hi,

I noticed ${businessName} operates in ${industry.industry.toLowerCase()}.

${blocker.emailReference}

You may not need this, but we work with similar businesses who face this exact challenge—usually solved within hours, not days.

If you're already handling it efficiently, ignore this.

If not, worth a quick conversation?

Best,
Saint & Story`,
    humanAnchors: {
      specificObservation: `${businessName} operates in ${industry.industry.toLowerCase()}`,
      usefulInsight: `This blocker usually solved within hours, not days`,
      trustSignal: `You may not need this. If you're already handling it, ignore this.`
    }
  };
}

/**
 * Industry-specific blocker email templates
 * Each template includes:
 * - Specific observation about the business
 * - Useful insight without hard sell
 * - Trust signal (inverse incentive)
 * - RRTA structure (Recognition → Relief → Trust → Action)
 */
const BLOCKER_EMAIL_TEMPLATES: Record<
  string,
  (businessName: string, industry: IndustryProfile, blocker: Blocker) => Omit<TrustSignalEmail, "framework" | "pattern" | "blockerReference" | "confidence" | "readyForPreview">
> = {
  // LAWYERS: Documents to courthouse
  "documents-stuck": (businessName, industry, blocker) => ({
    subject: `Court deadline today—documents stuck?`,
    body: `Hi,

I noticed ${businessName} operates in legal services.

Here's something most law firms don't mention: ${blocker.timeWindow} is usually when documents still aren't at the courthouse.

You may not need same-day courier—maybe you've got a system that works. But if you've ever had that 2pm panic when a file isn't there yet, that's what we solve. Usually within 1 hour.

Not the cheapest option. But when 1 hour matters more than £50, we're the choice.

Worth knowing about?

Best,
Saint & Story`,
    humanAnchors: {
      specificObservation: `Law firm operating during court deadline hours`,
      usefulInsight: `Documents often aren't at courthouse during critical deadlines (specific time pattern most firms face)`,
      trustSignal: `You may not need this. If you've got a system that works, ignore this.`
    }
  }),

  // PHARMACY: Urgent prescriptions
  "urgent-prescriptions": (businessName, industry, blocker) => ({
    subject: `Patient needs prescription today, not Tuesday`,
    body: `Hi,

I noticed ${businessName} is a pharmacy.

One thing we've seen: patients calling about urgent prescription needs that can't wait until next business day. Usually between 3-5pm when it's too late for regular delivery.

You may already have this covered with your wholesaler. But if there's ever a gap—particularly same-day urgent needs—we handle it within 2 hours.

Not for routine stock rotation. Just for when "today" matters.

Clear?

Best,
Saint & Story`,
    humanAnchors: {
      specificObservation: `Pharmacy managing urgent patient needs`,
      usefulInsight: `Urgent prescriptions typically needed 3-5pm window (specific pattern)`,
      trustSignal: `You may already have this covered. Not for routine orders, only urgent gaps.`
    }
  }),

  // DENTISTRY: Cancellation gaps & lab delays
  "cancellation-gaps": (businessName, industry, blocker) => ({
    subject: `Cancellation just freed 2 hours—lost revenue?`,
    body: `Hi,

I noticed ${businessName} is a dental practice.

This happens around 2-4pm most days: cancellation frees 2 hours of chair time, but no patient booked. Revenue gap.

You may not see this as a problem—maybe you have a waitlist that fills it. But if cancellations are occasional gaps rather than constantly full, that's where some practices lose £200-400 per afternoon.

Not something we solve directly. But thought you'd notice if you tracked it.

Do you?

Best,
Saint & Story`,
    humanAnchors: {
      specificObservation: `Dental practice with appointment-based revenue model`,
      usefulInsight: `Cancellations create 2-4pm revenue gaps (specific time pattern)`,
      trustSignal: `May not be a problem if you have a full waitlist. But if not, worth tracking.`
    }
  }),

  // MOVING: Saturday overflow
  "weekend-overflow": (businessName, industry, blocker) => ({
    subject: `Saturday 2pm double-booking—next job delayed?`,
    body: `Hi,

I noticed ${businessName} is a removal company.

Saturday double-booking is the killer. First job runs late, second job is 30 minutes away, and now you're 45 minutes behind schedule with an angry customer.

You may have a backup plan—some companies do. But if you don't, that delay costs you: the angry review, the second customer never returning, the weekend stress.

One extra van + driver that Saturday 1-5pm solves it completely.

Not needed every week. But on the weeks you need it, worth having?

Best,
Saint & Story`,
    humanAnchors: {
      specificObservation: `Removal company managing multiple Saturday bookings`,
      usefulInsight: `Saturday overflow typically happens 2pm onward (specific time pattern and cost)`,
      trustSignal: `You may already have a backup plan. Only matters on overbooked Saturdays.`
    }
  }),

  // E-COMMERCE: Fulfillment backlog
  "fulfillment-backlog": (businessName, industry, blocker) => ({
    subject: `50 orders in warehouse—missing your 24h shipping promise?`,
    body: `Hi,

I noticed ${businessName} sells online.

Here's the pattern: you promise "ships within 24 hours." Most of the time, easy. But then a flash sale hits, or a viral post, or a promo code, and suddenly 50+ orders are in the warehouse and it's 6pm.

Your staff can't pack and ship them all tonight. So you either:
1. Ship them tomorrow (break your promise)
2. Pay overtime (destroy margin)
3. Call in backup (don't have a reliable option)

You may have this totally covered already. But if there's ever a moment where "we need packing help by 8pm tonight," that's exactly what we do.

Rare need, but critical when it happens?

Best,
Saint & Story`,
    humanAnchors: {
      specificObservation: `E-commerce business with 24-hour fulfillment promise`,
      usefulInsight: `Order backlog during peak times creates 6pm-tomorrow gap (specific pattern and cost)`,
      trustSignal: `May already be covered. Only matters during unexpected surge days.`
    }
  })
};

/**
 * Validate email for trust signals
 */
export function validateTrustSignals(email: TrustSignalEmail): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check for specific observation
  if (!email.humanAnchors.specificObservation) {
    issues.push("Missing specific observation (sounds generic)");
  }

  // Check for useful insight
  if (!email.humanAnchors.usefulInsight) {
    issues.push("Missing useful insight (not informative)");
  }

  // Check for trust signal / inverse incentive
  if (!email.humanAnchors.trustSignal) {
    issues.push("Missing trust signal / inverse incentive (seems too eager)");
  }

  // Check for sales language
  const salesyKeywords = [
    "amazing",
    "revolutionary",
    "game-changing",
    "disrupt",
    "exclusive",
    "limited time",
    "act now"
  ];
  const bodySalesy = salesyKeywords.some((keyword) =>
    email.body.toLowerCase().includes(keyword)
  );
  if (bodySalesy) {
    issues.push("Contains salesy language (breaks trust)");
  }

  // Check for genuine inverse incentive
  const inverseKeywords = [
    "you may not need",
    "may already have",
    "if you're already",
    "not for",
    "only if"
  ];
  const hasInverse = inverseKeywords.some((keyword) =>
    email.body.toLowerCase().includes(keyword)
  );
  if (!hasInverse) {
    issues.push("Missing genuine inverse incentive");
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}
