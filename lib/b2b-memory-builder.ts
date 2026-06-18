import { prisma } from "@/lib/prisma";

const CONFIDENCE_THRESHOLD = 30; // Minimum evidence for high-confidence patterns

interface MemoryUpdate {
  type: string;
  key: string;
  value: any;
  confidenceScore: number;
  evidenceCount: number;
  campaignId?: string;
}

async function buildVariantWinnerMemory(): Promise<MemoryUpdate[]> {
  const metrics = await prisma.b2bBehaviorMetrics.findMany({
    where: { sentCount: { gte: CONFIDENCE_THRESHOLD } },
    orderBy: { yesRate: "desc" },
    take: 1,
  });

  if (metrics.length === 0) return [];

  const best = metrics[0];
  return [
    {
      type: "VARIANT_WINNER",
      key: `variant_${best.variantId || "default"}`,
      value: {
        variantId: best.variantId,
        yesRate: Number(best.yesRate),
        campaignId: best.campaignId,
      },
      confidenceScore: Math.min(100, (best.sentCount / CONFIDENCE_THRESHOLD) * 100),
      evidenceCount: best.sentCount,
      campaignId: best.campaignId || undefined,
    },
  ];
}

async function buildPressureTypeWinnerMemory(): Promise<MemoryUpdate[]> {
  // Group by pressure type and calculate average yes_rate
  const metrics = await prisma.b2bBehaviorMetrics.findMany({
    where: { sentCount: { gte: 10 } }, // Lower threshold for pressure type analysis
  });

  if (metrics.length === 0) return [];

  // Group by pressure type
  const pressureGroups = new Map<string, { totalYes: number; totalSent: number; count: number }>();

  metrics.forEach((m) => {
    if (!m.pressureType) return;

    if (!pressureGroups.has(m.pressureType)) {
      pressureGroups.set(m.pressureType, { totalYes: 0, totalSent: 0, count: 0 });
    }

    const group = pressureGroups.get(m.pressureType)!;
    group.totalYes += m.replyYesCount;
    group.totalSent += m.sentCount;
    group.count += 1;
  });

  const results: MemoryUpdate[] = [];

  pressureGroups.forEach((data, pressureType) => {
    if (data.totalSent >= CONFIDENCE_THRESHOLD) {
      const yesRate = (data.totalYes / data.totalSent) * 100;
      results.push({
        type: "PRESSURE_TYPE_WINNER",
        key: `pressure_${pressureType}`,
        value: {
          pressureType,
          yesRate: Math.round(yesRate * 100) / 100,
          samplesCount: data.count,
        },
        confidenceScore: Math.min(100, (data.totalSent / CONFIDENCE_THRESHOLD) * 100),
        evidenceCount: data.totalSent,
      });
    }
  });

  // Sort by yes_rate and return top one
  return results.sort((a, b) => Number(b.value.yesRate) - Number(a.value.yesRate)).slice(0, 1);
}

async function buildSequencePatternMemory(): Promise<MemoryUpdate[]> {
  // Detect conversion sequences from ConversationEvents
  const leads = await prisma.b2bLead.findMany({
    include: {
      conversationEvents: {
        orderBy: { createdAt: "asc" },
      },
    },
    where: {
      conversationEvents: {
        some: {
          type: { in: ["REPLIED_YES", "REPLIED_NO"] },
        },
      },
    },
    take: 100,
  });

  interface SequencePattern {
    sequence: string;
    count: number;
    yesCount: number;
  }

  const sequenceMap = new Map<string, SequencePattern>();

  leads.forEach((lead) => {
    const events = lead.conversationEvents;
    if (events.length < 2) return;

    // Build sequence string from event types
    const eventTypes = events.map((e) => e.type).join("→");
    const hasYes = events.some((e) => e.type === "REPLIED_YES");

    if (!sequenceMap.has(eventTypes)) {
      sequenceMap.set(eventTypes, { sequence: eventTypes, count: 0, yesCount: 0 });
    }

    const pattern = sequenceMap.get(eventTypes)!;
    pattern.count += 1;
    if (hasYes) pattern.yesCount += 1;
  });

  const results: MemoryUpdate[] = [];

  sequenceMap.forEach((data) => {
    if (data.count >= 5) {
      // Lower threshold for sequence patterns
      const successRate = (data.yesCount / data.count) * 100;
      results.push({
        type: "SEQUENCE_PATTERN",
        key: `seq_${data.sequence.toLowerCase().replace(/→/g, "_")}`,
        value: {
          sequence: data.sequence,
          successRate: Math.round(successRate * 100) / 100,
          sampleSize: data.count,
        },
        confidenceScore: Math.min(100, (data.count / 10) * 100),
        evidenceCount: data.count,
      });
    }
  });

  // Return top 3 by success rate
  return results
    .sort((a, b) => Number(b.value.successRate) - Number(a.value.successRate))
    .slice(0, 3);
}

export async function buildMemoryPatterns(): Promise<{
  created: number;
  updated: number;
  patterns: MemoryUpdate[];
  error?: string;
}> {
  try {
    const allUpdates: MemoryUpdate[] = [];

    // Build all memory types
    const variantMemory = await buildVariantWinnerMemory();
    const pressureMemory = await buildPressureTypeWinnerMemory();
    const sequenceMemory = await buildSequencePatternMemory();

    allUpdates.push(...variantMemory, ...pressureMemory, ...sequenceMemory);

    let created = 0;
    let updated = 0;

    for (const update of allUpdates) {
      const existing = await prisma.b2bMemoryPattern.findFirst({
        where: {
          type: update.type,
          key: update.key,
          campaignId: update.campaignId || null,
        },
      });

      if (existing) {
        // Log the change
        const deltaScore = Math.abs(
          Number(update.confidenceScore) - Number(existing.confidenceScore)
        );

        await prisma.b2bMemoryPattern.update({
          where: { id: existing.id },
          data: {
            value: update.value,
            confidenceScore: update.confidenceScore,
            evidenceCount: update.evidenceCount,
          },
        });

        if (deltaScore > 0) {
          await prisma.b2bLearningMemoryLog.create({
            data: {
              patternId: existing.id,
              eventTrigger: "DAILY_RECALC",
              beforeValue: existing.value as any,
              afterValue: update.value as any,
              deltaScore,
            },
          });
        }

        updated++;
      } else {
        // Create new pattern
        await prisma.b2bMemoryPattern.create({
          data: {
            type: update.type,
            key: update.key,
            value: update.value,
            confidenceScore: update.confidenceScore,
            evidenceCount: update.evidenceCount,
            campaignId: update.campaignId,
          },
        });

        created++;
      }
    }

    return { created, updated, patterns: allUpdates };
  } catch (error) {
    console.error("[MEMORY BUILDER] Error:", error);
    return {
      created: 0,
      updated: 0,
      patterns: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
