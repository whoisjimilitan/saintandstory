"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface MetricRow {
  pressure_type: string;
  industry: string | null;
  copy_variant: string | null;
  emails_sent: number;
  responses_yes: number;
  responses_no: number;
  yes_rate: number;
  conversion_rate: number;
}

export default function LearningDashboard() {
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pressure" | "industry" | "variant">("pressure");

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/b2b/learning/metrics");
        const data = await response.json();
        setMetrics(data.metrics || []);
      } catch (err) {
        console.error("Failed to fetch metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const groupByPressure = () => {
    const grouped: Record<string, MetricRow[]> = {};
    metrics.forEach((m) => {
      if (!grouped[m.pressure_type]) grouped[m.pressure_type] = [];
      grouped[m.pressure_type].push(m);
    });
    return grouped;
  };

  const totalSent = metrics.reduce((sum, m) => sum + m.emails_sent, 0);
  const totalYes = metrics.reduce((sum, m) => sum + m.responses_yes, 0);
  const avgYesRate =
    totalSent > 0 ? ((totalYes / totalSent) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-lg font-semibold">Learning</h1>
            <div className="hidden sm:flex gap-6">
              <Link
                href="/b2b/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/b2b/discover"
                className="text-gray-600 hover:text-gray-900"
              >
                Discover
              </Link>
              <Link
                href="/b2b/learning"
                className="text-gray-900 font-medium border-b-2 border-gray-900"
              >
                Learning
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Emails Sent</p>
            <p className="text-3xl font-bold text-gray-900">{totalSent}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">YES Responses</p>
            <p className="text-3xl font-bold text-green-600">{totalYes}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Avg YES Rate</p>
            <p className="text-3xl font-bold text-blue-600">{avgYesRate}%</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Pressure Types</p>
            <p className="text-3xl font-bold text-gray-900">
              {Object.keys(groupByPressure()).length}
            </p>
          </div>
        </div>

        {/* Pressure Type Breakdown */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">
              Performance by Pressure Type
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : metrics.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No data yet. Send emails to see performance metrics.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">
                      Pressure Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">
                      Industry
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-700">
                      Sent
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-700">
                      YES
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-700">
                      NO
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-700">
                      YES Rate
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-700">
                      Conversion
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {metrics
                    .sort((a, b) => b.conversion_rate - a.conversion_rate)
                    .map((metric, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {metric.pressure_type}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {metric.industry || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-gray-600">
                          {metric.emails_sent}
                        </td>
                        <td className="px-6 py-4 text-sm text-center font-medium text-green-600">
                          {metric.responses_yes}
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-gray-600">
                          {metric.responses_no}
                        </td>
                        <td className="px-6 py-4 text-sm text-center">
                          <span className={`${
                            metric.yes_rate >= 15
                              ? "text-green-600 font-medium"
                              : metric.yes_rate >= 10
                                ? "text-blue-600"
                                : "text-gray-600"
                          }`}>
                            {metric.yes_rate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-center font-medium text-blue-600">
                          {metric.conversion_rate.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Insights */}
        {metrics.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Insights</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              {metrics.length > 0 && (
                <>
                  <li>
                    ✓ Best performer:{" "}
                    <span className="font-medium">
                      {metrics.sort((a, b) => b.conversion_rate - a.conversion_rate)[0].pressure_type}
                    </span>{" "}
                    at{" "}
                    <span className="font-medium">
                      {metrics.sort((a, b) => b.conversion_rate - a.conversion_rate)[0].conversion_rate.toFixed(1)}%
                    </span>{" "}
                    conversion
                  </li>
                  <li>
                    • Focus on pressure types with 10%+ YES rate this week
                  </li>
                  <li>• A/B test copy variants to improve underperformers</li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
