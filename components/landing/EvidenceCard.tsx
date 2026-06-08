"use client";

interface EvidenceCardProps {
  evidence: string;
  source?: string;
  context?: string;
}

export default function EvidenceCard({
  evidence,
  source,
  context,
}: EvidenceCardProps) {
  return (
    <div className="bg-[#F5F5F5] rounded-2xl p-5 border border-[#E8E8E8]">
      {/* Section Label (text-[10px], uppercase, Tier 1) */}
      <p className="text-[10px] uppercase tracking-[0.1em] text-[#888888] font-semibold mb-2">
        Evidence & Context
      </p>

      {/* Evidence Statement (text-sm, no marketing language) */}
      <p className="text-sm text-[#0D0D0D] leading-relaxed mb-3">
        {evidence}
      </p>

      {/* Source Attribution (text-[10px], subtle) */}
      {source && (
        <p className="text-[10px] text-[#888888] mb-2">
          {source}
        </p>
      )}

      {/* Additional Context (text-xs, muted) */}
      {context && (
        <p className="text-xs text-[#888888]">
          {context}
        </p>
      )}
    </div>
  );
}
