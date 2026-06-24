/**
 * DashboardService - Centralized aggregation layer for Morning Brief
 *
 * Single source of truth for all dashboard data.
 * All modules should use this service for dashboard-related queries.
 *
 * Architecture:
 * - DashboardService (orchestrator)
 *   ├── OpportunityService (high-confidence opportunities)
 *   ├── PipelineService (stage breakdown)
 *   ├── TaskService (today's actions)
 *   ├── ActivityService (recent activity)
 *   └── OrdersService (closed orders)
 */

import { prisma } from "@/lib/prisma";
import { OpportunityService } from "./services/opportunity-service";
import { PipelineService } from "./services/pipeline-service";
import { TaskService } from "./services/task-service";
import { ActivityService } from "./services/activity-service";
import { OrdersService } from "./services/orders-service";

export const CONFIDENCE_THRESHOLD_HIGH = 80;

export interface TemperatureBreakdown {
  ultraHot: number;
  hot: number;
  warm: number;
}

export interface ActiveProspect {
  id: string;
  businessName: string;
  location: string;
  stage: string;
  stagedAt: string;
  action: string;
}

export interface ActionItemsBreakdown {
  readyToQualify: number;
  readyToEmail: number;
  awaitingReply: number;
  readyToClose: number;
}

export interface MorningBriefMetrics {
  newOpportunitiesToday: number;
  prospectNeedingAttention: number;
  finishedToday: number;
  closedToday: number;
  temperatureBreakdown?: TemperatureBreakdown;
  activeProspects?: ActiveProspect[];
  actionItemsBreakdown?: ActionItemsBreakdown;
}

export interface PipelineBreakdown {
  discover: number;
  enrich: number;
  qualify: number;
  propose: number;
  orders: number;
}

export interface TodaysAction {
  id: string;
  company: string;
  contactName: string;
  actionType: string;
  priority: number;
  dueAt: string;
  status: string;
  confidenceScore: number;
  deepLink?: string;
}

export interface RecentActivityItem {
  id: string;
  company: string;
  eventType: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface MorningBriefResponse {
  metrics: MorningBriefMetrics;
  pipeline: PipelineBreakdown;
  todaysActions: TodaysAction[];
  recentActivity: RecentActivityItem[];
  metadata: {
    lastUpdated: string;
    version: "1.0";
  };
}

export class DashboardService {
  private opportunityService: OpportunityService;
  private pipelineService: PipelineService;
  private taskService: TaskService;
  private activityService: ActivityService;
  private ordersService: OrdersService;

  constructor() {
    this.opportunityService = new OpportunityService();
    this.pipelineService = new PipelineService();
    this.taskService = new TaskService();
    this.activityService = new ActivityService();
    this.ordersService = new OrdersService();
  }

  /**
   * Get all Morning Brief data in a single aggregated response
   * Used by: GET /api/v1/dashboard/morning-brief
   */
  async getMorningBriefData(): Promise<MorningBriefResponse> {
    const startTime = Date.now();

    // Fetch data with safe defaults for missing tables/columns
    const metrics = await this.getMetricsForToday().catch((error) => {
      console.error("[DashboardService] Error fetching metrics:", error);
      return {
        newOpportunitiesToday: 0,
        highConfidenceToday: 0,
        finishedToday: 0,
        closedToday: 0,
      };
    });

    const pipeline = await this.getPipelineBreakdown().catch((error) => {
      console.error("[DashboardService] Error fetching pipeline:", error);
      return { discover: 0, enrich: 0, qualify: 0, propose: 0, orders: 0 };
    });

    const todaysActions = await this.getTodaysActions().catch((error) => {
      console.error("[DashboardService] Error fetching actions:", error);
      return [];
    });

    const recentActivity = await this.getRecentActivity().catch((error) => {
      console.error("[DashboardService] Error fetching activity:", error);
      return [];
    });

    const duration = Date.now() - startTime;
    console.log(`[DashboardService] Morning Brief aggregated in ${duration}ms`);

    return {
      metrics,
      pipeline,
      todaysActions,
      recentActivity,
      metadata: {
        lastUpdated: new Date().toISOString(),
        version: "1.0",
      },
    };
  }

  /**
   * Get top-level metrics for today
   */
  async getMetricsForToday(): Promise<MorningBriefMetrics> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      newOpportunitiesToday,
      finishedToday,
      closedToday,
      temperatureBreakdown,
      activeProspects,
      actionItemsBreakdown,
    ] = await Promise.all([
      this.opportunityService.countDiscoveredToday(today),
      this.ordersService.countFinishedToday(today),
      this.ordersService.countClosedToday(today),
      this.getTemperatureBreakdown(),
      this.getActiveProspects(),
      this.getActionItemsBreakdown(),
    ]);

    // prospectNeedingAttention = sum of all action items
    const prospectNeedingAttention =
      (actionItemsBreakdown.readyToQualify || 0) +
      (actionItemsBreakdown.readyToEmail || 0) +
      (actionItemsBreakdown.awaitingReply || 0) +
      (actionItemsBreakdown.readyToClose || 0);

    return {
      newOpportunitiesToday,
      prospectNeedingAttention,
      finishedToday,
      closedToday,
      temperatureBreakdown,
      activeProspects,
      actionItemsBreakdown,
    };
  }

  /**
   * Calculate temperature breakdown based on prospect urgency
   */
  private async getTemperatureBreakdown(): Promise<TemperatureBreakdown> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Ultra Hot: Replied but not converted (awaiting response follow-up)
      const ultraHot = await prisma.b2bLead.count({
        where: {
          pipeline_stage: "propose",
          leadState: "contacted",
        },
      });

      // Hot: Emailed in last 24 hours (watch for responses)
      const hot = await prisma.b2bLead.count({
        where: {
          leadState: "emailed",
          email_sent_at: {
            gte: yesterday,
          },
        },
      });

      // Warm: Qualified but not yet emailed (awaiting first email)
      const warm = await prisma.b2bLead.count({
        where: {
          pipeline_stage: "discover",
          leadState: "understood",
        },
      });

      return { ultraHot, hot, warm };
    } catch (error) {
      console.error("[DashboardService] Error calculating temperature:", error);
      return { ultraHot: 0, hot: 0, warm: 0 };
    }
  }

  /**
   * Get active prospects (currently in pipeline, needs action)
   */
  private async getActiveProspects(): Promise<ActiveProspect[]> {
    try {
      const prospects = await prisma.b2bLead.findMany({
        where: {
          pipeline_stage: {
            in: ["discover", "qualify", "propose"],
          },
        },
        select: {
          id: true,
          businessName: true,
          location: true,
          pipeline_stage: true,
          last_engagement_at: true,
          leadState: true,
        },
        orderBy: {
          last_engagement_at: "desc",
        },
        take: 5,
      });

      return prospects.map((p) => ({
        id: p.id,
        businessName: p.businessName || "Unknown",
        location: p.location || "Unknown",
        stage: p.pipeline_stage || "discover",
        stagedAt: p.last_engagement_at
          ? this.getTimeAgo(p.last_engagement_at)
          : "Recently",
        action: this.getActionForStage(p.pipeline_stage || "discover"),
      }));
    } catch (error) {
      console.error("[DashboardService] Error fetching active prospects:", error);
      return [];
    }
  }

  /**
   * Get action items breakdown - what needs doing today
   */
  private async getActionItemsBreakdown(): Promise<ActionItemsBreakdown> {
    try {
      // Ready to Qualify: discovered, but leadState is not understood yet
      const readyToQualify = await prisma.b2bLead.count({
        where: {
          pipeline_stage: "discover",
          leadState: "discovered",
        },
      });

      // Ready to Email: qualified and ready to send
      const readyToEmail = await prisma.b2bLead.count({
        where: {
          pipeline_stage: "qualify",
          leadState: "understood",
        },
      });

      // Awaiting Reply: emailed but no response yet
      const awaitingReply = await prisma.b2bLead.count({
        where: {
          pipeline_stage: "propose",
          leadState: "emailed",
        },
      });

      // Ready to Close: replied but not yet converted
      const readyToClose = await prisma.b2bLead.count({
        where: {
          pipeline_stage: "propose",
          leadState: "replied",
        },
      });

      return {
        readyToQualify,
        readyToEmail,
        awaitingReply,
        readyToClose,
      };
    } catch (error) {
      console.error("[DashboardService] Error calculating action items:", error);
      return {
        readyToQualify: 0,
        readyToEmail: 0,
        awaitingReply: 0,
        readyToClose: 0,
      };
    }
  }

  /**
   * Helper: Convert timestamp to "X hours ago" format
   */
  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  }

  /**
   * Helper: Get action text based on prospect stage
   */
  private getActionForStage(stage: string): string {
    switch (stage) {
      case "discover":
        return "Ready to qualify";
      case "qualify":
        return "Ready to email";
      case "propose":
        return "Awaiting reply";
      default:
        return "Next action needed";
    }
  }

  /**
   * Get pipeline stage breakdown
   */
  async getPipelineBreakdown(): Promise<PipelineBreakdown> {
    return this.pipelineService.getStageBreakdown();
  }

  /**
   * Get today's pending actions/tasks
   */
  async getTodaysActions(): Promise<TodaysAction[]> {
    return this.taskService.getTasksDueToday();
  }

  /**
   * Get recent activity from activity log
   */
  async getRecentActivity(): Promise<RecentActivityItem[]> {
    return this.activityService.getRecentActivity(20); // Limit to 20 most recent
  }

  /**
   * Get emails sent today - for outreach activity transparency
   */
  async getSentEmailsToday(): Promise<Array<{
    id: string;
    leadId: string;
    businessName: string;
    email: string;
    subject: string;
    body: string;
    sentAt: Date;
    resendMessageId: string | null;
    status: "sent" | "pending" | "failed";
  }>> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get all outreach records sent today
      const sentEmails = await prisma.b2bOutreach.findMany({
        where: {
          sentAt: {
            gte: today,
            lt: tomorrow,
          },
        },
        include: {
          lead: {
            select: {
              id: true,
              businessName: true,
              email: true,
            },
          },
        },
        orderBy: {
          sentAt: "desc",
        },
      });

      return sentEmails.map((email) => ({
        id: email.id,
        leadId: email.leadId,
        businessName: email.lead?.businessName || "Unknown",
        email: email.lead?.email || "unknown@example.com",
        subject: email.subject || "(No subject)",
        body: email.body || "",
        sentAt: email.sentAt || new Date(),
        resendMessageId: email.resendMessageId,
        status: email.resendMessageId ? "sent" : "pending",
      }));
    } catch (error) {
      console.error("[DashboardService] Error fetching sent emails today:", error);
      return [];
    }
  }

  /**
   * Health check - verify all data sources are accessible
   */
  async healthCheck(): Promise<{ healthy: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Quick test query to b2b_leads
      await prisma.b2bLead.count({ take: 1 });
    } catch (error) {
      errors.push(`B2bLead query failed: ${error}`);
    }

    try {
      // Quick test query to b2b_tasks
      await prisma.b2bTask.count({ take: 1 });
    } catch (error) {
      errors.push(`B2bTask query failed: ${error}`);
    }

    try {
      // Quick test query to b2b_activity_log
      await prisma.b2bActivityLog.count({ take: 1 });
    } catch (error) {
      errors.push(`B2bActivityLog query failed: ${error}`);
    }

    return {
      healthy: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();
