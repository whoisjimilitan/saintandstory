/**
 * Phone Number Utilities
 * Handles UK phone number normalization for WhatsApp, VoIP, and logging
 */

/**
 * Normalize UK phone number to international format (+44XXXXXXXXX or 0044XXXXXXXXX)
 * Accepts multiple input formats and converts to consistent format
 * Handles corrupted input and validates length
 */
export function normalizePhoneToInternational(phone: string, format: "+" | "00" = "+"): string {
  if (!phone) return "";

  // Remove all whitespace, dashes, parentheses
  let cleaned = phone.replace(/[\s\-()]/g, "");

  // Handle leading country codes
  if (cleaned.startsWith("+44")) {
    cleaned = "44" + cleaned.substring(3); // Remove + if present
  } else if (cleaned.startsWith("0044")) {
    cleaned = cleaned.substring(2); // Remove first 00, keep 44
  } else if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1); // Remove other country codes
  }

  // Convert UK local format (starting with 0) to international
  // But first check if it's actually a valid 11-digit UK number
  if (cleaned.startsWith("0")) {
    // Common corruption: spacing issues like "0477 110 07373"
    // Try to detect and fix if it's a malformed mobile number
    const digits = cleaned.substring(1); // Remove leading 0

    // If we have a digit that looks like a duplicate, it might be corrupted
    // E.g., "477 110 07373" = malformed "7711 007373"
    // Check if removing the first digit fixes it
    if (digits.length === 10 && digits.startsWith("4")) {
      // Might be "0477..." which is actually "07..." with a doubled 4
      const possibleFix = "07" + digits.substring(1);
      if (possibleFix.match(/^07\d{9}$/)) {
        cleaned = "44" + possibleFix.substring(1);
        console.log(`[PHONE] Auto-corrected possible corruption: 0${digits} → ${possibleFix} → 44${possibleFix.substring(1)}`);
      } else {
        cleaned = "44" + digits;
      }
    } else {
      cleaned = "44" + digits;
    }
  }

  // Validate: should be 12 digits (44 + 10-digit UK number)
  if (!/^44\d{10,11}$/.test(cleaned)) {
    console.warn(`[PHONE] Invalid format after normalization: ${cleaned} (input was: ${phone})`);
  }

  // Add prefix
  return format === "+" ? "+" + cleaned : "00" + cleaned;
}

/**
 * Normalize UK phone number to local format (07xxxxxxxxx or 01xxxxxxxxx)
 * Used for display and some VoIP systems
 */
export function normalizePhoneToLocal(phone: string): string {
  if (!phone) return "";

  // Get international format first
  const intl = normalizePhoneToInternational(phone);

  // Convert +447 → 07
  if (intl.startsWith("+447")) {
    return "0" + intl.substring(2);
  }

  // Convert +441 → 01
  if (intl.startsWith("+441")) {
    return "0" + intl.substring(2);
  }

  // Already in local format or unknown
  return intl.replace("+44", "0");
}

/**
 * Detect if UK phone is mobile (07xxx) or landline (01/02/03xxx)
 * Direct detection - don't rely on normalization chain
 */
export function detectPhoneType(phone: string): "mobile" | "landline" | "unknown" {
  if (!phone) return "unknown";

  // Clean the phone - just remove spaces and special chars
  const cleaned = phone.replace(/[\s\-()]/g, "");

  // Remove any + or 00 prefix to get to the core number
  let core = cleaned;
  if (core.startsWith("+44")) {
    core = "0" + core.substring(3); // +447711007373 → 07711007373
  } else if (core.startsWith("0044")) {
    core = "0" + core.substring(4); // 00447711007373 → 07711007373
  } else if (core.startsWith("44")) {
    core = "0" + core.substring(2); // 447711007373 → 07711007373
  }

  console.log(`[DETECT] Input: "${phone}" → Cleaned: "${cleaned}" → Core: "${core}"`);

  // Mobile: 07xxx (11 digits total: 0 + 7 + 9 more)
  if (core.match(/^07\d{9}$/)) {
    console.log(`[DETECT] ✓ MOBILE detected`);
    return "mobile";
  }

  // Landline: 01/02/03xxx (10-11 digits: 0 + [1-3] + 8-10 more)
  if (core.match(/^0[1-3]\d{8,10}$/)) {
    console.log(`[DETECT] ✓ LANDLINE detected`);
    return "landline";
  }

  console.log(`[DETECT] ✗ UNKNOWN format`);
  return "unknown";
}

/**
 * Normalize to 00 prefix format (0044XXXXXXXXX)
 * Used for some VoIP systems that prefer 00 over +
 */
export function normalizePhoneTo00(phone: string): string {
  return normalizePhoneToInternational(phone, "00").replace(/^00/, "00");
}

/**
 * Format phone for display (human-readable)
 * Example: 07711 007373
 */
export function formatPhoneForDisplay(phone: string): string {
  const normalized = normalizePhoneToLocal(phone);

  if (normalized.match(/^07\d{9}$/)) {
    // Mobile: 07711 007373
    return normalized.replace(/(\d{4})(\d{6})/, "$1 $2");
  }

  if (normalized.match(/^0\d{4}\d{6,7}$/)) {
    // Landline: 0123 456 7890
    return normalized.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
  }

  return normalized;
}
