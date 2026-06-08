"use client";

interface BriefSummaryCardProps {
  title: string;
  summary: string;
  pattern?: string;
}

export default function BriefSummaryCard({
  title,
  summary,
  pattern,
}: BriefSummaryCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E8E8E8]">
      {/* Section Label (text-[10px], uppercase, Tier 1) */}
      <p className="text-[10px] uppercase tracking-[0.1em] text-[#888888] font-semibold mb-2">
        Situation Overview
      </p>

      {/* Title (font-semibold, text-sm) */}
      <h2 className="font-semibold text-sm text-[#0D0D0D] mb-2">
        {title}
      </h2>

      {/* Summary Paragraph (text-sm, consultant tone) */}
      <p className="text-sm text-[#0D0D0D] leading-relaxed mb-3">
        {summary}
      </p>

      {/* Optional Pattern Context (text-xs, muted) */}
      {pattern && (
        <p className="text-xs text-[#888888]">
          {pattern}
        </p>
      )}
    </div>
  );
}
