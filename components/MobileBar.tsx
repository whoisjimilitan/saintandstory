"use client";

import posthog from "posthog-js";

export default function MobileBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0D0E17] border-t border-white/10 px-4 py-3">
      <a
        href="#quote"
        onClick={() => posthog.capture("mobile_bar_cta_clicked")}
        className="block w-full bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white text-center font-bold py-3.5 rounded-xl text-sm transition-colors"
      >
        Get Your Free Quote &rarr;
      </a>
    </div>
  );
}
