/**
 * Question template library.
 *
 * Questions are indexed by pattern type.
 * For each pattern, return 2-3 template questions to ask.
 * No LLM. No generation. Pure templates.
 */

export const QUESTION_TEMPLATES: Record<string, string[]> = {
  "Wedding-related work mentioned": [
    "Do you supply standing flower arrangements to wedding venues that hold regular ceremonies?",
    "Would a weekly standing order for seasonal stems help you plan for wedding season?",
    "How many wedding orders do you typically handle each month?",
  ],

  "Seasonal occasions mentioned": [
    "How do you currently manage supply around high-demand seasonal periods like Valentine's Day or Christmas?",
    "Would a standing order arrangement help you plan stock for seasonal occasions in advance?",
    "Do you find yourself placing large, repeated orders around specific seasonal peaks?",
  ],

  "Owner mentioned by name or personal involvement noted": [
    "As an owner-run business, how much of your time is spent sourcing and ordering flowers each week?",
    "Would removing the logistics of weekly ordering free up time for the creative side of your work?",
    "Do you handle your own sourcing, or do you work with a supplier currently?",
  ],

  "Custom coordination or bespoke service mentioned": [
    "Do you regularly need specific, less common varieties to fulfil bespoke orders?",
    "Would a supplier relationship that accommodates custom stem requests be useful?",
    "How do you currently source unusual or speciality flowers for bespoke commissions?",
  ],

  "Last-minute or urgent requests handled": [
    "How often do you find yourself needing to source flowers at short notice?",
    "Do you have a reliable same-day or next-day supply option currently available?",
    "Would a standing arrangement with guaranteed short-notice fulfilment reduce stress?",
  ],
};

export function getQuestionsForPattern(
  patternType: string
): string[] {
  return QUESTION_TEMPLATES[patternType] || [];
}
