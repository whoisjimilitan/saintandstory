/**
 * Build premium HTML email with Saint & Story branding
 */
export function buildEmailHtml(
  email: {
    prospectName: string;
    body: string;
    subject?: string;
  },
  sender: { name: string; email: string; role?: string }
): string {
  // Use phone based on email domain
  const senderPhone = sender.email.includes("james@") ? "+44 20 3318 1234" : "+44 20 3318 5678";
  const senderAddress = "Saint & Story, London, UK";
  const websiteUrl = "https://saintandstoryltd.co.uk";
  const logoUrl = "https://saintandstoryltd.co.uk/logo-mark.svg";

  // Parse body to separate main content from signature
  const lines = email.body.split("\n");

  // Get non-empty lines from the end
  const nonEmptyLines = lines.filter(l => l.trim());
  const companyNameFromBody = nonEmptyLines[nonEmptyLines.length - 1] || "Saint & Story";
  const senderNameFromBody = nonEmptyLines[nonEmptyLines.length - 2] || "James";

  // Main content is everything except the last 2 non-empty lines
  const mainContent = lines.slice(0, -3).join("\n").trim();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
      color: #0D0D0D;
      line-height: 1.65;
      background: #FFFFFF;
    }
    .wrapper { background: #FFFFFF; }
    .container {
      max-width: 580px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 1px solid #E8E8E8;
    }
    .logo {
      display: inline-block;
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
    }
    .content {
      margin-bottom: 32px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 20px;
      color: #0D0D0D;
    }
    .body-text {
      font-size: 15px;
      line-height: 1.7;
      color: #333333;
      white-space: pre-wrap;
      word-wrap: break-word;
      margin-bottom: 0;
    }
    .divider {
      margin: 32px 0;
      height: 1px;
      background: #E8E8E8;
    }
    .tagline-section {
      font-size: 13px;
      color: #666666;
      white-space: pre-wrap;
      word-wrap: break-word;
      line-height: 1.5;
    }
    .cta-section {
      margin: 32px 0;
    }
    .cta-button {
      display: inline-block;
      padding: 12px 28px;
      background: #0D0D0D;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      transition: background 0.2s;
    }
    .cta-button:hover {
      background: #333333;
    }
    .signature-section {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #E8E8E8;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .signature-content {
      flex: 1;
    }
    .signature-sender {
      font-weight: 600;
      font-size: 15px;
      color: #0D0D0D;
      margin-bottom: 2px;
    }
    .signature-role {
      font-size: 12px;
      color: #888888;
      margin-bottom: 4px;
    }
    .signature-details {
      font-size: 13px;
      color: #666666;
      line-height: 1.6;
    }
    .signature-details a {
      color: #0D0D0D;
      text-decoration: none;
      font-weight: 500;
    }
    .signature-details a:hover {
      text-decoration: underline;
    }
    .website-link-subtle {
      font-size: 13px;
      color: #AAAAAA;
      text-decoration: none;
      text-align: right;
      flex-shrink: 0;
      margin-left: 20px;
    }
    .website-link-subtle:hover {
      color: #0D0D0D;
      text-decoration: underline;
    }
    @media (max-width: 600px) {
      .container { padding: 30px 16px; }
      .header { margin-bottom: 30px; }
      .content { margin-bottom: 24px; }
      .greeting { font-size: 15px; }
      .body-text { font-size: 14px; }
      .cta-button { padding: 11px 24px; font-size: 13px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Header with Logo -->
      <div class="header">
        <img src="${logoUrl}" alt="Saint & Story" class="logo" width="48" height="48">
      </div>

      <!-- Main Content -->
      <div class="content">
        <div class="body-text">${mainContent}</div>
      </div>

      <!-- Divider -->
      <div class="divider"></div>

      <!-- CTA Button -->
      <div class="cta-section">
        <a href="mailto:${sender.email}?subject=Re:%20Let's%20talk&body=Hi%20${senderNameFromBody},%0A%0AI'd%20like%20to%20discuss%20how%20Saint%20%26%20Story%20could%20help%20us.%0A%0AName:%0ARole:%0ACompany:%20${email.prospectName || ""}%0A%0AThanks" class="cta-button">Let's talk</a>
      </div>

      <!-- Signature with Website Link -->
      <div class="signature-section">
        <div class="signature-content">
          <div class="signature-sender">${senderNameFromBody}</div>
          ${sender.role ? `<div class="signature-role">${sender.role}</div>` : ''}
          <div class="signature-details">
            <a href="${websiteUrl}">${companyNameFromBody}</a>
          </div>
        </div>
        <a href="${websiteUrl}" class="website-link-subtle">Check out our website</a>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
