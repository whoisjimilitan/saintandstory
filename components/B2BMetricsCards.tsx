"use client";

import { useEffect, useState } from "react";

interface MetricsData {
  timestamp: string;
  metrics: {
    knowledge_capture_adoption: {
      value: string;
      unit: string;
      target: string;
      status: "success" | "warning" | "pending";
      leads_with_observations: number;
      total_leads: number;
    };
    standing_order_completeness: {
      value: string;
      unit: string;
      target: string;
      status: "success" | "warning" | "pending";
      complete_orders: number;
      total_orders: number;
    };
    fulfillment_readiness: {
      value: string;
      unit: string;
      target: string;
      status: "success" | "warning" | "pending";
      generated_orders: number;
      total_orders: number;
    };
    observation_usage: {
      value: string;
      unit: string;
      target: string;
      status: "success" | "warning" | "pending";
      leads_with_observations: number;
      total_leads: number;
      latest_observation: string | null;
    };
    revenue_flow_completeness: {
      jobs_generated_percent: string;
      jobs_completed_percent: string;
      jobs_cancelled_percent: string;
      total_standing_orders: number;
      target: string;
      status: "success" | "warning" | "pending";
    };
    operational_efficiency: {
      avg_time: string;
      median_time: string;
      fastest_time: string;
      slowest_time: string;
      completed_jobs: number;
      target: string;
      status: "success" | "warning" | "pending";
    };
  };
}

function MetricCard({
  title,
  value,
  unit,
  target,
  status,
  details,
}: {
  title: string;
  value: string;
  unit: string;
  target: string;
  status: "success" | "warning" | "pending";
  details?: React.ReactNode;
}) {
  const statusColor = {
    success: "text-[#2ECC71]",
    warning: "text-[#F39C12]",
    pending: "text-[#888888]",
  }[status];

  const bgColor = {
    success: "bg-[#E8F8F5]",
    warning: "bg-[#FEF5E7]",
    pending: "bg-[#F5F5F5]",
  }[status];

  return (
    <div className={`${bgColor} border border-[#E8E8E8] rounded-xl p-6`}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">
          {title}
        </p>
        <span className={`text-xl font-bold ${statusColor}`}>●</span>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <p className="text-3xl font-black text-[#0D0D0D]">{value}</p>
        <p className="text-sm text-[#888888]">{unit}</p>
      </div>

      <p className="text-[10px] text-[#888888] uppercase tracking-[0.5px] mb-3">
        Target: {target}
      </p>

      {details && <div className="text-[11px] text-[#666666] space-y-1">{details}</div>}
    </div>
  );
}

export default function B2BMetricsCards() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch("/api/b2b/metrics/knowledge-loop");
        if (!response.ok) throw new Error("Failed to fetch metrics");
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#F5F5F5] rounded-xl p-6 text-center">
        <p className="text-[#888888]">Loading metrics…</p>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-[#FEF5E7] border border-[#E8E8E8] rounded-xl p-6">
        <p className="text-[#888888]">Unable to load metrics. Try refreshing.</p>
      </div>
    );
  }

  const m = metrics.metrics;

  // Health status
  const healthScore =
    (m.knowledge_capture_adoption.status === "success" ? 1 : 0) +
    (m.standing_order_completeness.status === "success" ? 1 : 0) +
    (m.fulfillment_readiness.status === "success" ? 1 : 0);

  const healthStatus =
    healthScore >= 2.5 ? "success" : healthScore >= 1.5 ? "warning" : "pending";
  const healthLabel =
    healthScore >= 2.5 ? "Healthy" : healthScore >= 1.5 ? "Attention needed" : "Starting up";

  return (
    <div className="space-y-6">
      {/* Health Status */}
      <div className="bg-white border border-[#E8E8E8] rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-2">
              Knowledge Loop Health
            </p>
            <p className="text-2xl font-black text-[#0D0D0D]">{healthLabel}</p>
          </div>
          <div
            className={`text-4xl font-bold ${
              healthStatus === "success"
                ? "text-[#2ECC71]"
                : healthStatus === "warning"
                  ? "text-[#F39C12]"
                  : "text-[#888888]"
            }`}
          >
            ●
          </div>
        </div>
        <p className="text-[10px] text-[#888888] mt-4">
          Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <MetricCard
          title="Knowledge Capture Adoption"
          value={m.knowledge_capture_adoption.value}
          unit={m.knowledge_capture_adoption.unit}
          target={m.knowledge_capture_adoption.target}
          status={m.knowledge_capture_adoption.status}
          details={
            <>
              <p>
                {m.knowledge_capture_adoption.leads_with_observations} of{" "}
                {m.knowledge_capture_adoption.total_leads} leads recorded observations
              </p>
            </>
          }
        />

        {/* Metric 2 */}
        <MetricCard
          title="Standing Order Completeness"
          value={m.standing_order_completeness.value}
          unit={m.standing_order_completeness.unit}
          target={m.standing_order_completeness.target}
          status={m.standing_order_completeness.status}
          details={
            <>
              <p>
                {m.standing_order_completeness.complete_orders} of{" "}
                {m.standing_order_completeness.total_orders} orders have postcodes
              </p>
            </>
          }
        />

        {/* Metric 3 */}
        <MetricCard
          title="Fulfillment Readiness"
          value={m.fulfillment_readiness.value}
          unit={m.fulfillment_readiness.unit}
          target={m.fulfillment_readiness.target}
          status={m.fulfillment_readiness.status}
          details={
            <>
              <p>
                {m.fulfillment_readiness.generated_orders} of{" "}
                {m.fulfillment_readiness.total_orders} orders generated jobs
              </p>
            </>
          }
        />

        {/* Metric 4 */}
        <MetricCard
          title="Observation Usage"
          value={m.observation_usage.value}
          unit={m.observation_usage.unit}
          target={m.observation_usage.target}
          status={m.observation_usage.status}
          details={
            <>
              <p>
                Average per self-confirmed lead:
              </p>
              {m.observation_usage.latest_observation && (
                <p className="text-[10px] mt-2 italic">
                  Latest: {new Date(m.observation_usage.latest_observation).toLocaleDateString()}
                </p>
              )}
            </>
          }
        />

        {/* Metric 5 */}
        <MetricCard
          title="Revenue Flow Completeness"
          value={`${m.revenue_flow_completeness.jobs_generated_percent}%`}
          unit="jobs generated"
          target={m.revenue_flow_completeness.target}
          status={m.revenue_flow_completeness.status}
          details={
            <>
              <p>Jobs generated: {m.revenue_flow_completeness.jobs_generated_percent}%</p>
              <p>Jobs completed: {m.revenue_flow_completeness.jobs_completed_percent}%</p>
              <p>Jobs cancelled: {m.revenue_flow_completeness.jobs_cancelled_percent}%</p>
              <p>Total standing orders: {m.revenue_flow_completeness.total_standing_orders}</p>
            </>
          }
        />

        {/* Metric 6 */}
        <MetricCard
          title="Operational Efficiency"
          value={m.operational_efficiency.completed_jobs > 0 ? "✓" : "—"}
          unit={`${m.operational_efficiency.completed_jobs} completed`}
          target={m.operational_efficiency.target}
          status={m.operational_efficiency.status}
          details={
            <>
              {m.operational_efficiency.completed_jobs > 0 ? (
                <>
                  <p>Median: {m.operational_efficiency.median_time}</p>
                  <p>Average: {m.operational_efficiency.avg_time}</p>
                  <p className="text-[9px]">
                    Fastest: {m.operational_efficiency.fastest_time}
                  </p>
                  <p className="text-[9px]">
                    Slowest: {m.operational_efficiency.slowest_time}
                  </p>
                </>
              ) : (
                <p>No completed jobs yet</p>
              )}
            </>
          }
        />
      </div>
    </div>
  );
}
