"use client";

import { useEffect, useState } from "react";

interface MetricsData {
  timestamp: string;
  metrics: {
    leads_discovered: { value: number; target: string; status: string };
    leads_with_pain: { value: number; target: string; status: string };
    pain_penetration: { value: number; unit: string; target: string; status: string };
    standing_orders: { value: number; target: string; status: string };
    jobs_generated: { value: number; target: string; status: string };
  };
}

function MetricCard({
  title,
  value,
  unit,
  target,
  status,
}: {
  title: string;
  value: number | string;
  unit?: string;
  target: string;
  status: string;
}) {
  const statusColor = {
    success: "bg-[#F0F9F7] border border-[#D1E8E4]",
    warning: "bg-[#FBF7F2] border border-[#E8DACC]",
    pending: "bg-white border border-[#E8E8E8]",
  }[status] || "bg-white border border-[#E8E8E8]";

  const statusIcon = {
    success: "✓",
    warning: "⚠",
    pending: "—",
  }[status] || "—";

  const statusTextColor = {
    success: "text-[#1B6B54]",
    warning: "text-[#A86B2E]",
    pending: "text-[#999999]",
  }[status] || "text-[#999999]";

  return (
    <div className={`${statusColor} rounded-xl p-8 hover:shadow-md transition-all duration-200`}>
      <div className="flex items-baseline justify-between mb-6">
        <p className="text-[11px] font-medium text-[#666666] uppercase tracking-[0.15em] letter-spacing">
          {title}
        </p>
        <span className={`text-lg font-semibold ${statusTextColor}`}>
          {statusIcon}
        </span>
      </div>

      <div className="flex items-baseline gap-3 mb-6">
        <p className="text-5xl font-bold text-[#1A1A1A]">{value}</p>
        {unit && <p className="text-sm font-medium text-[#999999]">{unit}</p>}
      </div>

      <p className="text-xs text-[#999999]">
        <span className="font-medium">Target:</span> {target}
      </p>
    </div>
  );
}

export default function B2BMetricsCards() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch("/api/b2b/metrics/knowledge-loop");
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        console.error("Failed to fetch metrics:", err);
        // Fallback to empty metrics (always display something)
        setMetrics({
          timestamp: new Date().toISOString(),
          metrics: {
            leads_discovered: { value: 0, target: "10+", status: "pending" },
            leads_with_pain: { value: 0, target: "5+", status: "pending" },
            pain_penetration: { value: 0, unit: "%", target: "50%+", status: "pending" },
            standing_orders: { value: 0, target: "2+", status: "pending" },
            jobs_generated: { value: 0, target: "1+", status: "pending" }
          }
        });
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-8 border border-[#E8E8E8] text-center">
        <p className="text-[#999999] text-sm">Loading metrics…</p>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const m = metrics.metrics;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
      <MetricCard
        title="Leads Discovered"
        value={m.leads_discovered.value}
        target={m.leads_discovered.target}
        status={m.leads_discovered.status}
      />
      <MetricCard
        title="With Pain Signals"
        value={m.leads_with_pain.value}
        target={m.leads_with_pain.target}
        status={m.leads_with_pain.status}
      />
      <MetricCard
        title="Pain Penetration"
        value={m.pain_penetration.value}
        unit={m.pain_penetration.unit}
        target={m.pain_penetration.target}
        status={m.pain_penetration.status}
      />
      <MetricCard
        title="Standing Orders"
        value={m.standing_orders.value}
        target={m.standing_orders.target}
        status={m.standing_orders.status}
      />
      <MetricCard
        title="Jobs Generated"
        value={m.jobs_generated.value}
        target={m.jobs_generated.target}
        status={m.jobs_generated.status}
      />
    </div>
  );
}
