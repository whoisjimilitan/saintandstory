/**
 * Phone Number Utilities
 * Handles UK phone number normalization for WhatsApp, VoIP, and logging
 */

/**
 * Normalize UK phone number to international format (+44XXXXXXXXX)
 * Accepts multiple input formats and converts to consistent +44 format
 */
export function normalizePhoneToInternational(phone: string): string {
  if (!phone) return "";

  // Remove all whitespace, dashes, parentheses
  let cleaned = phone.replace(/[\s\-()]/g, "");

  // Remove leading + if present (will re-add later)
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }

  // Convert UK local format to international
  // 07xxx → 447xxx
  if (cleaned.startsWith("0")) {
    cleaned = "44" + cleaned.substring(1);
  }

  // Add + prefix
  return "+" + cleaned;
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
 */
export function detectPhoneType(phone: string): "mobile" | "landline" | "unknown" {
  const normalized = normalizePhoneToLocal(phone);

  // Mobile: 07xxx
  if (normalized.match(/^07\d{9}$/)) {
    return "mobile";
  }

  // Landline: 01/02/03xxx
  if (normalized.match(/^0[1-3]\d{8,10}$/)) {
    return "landline";
  }

  return "unknown";
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
