"use client";

import { useEffect, useState } from "react";
import posthog from "posthog-js";

type Side = "customer" | "driver";

export default function MobileBar() {
  const [side, setSide] = useState<Side>("customer");

  useEffect(() => {
    const handler = (e: Event) => {
      setSide((e as CustomEvent<{ side: Side }>).detail.side);
    };
    document.addEventListener("hero-side-change", handler);
    return () => document.removeEventListener("hero-side-change", handler);
  }, []);

  function openLead() {
    try { posthog.capture("mobile_bar_cta_clicked"); } catch { /* */ }
    document.dispatchEvent(new CustomEvent("open-lead-modal"));
  }

  function openDriver() {
    try { posthog.capture("mobile_bar_driver_cta_clicked"); } catch { /* */ }
    document.dispatchEvent(new CustomEvent("open-driver-modal"));
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#E8E8E8] px-4 py-3">
      {side === "driver" ? (
        <button
          onClick={openDriver}
          className="block w-full bg-[#0D0D0D] hover:bg-[#333333] text-white text-center font-semibold py-3.5 rounded-full text-sm transition-colors"
        >
          Join as driver →
        </button>
      ) : (
        <button
          onClick={openLead}
          className="block w-full bg-[#0D0D0D] hover:bg-[#333333] text-white text-center font-semibold py-3.5 rounded-full text-sm transition-colors"
        >
          Post a job →
        </button>
      )}
    </div>
  );
}
