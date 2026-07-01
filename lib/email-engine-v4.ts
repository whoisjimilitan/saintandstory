/**
 * EMAIL ENGINE v4 (V5 PSYCHOLOGY-LOCKED)
 *
 * Generates trust-first, market-aware cold outreach emails.
 *
 * ═══════════════════════════════════════════════════════════════════
 * STRATEGIC FRAMEWORK (LOCKED)
 * ═══════════════════════════════════════════════════════════════════
 *
 * V5 POSITIONING STRATEGY:
 *
 * Each email simultaneously:
 * 1. Observes a REAL industry trend (missed deadlines, capacity constraints)
 * 2. Highlights competitor weakness (others are failing)
 * 3. Implies Saint & Story is different (we solve what they can't)
 * 4. Creates contrast (market problem → our solution)
 *
 * WHY THIS WORKS:
 * ✅ Credible (observable market fact, not opinion)
 * ✅ Non-attacking (observational, not critical of competitors)
 * ✅ Urgent (happening RIGHT NOW in their industry)
 * ✅ Positions us as insider who understands their world
 * ✅ Makes the problem feel shared, not just theirs
 *
 * CRITICAL REQUIREMENT:
 * This positioning is ONLY ethical and effective if we can deliver:
 * - Consistent same-day delivery
 * - Zero missed deadlines
 * - Genuine backup for failures ("if it ever fails on us, we own it")
 *
 * If we cannot deliver on this promise, this positioning backfires immediately.
 * Prospects will see us as making claims we can't keep.
 *
 * RISK/REWARD:
 * Risk: If we miss a deadline, we lose all credibility (we claimed to solve this)
 * Reward: If we deliver, we're unbeatable (we're solving a real, visible problem)
 *
 * ═══════════════════════════════════════════════════════════════════
 *
 * Template structure (LOCKED):
 * 1. Apology (acknowledge cold outreach)
 * 2. Industry insight (market trend observation)
 * 3. Specific pain (category-specific consequence)
 * 4. Promise (what we do, backed by risk)
 * 5. Curiosity question (makes them expert, forces reply)
 * 6. Dynamic signature (personalized tagline)
 *
 * Mail merge: First names for personalization
 * Consequence Hierarchy: Tier-based pricing and urgency
 */

import { detectBusinessType } from "./business-pain-promise-map";
import { getSenderVoiceProfile, getSenderOpening, getSenderCloser } from "./sender-voice-profile";
import { getSeedPlant } from "./seed-plant-map";

// Format business type for tagline (e.g., "solicitor" → "Solicitors")
function formatBusinessTypeForTagline(businessType: string): string {
  const formatted = businessType
    .replace(/_/g, " ")
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Make plural if not already
  if (!formatted.endsWith("s")) {
    return formatted + "s";
  }
  return formatted;
}

export interface EmailV4 {
  subjectLine: string;
  bodyText: string;
  specificPain: string;
  specificPromise: string;
  senderVoice: string; // Tracks which voice profile was used
  consequenceTier: 1 | 2 | 3; // Consequence tier (1=ULTRA, 2=PREMIUM, 3=OPERATIONAL)
}

/**
 * Generate psychology-locked v4 email
 * Uses locked template with dynamic pain/promise
 */
export function generateEmailV4(
  prospect: {
    id: string;
    businessName: string;
    city?: string;
    email?: string;
    firstName?: string; // Contact first name for personalization
  },
  senderName: string = "James"
): EmailV4 {
  /**
   * V5 REASONING FRAMEWORK (Applied to every email)
   *
   * 1. HONESTY: Industry insight must be truthful + observable
   *    We're not criticizing competitors, we're observing market reality
   *
   * 2. RESTRAINT: Tone stays observational, never attacking
   *    "Couriers are stretched" not "Your courier sucks"
   *
   * 3. CLARITY: Promise is specific and deliverable
   *    "If it ever fails on us, we own the re-delivery" = we take the risk
   *
   * 4. CONSEQUENCE: Closing question makes them expert, forces engagement
   *    Not a yes/no question, but an evaluation of our solution
   *
   * This framework ensures every email is ethically positioned AND
   * operationally backed by our actual delivery capability.
   *
   * CRITICAL: This positioning only works if we deliver consistently.
   * If we miss deadlines, we lose all credibility immediately.
   */

  // Get sender voice profile (ensures consistency across all emails)
  const voiceProfile = getSenderVoiceProfile(senderName);
  const senderOpening = getSenderOpening(senderName);
  const senderCloser = getSenderCloser(senderName);

  // Detect business type and get pain/promise + consequence-based subject
  const { pain, promise, subjectLineVariation, tier } = detectBusinessType(prospect.businessName);

  const city = prospect.city || "your area";
  const businessType = prospect.businessName.toLowerCase();

  // SUBJECT LINE: Dynamic based on business category + tier
  const subjectLine = subjectLineVariation.replace("{{city}}", city);

  // Get seed plant for this business type
  const seedPlant = getSeedPlant(businessType, city);

  // Mail merge: use firstName if available, fallback to [Name]
  const greeting = prospect.firstName ? prospect.firstName : "[Name]";

  // V5 template: Industry insight + consequence + promise + curiosity question
  // Get category-specific data from pain-promise map
  const ppmEntry = detectBusinessType(prospect.businessName);
  const closingQuestion = ppmEntry.closingQuestion || "Real question. When this becomes critical, would a same-day backup help?";
  const industryInsight = ppmEntry.industryInsight || `the increase in missed deadlines with ${seedPlant}`;

  // Dynamic tagline: "Simplifying Logistics for [Category]"
  const businessCategory = formatBusinessTypeForTagline(businessType);
  const dynamicTagline = `Simplifying Logistics for ${businessCategory}`;

  // V5 opening: Industry trend + their specific seed plant
  const openingObservation = `But I noticed ${industryInsight}.`;

  const bodyText = `Hi ${greeting},

Apologies. I know it's bold emailing you cold. ${openingObservation}

${pain}

That's what we do. ${promise}

${closingQuestion}

${senderName}
Saint & Story
${dynamicTagline}`;

  return {
    subjectLine,
    bodyText,
    specificPain: pain,
    specificPromise: promise,
    senderVoice: voiceProfile.senderId,
    consequenceTier: tier,
  };
}

/**
 * Batch generate emails for multiple prospects
 */
export function generateEmailsV4Batch(
  prospects: Array<{
    id: string;
    businessName: string;
    city?: string;
    email?: string;
    firstName?: string;
  }>,
  senderName: string = "James"
): Array<{
  prospectId: string;
  businessName: string;
  city: string;
  email: EmailV4;
}> {
  return prospects.map((prospect) => ({
    prospectId: prospect.id,
    businessName: prospect.businessName,
    city: prospect.city || "your area",
    email: generateEmailV4(prospect, senderName),
  }));
}
