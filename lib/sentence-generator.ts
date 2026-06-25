/**
 * SENTENCE GENERATOR
 *
 * Generates high-PD sentences: show, don't tell. Simple. Short. Real.
 *
 * Principles:
 * - No claims. No explanation. No flowery language.
 * - Specific observation. Everyday language. One idea per sentence.
 * - Show behavior. Trust through action, not words.
 * - Reader draws conclusions themselves.
 * - Short sentences. Human voice.
 */

/**
 * Generate industry-specific recognition sentence
 * "Shows" what they're experiencing, doesn't explain it
 */
export function generateRecognitionSentence(
  industry: string,
  location: string
): string {
  const recognition: Record<string, Record<string, string>> = {
    "law-firm": {
      London: "Your partners drive to the Old Bailey themselves.",
      default: "You personally deliver urgent filings sometimes.",
    },
    ecommerce: {
      London: "October hits. Your courier can't keep up.",
      default: "Black Friday crushes your main courier's capacity.",
    },
    healthcare: {
      London: "Temperature-controlled deliveries are time-sensitive.",
      default: "You need medication same-day sometimes.",
    },
    manufacturing: {
      London: "Your production line waits for parts.",
      default: "Delayed parts cost you money per hour.",
    },
    logistics: {
      London: "Thursdays your routes are full by noon.",
      default: "You turn down work when capacity maxes.",
    },
    retail: {
      London: "Monday mornings your stores text about stock gaps.",
      default: "You run short on supplies during peak weeks.",
    },
    restaurant: {
      London: "Friday night supplies sometimes don't arrive.",
      default: "You've improvised a menu because delivery was late.",
    },
    "professional-services": {
      London: "Client deadlines push your delivery timeline.",
      default: "You personally deliver reports to meet deadlines.",
    },
    catering: {
      London: "Hot food arrives lukewarm on long London routes.",
      default: "Temperature matters when you're delivering food.",
    },
    florist: {
      London: "Valentine's orders need same-day London delivery.",
      default: "Fresh flowers wilt if delivery takes too long.",
    },
    construction: {
      London: "Your M25 commute delays material pickups.",
      default: "Job sites wait for materials to arrive.",
    },
    bakery: {
      London: "3am bakes need flour by 2am.",
      default: "Ingredient timing controls your production.",
    },
    "coffee-shop": {
      London: "Monday mornings specialty beans are low.",
      default: "Peak hours run you short on premium supplies.",
    },
    hotel: {
      London: "Guest complaints mention late room service.",
      default: "Room service arrives cold sometimes.",
    },
    dental: {
      London: "Crown work from the lab gets tight.",
      default: "Dental lab delays affect patient commitments.",
    },
  };

  const industryMap = recognition[industry.toLowerCase()] || recognition["default"] || {};
  const locationKey = location.toLowerCase().includes("london") ? "London" : "default";

  return industryMap[locationKey] || industryMap["default"] || "You've experienced delivery delays.";
}

/**
 * Generate permission line from behavioral patterns
 * Gives permission to ignore if they don't have the problem
 */
export function generatePermissionSentence(
  industry: string,
  location: string
): string {
  const permissions: Record<string, Record<string, string>> = {
    "law-firm": {
      London: "If partners haven't driven to the Old Bailey this month, stop reading.",
      default: "If you've never personally delivered an urgent filing, skip this.",
    },
    ecommerce: {
      London: "If Black Friday doesn't stretch your courier, ignore this.",
      default: "If peak season never maxes your main courier, you're covered.",
    },
    healthcare: {
      London: "If temperature-controlled delivery isn't time-critical, this won't help.",
      default: "If medication timing never impacts patient care, stop here.",
    },
    manufacturing: {
      London: "If your production line never waits for parts, you don't need us.",
      default: "If delayed materials never sit idle in your shop, skip this.",
    },
    logistics: {
      London: "If your Thursday routes have spare capacity, you're all set.",
      default: "If you never turn down work, you don't need overflow help.",
    },
    retail: {
      London: "If your store managers never text about stock gaps, ignore this.",
      default: "If supply delays never hit during peak weeks, you're fine.",
    },
    restaurant: {
      London: "If Friday night deliveries never fail you, keep doing what you're doing.",
      default: "If you've never improvised a menu, your suppliers are perfect.",
    },
    "professional-services": {
      London: "If clients never push your delivery deadlines, stop reading.",
      default: "If you never personally deliver reports, you're handling it fine.",
    },
    catering: {
      London: "If hot food always arrives hot across London, you're sorted.",
      default: "If food arrives at the right temperature, you're good.",
    },
    florist: {
      London: "If Valentine's orders never need same-day London delivery, skip this.",
      default: "If flowers never wilt during transport, you're fine.",
    },
    construction: {
      London: "If material pickups never get delayed on the M25, you don't need us.",
      default: "If job sites never wait for delivery, you're all set.",
    },
    bakery: {
      London: "If flour always arrives by 2am for 3am bakes, ignore this.",
      default: "If ingredients always arrive on time, your supplier is perfect.",
    },
    "coffee-shop": {
      London: "If specialty beans never run low on Monday mornings, skip this.",
      default: "If peak hours never stretch your supply, you're covered.",
    },
    hotel: {
      London: "If guest complaints never mention late delivery, you're fine.",
      default: "If room service never arrives cold, you're doing well.",
    },
    dental: {
      London: "If lab work never gets tight on patient commitments, stop reading.",
      default: "If crown timing never affects scheduling, you're all set.",
    },
  };

  const industryMap = permissions[industry.toLowerCase()] || permissions["default"] || {};
  const locationKey = location.toLowerCase().includes("london") ? "London" : "default";

  return industryMap[locationKey] || industryMap["default"] || "If you're already happy with your logistics, ignore this.";
}

/**
 * Generate trust signal through action, not claims
 * Shows what we do, not why we're good
 */
export function generateTrustSignal(industry: string, location: string): string {
  const signals: Record<string, string> = {
    "law-firm": "We pick up urgent documents Friday nights. Deliver Saturday morning.",
    ecommerce: "We handle October overflow. That's our only job.",
    healthcare: "Temperature stays controlled. Arrives on time.",
    manufacturing: "We fill your gaps. Parts arrive when you need them.",
    logistics: "We take your Thursday overflow. You keep your schedule.",
    retail: "We deliver Monday mornings. Stores stock on time.",
    restaurant: "We arrive Friday nights. Food stays hot.",
    "professional-services": "We deliver client reports. They arrive on deadline.",
    catering: "We keep food temperature-controlled. Arrives perfect.",
    florist: "We deliver same-day London. Flowers stay fresh.",
    construction: "We pick up materials. Job sites don't wait.",
    bakery: "Flour arrives 2am. You bake on schedule.",
    "coffee-shop": "We restock Monday mornings. No shortage.",
    hotel: "Room service arrives hot. Guests stay happy.",
    dental: "Lab work arrives on time. Patients stay scheduled.",
  };

  return (
    signals[industry.toLowerCase()] ||
    "We handle what your main courier can't. That's it."
  );
}

/**
 * Generate CTA - simple, binary, forces response
 */
export function generateCTA(stage: number): string {
  if (stage === 1) {
    return "Yes, maybe, or no?";
  } else if (stage === 2) {
    return "When do you want to test it?";
  } else if (stage === 3) {
    return "Ready for that first delivery?";
  } else {
    return "What's next for you?";
  }
}

/**
 * Combine into email body
 * Permission → Recognition → Trust Signal → CTA
 * Each line shows something. No explanation.
 */
export function buildEmailBody(
  industry: string,
  location: string,
  stage: number,
  senderName: string = "{{senderName}}"
): string {
  const lines: string[] = [];

  // Stage 1: Permission line
  if (stage === 1) {
    lines.push(generatePermissionSentence(industry, location));
    lines.push(""); // Blank line
  }

  // Recognition: What they experience
  lines.push(generateRecognitionSentence(industry, location));
  lines.push(""); // Blank line

  // Trust: What we do
  lines.push(generateTrustSignal(industry, location));
  lines.push(""); // Blank line

  // CTA: Binary response
  lines.push(generateCTA(stage));
  lines.push("");
  lines.push("Best,");
  lines.push(senderName);
  lines.push("Saint & Story");

  return lines.join("\n");
}

/**
 * Calculate true PD score for a sentence
 * Based on how many psychological functions it performs
 */
export function calculateSentencePD(sentence: string): number {
  let functions = 0;

  // Specific detail (timestamp, number, name)
  if (/\d+|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Old Bailey|M25/.test(sentence)) {
    functions++; // Creates credibility through specificity
  }

  // Active voice, concrete action
  if (/arrive|deliver|wait|sit|text|improvise|drive|pick|handle/.test(sentence)) {
    functions++; // Shows behavior, not claims
  }

  // You/Your - relevance
  if (/you|your/.test(sentence)) {
    functions++; // Builds relevance
  }

  // Negative/permission structure
  if (/if|don't|never|skip|stop|ignore/.test(sentence)) {
    functions++; // Grants permission, removes pressure
  }

  // Short, punchy (under 15 words)
  if (sentence.split(" ").length < 15) {
    functions++; // Creates emphasis through brevity
  }

  // Emotional reality
  if (/late|wait|run|short|crunch|fail|improvise/.test(sentence)) {
    functions++; // Triggers recognition
  }

  // Question or imperative
  if (/\?|or/.test(sentence)) {
    functions++; // Invites response, forces decision
  }

  // Simple language (no corporate jargon)
  if (!/optimize|leverage|synergy|stakeholder|ecosystem/.test(sentence)) {
    functions++; // Human voice
  }

  return Math.min(functions, 8);
}
