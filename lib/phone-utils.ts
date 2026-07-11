/**
 * Phone Number Utilities - HOLISTIC
 * Robust UK phone handling with validation, corruption detection, and multiple output formats
 */

/**
 * Extract core UK number from any format
 * Handles: 07711007373, 07711 007373, +447711007373, 00447711007373, 447711007373
 * Returns: 07711007373 (clean local format, 11 digits starting with 0)
 * REJECTS corrupted data like 04771100737 or 0477110737
 */
function extractCoreNumber(phone: string): string {
  if (!phone) return "";

  // Remove all spaces, dashes, parentheses, dots
  let cleaned = phone.replace(/[\s\-()\.]/g, "");

  // Strip country codes to get to core number
  if (cleaned.startsWith("+44")) {
    cleaned = cleaned.substring(3); // +447711007373 → 7711007373
  } else if (cleaned.startsWith("0044")) {
    cleaned = cleaned.substring(4); // 00447711007373 → 7711007373
  } else if (cleaned.startsWith("44")) {
    cleaned = cleaned.substring(2); // 447711007373 → 7711007373
  } else if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1); // 07711007373 → 7711007373
  }

  // At this point we have just the digits (e.g., 7711007373)
  // Validate it's 10 digits (UK number without leading 0)
  if (!/^\d{10}$/.test(cleaned)) {
    console.warn(`[PHONE] Rejected corrupted UK number: "${phone}" (got "${cleaned}", need exactly 10 digits)`);
    return ""; // Return empty to signal invalid
  }

  // Validate it starts with valid UK prefixes (7 for mobile, 1-3 for landline)
  const firstDigit = cleaned.charAt(0);
  if (!["1", "2", "3", "7"].includes(firstDigit)) {
    console.warn(`[PHONE] Rejected invalid UK prefix: "${phone}" (first digit after country code: ${firstDigit})`);
    return ""; // Not a valid UK number
  }

  // Return with leading 0 (local format)
  return "0" + cleaned;
}

/**
 * Get phone in +44 format (for WhatsApp URL schemes)
 */
export function getPhonePlusFormat(phone: string): string {
  const core = extractCoreNumber(phone);
  if (!core) return "";
  // 07711007373 → +447711007373
  return "+" + "44" + core.substring(1);
}

/**
 * Get phone in 00 format (for VoIP/MobileVOIP)
 */
export function getPhone00Format(phone: string): string {
  const core = extractCoreNumber(phone);
  if (!core) return "";
  // 07711007373 → 00447711007373
  return "00" + "44" + core.substring(1);
}

/**
 * Get phone in local format (for display: 07711 007373)
 */
export function getPhoneLocalFormat(phone: string): string {
  const core = extractCoreNumber(phone);
  if (!core) return "";
  // 07711007373 → 07711 007373 (for mobile: 5+6 digits after 0)
  // 01234567890 → 01234 567890 (for landline: 4+3+4 digits)
  if (core.startsWith("07")) {
    return core.replace(/^(\d{5})(\d{6})$/, "$1 $2");
  }
  if (core.startsWith("0")) {
    return core.replace(/^(\d{5})(\d{6})$/, "$1 $2");
  }
  return core;
}

/**
 * Detect phone type: mobile (07xxx) or landline (01/02/03xxx)
 */
export function detectPhoneType(phone: string): "mobile" | "landline" | "unknown" {
  const core = extractCoreNumber(phone);
  if (!core) return "unknown";

  if (core.startsWith("07")) return "mobile";
  if (core.match(/^0[1-3]/)) return "landline";
  return "unknown";
}

/**
 * Legacy functions for backwards compatibility
 */
export function normalizePhoneToInternational(phone: string, format: "+" | "00" = "+"): string {
  return format === "+" ? getPhonePlusFormat(phone) : getPhone00Format(phone);
}

export function normalizePhoneToLocal(phone: string): string {
  return getPhoneLocalFormat(phone);
}

export function normalizePhoneTo00(phone: string): string {
  return getPhone00Format(phone);
}

export function formatPhoneForDisplay(phone: string): string {
  return getPhoneLocalFormat(phone);
}
