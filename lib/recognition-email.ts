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
    ? `We noticed customers mentioning ${lead.pain_point.toLowerCase()} in recent reviews.`
    : `We've identified ${lead.business_category} as an area where we can help.`;

  const subject = `${businessName}: Delivery opportunity (${driver.radius_miles}mi radius)`;

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
      <h1>Hi there, ${businessName}</h1>
    </div>
    <div class="body">
      <p>${painContext}</p>
      <div class="highlight">
        <p><strong>We deliver in your area:</strong> ${driver.radius_miles} miles from ${driver.postcode}</p>
        <p><strong>What makes us different:</strong> Fixed price. Verified driver. Same-day available.</p>
      </div>
      <p>Rather than a generic pitch, we wanted to reach out directly. If you'd like to explore how we handle ${lead.business_category} logistics, we're happy to talk through your specific needs.</p>
      <div class="cta">
        <a href="https://saintandstoryltd.co.uk/lead/${lead.id}" class="button">Let's Talk →</a>
      </div>
      <p>Not interested right now? That's fine. We'll follow up only if something changes.</p>
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
