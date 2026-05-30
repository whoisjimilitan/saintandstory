"use client";

import { useEffect } from "react";

// Drop this into any landing page to auto-open a modal after a delay.
// type="lead" opens the 12-step customer LeadModal (default)
// type="driver" opens the 5-step DriverModal
// Used on ad/SEO landing pages — NOT on the main website.
export default function AutoOpenModal({
  delayMs = 2000,
  type = "lead",
}: {
  delayMs?: number;
  type?: "lead" | "driver";
}) {
  useEffect(() => {
    const event = type === "driver" ? "open-driver-modal" : "open-lead-modal";
    const t = setTimeout(() => {
      document.dispatchEvent(new CustomEvent(event));
    }, delayMs);
    return () => clearTimeout(t);
  }, [delayMs, type]);

  return null;
}
