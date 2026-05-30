"use client";

import posthog from "posthog-js";

function track(event: string, props?: Record<string, unknown>) {
  try { posthog.capture(event, props); } catch { /* */ }
}

interface ModalCTAProps {
  label?: string;
  className?: string;
  source?: string;
}

export default function ModalCTA({
  label = "Get free quotes →",
  className = "bg-brand hover:bg-brand-dark text-white font-bold px-8 py-4 rounded-xl text-sm transition-colors",
  source = "cta",
}: ModalCTAProps) {
  function open() {
    track("modal_cta_clicked", { source });
    document.dispatchEvent(new CustomEvent("open-lead-modal"));
  }

  return (
    <button onClick={open} className={className}>
      {label}
    </button>
  );
}
