"use client";

import { useState, useEffect } from "react";
import LeadModal from "./LeadModal";

// Mounts globally in layout.tsx.
// Opens the lead modal automatically on every page load (Bark-style lead capture).
// Also listens for manual triggers via the "open-lead-modal" custom event.
export default function ModalProvider() {
  const [open, setOpen] = useState(false);

  // Auto-open on every page load after a short "please wait" delay
  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 2000);
    return () => clearTimeout(t);
  }, []);

  // Listen for manual triggers (nav button, hero CTA, service pills, etc.)
  useEffect(() => {
    const handler = () => setOpen(true);
    document.addEventListener("open-lead-modal", handler);
    return () => document.removeEventListener("open-lead-modal", handler);
  }, []);

  return <LeadModal isOpen={open} onClose={() => setOpen(false)} />;
}
