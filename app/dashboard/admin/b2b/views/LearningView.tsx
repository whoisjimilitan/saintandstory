"use client";

import { useEffect, useState } from "react";

interface MetricRow {
  pressure_type?: string;
  copy_variant?: string;
  yes_rate: number;
  sent_count: number;
  yes_count: number;
  no_count: number;
}

export function LearningView() {
  const [pressureTypes, setPressureTypes] = useState<MetricRow[]>([]);
  const [copyVariants, setCopyVariants] = useState<MetricRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const response = await fetch("/api/b2b/learning");
        if (response.ok) {
          const data = await response.json();
          setPressureTypes(data.pressureTypes || []);
          setCopyVariants(data.copyVariants || []);
        }
      } catch (error) {
        console.error("Failed to load metrics:", error);
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 px-6 py-10">
        <p className="text-sm text-[#888888]">Loading metrics...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 py-10 overflow-auto">
      <div className="max-w-4xl space-y-16">
        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-black text-[#0D0D0D] tracking-tight">
            Learning Dashboard
          </h1>
          <p className="text-sm text-[#888888] mt-3">
            Read-only view of what is working. Use to inform settings decisions.
          </p>
        </div>

        {/* PRESSURE TYPE RANKINGS */}
        {pressureTypes.length > 0 && (
          <div className="space-y-8">
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D]">
              Pressure Type Performance
            </h2>
            <div className="space-y-4">
              {pressureTypes.map((row, idx) => (
                <div
                  key={idx}
                  className="px-4 py-4 border-l-2 border-[#E8E8E8] hover:border-[#0D0D0D] transition-colors"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-[#0D0D0D]">
                        {row.pressure_type}
                      </p>
                      <div className="flex gap-6 mt-2 text-xs text-[#888888]">
                        <span>Sent: {row.sent_count}</span>
                        <span>YES: {row.yes_count}</span>
                        <span>NO: {row.no_count}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-[#0D0D0D]">
                        {(row.yes_rate * 100).toFixed(1)}%
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#888888]">
                        YES Rate
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COPY VARIANT COMPARISON */}
        {copyVariants.length > 0 && (
          <div className="space-y-8 pt-12 border-t border-[#E8E8E8]">
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D]">
              Copy Variant Performance
            </h2>
            <div className="space-y-4">
              {copyVariants.map((row, idx) => (
                <div
                  key={idx}
                  className="px-4 py-4 border-l-2 border-[#E8E8E8] hover:border-[#0D0D0D] transition-colors"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-[#0D0D0D]">
                        Variant {row.copy_variant}
                        {row.copy_variant === "A"
                          ? " (Pain-First)"
                          : " (Solution-First)"}
                      </p>
                      <div className="flex gap-6 mt-2 text-xs text-[#888888]">
                        <span>Sent: {row.sent_count}</span>
                        <span>YES: {row.yes_count}</span>
                        <span>NO: {row.no_count}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-[#0D0D0D]">
                        {(row.yes_rate * 100).toFixed(1)}%
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#888888]">
                        YES Rate
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {pressureTypes.length === 0 && copyVariants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-[#888888]">
              No data yet. Send emails and capture responses to see metrics.
            </p>
          </div>
        )}

        {/* INFO */}
        <div className="space-y-4 pt-12 border-t border-[#E8E8E8]">
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D]">
            How to Use These Metrics
          </h3>
          <div className="space-y-2 text-xs text-[#666666]">
            <p>
              <strong>YES Rate:</strong> Percentage of responses that were YES (intent signal).
            </p>
            <p>
              <strong>Sent Count:</strong> Total emails sent for this pressure type or variant.
            </p>
            <p>
              <strong>Use this to:</strong> Decide which pressure types to enable/disable in Settings.
            </p>
            <p>
              <strong>⚠️ Remember:</strong> High YES rate doesn't always mean high-quality intent.
              Verify with follow-up conversations before optimizing too aggressively.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
