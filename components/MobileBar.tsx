"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

  function open() {
    try { posthog.capture("mobile_bar_cta_clicked"); } catch { /* */ }
    document.dispatchEvent(new CustomEvent("open-lead-modal"));
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#E8E8E8] px-4 py-3">
      {side === "driver" ? (
        <Link
          href="/for-drivers"
          className="block w-full bg-[#0D0D0D] hover:bg-[#333333] text-white text-center font-semibold py-3.5 rounded-full text-sm transition-colors"
        >
          Join as driver →
        </Link>
      ) : (
        <button
          onClick={open}
          className="block w-full bg-[#0D0D0D] hover:bg-[#333333] text-white text-center font-semibold py-3.5 rounded-full text-sm transition-colors"
        >
          Post a job →
        </button>
      )}
    </div>
  );
}
