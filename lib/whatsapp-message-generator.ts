/**
 * WHATSAPP MESSAGE GENERATOR
 *
 * Core Philosophy (LOCKED 2026-06-27):
 * - Messages introduce who you are, NOT ask if they need help
 * - Every message creates immediate action (reply within minutes)
 * - No questions at end (removes sales pressure)
 * - Sound like an expert introducing themselves, not a salesman pitching
 * - One line, max 180 characters
 * - Human and confident tone
 *
 * Psychology Framework:
 * ✅ Acknowledge them (group, context, their background)
 * ✅ Identify their problem (specific, not generic)
 * ✅ Introduce who you are at Saint & Story (expertise positioning)
 * ✅ NO ask at end (no "Worth a chat?", "Interested?", "Call me")
 * ✅ Removes sales pressure
 * ✅ Triggers curiosity over obligation
 *
 * Structure:
 * 1. "Hey {firstName}, saw/noticed you in {groupName}" (acknowledgment)
 * 2. "{Their pain point}" (problem identification)
 * 3. "I head/handle X for Saint & Story" (expertise intro)
 * 4. Total: One line, under 180 chars, NO question mark
 */

export interface WhatsAppMessageContext {
  firstName: string;
  groupName: string;
  description?: string; // Their role/business background
  businessType?: string; // Industry hint
  maxChars?: number; // Default 180
}

export interface WhatsAppMessage {
  message: string;
  charCount: number;
  strategy: "ai_personalized" | "template" | "generic";
  isValid: boolean;
  askPresent: boolean; // Should ALWAYS be false
  questionMarkAtEnd: boolean; // Should ALWAYS be false
}

/**
 * STRATEGY 1: AI Personalized (Facebook profile + description available)
 * Uses Claude API to generate unique, personalized message
 */
export async function generateAIPersonalizedMessage(
  ctx: WhatsAppMessageContext
): Promise<WhatsAppMessage> {
  const maxChars = ctx.maxChars || 180;

  // Claude prompt to generate personalized message
  const prompt = `Generate a ONE-LINE WhatsApp message (max ${maxChars} characters):

Person: ${ctx.firstName}
Group: ${ctx.groupName}
Their background: ${ctx.description || "Not provided"}

Your message MUST:
✓ Start with "Hey ${ctx.firstName}, saw/spotted you in ${ctx.groupName}"
✓ Identify a problem they likely face (based on their role)
✓ End with "I head/handle [service] for Saint & Story"
✓ NO question mark at end
✓ NO "Worth a chat?", "Interested?", "Call me", or similar asks
✓ Sound confident and expert-like, not salesy
✓ Exactly ONE line

Structure: [Acknowledgment] [Their problem] [Your intro at Saint & Story]

Examples of good structure:
✓ "Hey Sarah, saw you in Manchester Business – logistics gets messy. I handle that for Saint & Story"
✓ "Hi James, spotted in Owners Group – distribution's a headache. I head operations for Saint & Story"
✓ "Tom, noticed in SME Support – supply chain chaos common. I manage fulfillment at Saint & Story"

Generate ONLY the message, nothing else.
Max ${maxChars} chars.`;

  try {
    // TODO: Call Claude API (placeholder for now)
    // For now, return template version
    return generateTemplateMessage(ctx);
  } catch (error) {
    console.error("[WHATSAPP] AI generation failed:", error);
    return generateTemplateMessage(ctx);
  }
}

/**
 * STRATEGY 2: Template (WhatsApp group data, minimal info)
 * Uses pre-built template with personalization
 */
export function generateTemplateMessage(
  ctx: WhatsAppMessageContext
): WhatsAppMessage {
  const maxChars = ctx.maxChars || 180;

  // Pain point library (select based on group name)
  const painPoints: Record<string, string> = {
    "business": "logistics eats time",
    "entrepreneur": "shipping coordination's tough",
    "sme": "distribution logistics drain resources",
    "trade": "supply chain is hectic",
    "commerce": "moving stuff happens constantly",
    "owner": "deliveries need coordination",
    "startup": "logistics grows with you",
    "professional": "moving happens regularly",
    "service": "coordination is constant",
    default: "logistics is a headache"
  };

  // Find matching pain point
  const groupNameLower = ctx.groupName.toLowerCase();
  let selectedPain = painPoints.default;
  for (const [key, pain] of Object.entries(painPoints)) {
    if (groupNameLower.includes(key)) {
      selectedPain = pain;
      break;
    }
  }

  // Generate message
  const message = `Hey ${ctx.firstName}, spotted you in ${ctx.groupName} – ${selectedPain}. I head logistics at Saint & Story`;

  // Validate
  const charCount = message.length;
  const isValid =
    charCount <= maxChars &&
    !message.includes("?") &&
    !message.includes("Worth a chat") &&
    !message.includes("Interested") &&
    !message.includes("Call me") &&
    message.includes("I head") &&
    message.includes("Saint & Story");

  return {
    message,
    charCount,
    strategy: "template",
    isValid,
    askPresent: message.includes("?"),
    questionMarkAtEnd: message.endsWith("?")
  };
}

/**
 * STRATEGY 3: Generic (Minimal data)
 * Fallback for when we have only phone number
 */
export function generateGenericMessage(
  ctx: WhatsAppMessageContext
): WhatsAppMessage {
  const maxChars = ctx.maxChars || 180;

  const message = `Hi there, I head logistics for Saint & Story. We handle courier and moving services for UK businesses. Worth exploring?`;

  // Better version (removes question):
  const betterMessage = `Hi there, I head logistics for Saint & Story. We handle courier and moving services. Verified drivers, fixed price.`;

  const charCount = betterMessage.length;
  const isValid = charCount <= maxChars && !betterMessage.includes("?");

  return {
    message: betterMessage,
    charCount,
    strategy: "generic",
    isValid,
    askPresent: false,
    questionMarkAtEnd: false
  };
}

/**
 * VALIDATION: Enforce psychology rules
 */
export function validateMessage(message: WhatsAppMessage): boolean {
  // Must NOT have these
  if (message.message.includes("Worth a chat?")) return false;
  if (message.message.includes("Interested?")) return false;
  if (message.message.includes("Call me")) return false;
  if (message.message.includes("DM me")) return false;
  if (message.message.includes("Give me a call")) return false;
  if (message.message.includes("Let me know")) return false;
  if (message.message.includes("Could help")) return false;
  if (message.message.includes("Might help")) return false;
  if (message.message.endsWith("?")) return false; // No question at end

  // Must HAVE these
  if (!message.message.includes("I head") && !message.message.includes("I handle")) return false;
  if (!message.message.includes("Saint & Story")) return false;

  // Character limit
  if (message.charCount > (message.maxChars || 180)) return false;

  return message.isValid;
}

/**
 * MAIN EXPORT: Generate best message based on available data
 */
export async function generateWhatsAppMessage(
  ctx: WhatsAppMessageContext
): Promise<WhatsAppMessage> {
  // Determine strategy based on available data
  if (ctx.description && ctx.description.length > 10) {
    // We have profile info: use AI personalization
    return generateAIPersonalizedMessage(ctx);
  } else if (ctx.groupName) {
    // We have group name: use template
    return generateTemplateMessage(ctx);
  } else {
    // Minimal data: use generic
    return generateGenericMessage(ctx);
  }
}
