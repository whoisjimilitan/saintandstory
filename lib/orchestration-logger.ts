/**
 * Orchestration Logging System
 *
 * Tracks each stage of the daily autonomous execution.
 * Provides structured logging for debugging and auditing.
 */

export interface StageLog {
  stage: string;
  started: string;
  completed?: string;
  status: "pending" | "success" | "failure" | "skipped";
  recordsProcessed?: number;
  recordsCreated?: number;
  failures?: string[];
  error?: string;
  durationMs?: number;
}

export interface ExecutionReport {
  executionId: string;
  timestamp: string;
  stages: StageLog[];
  summary: {
    totalStages: number;
    successCount: number;
    failureCount: number;
    skippedCount: number;
    totalDurationMs: number;
  };
  success: boolean;
}

export class OrchestrationLogger {
  private executionId: string;
  private startTime: number;
  private stages: StageLog[] = [];

  constructor() {
    this.executionId = `exec-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    this.startTime = Date.now();
    console.log(`[Orchestration] Execution ID: ${this.executionId}`);
  }

  startStage(stageName: string) {
    const stageStart = Date.now();
    const self = this;

    return {
      start: () => {
        const stage: StageLog = {
          stage: stageName,
          started: new Date(stageStart).toISOString(),
          status: "pending",
        };

        self.stages.push(stage);
        console.log(`[${stageName}] Started at ${stage.started}`);

        return {
          success: (
            recordsProcessed?: number,
            recordsCreated?: number,
            failures?: string[]
          ) => {
            const now = Date.now();
            stage.status = "success";
            stage.completed = new Date(now).toISOString();
            stage.durationMs = now - stageStart;
            stage.recordsProcessed = recordsProcessed;
            stage.recordsCreated = recordsCreated;
            if (failures?.length) {
              stage.failures = failures;
            }

            console.log(
              `[${stageName}] ✅ Success (${stage.durationMs}ms) - Created: ${recordsCreated || 0}, Processed: ${recordsProcessed || 0}`
            );
          },

          failure: (error: string, recordsProcessed?: number) => {
            const now = Date.now();
            stage.status = "failure";
            stage.completed = new Date(now).toISOString();
            stage.durationMs = now - stageStart;
            stage.error = error;
            stage.recordsProcessed = recordsProcessed;

            console.error(
              `[${stageName}] ❌ Failed (${stage.durationMs}ms): ${error}`
            );
          },

          skip: (reason: string) => {
            const now = Date.now();
            stage.status = "skipped";
            stage.completed = new Date(now).toISOString();
            stage.durationMs = now - stageStart;
            stage.error = reason;

            console.log(`[${stageName}] ⊘ Skipped: ${reason}`);
          },
        };
      },
    };
  }

  generateReport(): ExecutionReport {
    const now = Date.now();
    const totalDuration = now - this.startTime;

    const summary = this.stages.reduce(
      (acc, stage) => ({
        ...acc,
        successCount: acc.successCount + (stage.status === "success" ? 1 : 0),
        failureCount: acc.failureCount + (stage.status === "failure" ? 1 : 0),
        skippedCount: acc.skippedCount + (stage.status === "skipped" ? 1 : 0),
      }),
      {
        totalStages: this.stages.length,
        successCount: 0,
        failureCount: 0,
        skippedCount: 0,
        totalDurationMs: totalDuration,
      }
    );

    const report: ExecutionReport = {
      executionId: this.executionId,
      timestamp: new Date(this.startTime).toISOString(),
      stages: this.stages,
      summary,
      success: summary.failureCount === 0,
    };

    return report;
  }

  logReport(report: ExecutionReport): void {
    console.log("\n" + "═".repeat(80));
    console.log("EXECUTION REPORT");
    console.log("═".repeat(80));
    console.log(`Execution ID: ${report.executionId}`);
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Total Duration: ${report.summary.totalDurationMs}ms`);
    console.log(
      `Result: ${report.success ? "✅ SUCCESS" : "❌ FAILURES OCCURRED"}`
    );
    console.log(`\nStage Summary:`);
    console.log(
      `  ✅ Successful: ${report.summary.successCount}/${report.summary.totalStages}`
    );
    console.log(
      `  ❌ Failed: ${report.summary.failureCount}/${report.summary.totalStages}`
    );
    console.log(
      `  ⊘ Skipped: ${report.summary.skippedCount}/${report.summary.totalStages}`
    );

    console.log(`\nStage Details:`);
    for (const stage of report.stages) {
      const icon =
        stage.status === "success"
          ? "✅"
          : stage.status === "failure"
            ? "❌"
            : "⊘";
      console.log(
        `  ${icon} ${stage.stage} (${stage.durationMs}ms) - ${stage.status.toUpperCase()}`
      );
      if (stage.recordsProcessed !== undefined) {
        console.log(
          `     Processed: ${stage.recordsProcessed}, Created: ${stage.recordsCreated || 0}`
        );
      }
      if (stage.error) {
        console.log(`     Error: ${stage.error}`);
      }
      if (stage.failures?.length) {
        console.log(`     Failures: ${stage.failures.join(", ")}`);
      }
    }
    console.log("═".repeat(80) + "\n");
  }
}
