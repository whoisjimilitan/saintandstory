"use client";

import posthog from "posthog-js";

export default function MobileBar() {
  function open() {
    try { posthog.capture("mobile_bar_cta_clicked"); } catch { /* */ }
    document.dispatchEvent(new CustomEvent("open-lead-modal"));
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-navy border-t border-white/10 px-4 py-3">
      <button
        onClick={open}
        className="block w-full bg-brand hover:bg-brand-dark text-white text-center font-bold py-3.5 rounded-xl text-sm transition-colors"
      >
        Get Your Free Quote &rarr;
      </button>
    </div>
  );
}
