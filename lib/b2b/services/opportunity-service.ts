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
   * Falls back to 0 if column doesn't exist yet
   */
  async countHighConfidenceToday(today: Date): Promise<number> {
    try {
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
    } catch (error) {
      // confidenceScore column doesn't exist yet (migration not applied)
      console.log("[OpportunityService] confidence_score column not found, returning 0");
      return 0;
    }
  }

  /**
   * Get high-confidence opportunities for display
   * Falls back to empty array if column doesn't exist yet
   */
  async getHighConfidenceOpportunities(limit: number = 10) {
    try {
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
    } catch (error) {
      // confidenceScore column doesn't exist yet (migration not applied)
      console.log("[OpportunityService] confidence_score column not found, returning empty array");
      return [];
    }
  }
}
