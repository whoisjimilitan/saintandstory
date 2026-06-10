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
    success: "bg-[#E8F5E9] border-l-4 border-l-[#2ECC71]",
    warning: "bg-[#FFF3E0] border-l-4 border-l-[#F39C12]",
    pending: "bg-[#F5F5F5] border-l-4 border-l-[#BDBDBD]",
  }[status] || "bg-[#F5F5F5] border-l-4 border-l-[#BDBDBD]";

  const statusIcon = {
    success: "✓",
    warning: "⚠",
    pending: "—",
  }[status] || "—";

  const statusTextColor = {
    success: "text-[#2ECC71]",
    warning: "text-[#F39C12]",
    pending: "text-[#888888]",
  }[status] || "text-[#888888]";

  return (
    <div className={`${statusColor} rounded-lg p-6 hover:shadow-sm transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">
            {title}
          </p>
        </div>
        <span className={`text-lg font-bold ${statusTextColor} ml-3`}>
          {statusIcon}
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <p className="text-4xl font-black text-[#0D0D0D]">{value}</p>
        {unit && <p className="text-sm text-[#888888]">{unit}</p>}
      </div>

      <p className="text-[10px] text-[#888888] uppercase tracking-[0.5px]">
        Target: {target}
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
      <div className="bg-[#F5F5F5] rounded-xl p-6 text-center">
        <p className="text-[#888888]">Loading metrics…</p>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const m = metrics.metrics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
