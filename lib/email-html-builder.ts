/**
 * Build PREMIUM HTML email - Apple-level design
 * Sleek, clean, minimal, elegant. Brand colors and typography.
 */
export function buildEmailHtml(
  email: {
    prospectName: string;
    body: string;
    subject?: string;
    prePopulatedReply?: string;
  },
  sender: { name: string; email: string; role?: string }
): string {
  const websiteUrl = "https://saintandstoryltd.co.uk";
  const logoUrl = "https://saintandstoryltd.co.uk/logo-mark.svg";

  // Parse body: split into paragraphs
  const paragraphs = email.body
    .split("\n\n")
    .map(p => p.trim())
    .filter(p => p.length > 0);

  // Extract name and role from last lines
  const lastTwoParagraphs = paragraphs.slice(-2);
  const senderNameFromBody = lastTwoParagraphs[0] || "James";
  const senderRoleFromBody = lastTwoParagraphs[1] || "";

  // Main content: everything except last 2 paragraphs
  const contentParagraphs = paragraphs.slice(0, -2);

  // Build pre-populated reply
  const replyText = email.prePopulatedReply || "Let's talk about this.";
  const replyEmailBody = `Hi ${senderNameFromBody},%0D%0A%0D%0A${encodeURIComponent(replyText)}%0D%0A%0D%0AThanks,%0D%0A[Your Name]`;
  const replyLink = `mailto:${sender.email}?subject=Re:%20${encodeURIComponent(email.prospectName)}&body=${replyEmailBody}`;

  // Format content paragraphs with proper HTML
  const contentHtml = contentParagraphs
    .map(p => `<p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.65; color: #1d1d1d; font-weight: 400;">${p}</p>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
      background: #ffffff;
      color: #1d1d1d;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      padding: 40px 24px;
      background: #ffffff;
    }
    .content {
      margin-bottom: 40px;
    }
    .cta-button {
      display: inline-block;
      padding: 12px 32px;
      background: #0d0d0d;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s;
      margin-right: 12px;
    }
    .cta-button:hover {
      background: #2d2d2d;
    }
    .website-link {
      display: inline-block;
      padding: 8px 0;
      color: #0d0d0d;
      text-decoration: none;
      font-size: 13px;
      border-bottom: 1px solid #0d0d0d;
      transition: opacity 0.2s;
    }
    .website-link:hover {
      opacity: 0.7;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      ${contentHtml}
    </div>

    <div style="margin-top: 24px; padding-top: 0;">
      <p style="margin: 0 0 4px 0; font-size: 15px; line-height: 1.65; color: #1d1d1d; font-weight: 400;">${senderNameFromBody}</p>
      ${senderRoleFromBody ? `<p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.65; color: #666666; font-weight: 400;">${senderRoleFromBody}</p>` : '<p style="margin: 0 0 24px 0;"></p>'}

      <div style="margin-top: 24px;">
        <a href="${replyLink}" class="cta-button">Reply</a>
      </div>

      <div style="margin-top: 20px;">
        <a href="${websiteUrl}" class="website-link">Check out our website</a>
      </div>
    </div>
  </div>
</body>
</html>`;
}
