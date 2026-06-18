"use client";

import { useEffect, useState } from "react";

interface AutopilotStatus {
  systemMode: string;
  causalValidationRequired: boolean;
  minCausalConfidence: number;
  minSampleSize: number;
  revenueStabilityRequired: boolean;
  canExecuteAutomated: boolean;
}

interface CausalInsight {
  patternKey?: string;
  causalLift: number;
  confidence: number;
  isValidCausal: boolean;
  recommendation: string;
  reason: string;
}

export function B2bAutopilotPanel() {
  const [status, setStatus] = useState<AutopilotStatus | null>(null);
  const [insights, setInsights] = useState<CausalInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statusRes, insightsRes] = await Promise.all([
          fetch("/api/b2b/system/autopilot"),
          fetch("/api/b2b/causal/insights"),
        ]);

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setStatus(statusData.status);
        }

        if (insightsRes.ok) {
          const insightsData = await insightsRes.json();
          setInsights(insightsData.insights || []);
        }
      } catch (error) {
        console.error("Failed to fetch autopilot data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading autopilot status...</div>;
  }

  if (!status) {
    return <div className="p-6 text-gray-500">Autopilot data unavailable</div>;
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "OBSERVE_ONLY":
        return "bg-gray-50 border-gray-200";
      case "SUGGESTION_ONLY":
        return "bg-blue-50 border-blue-200";
      case "HUMAN_APPROVAL_REQUIRED":
        return "bg-yellow-50 border-yellow-200";
      case "LIMITED_AUTOPILOT":
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getModeText = (mode: string) => {
    switch (mode) {
      case "OBSERVE_ONLY":
        return "Observation mode only";
      case "SUGGESTION_ONLY":
        return "Suggestions only (requires approval)";
      case "HUMAN_APPROVAL_REQUIRED":
        return "All actions require approval";
      case "LIMITED_AUTOPILOT":
        return "Autopilot active (safety-constrained)";
      default:
        return "Unknown mode";
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: System Mode */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Autopilot Status</h2>

        <div className={`rounded-lg p-6 border-2 mb-6 ${getModeColor(status.systemMode)}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-700">System Mode</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {status.systemMode}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {getModeText(status.systemMode)}
              </p>
            </div>
            <div className="text-right">
              {status.canExecuteAutomated ? (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Automation Available
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Manual Control
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Safety Requirements */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-900 mb-4">
            Safety Requirements
          </p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">
                Causal Validation Required
              </span>
              <span
                className={`text-sm font-medium ${
                  status.causalValidationRequired ? "text-orange-600" : "text-gray-500"
                }`}
              >
                {status.causalValidationRequired ? "✓ Yes" : "✗ No"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">
                Minimum Causal Confidence
              </span>
              <span className="text-sm font-medium text-gray-900">
                {status.minCausalConfidence}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">
                Minimum Sample Size
              </span>
              <span className="text-sm font-medium text-gray-900">
                {status.minSampleSize}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">
                Revenue Stability Required
              </span>
              <span
                className={`text-sm font-medium ${
                  status.revenueStabilityRequired ? "text-orange-600" : "text-gray-500"
                }`}
              >
                {status.revenueStabilityRequired ? "✓ Yes" : "✗ No"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Causally Valid Recommendations */}
      {insights.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Causally Validated Recommendations
          </h2>

          <div className="space-y-3">
            {insights
              .filter((i) => i.isValidCausal)
              .slice(0, 5)
              .map((insight, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {insight.patternKey?.replace(/_/g, " ") || "Pattern"}
                      </span>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        {insight.recommendation}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {insight.reason}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-green-900">
                      {insight.confidence}%
                    </p>
                    <p className="text-xs text-gray-600">confidence</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* SECTION 3: Execution Gate Notice */}
      {!status.canExecuteAutomated && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <p className="text-sm font-medium text-blue-900 mb-2">
            🔒 Automation Blocked
          </p>
          <p className="text-sm text-blue-800">
            System is not in LIMITED_AUTOPILOT mode. All actions require operator
            approval before execution.
          </p>
          <p className="text-xs text-blue-700 mt-2">
            To enable autopilot: reach min confidence threshold and ensure guardrails pass.
          </p>
        </div>
      )}

      {/* SECTION 4: Core Principle */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm font-medium text-gray-900 mb-2">Core Principle</p>
        <p className="text-sm text-gray-700">
          <strong>SUGGESTION FIRST.</strong> The system always recommends before
          acting. No automatic execution without causal validation and operator approval.
        </p>
      </div>
    </div>
  );
}
