"use client";

import { useEffect, useState } from "react";

interface TopPattern {
  patternId: string;
  patternKey?: string;
  totalRevenue: number;
  conversionCount: number;
  roiScore: number;
  confidence: number;
}

interface RevenueSummary {
  totalRevenue: number;
  averageRoi: number;
  topPatterns: TopPattern[];
  byType: Record<string, { revenue: number; count: number; roi: number }>;
}

export function B2bRevenueIntelligence() {
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRevenue() {
      try {
        const response = await fetch("/api/b2b/revenue/insights");
        if (response.ok) {
          const data = await response.json();
          setSummary({
            totalRevenue: data.summary?.totalRevenue ?? 0,
            averageRoi: data.summary?.averageRoi ?? 0,
            topPatterns: data.topPatterns ?? [],
            byType: data.byType ?? {},
          });
        }
      } catch (error) {
        console.error("Failed to fetch revenue insights:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRevenue();
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading revenue insights...</div>;
  }

  if (!summary || summary.totalRevenue === 0) {
    return (
      <div className="p-6 text-gray-500">
        No revenue data yet. Record revenue events to generate insights.
      </div>
    );
  }

  const { totalRevenue, averageRoi, topPatterns, byType } = summary;

  // Format currency
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return "£0";
    return `£${Math.round(value).toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: What Makes Money */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">
          What Makes Money
        </h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-700 font-medium">Total Revenue</p>
            <p className="text-3xl font-bold text-green-900 mt-2">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-sm text-green-700 mt-1">
              from {topPatterns.length} patterns
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700 font-medium">Average ROI</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">
              {averageRoi.toFixed(0)}%
            </p>
            <p className="text-sm text-blue-700 mt-1">
              per pattern usage
            </p>
          </div>

          {topPatterns && topPatterns.length > 0 && (
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-purple-700 font-medium">
                Top Revenue Pattern
              </p>
              <p className="text-2xl font-bold text-purple-900 mt-2">
                {topPatterns[0]?.patternKey?.split("_")[1] || "Pattern"}
              </p>
              <p className="text-sm text-purple-700 mt-1">
                {formatCurrency(topPatterns[0]?.totalRevenue)}
              </p>
            </div>
          )}
        </div>

        {/* Revenue by Pattern Type */}
        {Object.keys(byType).length > 0 && (
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">
              Revenue by Pattern Type
            </h3>
            <div className="space-y-3">
              {Object.entries(byType)
                .sort(
                  ([, a], [, b]) =>
                    (b.revenue as number) - (a.revenue as number)
                )
                .map(([type, stats]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 capitalize">
                        {type.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm text-gray-600">
                        {(stats as any).count} conversions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency((stats as any).revenue)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {((stats as any).roi).toFixed(0)}% ROI
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Top Patterns ROI Table */}
      {topPatterns.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Revenue Leaders (ROI Ranked)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">
                    Pattern
                  </th>
                  <th className="px-4 py-2 text-center font-medium text-gray-700">
                    Revenue
                  </th>
                  <th className="px-4 py-2 text-center font-medium text-gray-700">
                    Conversions
                  </th>
                  <th className="px-4 py-2 text-center font-medium text-gray-700">
                    ROI
                  </th>
                  <th className="px-4 py-2 text-center font-medium text-gray-700">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody>
                {topPatterns.slice(0, 10).map((pattern, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {pattern.patternKey || "Unknown"}
                    </td>
                    <td className="px-4 py-2 text-center text-gray-600">
                      {formatCurrency(pattern.totalRevenue)}
                    </td>
                    <td className="px-4 py-2 text-center text-gray-600">
                      {pattern.conversionCount}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className="font-semibold text-green-700">
                        {pattern.roiScore.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center text-gray-600">
                      {pattern.confidence.toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: Revenue Insight */}
      {topPatterns && topPatterns.length > 0 && topPatterns[0] && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-medium text-green-900 mb-2">
            💰 Revenue Intelligence
          </p>
          <p className="text-sm text-green-800">
            {topPatterns[0].patternKey || "Top pattern"} is your top revenue generator with{" "}
            <span className="font-semibold">
              {(topPatterns[0].roiScore ?? 0).toFixed(0)}% ROI
            </span>
            . This pattern has generated{" "}
            <span className="font-semibold">
              {formatCurrency(topPatterns[0].totalRevenue)}
            </span>{" "}
            from {topPatterns[0].conversionCount ?? 0} conversions.
          </p>
        </div>
      )}
    </div>
  );
}
