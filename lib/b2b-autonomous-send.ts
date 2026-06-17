/**
 * B2B Autonomous Send Engine
 *
 * Sends first-touch emails to qualified leads with:
 * - 50/day throttle (configurable)
 * - Operator pressure type preferences (respects opt-outs)
 * - Deduplication (no double-sending within 90 days)
 * - Tracking (stores send timestamp, sent_by='autonomous')
 *
 * Runs daily after enrichment completes (~07:00 UTC).
 */

import { prisma } from "./prisma";
import { resend, FROM } from "./resend";

export interface AutonomousSendConfig {
  max_emails_per_day: number;
  enabled_pressure_types: string[];
  min_engagement_score: number;
}

export interface AutonomousSendResult {
  emails_sent: number;
  emails_queued: number;
  emails_skipped: number;
  errors: string[];
  started_at: string;
  completed_at: string;
}

/**
 * Get operator preferences for autonomous sending
 * Defaults to all pressure types enabled if not configured
 */
async function getOperatorPreferences(
  operatorId?: string
): Promise<AutonomousSendConfig> {
  if (!operatorId) {
    return {
      max_emails_per_day: 50,
      enabled_pressure_types: [
        "Time-Critical Movement",
        "Capacity Overflow",
        "Service Quality Inconsistency",
        "Geographic Service Gaps",
        "Customer Acquisition Friction",
        "Customer Churn",
        "Delivery Reliability",
        "Appointment Scheduling Friction",
        "Communication Breakdown",
      ],
      min_engagement_score: 30,
    };
  }

  // In future: Load from operator_settings table
  // For now, use defaults
  return {
    max_emails_per_day: 50,
    enabled_pressure_types: [
      "Time-Critical Movement",
      "Capacity Overflow",
      "Service Quality Inconsistency",
      "Geographic Service Gaps",
      "Customer Acquisition Friction",
      "Customer Churn",
      "Delivery Reliability",
      "Appointment Scheduling Friction",
      "Communication Breakdown",
    ],
    min_engagement_score: 30,
  };
}

/**
 * Count emails already sent today
 */
async function countEmailsSentToday(): Promise<number> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const count = await prisma.b2b_outreach.count({
    where: {
      sent_at: {
        gte: today,
      },
      sent_by: "autonomous",
    },
  });

  return count;
}

/**
 * Check if a lead was contacted recently (within 90 days)
 */
async function wasContactedRecently(leadId: string): Promise<boolean> {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const recentContact = await prisma.b2b_outreach.findFirst({
    where: {
      lead_id: leadId,
      sent_at: {
        gte: ninetyDaysAgo,
      },
    },
  });

  return !!recentContact;
}

/**
 * Get leads ready for autonomous sending
 *
 * Criteria:
 * - Has b2b_outreach record with email body ready
 * - engagement_score >= config.min_engagement_score
 * - pressure_type is in enabled_pressure_types
 * - Not contacted in last 90 days
 * - Not already sent_at (send_at is NULL)
 *
 * Ordered by engagement_score DESC (highest first)
 */
async function getQualifiedLeads(
  config: AutonomousSendConfig,
  limit: number
) {
  const leads = await prisma.b2b_outreach.findMany({
    where: {
      sent_at: null, // Not yet sent
      sent_by: "autonomous", // Created by autonomous enrichment
      pressure_type: {
        in: config.enabled_pressure_types,
      },
      b2b_leads: {
        engagement_score: {
          gte: config.min_engagement_score,
        },
      },
    },
    include: {
      b2b_leads: {
        select: {
          id: true,
          business_name: true,
          email: true,
          engagement_score: true,
          created_at: true,
        },
      },
    },
    orderBy: {
      b2b_leads: {
        engagement_score: "desc",
      },
    },
    take: limit,
  });

  return leads;
}

/**
 * Send single email via Resend
 */
async function sendEmailViaResend(
  outreachId: string,
  toEmail: string,
  subject: string,
  body: string,
  trackingToken: string
): Promise<boolean> {
  try {
    const yesToken = `yes_${outreachId}`;
    const noToken = `no_${outreachId}`;
    const baseUrl = process.env.VERCEL_URL || "http://localhost:3000";
    const yesUrl = `https://${baseUrl}/api/b2b/respond?token=${yesToken}&response=YES`;
    const noUrl = `https://${baseUrl}/api/b2b/respond?token=${noToken}&response=NO`;

    // Build HTML email with YES/NO buttons
    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family:-apple-system,system-ui,sans-serif;margin:0;padding:0;background:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:8px;padding:40px;border:1px solid #e0e0e0;">
        <tr><td style="font-size:16px;line-height:1.6;color:#333;margin-bottom:24px;">
          ${body}
        </td></tr>
        <tr><td align="center" style="padding-top:20px;border-top:1px solid #e0e0e0;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:12px;">
              <a href="${yesUrl}" style="display:inline-block;background:#10b981;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">YES</a>
            </td>
            <td>
              <a href="${noUrl}" style="display:inline-block;background:#ef4444;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">NO</a>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="padding-top:24px;font-size:12px;color:#999;text-align:center;">
          Saint & Story
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // Send via Resend
    const result = await resend.emails.send({
      from: FROM || "Saint & Story <hello@saintandstory.com>",
      to: toEmail,
      subject,
      html,
    });

    if (result.error) {
      console.error(`[AUTONOMOUS_SEND] Resend error:`, result.error);
      return false;
    }

    // Mark as sent with Resend message ID
    await prisma.b2b_outreach.update({
      where: { id: outreachId },
      data: {
        sent_at: new Date(),
        resend_message_id: result.data?.id,
      },
    });

    return true;
  } catch (error) {
    console.error(`[AUTONOMOUS_SEND] Failed to send email:`, error);
    return false;
  }
}

/**
 * Main autonomous send function
 *
 * Called daily after enrichment completes.
 * Sends up to max_emails_per_day emails respecting operator preferences.
 */
export async function autonomousSendEmails(
  operatorId?: string
): Promise<AutonomousSendResult> {
  const result: AutonomousSendResult = {
    emails_sent: 0,
    emails_queued: 0,
    emails_skipped: 0,
    errors: [],
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
  };

  try {
    console.log("[AUTONOMOUS_SEND] Starting autonomous send run");

    // Get operator configuration
    const config = await getOperatorPreferences(operatorId);
    console.log(
      `[AUTONOMOUS_SEND] Config: max_per_day=${config.max_emails_per_day}, pressure_types=${config.enabled_pressure_types.length}`
    );

    // Check how many emails already sent today
    const alreadySent = await countEmailsSentToday();
    const remainingQuota = Math.max(0, config.max_emails_per_day - alreadySent);

    console.log(
      `[AUTONOMOUS_SEND] Already sent today: ${alreadySent}, remaining quota: ${remainingQuota}`
    );

    if (remainingQuota === 0) {
      console.log("[AUTONOMOUS_SEND] Daily quota exhausted, skipping");
      result.completed_at = new Date().toISOString();
      return result;
    }

    // Get qualified leads
    const qualifiedLeads = await getQualifiedLeads(config, remainingQuota);
    console.log(
      `[AUTONOMOUS_SEND] Found ${qualifiedLeads.length} qualified leads`
    );

    result.emails_queued = qualifiedLeads.length;

    // Process each lead
    for (const outreach of qualifiedLeads) {
      try {
        // Check if recently contacted
        const recentlyContacted = await wasContactedRecently(
          outreach.lead_id
        );
        if (recentlyContacted) {
          console.log(
            `[AUTONOMOUS_SEND] Skipping ${outreach.b2b_leads.business_name} - recently contacted`
          );
          result.emails_skipped++;
          continue;
        }

        // Send email
        const trackingToken = `token_${outreach.id}`;
        const success = await sendEmailViaResend(
          outreach.id,
          outreach.b2b_leads.email || "",
          outreach.subject || "",
          outreach.body || "",
          trackingToken
        );

        if (success) {
          result.emails_sent++;
          console.log(
            `[AUTONOMOUS_SEND] ✅ Sent to ${outreach.b2b_leads.business_name}`
          );
        } else {
          result.emails_skipped++;
          console.log(
            `[AUTONOMOUS_SEND] ❌ Failed to send to ${outreach.b2b_leads.business_name}`
          );
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        result.errors.push(errorMsg);
        result.emails_skipped++;
        console.error(
          `[AUTONOMOUS_SEND] Error processing ${outreach.b2b_leads.business_name}:`,
          err
        );
      }

      // Stop if we've hit the quota
      if (result.emails_sent >= remainingQuota) {
        console.log("[AUTONOMOUS_SEND] Daily quota reached");
        break;
      }
    }
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Unknown error during send";
    result.errors.push(errorMsg);
    console.error("[AUTONOMOUS_SEND] Error in autonomous send:", error);
  }

  result.completed_at = new Date().toISOString();

  console.log(
    `[AUTONOMOUS_SEND] ✅ Run complete: sent=${result.emails_sent}, queued=${result.emails_queued}, skipped=${result.emails_skipped}`
  );

  return result;
}
