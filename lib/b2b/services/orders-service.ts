/**
 * OrdersService - Queries for completed orders/standing orders
 */

import { prisma } from "@/lib/prisma";

export class OrdersService {
  /**
   * Count standing orders created today
   */
  async countFinishedToday(today: Date): Promise<number> {
    return prisma.b2bStandingOrder.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });
  }

  /**
   * Count closed/completed opportunities
   * A closed opportunity typically means the deal was completed or lost
   */
  async countClosedToday(today: Date): Promise<number> {
    // This could be mapped to a specific leadState or a closed date
    // For now, we'll count standing orders which represent completed deals
    return prisma.b2bStandingOrder.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });
  }

  /**
   * Get recent standing orders
   */
  async getRecentOrders(limit: number = 10) {
    return prisma.b2bStandingOrder.findMany({
      include: {
        lead: {
          select: {
            id: true,
            businessName: true,
            contactName: true,
            city: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
  }

  /**
   * Get standing orders for a specific lead
   */
  async getOrdersForLead(leadId: string) {
    return prisma.b2bStandingOrder.findMany({
      where: { leadId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Count total active standing orders (contracts)
   */
  async countActiveContracts(): Promise<number> {
    return prisma.b2bStandingOrder.count();
  }
}
