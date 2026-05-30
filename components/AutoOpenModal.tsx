"use client";

import { useEffect } from "react";

// Drop this into any page that should auto-open the lead modal.
// Used on ad landing pages — NOT on the main website.
export default function AutoOpenModal({ delayMs = 2000 }: { delayMs?: number }) {
  useEffect(() => {
    const t = setTimeout(() => {
      document.dispatchEvent(new CustomEvent("open-lead-modal"));
    }, delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  return null;
}
