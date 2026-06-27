/**
 * UNIFIED OUTREACH MESSAGE GENERATOR
 *
 * Core Philosophy (LOCKED 2026-06-27):
 * - Messages introduce who you are, NOT ask if they need help
 * - Every message creates immediate action (reply within minutes)
 * - No questions at end (removes sales pressure)
 * - Sound like an expert introducing themselves, not a salesman pitching
 * - Adapt to channel (WhatsApp one-line, Email multi-para, LinkedIn personal)
 * - Human and confident tone across ALL channels
 *
 * Psychology Framework (UNIVERSAL):
 * ✅ Acknowledge them (group, context, their background)
 * ✅ Identify their problem (specific, not generic)
 * ✅ Introduce who you are at Saint & Story (expertise positioning)
 * ✅ NO ask at end (no "Worth a chat?", "Interested?", "Call me")
 * ✅ Removes sales pressure
 * ✅ Triggers curiosity over obligation
 *
 * Strategies:
 * 1. AI Personalized (Facebook + description) → WhatsApp one-liner
 * 2. Template (WhatsApp group + minimal data) → WhatsApp one-liner
 * 3. Email (email + company) → Multi-paragraph intro
 * 4. LinkedIn (profile + title) → Professional personal message
 * 5. Generic (phone only) → Fallback one-liner
 */

export interface OutreachContext {
  // Identifiers
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;

  // Source context
  groupName?: string;
  company?: string;
  linkedinProfile?: string;
  description?: string; // Their role/background
  businessType?: string;

  // Configuration
  maxChars?: number; // Default: 180 for WhatsApp, N/A for email/LinkedIn
}

export interface OutreachMessage {
  message: string;
  charCount: number;
  strategy: "ai_personalized" | "template" | "email" | "linkedin" | "generic";
  channel: "whatsapp" | "email" | "linkedin" | "sms";
  isValid: boolean;
  askPresent: boolean; // Should ALWAYS be false
  questionMarkAtEnd: boolean; // Should ALWAYS be false
  psychology: {
    acknowledgesContext: boolean;
    identifiesProblem: boolean;
    introducesExpertise: boolean;
    noSalesPressure: boolean;
  };
}

/**
 * STRATEGY 1: AI Personalized (Facebook profile + description)
 * Uses Claude API to generate unique, personalized one-liner
 */
export async function generateAIPersonalizedMessage(
  ctx: OutreachContext
): Promise<OutreachMessage> {
  const maxChars = ctx.maxChars || 180;

  const prompt = `Generate a ONE-LINE WhatsApp message (max ${maxChars} characters):

Person: ${ctx.firstName} (${ctx.description || "Not provided"})
Group: ${ctx.groupName}

Your message MUST:
✓ Start with "Hey ${ctx.firstName}, saw/spotted you in ${ctx.groupName}"
✓ Identify a problem they likely face (based on their role)
✓ End with "I head/handle [service] for Saint & Story"
✓ NO question mark at end
✓ NO asks like "Worth a chat?", "Interested?", "Call me"
✓ Sound confident, expert-like, not salesy
✓ Exactly ONE line, max ${maxChars} chars

Examples:
✓ "Hey Sarah, saw you in Manchester Business – logistics gets messy. I handle that for Saint & Story"
✓ "Hi James, spotted in Owners Group – distribution's a headache. I head operations for Saint & Story"

Generate ONLY the message.`;

  try {
    // TODO: Call Claude API for true personalization
    // For now, use template strategy
    return generateTemplateMessage(ctx);
  } catch (error) {
    console.error("[OUTREACH] AI generation failed:", error);
    return generateTemplateMessage(ctx);
  }
}

/**
 * STRATEGY 2: Template (WhatsApp group + minimal data)
 * Uses pre-built template with pain point library
 */
export function generateTemplateMessage(
  ctx: OutreachContext
): OutreachMessage {
  const maxChars = ctx.maxChars || 180;

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

  const groupNameLower = ctx.groupName?.toLowerCase() || "";
  let selectedPain = painPoints.default;
  for (const [key, pain] of Object.entries(painPoints)) {
    if (groupNameLower.includes(key)) {
      selectedPain = pain;
      break;
    }
  }

  const message = `Hey ${ctx.firstName}, spotted you in ${ctx.groupName} – ${selectedPain}. I head logistics at Saint & Story`;

  return validateOutreachMessage(message, "template", "whatsapp", maxChars, ctx);
}

/**
 * STRATEGY 3: Email (email + company)
 * Multi-paragraph introduction with expertise positioning
 * NEW PSYCHOLOGY: "Here's what I do" instead of "Do you need help?"
 */
export function generateEmailMessage(
  ctx: OutreachContext
): OutreachMessage {
  const subject = `Quick thought on ${ctx.company} + logistics`;

  const body = `Hi ${ctx.firstName},

I came across ${ctx.company} and noticed you're handling distribution challenges.

I head logistics at Saint & Story. Most companies like yours spend way too much time coordinating shipments – we handle that end-to-end, fixed price.

Thought it might be worth exploring.

Talk soon,
Saint & Story`;

  return validateOutreachMessage(body, "email", "email", Infinity, ctx, subject);
}

/**
 * STRATEGY 4: LinkedIn (profile + title)
 * Professional personal message with expertise positioning
 * NEW PSYCHOLOGY: "Here's what I do for companies like you"
 */
export function generateLinkedInMessage(
  ctx: OutreachContext
): OutreachMessage {
  const message = `Hi ${ctx.firstName},

Came across your profile – your background in ${ctx.description || "operations"} caught my attention.

I head logistics at Saint & Story. We work with ${ctx.businessType || "companies like yours"} on distribution and logistics.

Thought we could explore how we help teams like yours streamline that side.

Cheers,
Saint & Story`;

  return validateOutreachMessage(message, "linkedin", "linkedin", Infinity, ctx);
}

/**
 * STRATEGY 5: Generic (phone only)
 * Fallback one-liner for minimal data
 */
export function generateGenericMessage(
  ctx: OutreachContext
): OutreachMessage {
  const message = `Hi there, I head logistics for Saint & Story. We handle courier and moving services for UK businesses. Verified drivers, fixed price.`;

  return validateOutreachMessage(message, "generic", "sms", 180, ctx);
}

/**
 * UNIFIED VALIDATION: Psychology rules apply to ALL strategies
 */
function validateOutreachMessage(
  message: string,
  strategy: "ai_personalized" | "template" | "email" | "linkedin" | "generic",
  channel: "whatsapp" | "email" | "linkedin" | "sms",
  maxChars: number,
  ctx: OutreachContext,
  subject?: string
): OutreachMessage {
  const charCount = message.length;

  // Validate psychology rules (UNIVERSAL)
  const psychology = {
    acknowledgesContext: message.includes(ctx.groupName || ctx.company || "") || message.includes("Came across"),
    identifiesProblem:
      message.includes("logistics") ||
      message.includes("distribution") ||
      message.includes("shipping") ||
      message.includes("coordination"),
    introducesExpertise:
      message.includes("I head") ||
      message.includes("I handle") ||
      message.includes("Saint & Story"),
    noSalesPressure: !message.endsWith("?") && !message.includes("Worth a chat")
  };

  // Hard validation: MUST NOT have these
  const hasForbiddenText =
    message.includes("Worth a chat?") ||
    message.includes("Interested?") ||
    message.includes("Call me") ||
    message.includes("DM me") ||
    message.includes("Give me a call") ||
    message.includes("Let me know") ||
    message.includes("Could help") ||
    message.includes("Might help") ||
    message.endsWith("?");

  // Hard validation: MUST have these
  const hasExpertIntro = message.includes("I head") || message.includes("I handle");
  const hasBrandName = message.includes("Saint & Story");
  const underCharLimit = charCount <= maxChars;

  const isValid =
    !hasForbiddenText &&
    hasExpertIntro &&
    hasBrandName &&
    underCharLimit &&
    Object.values(psychology).every(v => v);

  return {
    message,
    charCount,
    strategy,
    channel,
    isValid,
    askPresent: message.includes("?"),
    questionMarkAtEnd: message.endsWith("?"),
    psychology
  };
}

/**
 * MAIN EXPORT: Auto-detect best strategy based on available data
 */
export async function generateOutreachMessage(
  ctx: OutreachContext
): Promise<OutreachMessage> {
  // Strategy selection logic (most specific to most generic)

  if (ctx.linkedinProfile && ctx.firstName) {
    // LinkedIn profile available → Use LinkedIn strategy
    return generateLinkedInMessage(ctx);
  } else if (ctx.email && ctx.company && ctx.firstName) {
    // Email + company available → Use Email strategy
    return generateEmailMessage(ctx);
  } else if (ctx.description && ctx.description.length > 10 && ctx.groupName && ctx.firstName) {
    // Full Facebook profile → Use AI Personalized
    return generateAIPersonalizedMessage(ctx);
  } else if (ctx.groupName && ctx.firstName) {
    // WhatsApp group + name → Use Template
    return generateTemplateMessage(ctx);
  } else if (ctx.phoneNumber || ctx.firstName) {
    // Minimal data → Use Generic
    return generateGenericMessage(ctx);
  } else {
    // Fallback
    return generateGenericMessage(ctx);
  }
}

/**
 * LEGACY: WhatsApp-specific export for backward compatibility
 * Routes to unified generator
 */
export interface WhatsAppMessageContext {
  firstName: string;
  groupName: string;
  description?: string;
  businessType?: string;
  maxChars?: number;
}

export interface WhatsAppMessage {
  message: string;
  charCount: number;
  strategy: "ai_personalized" | "template" | "generic";
  isValid: boolean;
  askPresent: boolean;
  questionMarkAtEnd: boolean;
}

export async function generateWhatsAppMessage(
  ctx: WhatsAppMessageContext
): Promise<WhatsAppMessage> {
  const result = await generateOutreachMessage({
    firstName: ctx.firstName,
    groupName: ctx.groupName,
    description: ctx.description,
    businessType: ctx.businessType,
    maxChars: ctx.maxChars
  });

  return {
    message: result.message,
    charCount: result.charCount,
    strategy: result.strategy as "ai_personalized" | "template" | "generic",
    isValid: result.isValid,
    askPresent: result.askPresent,
    questionMarkAtEnd: result.questionMarkAtEnd
  };
}
