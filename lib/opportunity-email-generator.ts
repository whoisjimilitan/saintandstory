interface EmailInput {
  contactName: string;
  extractedNeed: string;
  briefUrl: string;
}

export function generateOpportunityEmail(input: EmailInput): {
  subject: string;
  body: string;
} {
  const subject = input.contactName || "A prospect brief for your business";

  const body = `Hi ${input.contactName || "there"},

A little birdie told me you're looking for ${input.extractedNeed}.

I went ahead and prepared a one-page Courier Readiness Brief based on what you described.

It outlines how we'd handle that type of work before you spend time explaining everything.

Here's the link. ${input.briefUrl}

If it's useful, great. If not, keep it anyway.

James`;

  return {
    subject,
    body,
  };
}

export function validateEmailStructure(body: string): boolean {
  const hasBirdie = body.includes("A little birdie told me");
  const hasWentAhead = body.includes("I went ahead and prepared");
  const hasOutlines = body.includes("It outlines");
  const hasLink = body.includes("Here's the link");
  const hasKeepIt = body.includes("If it's useful, great. If not, keep it anyway");

  return hasBirdie && hasWentAhead && hasOutlines && hasLink && hasKeepIt;
}
