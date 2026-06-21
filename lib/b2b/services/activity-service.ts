/**
 * ActivityService - Queries for activity log
 * Single source of truth for "what happened" in the system
 */

import { prisma } from "@/lib/prisma";

export class ActivityService {
  /**
   * Get recent activity from the activity log
   * Returns most recent N items
   */
  async getRecentActivity(limit: number = 20) {
    const activities = await prisma.b2bActivityLog.findMany({
      include: {
        lead: {
          select: {
            id: true,
            businessName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return activities.map((activity) => ({
      id: activity.id,
      company: activity.lead.businessName,
      eventType: activity.eventType,
      description: activity.description || this.getEventDescription(activity.eventType),
      timestamp: activity.createdAt.toISOString(),
      metadata: activity.metadata as Record<string, unknown> | undefined,
    }));
  }

  /**
   * Log an activity event
   * Called by various modules when important actions occur
   */
  async logActivity(data: {
    leadId: string;
    eventType: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }) {
    return prisma.b2bActivityLog.create({
      data: {
        leadId: data.leadId,
        eventType: data.eventType,
        description: data.description,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
      },
      include: {
        lead: {
          select: {
            businessName: true,
          },
        },
      },
    });
  }

  /**
   * Get activity for a specific company
   */
  async getActivityForLead(leadId: string, limit: number = 50) {
    const activities = await prisma.b2bActivityLog.findMany({
      where: { leadId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return activities.map((activity) => ({
      id: activity.id,
      eventType: activity.eventType,
      description: activity.description,
      timestamp: activity.createdAt.toISOString(),
      metadata: activity.metadata,
    }));
  }

  /**
   * Get activities by type (e.g., all "email_sent" events)
   */
  async getActivitiesByType(eventType: string, limit: number = 50) {
    const activities = await prisma.b2bActivityLog.findMany({
      where: { eventType },
      include: {
        lead: {
          select: {
            businessName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return activities.map((activity) => ({
      id: activity.id,
      company: activity.lead.businessName,
      eventType: activity.eventType,
      description: activity.description,
      timestamp: activity.createdAt.toISOString(),
    }));
  }

  /**
   * Get activities from today
   */
  async getActivitiesFromToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activities = await prisma.b2bActivityLog.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        lead: {
          select: {
            businessName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return activities.map((activity) => ({
      id: activity.id,
      company: activity.lead.businessName,
      eventType: activity.eventType,
      description: activity.description,
      timestamp: activity.createdAt.toISOString(),
    }));
  }

  /**
   * Generate default description for event type
   */
  private getEventDescription(eventType: string): string {
    const descriptions: Record<string, string> = {
      company_discovered: "Company discovered",
      enrichment_completed: "Company enriched",
      email_sent: "Email sent",
      email_opened: "Email opened",
      email_clicked: "Email link clicked",
      reply_received: "Reply received",
      meeting_booked: "Meeting booked",
      proposal_generated: "Proposal generated",
      proposal_sent: "Proposal sent",
      contract_signed: "Contract signed",
      order_approved: "Order approved",
      opportunity_closed: "Opportunity closed",
    };

    return descriptions[eventType] || eventType;
  }
}
