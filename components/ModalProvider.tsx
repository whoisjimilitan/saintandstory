"use client";

import { useState, useEffect } from "react";
import LeadModal from "./LeadModal";

// Mounts in layout.tsx — listens globally for "open-lead-modal" custom events
// and manages the auto-open timer so the modal works on every page.
export default function ModalProvider() {
  const [open, setOpen] = useState(false);

  // Listen for any button/link dispatching the custom event
  useEffect(() => {
    const handler = () => setOpen(true);
    document.addEventListener("open-lead-modal", handler);
    return () => document.removeEventListener("open-lead-modal", handler);
  }, []);

  // Auto-open once per session after 4 seconds
  useEffect(() => {
    if (sessionStorage.getItem("modal_auto_opened")) return;
    const t = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem("modal_auto_opened", "1");
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  return <LeadModal isOpen={open} onClose={() => setOpen(false)} />;
}
