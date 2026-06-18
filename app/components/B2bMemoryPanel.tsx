"use client";

import { useEffect, useState } from "react";

interface MemoryPattern {
  type: string;
  key: string;
  value: any;
  confidenceScore: number;
  evidenceCount: number;
}

interface MemorySummary {
  bestVariant?: any;
  bestPressureType?: any;
  bestSequences: any[];
  allPatterns: MemoryPattern[];
}

export function B2bMemoryPanel() {
  const [summary, setSummary] = useState<MemorySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMemory() {
      try {
        const response = await fetch("/api/b2b/memory/patterns");
        if (response.ok) {
          const data = await response.json();
          const patterns = data.patterns as MemoryPattern[];

          const bestVariant = patterns.find((p) => p.type === "VARIANT_WINNER");
          const bestPressure = patterns.find((p) => p.type === "PRESSURE_TYPE_WINNER");
          const bestSequences = patterns.filter((p) => p.type === "SEQUENCE_PATTERN");

          setSummary({
            bestVariant,
            bestPressureType: bestPressure,
            bestSequences,
            allPatterns: patterns,
          });
        }
      } catch (error) {
        console.error("Failed to fetch memory patterns:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMemory();
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading system memory...</div>;
  }

  if (!summary || summary.allPatterns.length === 0) {
    return (
      <div className="p-6 text-gray-500">
        No memory patterns yet. Build behavior metrics to generate recommendations.
      </div>
    );
  }

  const { bestVariant, bestPressureType, bestSequences } = summary;

  return (
    <div className="space-y-6">
      {/* SECTION 1: What We Know Works */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">What We Know Works</h2>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Best Variant */}
          {bestVariant && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-700 font-medium">Best Variant</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {bestVariant.value.variantId}
              </p>
              <p className="text-sm text-green-700 mt-1">
                {bestVariant.value.yesRate}% YES rate
              </p>
              <div className="mt-2 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-green-600">
                  {Math.round(Number(bestVariant.confidenceScore))}% confident
                </span>
              </div>
            </div>
          )}

          {/* Best Pressure Type */}
          {bestPressureType && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">Best Pressure Type</p>
              <p className="text-xl font-bold text-blue-900 mt-2 capitalize">
                {bestPressureType.value.pressureType}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {bestPressureType.value.yesRate}% conversion
              </p>
              <div className="mt-2 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-xs text-blue-600">
                  {Math.round(Number(bestPressureType.confidenceScore))}% confident
                </span>
              </div>
            </div>
          )}

          {/* Best Sequence */}
          {bestSequences.length > 0 && (
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-purple-700 font-medium">Best Sequence</p>
              <p className="text-sm font-mono text-purple-900 mt-2 break-words">
                {bestSequences[0].value.sequence}
              </p>
              <p className="text-sm text-purple-700 mt-1">
                {bestSequences[0].value.successRate}% success rate
              </p>
              <div className="mt-2 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span className="text-xs text-purple-600">
                  {Math.round(Number(bestSequences[0].confidenceScore))}% confident
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: What to Do Next */}
      {(bestVariant || bestPressureType || bestSequences.length > 0) && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Recommended Actions</h2>

          <div className="space-y-3">
            {bestVariant && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                <span className="text-xl">✓</span>
                <div>
                  <p className="font-medium text-gray-900">
                    Use Variant {bestVariant.value.variantId}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Consistently converts at {bestVariant.value.yesRate}%
                  </p>
                </div>
              </div>
            )}

            {bestPressureType && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-xl">✓</span>
                <div>
                  <p className="font-medium text-gray-900 capitalize">
                    Apply {bestPressureType.value.pressureType} Messaging
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    This pressure type shows the highest engagement across campaigns
                  </p>
                </div>
              </div>
            )}

            {bestSequences.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                <span className="text-xl">✓</span>
                <div>
                  <p className="font-medium text-gray-900">
                    Follow This Sequence
                  </p>
                  <p className="text-sm font-mono text-gray-600 mt-1">
                    {bestSequences[0].value.sequence}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {bestSequences[0].value.successRate}% of prospects following this path say YES
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: Confidence Levels */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Pattern Confidence Levels</h2>

        <div className="space-y-2">
          {summary.allPatterns
            .filter((p) => Number(p.confidenceScore) >= 75)
            .map((p) => (
              <div key={p.key} className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{p.key}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${Math.min(100, Number(p.confidenceScore))}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-12">
                    {Math.round(Number(p.confidenceScore))}%
                  </span>
                </div>
              </div>
            ))}
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Only high-confidence patterns (≥75%) are shown. System learns from every interaction.
        </p>
      </div>
    </div>
  );
}
