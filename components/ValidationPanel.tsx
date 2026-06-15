'use client';

import type { ValidationIntelligence } from "@/lib/validation-intelligence";

interface Props {
  validation: ValidationIntelligence;
}

export function ValidationPanel({ validation }: Props) {
  const getScoreColor = (tier: string) => {
    if (tier === 'ignore') {
      return { bg: "#FFE5E5", text: "#CC0000", label: "Ignore/Monitor" };
    } else if (tier === 'learn') {
      return { bg: "#FFF8E5", text: "#CC6600", label: "Learn" };
    }
    return { bg: "#E8F5E9", text: "#1B5E20", label: "Act" };
  };

  const scoreColor = getScoreColor(validation.action_tier);
  const isLearnable = validation.action_tier !== 'ignore';
  const isCommercial = validation.action_tier === 'act';

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
          {validation.action_tier === 'ignore' && (
            <p className="text-sm text-[#CC0000]">
              Not enough signal to act. Monitor for future engagement.
            </p>
          )}
          {validation.action_tier === 'learn' && (
            <p className="text-sm text-[#CC6600]">
              Eligible for pattern learning. Strong logistics signal.
            </p>
          )}
          {validation.action_tier === 'act' && (
            <p className="text-sm text-[#1B5E20]">
              Commercially actionable. Engage and propose solution.
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
          isLearnable
            ? "bg-[#E8F5E9] border-[#C8E6C9]"
            : "bg-[#FFF8E5] border-[#FFE5CC]"
        }`}>
          <p className={`text-sm font-semibold ${
            isLearnable ? "text-[#1B5E20]" : "text-[#CC6600]"
          }`}>
            {validation.recommended_action}
          </p>
        </div>
      </div>

      {/* ACTION TIER GATES */}
      <div className="space-y-3">
        <div className={`p-3 rounded border text-sm ${
          validation.action_tier !== 'ignore'
            ? "bg-[#E8F5E9] border-[#C8E6C9] text-[#1B5E20]"
            : "bg-[#F5F5F5] border-[#E8E8E8] text-[#999999]"
        }`}>
          <p className="font-semibold">Pattern Intelligence (≥60)</p>
          <p className="text-[10px] mt-1">
            {validation.action_tier !== 'ignore' ? "✓ Eligible" : "— Not yet"}
          </p>
        </div>
        <div className={`p-3 rounded border text-sm ${
          validation.action_tier === 'act'
            ? "bg-[#E8F5E9] border-[#C8E6C9] text-[#1B5E20]"
            : "bg-[#F5F5F5] border-[#E8E8E8] text-[#999999]"
        }`}>
          <p className="font-semibold">Commercial Intelligence (≥75)</p>
          <p className="text-[10px] mt-1">
            {validation.action_tier === 'act' ? "✓ Eligible" : "— Not yet"}
          </p>
        </div>
      </div>
    </div>
  );
}
