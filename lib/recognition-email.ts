import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";
import { type Lead, type Driver } from "@/lib/b2b-types";

const resend = new Resend(process.env.RESEND_API_KEY);

export function generateRecognitionEmailTemplate(
  lead: Lead,
  driver: Driver
): { subject: string; html: string } {
  const businessName = lead.business_name || "Business";
  const painContext = lead.pain_point
    ? `We've watched your reviews. Multiple customers mention struggling with ${lead.pain_point.toLowerCase()}. That's the friction point we fix.`
    : `Managing transport for a ${lead.business_category} operation is complex. Gaps in coverage create chaos when demand peaks.`;

  const subject = `Transport continuity for ${businessName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header h1 { font-size: 24px; margin: 0; color: #0D0D0D; }
    .highlight { background: #F5F5F5; padding: 15px; border-left: 4px solid #0D0D0D; margin: 20px 0; }
    .button { display: inline-block; background: #0D0D0D; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; }
    .footer { font-size: 12px; color: #888; border-top: 1px solid #EEE; padding-top: 20px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${businessName}</h1>
    </div>
    <div class="body">
      <p>${painContext}</p>
      <div class="highlight">
        <p>We operate drivers within ${driver.radius_miles} miles of your location (${driver.postcode}). Same-day scheduling. Verified team. No gimmicks.</p>
      </div>
      <p>Most businesses in your sector manage transport sporadically until demand peaks. Then it becomes everyone's problem. We specialise in replacing that chaos with certainty.</p>
      <p>This brief is designed to help you understand if we're a fit for what you do. Read it. See if it rings true. Reply only if you want to explore further.</p>
      <div class="cta">
        <a href="https://saintandstoryltd.co.uk/lead/${lead.id}" class="button">View Your Transport Brief →</a>
      </div>
      <p style="color: #999; font-size: 14px;">No pressure. No follow-up unless you respond.</p>
    </div>
    <div class="footer">
      <p>Saint & Story Ltd · Removal & Logistics Partner</p>
      <p>Phone: 0203 051 9243 | Email: info@saintandstoryltd.co.uk</p>
      <p>Reply directly to this email or click the link above.</p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}

export async function sendRecognitionEmail(
  lead: Lead,
  driver: Driver
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!lead.email) {
    return { success: false, error: "Lead has no email address" };
  }

  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const { subject, html } = generateRecognitionEmailTemplate(lead, driver);

    const response = await resend.emails.send({
      from: "recognition@saintandstoryltd.co.uk",
      to: lead.email,
      subject,
      html,
      replyTo: "info@saintandstoryltd.co.uk",
      headers: {
        "X-Lead-ID": lead.id as string,
        "X-Driver-ID": driver.id,
      },
    });

    if (response.error) {
      console.error("[Recognition Email] Resend error:", response.error);
      return { success: false, error: response.error.message };
    }

    return { success: true, messageId: response.data?.id };
  } catch (error) {
    console.error("[Recognition Email] Exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function sendRecognitionEmailsBatch(
  leads: Lead[],
  driver: Driver
): Promise<{
  total: number;
  sent: number;
  failed: number;
  failedLeads: Array<{ leadId: string; error: string }>;
}> {
  if (!process.env.DATABASE_URL) {
    return { total: leads.length, sent: 0, failed: leads.length, failedLeads: [] };
  }

  const sql = neon(process.env.DATABASE_URL);
  const failedLeads: Array<{ leadId: string; error: string }> = [];
  let sentCount = 0;

  for (const lead of leads) {
    const result = await sendRecognitionEmail(lead, driver);

    if (result.success && result.messageId) {
      try {
        await sql`
          UPDATE b2b_leads
          SET
            email_sent_at = NOW(),
            driver_id = ${driver.id},
            lead_state = 'recognized'
          WHERE id = ${lead.id}
        `;
        sentCount++;
      } catch (dbError) {
        const leadId = lead.id as string;
        console.error(`[Recognition Email] Failed to update lead ${leadId}:`, dbError);
        failedLeads.push({
          leadId,
          error: "Email sent but DB update failed",
        });
      }
    } else {
      failedLeads.push({
        leadId: lead.id as string,
        error: result.error || "Unknown error",
      });
    }
  }

  return {
    total: leads.length,
    sent: sentCount,
    failed: leads.length - sentCount,
    failedLeads,
  };
}

/**
 * Backward compatibility: wrapper for existing send-recognition API
 */
export function generateRecognitionEmail(input: {
  business_name: string;
  industry: string;
  email: string;
  lead_id: number | string;
}): { subject: string; body: string; triggerEvent: string } | null {
  const lead: Lead = {
    id: input.lead_id,
    business_name: input.business_name,
    business_category: input.industry,
    email: input.email,
    created_at: new Date().toISOString(),
    status: "new",
    lead_state: "recognized",
    transitioned_at: null,
  };

  const driver: Driver = {
    id: "admin-triggered",
    name: "Admin",
    postcode: "",
    radius_miles: 0,
    created_at: new Date().toISOString(),
  };

  const template = generateRecognitionEmailTemplate(lead, driver);

  return {
    subject: template.subject,
    body: template.html,
    triggerEvent: "admin_recognition",
  };
}

export async function triggerDriverLeadDiscovery(driver: Driver): Promise<{
  discovered: number;
  emailsSent: number;
  error?: string;
}> {
  try {
    const { findNearbyLeads } = await import("@/lib/lead-discovery");

    if (!driver.latitude || !driver.longitude) {
      return {
        discovered: 0,
        emailsSent: 0,
        error: "Driver postcode not geocoded",
      };
    }

    const leads = await findNearbyLeads(
      driver.id,
      driver.postcode,
      driver.latitude,
      driver.longitude,
      driver.radius_miles
    );

    if (leads.length === 0) {
      return { discovered: 0, emailsSent: 0 };
    }

    const emailResult = await sendRecognitionEmailsBatch(leads, driver);

    return {
      discovered: emailResult.total,
      emailsSent: emailResult.sent,
      error: emailResult.failed > 0 ? `${emailResult.failed} emails failed to send` : undefined,
    };
  } catch (error) {
    console.error("[Driver Lead Discovery] Exception:", error);
    return {
      discovered: 0,
      emailsSent: 0,
      error: error instanceof Error ? error.message : "Unknown discovery error",
    };
  }
}
