interface EmailInput {
  companyName: string;
  contactName?: string;
  extractedNeed: string;
  briefUrl: string;
}

/**
 * Generate email using exact template from user.
 *
 * Template (LOCKED):
 * Hi [NAME],
 * A little birdie told me about [SPECIFIC PROBLEM].
 * Went ahead and made you a [DELIVERABLE TYPE]: [LINK]
 * [ONE PUNCHY LINE about driver availability / capability for their specific need]
 * Want me to build the full version? If not, keep this one.
 * [YOUR NAME]
 *
 * Dynamic content:
 * - Name: from contact
 * - Problem: from extracted need
 * - Deliverable type: specific to their need (Same-Day Courier Brief, etc.)
 * - Link: to their brief
 * - Punchy line: generated based on their specific situation
 */
export function generateOpportunityEmail(input: EmailInput): {
  subject: string;
  body: string;
} {
  const contactName = input.contactName || "there";
  const need = (input.extractedNeed || "reliable delivery support").toLowerCase();

  // Determine deliverable type based on need
  let deliverableType = "Courier Readiness Brief";
  if (need.includes("dedicated")) deliverableType = "Dedicated Driver Proposal";
  else if (need.includes("regular") || need.includes("collection")) deliverableType = "Regular Collections Brief";
  else if (need.includes("medical")) deliverableType = "Medical Logistics Brief";
  else if (need.includes("legal") || need.includes("document")) deliverableType = "Legal Courier Brief";

  // Generate punchy line about driver availability specific to their need
  const punchyLine = generatePunchyLine(need);

  // Subject: Simple, company-specific
  const subject = `${input.companyName} – Driver Availability`;

  // Email body (EXACT template structure)
  const body = `Hi ${contactName},

A little birdie told me about your need for ${need}.

Went ahead and made you a ${deliverableType}: ${input.briefUrl}

${punchyLine}

Want me to build the full version? If not, keep this one.

James`;

  return { subject, body };
}

function generatePunchyLine(need: string): string {
  const needLower = need.toLowerCase();

  if (needLower.includes("deadline") || needLower.includes("legal") || needLower.includes("document")) {
    return "We have drivers ready to handle time-critical deliveries without the stress.";
  }

  if (needLower.includes("same-day") || needLower.includes("urgent")) {
    return "We have drivers on standby who specialise in urgent, same-day operations.";
  }

  if (needLower.includes("regular") || needLower.includes("collection")) {
    return "We have drivers who can handle your regular collections on a recurring basis.";
  }

  if (needLower.includes("dedicated")) {
    return "We have dedicated drivers available to become part of your operations.";
  }

  if (needLower.includes("medical") || needLower.includes("pharmacy")) {
    return "We have drivers trained for medical and pharmacy deliveries with proper handling.";
  }

  return "We have drivers ready to solve your specific logistics challenge.";
}
