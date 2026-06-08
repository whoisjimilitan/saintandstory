"use client";

interface ImplicationCardProps {
  implication: string;
  consequence?: string;
  decisionRelevance?: string;
}

export default function ImplicationCard({
  implication,
  consequence,
  decisionRelevance,
}: ImplicationCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E8E8E8]">
      {/* Section Label (text-[10px], uppercase, Tier 1) */}
      <p className="text-[10px] uppercase tracking-[0.1em] text-[#888888] font-semibold mb-2">
        What This Means
      </p>

      {/* Main Implication (text-sm, consultant tone) */}
      <p className="text-sm text-[#0D0D0D] leading-relaxed mb-3">
        {implication}
      </p>

      {/* Operational Consequence (text-xs, secondary) */}
      {consequence && (
        <p className="text-xs text-[#888888] mb-3">
          {consequence}
        </p>
      )}

      {/* Decision Relevance (text-xs, muted) */}
      {decisionRelevance && (
        <p className="text-xs text-[#888888] italic">
          {decisionRelevance}
        </p>
      )}
    </div>
  );
}
