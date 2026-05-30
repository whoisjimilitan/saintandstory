"use client";

import { useState, useEffect } from "react";
import LeadModal from "./LeadModal";

// Mounts globally in layout.tsx.
// No auto-open — listens only for manual "open-lead-modal" events.
// Landing pages add <AutoOpenModal /> to trigger the auto-open sequence.
export default function ModalProvider() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    document.addEventListener("open-lead-modal", handler);
    return () => document.removeEventListener("open-lead-modal", handler);
  }, []);

  return <LeadModal isOpen={open} onClose={() => setOpen(false)} />;
}
