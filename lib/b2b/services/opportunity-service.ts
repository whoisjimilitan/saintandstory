/**
 * OpportunityService - Queries for opportunity/lead data
 */

import { prisma } from "@/lib/prisma";
import { CONFIDENCE_THRESHOLD_HIGH } from "../dashboard-service";

export class OpportunityService {
  /**
   * Count opportunities discovered today
   */
  async countDiscoveredToday(today: Date): Promise<number> {
    return prisma.b2bLead.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });
  }

  /**
   * Count high-confidence opportunities
   * High confidence = confidence_score >= 80
   */
  async countHighConfidenceToday(today: Date): Promise<number> {
    return prisma.b2bLead.count({
      where: {
        createdAt: {
          gte: today,
        },
        confidenceScore: {
          gte: CONFIDENCE_THRESHOLD_HIGH,
        },
      },
    });
  }

  /**
   * Get high-confidence opportunities for display
   */
  async getHighConfidenceOpportunities(limit: number = 10) {
    return prisma.b2bLead.findMany({
      where: {
        confidenceScore: {
          gte: CONFIDENCE_THRESHOLD_HIGH,
        },
      },
      select: {
        id: true,
        businessName: true,
        contactName: true,
        city: true,
        confidenceScore: true,
      },
      orderBy: [
        { confidenceScore: "desc" }
      ],
      take: limit,
    });
  }
}
