interface BriefInput {
  companyName: string;
  extractedNeed: string;
  extractedContext: string;
  extractedQuote: string;
  extractedUrgency: string;
}

/**
 * Generate a one-page Courier Readiness Brief showing understanding of prospect needs.
 * Template-based (no API calls needed).
 * Shows operational understanding, not marketing language.
 */
export async function generateCourierReadinessBrief(
  input: BriefInput
): Promise<string> {
  // Ensure all fields have default values
  const companyName = input.companyName || "Your Business";
  const extractedNeed = input.extractedNeed || "same-day delivery services";
  const extractedContext = input.extractedContext || "business operations";
  const extractedQuote = input.extractedQuote || "we need reliable delivery support";
  const extractedUrgency = input.extractedUrgency || "Medium";

  const today = new Date().toLocaleDateString("en-UK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const operationalApproaches = getOperationalApproaches(extractedNeed, extractedContext);
  const businessImpact = getBusinessImpact(extractedNeed, extractedUrgency);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Courier Readiness Brief - ${input.companyName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: #ffffff;
      padding: 40px;
    }
    .container { max-width: 700px; margin: 0 auto; }
    .header {
      border-bottom: 2px solid #0d0d0d;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .company-name {
      font-size: 24px;
      font-weight: 700;
      color: #0d0d0d;
      margin-bottom: 8px;
    }
    .date { font-size: 12px; color: #666666; }
    .section {
      margin-bottom: 32px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #0d0d0d;
      margin-bottom: 12px;
    }
    .section-content {
      font-size: 14px;
      line-height: 1.7;
      color: #333333;
    }
    .quote {
      font-style: italic;
      color: #666666;
      margin: 12px 0;
      padding-left: 12px;
      border-left: 3px solid #0d0d0d;
    }
    ul {
      list-style: none;
      margin: 12px 0;
    }
    li {
      margin: 8px 0;
      padding-left: 20px;
      position: relative;
    }
    li:before {
      content: "→";
      position: absolute;
      left: 0;
      color: #0d0d0d;
    }
    .footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 24px;
      margin-top: 40px;
      font-size: 13px;
      color: #666666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="company-name">${escapeHtml(companyName)}</div>
      <div class="date">${today}</div>
    </div>

    <div class="section">
      <div class="section-title">Your Stated Need</div>
      <div class="section-content">
        <div class="quote">"${escapeHtml(extractedQuote)}"</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">What This Means</div>
      <div class="section-content">
        ${escapeHtml(extractedContext)}. This is time-critical and directly impacts operations.
      </div>
    </div>

    <div class="section">
      <div class="section-title">How We'd Approach It</div>
      <div class="section-content">
        <ul>
${operationalApproaches.map((approach) => `          <li>${escapeHtml(approach)}</li>`).join("\n")}
        </ul>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Why This Matters</div>
      <div class="section-content">
        ${escapeHtml(businessImpact)}
      </div>
    </div>

    <div class="footer">
      Questions? james@saintandstory.co.uk
    </div>
  </div>
</body>
</html>`;

  return html;
}

function escapeHtml(text: string): string {
  // Server-side HTML escaping (no document API available)
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

function getOperationalApproaches(need: string | null, context: string | null): string[] {
  const needLower = (need || "").toLowerCase();

  // Legal/deadline-critical
  if (
    needLower.includes("document") ||
    needLower.includes("deadline") ||
    needLower.includes("court") ||
    needLower.includes("legal")
  ) {
    return [
      "Same-day collection from your offices with proof of receipt",
      "Dedicated driver assigned to time-sensitive deliveries",
      "Real-time tracking so you always know exact location",
      "Backup transport on standby for critical deadlines",
      "Direct communication channel for urgent priority changes",
    ];
  }

  // Estate/completion related
  if (needLower.includes("completion") || needLower.includes("estate") || needLower.includes("sale")) {
    return [
      "Coordinated pickup and delivery to meet completion deadlines",
      "Flexible timing around solicitor and buyer schedules",
      "Secure transport with proof of delivery signed by recipient",
      "Weekend and out-of-hours availability for urgent closures",
      "Single point of contact who understands the deal timeline",
    ];
  }

  // Healthcare/urgent
  if (
    needLower.includes("prescription") ||
    needLower.includes("urgent") ||
    needLower.includes("hospital") ||
    needLower.includes("medical")
  ) {
    return [
      "Express delivery with temperature-controlled transport if needed",
      "Dedicated drivers trained in handling sensitive materials",
      "Real-time notifications at each stage of the journey",
      "Priority queuing for time-critical collections",
      "Direct coordination with your dispatch team",
    ];
  }

  // Default
  return [
    "Same-day collection and delivery within service area",
    "Real-time tracking with direct driver communication",
    "Flexible scheduling around your operational needs",
    "Dedicated account support for consistent service",
    "Reliable backup coverage for peak demand periods",
  ];
}

function getBusinessImpact(need: string | null, urgency: string | null): string {
  const needLower = (need || "").toLowerCase();
  const urgencyLevel = (urgency || "medium").toLowerCase();

  if (needLower.includes("deadline")) {
    return "Missed deadlines damage client relationships and create operational friction. Reliable transport removes this variable from your planning.";
  }

  if (needLower.includes("completion")) {
    return "Deal delays cascade across all parties. Same-day certainty means your team focuses on closing, not logistics.";
  }

  if (needLower.includes("urgent")) {
    return "When urgent needs arise, having a trusted transport partner means you respond immediately instead of scrambling for options.";
  }

  return "Operational certainty reduces friction, improves client confidence, and lets your team focus on what matters: delivering your core service.";
}

export function generateBriefDownloadUrl(briefHtml: string, companyName: string): string {
  const encoded = encodeURIComponent(briefHtml);
  return `data:text/html;charset=utf-8,${encoded}`;
}
