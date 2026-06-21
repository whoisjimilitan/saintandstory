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

    const [metrics, pipeline, todaysActions, recentActivity] = await Promise.all([
      this.getMetricsForToday(),
      this.getPipelineBreakdown(),
      this.getTodaysActions(),
      this.getRecentActivity(),
    ]);

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
