// UK phone number utilities for outreach
// Handles detection (mobile vs landline) and formatting for different channels

export function extractCoreNumber(phoneNumber: string): string | null {
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Must be exactly 10 digits (UK standard without country code)
  if (cleaned.length === 10) {
    const firstDigit = cleaned[0];
    // Valid UK prefix: 1, 2, 3, 7
    if (["1", "2", "3", "7"].includes(firstDigit)) {
      return cleaned;
    }
  }

  // Handle 11 digits with leading 0
  if (cleaned.length === 11 && cleaned[0] === "0") {
    const without0 = cleaned.slice(1);
    if (["1", "2", "3", "7"].includes(without0[0])) {
      return without0;
    }
  }

  // Handle +44 format (12 digits total: 44 + 10)
  if (cleaned.startsWith("44") && cleaned.length === 12) {
    return cleaned.slice(2);
  }

  return null;
}

export function detectPhoneType(phoneNumber: string): "mobile" | "landline" | "unknown" {
  const cleaned = phoneNumber.replace(/\D/g, "");

  // UK mobile: 07xxx (starts with 7, 11 digits with 0 prefix)
  if (cleaned.match(/^447\d{9}$/) || cleaned.match(/^07\d{9}$/)) {
    return "mobile";
  }

  // UK landline: 01/02/03xxx (10-11 digits)
  if (cleaned.match(/^44[0-3]\d{8,10}$/) || cleaned.match(/^0[1-3]\d{8,10}$/)) {
    return "landline";
  }

  return "unknown";
}

export function getPhonePlusFormat(phoneNumber: string): string {
  // Format for WhatsApp: +44...
  const core = extractCoreNumber(phoneNumber);
  if (!core) return phoneNumber;

  return `+44${core}`;
}

export function getPhone00Format(phoneNumber: string): string {
  // Format for VoIP: 0044...
  const core = extractCoreNumber(phoneNumber);
  if (!core) return phoneNumber;

  return `0044${core}`;
}

export function getPhoneLocalFormat(phoneNumber: string): string {
  // Format for display: 0...
  const core = extractCoreNumber(phoneNumber);
  if (!core) return phoneNumber;

  if (core.startsWith("7")) {
    // Mobile: 07xxx xxxx xxx
    return `07${core.slice(1)}`;
  } else {
    // Landline: 0[1-3]xxx xxxxx
    return `0${core}`;
  }
}
