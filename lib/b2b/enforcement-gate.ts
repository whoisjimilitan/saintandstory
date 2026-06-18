/**
 * B2B Enforcement Gate
 *
 * Pure validation layer. Stateless, side-effect free, decision-only.
 * MUST NEVER: write DB, send email, update metrics, trigger workflows
 *
 * Returns: { allowed: boolean, reason?: string }
 * No mutations. No side effects. Only decide.
 */

import { prisma } from "@/lib/prisma";

export interface EnforcementDecision {
  allowed: boolean;
  reason?: string;
}

/**
 * Check if send request meets all constraints.
 * Pure validation only. No mutations.
 */
export async function checkSendConstraints(
  pressureType: string,
  copyVariant: string
): Promise<EnforcementDecision> {
  try {
    // Fetch settings for this pressure type
    const setting = await (prisma as any).b2b_settings.findUnique({
      where: { pressure_type: pressureType },
    });

    // Check 1: Is pressure type enabled?
    if (!setting || !setting.enabled) {
      return {
        allowed: false,
        reason: "pressure_type_disabled",
      };
    }

    // Check 2: Is daily limit respected?
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyCount = await prisma.b2bOutreach.count({
      where: {
        pressure_type: pressureType,
        sentAt: {
          gte: today,
        },
      },
    });

    if (dailyCount >= setting.max_emails_per_day) {
      return {
        allowed: false,
        reason: "daily_limit_reached",
      };
    }

    // Check 3: Is copy variant allowed?
    if (
      setting.allowed_variants !== "BOTH" &&
      setting.allowed_variants !== copyVariant
    ) {
      return {
        allowed: false,
        reason: "variant_not_allowed",
      };
    }

    // All constraints pass
    return { allowed: true };
  } catch (error) {
    // On error, fail closed (deny send)
    console.error("[ENFORCEMENT GATE] Error:", error);
    return {
      allowed: false,
      reason: "enforcement_check_failed",
    };
  }
}
