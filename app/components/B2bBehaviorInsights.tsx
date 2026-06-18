"use client";

import { useEffect, useState } from "react";

interface BehaviorMetric {
  variantId?: string;
  campaignId?: string;
  pressureType?: string;
  sentCount: number;
  openCount: number;
  clickCount: number;
  replyYesCount: number;
  replyNoCount: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  yesRate: number;
}

interface InsightSummary {
  bestVariant?: BehaviorMetric;
  worstVariant?: BehaviorMetric;
  bestPressureType?: string;
  allMetrics: BehaviorMetric[];
}

export function B2bBehaviorInsights() {
  const [summary, setSummary] = useState<InsightSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch("/api/b2b/behavior/metrics");
        if (response.ok) {
          const data = await response.json();
          const metrics = data.metrics as BehaviorMetric[];

          // Derive insights
          const bestVariant = metrics[0]; // Sorted by yesRate desc
          const worstVariant = metrics[metrics.length - 1];

          // Best pressure type by avg yes_rate
          const pressureTypeMap = new Map<string, BehaviorMetric[]>();
          metrics.forEach((m) => {
            if (m.pressureType) {
              if (!pressureTypeMap.has(m.pressureType)) {
                pressureTypeMap.set(m.pressureType, []);
              }
              pressureTypeMap.get(m.pressureType)!.push(m);
            }
          });

          let bestPressureType = "";
          let bestAvgRate = 0;
          pressureTypeMap.forEach((variants, type) => {
            const avgRate =
              variants.reduce((sum, v) => sum + Number(v.yesRate), 0) / variants.length;
            if (avgRate > bestAvgRate) {
              bestAvgRate = avgRate;
              bestPressureType = type;
            }
          });

          setSummary({
            bestVariant,
            worstVariant,
            bestPressureType,
            allMetrics: metrics,
          });
        }
      } catch (error) {
        console.error("Failed to fetch behavior metrics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading behavior insights...</div>;
  }

  if (!summary || summary.allMetrics.length === 0) {
    return (
      <div className="p-6 text-gray-500">No behavior data yet. Send more emails to see patterns.</div>
    );
  }

  const { bestVariant, worstVariant, bestPressureType, allMetrics } = summary;
  const bestVariantLabel = bestVariant?.variantId || "Unknown";
  const worstVariantLabel = worstVariant?.variantId || "Unknown";

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6">What Is Working?</h2>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {bestVariant && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-700 font-medium">Best Variant</p>
            <p className="text-2xl font-bold text-green-900 mt-2">
              {bestVariantLabel}
            </p>
            <p className="text-sm text-green-700 mt-1">
              {bestVariant.yesRate.toFixed(1)}% YES rate
            </p>
          </div>
        )}

        {worstVariant && (
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="text-sm text-red-700 font-medium">Worst Variant</p>
            <p className="text-2xl font-bold text-red-900 mt-2">
              {worstVariantLabel}
            </p>
            <p className="text-sm text-red-700 mt-1">
              {worstVariant.yesRate.toFixed(1)}% YES rate
            </p>
          </div>
        )}

        {bestPressureType && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700 font-medium">Best Pressure Type</p>
            <p className="text-2xl font-bold text-blue-900 mt-2 capitalize">
              {bestPressureType}
            </p>
            <p className="text-sm text-blue-700 mt-1">Highest engagement</p>
          </div>
        )}
      </div>

      {/* Variant Comparison Table */}
      <div className="mb-8">
        <h3 className="font-semibold text-gray-900 mb-3">Variant Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700">
                  Variant
                </th>
                <th className="px-4 py-2 text-center font-medium text-gray-700">
                  Sent
                </th>
                <th className="px-4 py-2 text-center font-medium text-gray-700">
                  Opens
                </th>
                <th className="px-4 py-2 text-center font-medium text-gray-700">
                  Clicks
                </th>
                <th className="px-4 py-2 text-center font-medium text-gray-700">
                  Replies
                </th>
                <th className="px-4 py-2 text-center font-medium text-gray-700">
                  YES Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {allMetrics.slice(0, 10).map((metric, idx) => (
                <tr
                  key={idx}
                  className={
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }
                >
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {metric.variantId || "—"}
                  </td>
                  <td className="px-4 py-2 text-center text-gray-600">
                    {metric.sentCount}
                  </td>
                  <td className="px-4 py-2 text-center text-gray-600">
                    {metric.openCount} ({metric.openRate.toFixed(1)}%)
                  </td>
                  <td className="px-4 py-2 text-center text-gray-600">
                    {metric.clickCount} ({metric.clickRate.toFixed(1)}%)
                  </td>
                  <td className="px-4 py-2 text-center text-gray-600">
                    {metric.replyYesCount + metric.replyNoCount}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className={
                      metric.yesRate > 10
                        ? "text-green-700 font-semibold"
                        : metric.yesRate > 5
                          ? "text-yellow-700 font-semibold"
                          : "text-red-700 font-semibold"
                    }>
                      {metric.yesRate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insight Box */}
      {bestVariant && worstVariant && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-2">📊 Key Insight</p>
          <p className="text-sm text-blue-800">
            {bestVariantLabel} outperforms {worstVariantLabel} by{" "}
            <span className="font-semibold">
              {(bestVariant.yesRate - worstVariant.yesRate).toFixed(1)}%
            </span>{" "}
            in YES rate. Focus on variant {bestVariantLabel} for future campaigns.
          </p>
          {bestPressureType && (
            <p className="text-sm text-blue-800 mt-2">
              <span className="capitalize font-semibold">{bestPressureType}</span>{" "}
              messaging shows the highest engagement across all variants.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
