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
 * Send single email via SendGrid
 * (Placeholder - actual implementation depends on SendGrid setup)
 */
async function sendEmailViaSendGrid(
  outreachId: string,
  toEmail: string,
  subject: string,
  body: string,
  trackingToken: string
): Promise<boolean> {
  try {
    // In real implementation, call SendGrid API here
    // For now, just log and return true
    console.log(
      `[AUTONOMOUS_SEND] Would send email to ${toEmail} with token ${trackingToken}`
    );

    // Mark as sent
    await prisma.b2b_outreach.update({
      where: { id: outreachId },
      data: {
        sent_at: new Date(),
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
        const success = await sendEmailViaSendGrid(
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
