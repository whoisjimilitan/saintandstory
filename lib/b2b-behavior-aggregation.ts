import { prisma } from "@/lib/prisma";

interface BehaviorGroup {
  variantId?: string;
  campaignId?: string;
  pressureType?: string;
  sentCount: number;
  openCount: number;
  clickCount: number;
  replyCount: number;
  replyYesCount: number;
  replyNoCount: number;
}

async function extractMetadataFromEvents(): Promise<BehaviorGroup[]> {
  const events = await prisma.b2bConversationEvent.findMany({
    select: {
      type: true,
      metadata: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Group events by variant_id, campaign_id, pressure_type from metadata
  const groups: Map<string, BehaviorGroup> = new Map();

  for (const event of events) {
    const metadata = event.metadata as Record<string, any> | null;
    const variantId = metadata?.variantId || null;
    const campaignId = metadata?.campaignId || null;
    const pressureType = metadata?.pressureType || null;

    const key = `${variantId}||${campaignId}||${pressureType}`;

    if (!groups.has(key)) {
      groups.set(key, {
        variantId: variantId || undefined,
        campaignId: campaignId || undefined,
        pressureType: pressureType || undefined,
        sentCount: 0,
        openCount: 0,
        clickCount: 0,
        replyCount: 0,
        replyYesCount: 0,
        replyNoCount: 0,
      });
    }

    const group = groups.get(key)!;

    // Count events by type
    switch (event.type) {
      case "EMAIL_SENT":
        group.sentCount++;
        break;
      case "EMAIL_OPENED":
        group.openCount++;
        break;
      case "CLICKED":
        group.clickCount++;
        break;
      case "REPLIED_YES":
        group.replyYesCount++;
        group.replyCount++;
        break;
      case "REPLIED_NO":
        group.replyNoCount++;
        group.replyCount++;
        break;
    }
  }

  return Array.from(groups.values());
}

function calculateRates(group: BehaviorGroup): {
  openRate: number;
  clickRate: number;
  replyRate: number;
  yesRate: number;
} {
  const openRate =
    group.sentCount > 0
      ? Math.round((group.openCount / group.sentCount) * 10000) / 100
      : 0;
  const clickRate =
    group.sentCount > 0
      ? Math.round((group.clickCount / group.sentCount) * 10000) / 100
      : 0;
  const replyRate =
    group.sentCount > 0
      ? Math.round((group.replyCount / group.sentCount) * 10000) / 100
      : 0;
  const yesRate =
    group.sentCount > 0
      ? Math.round((group.replyYesCount / group.sentCount) * 10000) / 100
      : 0;

  return { openRate, clickRate, replyRate, yesRate };
}

export async function aggregateBehaviorMetrics(): Promise<{
  created: number;
  updated: number;
  error?: string;
}> {
  try {
    const groups = await extractMetadataFromEvents();

    let created = 0;
    let updated = 0;

    for (const group of groups) {
      const rates = calculateRates(group);

      // Find or create metric
      const existing = await prisma.b2bBehaviorMetrics.findFirst({
        where: {
          variantId: group.variantId,
          campaignId: group.campaignId,
          pressureType: group.pressureType,
        },
      });

      if (existing) {
        // Update
        await prisma.b2bBehaviorMetrics.update({
          where: { id: existing.id },
          data: {
            sentCount: group.sentCount,
            openCount: group.openCount,
            clickCount: group.clickCount,
            replyCount: group.replyCount,
            replyYesCount: group.replyYesCount,
            replyNoCount: group.replyNoCount,
            openRate: rates.openRate,
            clickRate: rates.clickRate,
            replyRate: rates.replyRate,
            yesRate: rates.yesRate,
            dateRangeEnd: new Date(),
          },
        });
        updated++;
      } else {
        // Create
        await prisma.b2bBehaviorMetrics.create({
          data: {
            variantId: group.variantId,
            campaignId: group.campaignId,
            pressureType: group.pressureType,
            sentCount: group.sentCount,
            openCount: group.openCount,
            clickCount: group.clickCount,
            replyCount: group.replyCount,
            replyYesCount: group.replyYesCount,
            replyNoCount: group.replyNoCount,
            openRate: rates.openRate,
            clickRate: rates.clickRate,
            replyRate: rates.replyRate,
            yesRate: rates.yesRate,
            dateRangeStart: new Date(),
            dateRangeEnd: new Date(),
          },
        });
        created++;
      }
    }

    return { created, updated };
  } catch (error) {
    console.error("[BEHAVIOR AGGREGATION] Error:", error);
    return {
      created: 0,
      updated: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
