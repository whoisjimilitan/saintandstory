'use client';

import type { ValidationIntelligence } from "@/lib/validation-intelligence";

interface Props {
  validation: ValidationIntelligence;
}

export function ValidationPanel({ validation }: Props) {
  const getScoreColor = (score: number) => {
    if (score < 21) {
      return { bg: "#FFE5E5", text: "#CC0000", label: "Ignore" };
    } else if (score < 41) {
      return { bg: "#FFE5CC", text: "#CC5500", label: "Monitor" };
    } else if (score < 61) {
      return { bg: "#FFF8E5", text: "#CC6600", label: "Investigate" };
    } else if (score < 81) {
      return { bg: "#E8F5E9", text: "#1B5E20", label: "Engage" };
    }
    return { bg: "#E8F5E9", text: "#1B5E20", label: "Prioritise" };
  };

  const scoreColor = getScoreColor(validation.logistics_fit_score);
  const isReadyForLearning = validation.logistics_fit_score >= 60;

  return (
    <div className="bg-white border border-[#E8E8E8] rounded p-8 space-y-8">
      {/* HEADER */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#0D0D0D]">
            VALIDATION INTELLIGENCE
          </h3>
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.05em] px-3 py-1 rounded"
            style={{
              backgroundColor: scoreColor.bg,
              color: scoreColor.text
            }}
          >
            {scoreColor.label}
          </span>
        </div>
        <p className="text-[10px] text-[#888888]">
          How strongly this indicates a real, logistics-solvable blocked outcome
        </p>
      </div>

      <div className="border-t border-[#E8E8E8]"></div>

      {/* LOGISTICS FIT SCORE */}
      <div>
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.05em] mb-4">
          Logistics Fit Score
        </p>

        {/* Score Display */}
        <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded p-6 mb-6">
          <div className="flex items-baseline justify-between mb-4">
            <p className="text-6xl font-black text-[#0D0D0D]">
              {validation.logistics_fit_score}
            </p>
            <p className="text-[10px] text-[#888888]">/ 100</p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#E8E8E8] rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-[#0D0D0D]"
              style={{
                width: `${validation.logistics_fit_score}%`
              }}
            />
          </div>
        </div>

        {/* Score meaning */}
        <div className="space-y-3">
          {validation.logistics_fit_score < 21 && (
            <p className="text-sm text-[#CC0000]">
              No meaningful engagement. Ignore this case.
            </p>
          )}
          {validation.logistics_fit_score >= 21 && validation.logistics_fit_score < 41 && (
            <p className="text-sm text-[#CC5500]">
              Weak interest. Uncertain relevance. Monitor for future signals.
            </p>
          )}
          {validation.logistics_fit_score >= 41 && validation.logistics_fit_score < 61 && (
            <p className="text-sm text-[#CC6600]">
              Possible logistics relevance. Investigate further on call.
            </p>
          )}
          {validation.logistics_fit_score >= 61 && validation.logistics_fit_score < 81 && (
            <p className="text-sm text-[#1B5E20]">
              Strong logistics relevance. Engage and propose solution.
            </p>
          )}
          {validation.logistics_fit_score >= 81 && (
            <p className="text-sm text-[#1B5E20]">
              Confirmed logistics opportunity. Fast-track this case.
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-[#E8E8E8]"></div>

      {/* RECOMMENDED ACTION */}
      <div>
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.05em] mb-3">
          Next Step
        </p>
        <div className={`p-4 rounded border ${
          isReadyForLearning
            ? "bg-[#E8F5E9] border-[#C8E6C9]"
            : "bg-[#FFF8E5] border-[#FFE5CC]"
        }`}>
          <p className={`text-sm font-semibold ${
            isReadyForLearning ? "text-[#1B5E20]" : "text-[#CC6600]"
          }`}>
            {validation.recommended_action}
          </p>
        </div>
      </div>

      {/* LEARNING GATE */}
      <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded p-4">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.05em] mb-2">
          Learning Systems
        </p>
        <p className={`text-sm ${isReadyForLearning ? "text-[#1B5E20]" : "text-[#999999]"}`}>
          {isReadyForLearning
            ? "✓ Ready for Pattern, Commercial, and Learning Intelligence"
            : "— Only cases with score ≥ 60 enter learning systems"}
        </p>
      </div>
    </div>
  );
}
