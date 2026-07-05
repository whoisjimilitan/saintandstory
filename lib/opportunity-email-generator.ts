interface EmailInput {
  companyName: string;
  contactName?: string;
  extractedNeed: string;
  briefUrl: string;
}

/**
 * Generate 5-sentence Opportunity Feed email.
 *
 * Structure (LOCKED):
 * 1. "A little birdie pointed me toward..." (acknowledgement of public statement)
 * 2. "I went ahead and prepared..." (action taken)
 * 3. "Hopefully it saves you a little thinking..." (inverse incentive)
 * 4. "If you'd like us to turn it into..." (clear CTA)
 * 5. "James" (personal signature)
 *
 * Each email is unique based on extracted need.
 * No marketing language. Authentic. Direct.
 */
export function generateOpportunityEmail(input: EmailInput): {
  subject: string;
  body: string;
} {
  const contactName = input.contactName || "there";
  const need = input.extractedNeed || "reliable delivery support";

  // Subject: Company-specific, acknowledging the need
  const subject = `Re: Your need for ${need}`;

  // 5-sentence body (LOCKED structure, dynamic content)
  const body = `Hi ${contactName},

A little birdie pointed me toward your need for ${need}.

I went ahead and prepared a Courier Readiness Brief based on what you described.

Hopefully it saves you a little thinking whether you use us or not.

If you'd like us to turn it into a working delivery setup, just reply.

James`;

  return { subject, body };
}
