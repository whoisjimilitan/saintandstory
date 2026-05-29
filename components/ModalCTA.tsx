"use client";

import posthog from "posthog-js";

interface ModalCTAProps {
  label?: string;
  className?: string;
  source?: string;
}

export default function ModalCTA({
  label = "Get free quotes →",
  className = "bg-gradient-to-br from-[#E8244A] to-[#C0183A] hover:from-[#D41C40] hover:to-[#A01030] text-white font-bold px-8 py-4 rounded-xl text-sm transition-colors",
  source = "cta",
}: ModalCTAProps) {
  function open() {
    posthog.capture("modal_cta_clicked", { source });
    document.dispatchEvent(new CustomEvent("open-lead-modal"));
  }

  return (
    <button onClick={open} className={className}>
      {label}
    </button>
  );
}
