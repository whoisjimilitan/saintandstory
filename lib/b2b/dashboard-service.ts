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

export interface MorningBriefMetrics {
  newOpportunitiesToday: number;
  highConfidenceToday: number;
  finishedToday: number;
  closedToday: number;
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
      highConfidenceToday,
      finishedToday,
      closedToday,
    ] = await Promise.all([
      this.opportunityService.countDiscoveredToday(today),
      this.opportunityService.countHighConfidenceToday(today),
      this.ordersService.countFinishedToday(today),
      this.ordersService.countClosedToday(today),
    ]);

    return {
      newOpportunitiesToday,
      highConfidenceToday,
      finishedToday,
      closedToday,
    };
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
