/**
 * TaskService - Queries for pending tasks/actions
 */

import { prisma } from "@/lib/prisma";

export class TaskService {
  /**
   * Get all pending tasks due today or overdue
   * Ordered by priority (higher first) and due date
   */
  async getTasksDueToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await prisma.b2bTask.findMany({
      where: {
        status: { in: ["pending", "assigned"] },
        dueAt: {
          lt: tomorrow,
        },
      },
      include: {
        lead: {
          select: {
            id: true,
            businessName: true,
            contactName: true,
            confidenceScore: true,
          },
        },
      },
      orderBy: [
        { priority: "asc" }, // Lower number = higher priority
        { dueAt: "asc" },
      ],
    });

    return tasks.map((task) => ({
      id: task.id,
      company: task.lead.businessName,
      contactName: task.lead.contactName || "Unknown",
      actionType: task.actionType,
      priority: task.priority ?? 5,
      dueAt: task.dueAt.toISOString(),
      status: task.status,
      confidenceScore: task.confidenceScore ?? 0,
      deepLink: task.deepLink || undefined,
    }));
  }

  /**
   * Create a new task
   * Called by various modules (Discover, Outreach, etc.)
   */
  async createTask(data: {
    leadId: string;
    actionType: string;
    priority?: number;
    dueAt: Date;
    description?: string;
    confidenceScore?: number;
    deepLink?: string;
    assignedTo?: string;
  }) {
    return prisma.b2bTask.create({
      data: {
        leadId: data.leadId,
        actionType: data.actionType,
        priority: data.priority ?? 5,
        dueAt: data.dueAt,
        description: data.description,
        confidenceScore: data.confidenceScore,
        deepLink: data.deepLink,
        assignedTo: data.assignedTo,
        status: "pending",
      },
      include: {
        lead: {
          select: {
            businessName: true,
            contactName: true,
          },
        },
      },
    });
  }

  /**
   * Complete a task
   */
  async completeTask(taskId: string) {
    return prisma.b2bTask.update({
      where: { id: taskId },
      data: {
        status: "completed",
        completedAt: new Date(),
      },
    });
  }

  /**
   * Count pending tasks due today
   */
  async countTasksDueToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.b2bTask.count({
      where: {
        status: { in: ["pending", "assigned"] },
        dueAt: {
          lt: tomorrow,
        },
      },
    });
  }
}
