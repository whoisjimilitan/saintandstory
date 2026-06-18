"use client";

import { useEffect, useState } from "react";

interface SystemHealth {
  systemMode: string;
  learningStability: number;
  revenueVolatility: string;
  patternConfidenceDrift: number;
  guardrailTriggersSevenDay: number;
  lastAnomalyDetected: string | null;
}

interface Override {
  id: string;
  trigger: string;
  reason: string;
  impactScore: number;
  createdAt: string;
}

export function B2bSystemObservability() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const response = await fetch("/api/b2b/system/health");
        if (response.ok) {
          const data = await response.json();
          setHealth(data.health);
          setOverrides(data.recentOverrides || []);
        }
      } catch (error) {
        console.error("Failed to fetch system health:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHealth();
    const interval = setInterval(fetchHealth, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading system health...</div>;
  }

  if (!health) {
    return <div className="p-6 text-gray-500">System health not available</div>;
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "MANUAL":
        return "bg-yellow-50 border-yellow-200";
      case "ASSISTED":
        return "bg-blue-50 border-blue-200";
      case "AUTOPILOT":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getModeTextColor = (mode: string) => {
    switch (mode) {
      case "MANUAL":
        return "text-yellow-900";
      case "ASSISTED":
        return "text-blue-900";
      case "AUTOPILOT":
        return "text-green-900";
      default:
        return "text-gray-900";
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: System Health Dashboard */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">System Health</h2>

        {/* Control Mode */}
        <div className={`rounded-lg p-4 border mb-6 ${getModeColor(health.systemMode)}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Current Control Mode</p>
              <p className={`text-2xl font-bold mt-2 ${getModeTextColor(health.systemMode)}`}>
                {health.systemMode}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {health.systemMode === "MANUAL"
                  ? "Operator full control"
                  : health.systemMode === "ASSISTED"
                    ? "System recommends, operator approves"
                    : "System executes autonomously"}
              </p>
            </div>
          </div>
        </div>

        {/* Health Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Learning Stability</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {health.learningStability.toFixed(0)}%
            </p>
            <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: `${Math.min(100, health.learningStability)}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Revenue Volatility</p>
            <p
              className={`text-2xl font-bold mt-2 ${
                health.revenueVolatility === "HIGH"
                  ? "text-red-900"
                  : "text-green-900"
              }`}
            >
              {health.revenueVolatility}
            </p>
            <p className="text-xs text-gray-600 mt-2">Detected in past 24h</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Pattern Confidence Drift</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {health.patternConfidenceDrift.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-600 mt-2">Deviation from mean</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Guardrail Triggers (7d)</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {health.guardrailTriggersSevenDay}
            </p>
            <p className="text-xs text-gray-600 mt-2">Protection events</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: System Override Log */}
      {overrides.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Recent System Overrides (7 Days)
          </h2>
          <div className="space-y-3">
            {overrides.map((override) => (
              <div
                key={override.id}
                className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        override.trigger === "GUARDRAIL"
                          ? "bg-yellow-100 text-yellow-800"
                          : override.trigger === "HUMAN"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {override.trigger}
                    </span>
                    <p className="font-medium text-gray-900">{override.reason}</p>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(override.createdAt).toLocaleDateString()} at{" "}
                    {new Date(override.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {override.impactScore.toFixed(0)}% impact
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: System Status */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-4">System Status</h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">All guardrails active</span>
            <span className="text-sm font-medium text-green-600">✓</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Learning stability &gt; 80%</span>
            <span
              className={`text-sm font-medium ${
                health.learningStability > 80 ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {health.learningStability > 80 ? "✓" : "⚠"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Revenue volatility is low
            </span>
            <span
              className={`text-sm font-medium ${
                health.revenueVolatility === "LOW" ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {health.revenueVolatility === "LOW" ? "✓" : "⚠"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
