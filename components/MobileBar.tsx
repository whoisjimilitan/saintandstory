"use client";

import posthog from "posthog-js";

export default function MobileBar() {
  function open() {
    try { posthog.capture("mobile_bar_cta_clicked"); } catch { /* */ }
    document.dispatchEvent(new CustomEvent("open-lead-modal"));
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#E8E8E8] px-4 py-3">
      <button
        onClick={open}
        className="block w-full bg-[#0D0D0D] hover:bg-[#333333] text-white text-center font-semibold py-3.5 rounded-full text-sm transition-colors"
      >
        Get started →
      </button>
    </div>
  );
}
