/**
 * PipelineService - Queries for pipeline stage breakdown
 */

import { prisma } from "@/lib/prisma";

export class PipelineService {
  /**
   * Get count of opportunities by pipeline stage
   *
   * Pipeline stages:
   * - Discover: new leads (pipeline_stage = 'NEW')
   * - Enrich: leads in enrichment (leadState in recognised, understood)
   * - Qualify: leads ready for qualification (leadState = understood)
   * - Propose: leads in proposal phase (leadState in prioritised, activated)
   * - Orders: completed standing orders
   */
  async getStageBreakdown() {
    const [discover, enrich, qualify, propose, orders] = await Promise.all([
      this.countDiscover(),
      this.countEnrich(),
      this.countQualify(),
      this.countPropose(),
      this.countOrders(),
    ]);

    return {
      discover,
      enrich,
      qualify,
      propose,
      orders,
    };
  }

  private async countDiscover(): Promise<number> {
    return prisma.b2bLead.count({
      where: {
        leadState: "new",
      },
    });
  }

  private async countEnrich(): Promise<number> {
    return prisma.b2bLead.count({
      where: {
        leadState: {
          in: ["recognised", "understood"],
        },
      },
    });
  }

  private async countQualify(): Promise<number> {
    return prisma.b2bLead.count({
      where: {
        leadState: "understood",
      },
    });
  }

  private async countPropose(): Promise<number> {
    return prisma.b2bLead.count({
      where: {
        leadState: {
          in: ["prioritised", "activated"],
        },
      },
    });
  }

  private async countOrders(): Promise<number> {
    return prisma.b2bStandingOrder.count({
      where: {
        // Standing orders represent completed/finalized deals
      },
    });
  }
}
