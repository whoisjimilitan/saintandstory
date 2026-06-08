"use client";

import { ArrowRight } from "lucide-react";

interface HeroCardProps {
  observation: string;
  briefContext: string;
  prospectName?: string;
  onCTA: () => void;
  ctaLabel?: string;
  loading?: boolean;
}

export default function HeroCard({
  observation,
  briefContext,
  prospectName,
  onCTA,
  ctaLabel = "See what's next",
  loading = false,
}: HeroCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E8E8E8] shadow-sm">
      {/* Observation Header (font-black, Tier 1) */}
      <h1 className="font-sans font-black text-[#0D0D0D] text-sm tracking-tight mb-3">
        {observation}
      </h1>

      {/* Brief Context (text-sm, consultant tone) */}
      <p className="text-sm text-[#0D0D0D] leading-relaxed mb-4">
        {briefContext}
      </p>

      {/* Personalization Line (text-xs, muted) */}
      {prospectName && (
        <p className="text-xs text-[#888888] mb-5">
          For {prospectName}, this means we should explore what this looks like
          operationally.
        </p>
      )}

      {/* CTA Button (Tier 1: #0D0D0D, hover:#333333, rounded-full) */}
      <button
        onClick={onCTA}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#0D0D0D] hover:bg-[#333333] disabled:opacity-40 text-white font-semibold py-2.5 px-4 rounded-full text-sm transition-colors"
      >
        {loading ? "Loading…" : ctaLabel}
        {!loading && <ArrowRight size={16} strokeWidth={2} />}
      </button>

      {/* Continuity Note (optional, text-[10px]) */}
      <p className="text-[10px] text-[#888888] mt-4 italic">
        (Continuing from your brief)
      </p>
    </div>
  );
}
