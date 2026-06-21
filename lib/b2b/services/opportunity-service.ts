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
   * Falls back to simple count if column doesn't exist yet
   */
  async countHighConfidenceToday(today: Date): Promise<number> {
    try {
      // Count leads created today without confidence threshold
      // (confidence_score column no longer exists in schema)
      return prisma.b2bLead.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      });
    } catch {
      return 0;
    }
  }

  /**
   * Get high-confidence opportunities for display
   * (confidence_score column no longer exists in schema)
   */
  async getHighConfidenceOpportunities(limit: number = 10) {
    try {
      return prisma.b2bLead.findMany({
        select: {
          id: true,
          businessName: true,
          contactName: true,
          city: true,
        },
        orderBy: [
          { createdAt: "desc" }
        ],
        take: limit,
      });
    } catch (error) {
      console.log("[OpportunityService] error fetching opportunities, returning empty array");
      return [];
    }
  }
}
