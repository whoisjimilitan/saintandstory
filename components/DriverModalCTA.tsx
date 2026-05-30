"use client";

import posthog from "posthog-js";

interface DriverModalCTAProps {
  label?: string;
  className?: string;
  source?: string;
}

export default function DriverModalCTA({
  label = "Join as driver →",
  className = "",
  source = "cta",
}: DriverModalCTAProps) {
  function open() {
    try { posthog.capture("driver_modal_cta_clicked", { source }); } catch { /* */ }
    document.dispatchEvent(new CustomEvent("open-driver-modal"));
  }
  return (
    <button onClick={open} className={className}>
      {label}
    </button>
  );
}
