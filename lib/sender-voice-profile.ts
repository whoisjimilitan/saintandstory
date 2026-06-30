/**
 * SENDER VOICE PROFILE
 *
 * Captures and applies authentic voice across ALL communication.
 * Each admin has one consistent voice locked across:
 * - Cold emails
 * - Follow-up drips
 * - Close drips
 * - All Saint & Story communication
 *
 * Ensures: Tonal consistency = authenticity = trust
 */

export type OpeningTone = "casual" | "formal" | "direct";
export type PromiseLanguage = "confident" | "humble" | "direct";
export type CloserStyle = "curious" | "direct" | "open";

export interface SenderVoiceProfile {
  senderId: string;
  senderName: string;
  email: string;
  openingTone: OpeningTone;
  promiseLanguage: PromiseLanguage;
  closerStyle: CloserStyle;
  overallTone: "casual" | "professional" | "hybrid";
  createdAt: Date;
  lastUpdatedAt: Date;
  performanceNotes?: string;
}

/**
 * Default voice profiles for known admins
 * Can be customized per admin
 */
export const DEFAULT_VOICE_PROFILES: Record<string, Partial<SenderVoiceProfile>> = {
  james: {
    senderName: "James",
    email: "james@saintandstoryltd.co.uk",
    openingTone: "casual",
    promiseLanguage: "confident",
    closerStyle: "curious",
    overallTone: "casual",
  },
};

/**
 * Opening tone variations
 * Used consistently across all emails from that sender
 */
export const OPENING_TONES: Record<OpeningTone, string> = {
  casual: "Sorry for my randomness.",
  formal: "Apologies if this is out of the blue.",
  direct: "Sorry if this feels random.",
};

/**
 * Promise language variations
 * Used consistently across cold + drip emails
 */
export const PROMISE_LANGUAGE: Record<PromiseLanguage, string> = {
  confident: "My expansion promise to {{group}} in {{city}} is that",
  humble: "What we're committing to {{group}} in {{city}} is that",
  direct: "Here's what we guarantee {{group}} in {{city}}:",
};

/**
 * Closer style variations
 * Used consistently across all emails
 */
export const CLOSER_STYLES: Record<CloserStyle, string> = {
  curious: "Just curious if we should be talking.",
  direct: "Worth a quick conversation?",
  open: "Open to exploring this together?",
};

/**
 * Get complete voice profile for a sender
 * Returns all tone/style variations for that sender
 */
export function getSenderVoiceProfile(senderName: string): SenderVoiceProfile {
  const defaultProfile = DEFAULT_VOICE_PROFILES[senderName.toLowerCase()];

  if (!defaultProfile) {
    // Return default profile if sender not found
    return {
      senderId: "unknown",
      senderName,
      email: "",
      openingTone: "casual",
      promiseLanguage: "confident",
      closerStyle: "curious",
      overallTone: "casual",
      createdAt: new Date(),
      lastUpdatedAt: new Date(),
    };
  }

  return {
    senderId: senderName.toLowerCase(),
    senderName: defaultProfile.senderName || senderName,
    email: defaultProfile.email || "",
    openingTone: defaultProfile.openingTone || "casual",
    promiseLanguage: defaultProfile.promiseLanguage || "confident",
    closerStyle: defaultProfile.closerStyle || "curious",
    overallTone: defaultProfile.overallTone || "casual",
    createdAt: new Date(),
    lastUpdatedAt: new Date(),
  };
}

/**
 * Get opening text for a sender
 * Used in cold emails, drips, all communication
 */
export function getSenderOpening(senderName: string): string {
  const profile = getSenderVoiceProfile(senderName);
  return OPENING_TONES[profile.openingTone];
}

/**
 * Get promise language for a sender
 * Used in cold emails + drips with dynamic {{group}} and {{city}}
 */
export function getSenderPromiseLanguage(senderName: string): string {
  const profile = getSenderVoiceProfile(senderName);
  return PROMISE_LANGUAGE[profile.promiseLanguage];
}

/**
 * Get closer text for a sender
 * Used in all emails (cold, drips)
 */
export function getSenderCloser(senderName: string): string {
  const profile = getSenderVoiceProfile(senderName);
  return CLOSER_STYLES[profile.closerStyle];
}

/**
 * Apply sender voice to email template
 * Ensures ALL emails from this sender sound like them
 */
export function applySenderVoice(
  emailBody: string,
  senderName: string,
  closerText?: string
): string {
  const profile = getSenderVoiceProfile(senderName);
  const opening = getSenderOpening(senderName);
  const closer = closerText || getSenderCloser(senderName);

  return emailBody
    .replace(/{{OPENING_TONE}}/g, opening)
    .replace(/{{PROMISE_LANGUAGE}}/g, getSenderPromiseLanguage(senderName))
    .replace(/{{CLOSER_STYLE}}/g, closer);
}
