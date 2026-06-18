/**
 * Adaptive Hypothesis Email Generator (Single Generator)
 *
 * Generates pressure-specific, human-feeling hypothesis validation emails.
 * No rigid templates. No marketing language. No sales claims.
 *
 * Structure:
 * [Industry observation]
 * → [Operational friction hypothesis]
 * → [Human observation sentence]
 * → [Soft validation question]
 * → [YES/MAYBE/NO token links]
 *
 * Design: Feels like someone who understands your world asking if they got it right.
 */

export interface HypothesisEmailInput {
  businessName: string;
  businessCategory: string;
  location?: string | null;
  pressureType: string;
  observation: string; // From PressureScenario
  validationQuestion: string; // From PressureScenario
}

export interface HypothesisEmailOutput {
  subject: string;
  body: string;
  htmlBody: string;
}

/**
 * Generate subject line from industry + pressure type
 * Conversational, not salesy
 */
function generateSubject(
  businessName: string,
  pressureType: string
): string {
  const firstName = businessName.split(" ")[0];

  // Keep it simple and human-sounding
  return `Question about ${pressureType.toLowerCase()} at ${firstName}`;
}

/**
 * Generate email body from hypothesis components
 * Structures: observation → implication → validation question
 */
function generateEmailBody(input: HypothesisEmailInput): string {
  const { observation, validationQuestion, location } = input;

  const locationPhrase = location ? ` in ${location}` : "";

  return `Hi,

I've been looking at how${locationPhrase} operations like yours handle ${input.pressureType.toLowerCase()}.

${observation}

${validationQuestion}

Yes / Maybe / No`;
}

/**
 * Generate HTML email body with button links for YES/MAYBE/NO
 */
function generateHTMLEmailBody(
  input: HypothesisEmailInput,
  yesLink: string,
  maybeLink: string,
  noLink: string
): string {
  const body = generateEmailBody(input);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 8px; }
    .body-text { font-size: 16px; color: #222; line-height: 1.7; margin-bottom: 30px; white-space: pre-wrap; }
    .button-group { display: flex; gap: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
    .button { display: inline-block; padding: 14px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; text-align: center; flex: 1; transition: opacity 0.2s; }
    .button-yes { background: #10b981; color: white; }
    .button-yes:hover { opacity: 0.9; }
    .button-maybe { background: #f59e0b; color: white; }
    .button-maybe:hover { opacity: 0.9; }
    .button-no { background: #ef4444; color: white; }
    .button-no:hover { opacity: 0.9; }
    .footer { font-size: 12px; color: #888; border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="body-text">${body.split("\n").slice(0, -3).join("\n")}</div>

    <div class="button-group">
      <a href="${yesLink}" class="button button-yes">YES</a>
      <a href="${maybeLink}" class="button button-maybe">MAYBE</a>
      <a href="${noLink}" class="button button-no">NO</a>
    </div>

    <div class="footer">
      <p>Saint & Story Ltd</p>
      <p>No pressure. Only reply if interested.</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Main generator: Create hypothesis validation email
 */
export function generateHypothesisEmail(
  input: HypothesisEmailInput,
  responseLinks?: {
    yesLink: string;
    maybeLink: string;
    noLink: string;
  }
): HypothesisEmailOutput {
  const subject = generateSubject(input.businessName, input.pressureType);
  const body = generateEmailBody(input);

  const htmlBody = responseLinks
    ? generateHTMLEmailBody(input, responseLinks.yesLink, responseLinks.maybeLink, responseLinks.noLink)
    : generateHTMLEmailBody(input, "#", "#", "#");

  return {
    subject,
    body,
    htmlBody,
  };
}
