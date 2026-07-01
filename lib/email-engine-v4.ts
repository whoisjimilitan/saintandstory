/**
 * EMAIL ENGINE v4
 *
 * Generates psychology-locked, ready-to-send cold outreach emails
 * with LOCKED SENDER VOICE and CONSEQUENCE-BASED SUBJECT LINES.
 *
 * Template structure (LOCKED):
 * 1. Honest cold outreach (A to Z contacts) + acknowledge boldness
 * 2. Seed plant (third-party observation of their real concerns)
 * 3. Specific pain (dynamic, business-type specific)
 * 4. Specific promise (dynamic, business-type specific)
 * 5. Self-discovery signal (yes/maybe/no)
 * 6. Emotional close (sender-specific)
 *
 * Consequence Hierarchy:
 * TIER 1 (ULTRA_MOTIVATED): Subject = "We're expanding with you in mind"
 * TIER 2 (HIGHLY_MOTIVATED): Subject = "We're expanding with you in mind"
 * TIER 3 (MOTIVATED): Subject = "We're expanding with you in mind"
 */

import { detectBusinessType } from "./business-pain-promise-map";
import { getSenderVoiceProfile, getSenderOpening, getSenderCloser } from "./sender-voice-profile";
import { getSeedPlant } from "./seed-plant-map";

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

  const bodyText = `Hi ${greeting},

Reaching out cold—I know it's bold. But I noticed something with ${seedPlant}

${pain}

We ${promise}

I'm not saying you need us. You might already have this solved. But if this matters to you, worth a quick conversation.

${senderName}
Saint & Story Logistics`;

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
