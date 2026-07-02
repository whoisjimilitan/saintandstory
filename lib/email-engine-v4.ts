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

import { detectBusinessType, selectSignature, generateBridge } from "./business-pain-promise-map";
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

  // Detect business type and get pain/promise + trust-first subject lines
  const { pain, promise, subjectLines, tier } = detectBusinessType(prospect.businessName);

  // SUBJECT LINE: Intelligently choose from trust-first options (Observation, Human, Shared World, Zero-Marketing)
  // Pick the first option (can be randomized for A/B testing if needed)
  const subjectLine = subjectLines && subjectLines.length > 0 ? subjectLines[0] : "One thing I've learnt";

  // Mail merge: use firstName if available, fallback to [Name]
  const greeting = prospect.firstName ? prospect.firstName : "[Name]";

  // Get category-specific closing question and identity from pain-promise map
  const ppmEntry = detectBusinessType(prospect.businessName);
  const closingQuestion = ppmEntry.closingQuestion || "Out of curiosity, when deadlines get tight, is having a same-day backup courier something your team ever needs?";

  // Dynamic signature: Use hierarchical identity (principle > outcome > positioning)
  const signature = selectSignature(ppmEntry.identity);

  // Industry-specific bridge: Use from pain-promise map, or generate if not set
  const bridge = ppmEntry.bridge || generateBridge(prospect.businessName);

  // Narrative story layers (if available, use new structure; otherwise fallback to old)
  const hasNarrativeStructure = ppmEntry.sharedReality && ppmEntry.rootCause && ppmEntry.businessPhilosophy && ppmEntry.promiseStatement;

  let bodyText: string;

  if (hasNarrativeStructure) {
    // NEW: Story-based template (Shared Reality → Root Cause → Philosophy → Promise → Question)
    bodyText = `Hi ${greeting},

Apologies. I know it's unusual emailing you out of the blue.

${bridge}
${ppmEntry.sharedReality}

${ppmEntry.rootCause}

${ppmEntry.businessPhilosophy}
${ppmEntry.promiseStatement}

${closingQuestion}

Saint & Story
${signature}`;
  } else {
    // LEGACY: Fallback to old template (Bridge + Observation → Promise → Question)
    bodyText = `Hi ${greeting},

Apologies. I know it's unusual emailing you out of the blue.

${bridge} ${pain}

${promise}

${closingQuestion}

Saint & Story
${signature}`;
  }

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
