/**
 * Wave 3 Insight Card
 *
 * Renders Wave3Insight into user-facing format.
 * No Wave 2 technical details exposed.
 * No raw JSON.
 * Action-oriented presentation.
 */

import React from "react";
import { Wave3Insight } from "../wave3-insight-translator";

interface Wave3InsightCardProps {
  insight: Wave3Insight;
}

const confidenceColors = {
  high: "border-green-500 bg-green-50",
  medium: "border-yellow-500 bg-yellow-50",
  low: "border-red-500 bg-red-50",
};

const confidenceLabels = {
  high: "High Confidence",
  medium: "Medium Confidence",
  low: "Low Confidence",
};

export function Wave3InsightCard({ insight }: Wave3InsightCardProps) {
  const confidenceColor = confidenceColors[insight.confidence];
  const confidenceLabel = confidenceLabels[insight.confidence];

  if (insight.status === "INSUFFICIENT_SIGNAL") {
    return (
      <div className={`rounded-lg border-2 p-6 ${confidenceColor}`}>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{insight.summary}</h2>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">{insight.implications[0]}</p>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-gray-600">Next Steps:</p>
          <ul className="space-y-2">
            {insight.recommended_actions.map((action, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-gray-400"></span>
                <span className="text-sm text-gray-700">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border-2 p-6 ${confidenceColor}`}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">{insight.summary}</h2>
        </div>
        <div className="ml-4 flex-shrink-0">
          <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">
            {confidenceLabel}
          </span>
        </div>
      </div>

      {/* Implications */}
      {insight.implications.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase text-gray-600">Why This Matters:</p>
          <ul className="space-y-2">
            {insight.implications.map((implication, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-gray-700"></span>
                <span className="text-sm text-gray-700">{implication}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Actions */}
      {insight.recommended_actions.length > 0 && (
        <div className="mb-6">
          <p className="mb-3 text-xs font-semibold uppercase text-gray-600">Recommended Actions:</p>
          <div className="space-y-2">
            {insight.recommended_actions.map((action, i) => (
              <button
                key={i}
                className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Source Summary */}
      <div className="border-t border-gray-200 pt-4 text-xs text-gray-600">
        <div className="mb-2 flex justify-between">
          <span>Signal Count:</span>
          <span className="font-semibold">{insight.source_summary.total_signals}</span>
        </div>
        {insight.source_summary.key_sources.length > 0 && (
          <div className="mb-2 flex justify-between">
            <span>Sources:</span>
            <span className="font-semibold">{insight.source_summary.key_sources.join(", ")}</span>
          </div>
        )}
        {insight.source_summary.contradiction_flag && (
          <div className="text-red-600">
            <strong>⚠️ Contradictions detected</strong>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="mt-4 border-t border-gray-200 pt-4 text-right text-xs text-gray-500">
        Generated {new Date(insight.meta.generated_at).toLocaleString()}
      </div>
    </div>
  );
}
