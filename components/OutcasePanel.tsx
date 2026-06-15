'use client';

import type { OutcomeCase } from "@/lib/outcome-case-engine";

interface Props {
  outcomeCase: OutcomeCase;
}

export function OutcomePanel({ outcomeCase }: Props) {
  const relevanceColors = {
    high: { bg: "#E8F5E9", text: "#1B5E20", label: "High" },
    medium: { bg: "#FFF8E5", text: "#CC6600", label: "Medium" },
    low: { bg: "#FFE5CC", text: "#CC5500", label: "Low" },
    none: { bg: "#FFE5E5", text: "#CC0000", label: "None" }
  };

  const relevance = relevanceColors[outcomeCase.saint_story_relevance];

  return (
    <div className="bg-white border border-[#E8E8E8] rounded p-8 space-y-8">
      {/* HEADER */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#0D0D0D]">
            OUTCOME CASE
          </h3>
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.05em] px-3 py-1 rounded"
            style={{ backgroundColor: relevance.bg, color: relevance.text }}
          >
            {relevance.label} Relevance
          </span>
        </div>
        <p className="text-[10px] text-[#888888]">
          {outcomeCase.confidence}% confidence
        </p>
      </div>

      <div className="border-t border-[#E8E8E8]"></div>

      {/* DESIRED OUTCOME */}
      <div>
        <h4 className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.05em] mb-2">
          What they want
        </h4>
        <p className="text-base font-semibold text-[#0D0D0D]">
          {outcomeCase.desired_outcome}
        </p>
      </div>

      {/* BLOCKED OUTCOME */}
      <div>
        <h4 className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.05em] mb-2">
          What's blocking it
        </h4>
        <p className="text-base font-semibold text-[#0D0D0D]">
          {outcomeCase.blocked_outcome}
        </p>
      </div>

      {/* OPERATIONAL CAUSE */}
      <div>
        <h4 className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.05em] mb-2">
          Why it's blocked
        </h4>
        <p className="text-base text-[#333333]">
          {outcomeCase.operational_cause}
        </p>
      </div>

      {/* LOGISTICS FRICTION */}
      <div>
        <h4 className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.05em] mb-2">
          The logistics friction
        </h4>
        <p className="text-base text-[#333333]">
          {outcomeCase.logistics_friction}
        </p>
      </div>

      <div className="border-t border-[#E8E8E8]"></div>

      {/* WHY THIS MATTERS */}
      <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded p-4">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.05em] mb-2">
          Saint & Story Relevance
        </p>
        <p className="text-sm leading-relaxed text-[#333333]">
          {outcomeCase.saint_story_relevance === 'none' && "Not a logistics problem we can solve."}
          {outcomeCase.saint_story_relevance === 'low' && "Possible logistics angle, but signal is weak. Insufficient confidence to outreach."}
          {outcomeCase.saint_story_relevance === 'medium' && "Logistics friction is likely involved. Worth exploring in conversation."}
          {outcomeCase.saint_story_relevance === 'high' && "Clear logistics friction. This is likely a real problem we can solve."}
        </p>
      </div>
    </div>
  );
}
