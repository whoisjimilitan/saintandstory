"use client";

import { ArrowRight } from "lucide-react";

interface CTAButtonProps {
  label: string;
  onClick: () => void;
  loading?: boolean;
  fullWidth?: boolean;
  showIcon?: boolean;
}

/**
 * CTAButton (Landing Page Variant)
 *
 * Rules:
 * - Single action only (no secondary CTAs on page)
 * - Deferred decision framing ("See what's next", not "Sign up")
 * - Tier 1 styling only: bg-[#0D0D0D], hover:bg-[#333333], rounded-full
 * - Optional Lucide icon (ArrowRight)
 * - No marketing language
 */
export default function CTAButton({
  label,
  onClick,
  loading = false,
  fullWidth = true,
  showIcon = true,
}: CTAButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${
        fullWidth ? "w-full" : "inline-block"
      } flex items-center justify-center gap-2 bg-[#0D0D0D] hover:bg-[#333333] disabled:opacity-40 text-white font-semibold py-2.5 px-4 rounded-full text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D0D0D] focus:ring-offset-2`}
    >
      {loading ? "Loading…" : label}
      {!loading && showIcon && <ArrowRight size={16} strokeWidth={2} />}
    </button>
  );
}
