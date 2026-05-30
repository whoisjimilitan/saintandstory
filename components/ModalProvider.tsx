"use client";

import { useState, useEffect } from "react";
import LeadModal from "./LeadModal";
import DriverModal from "./DriverModal";

export default function ModalProvider() {
  const [leadOpen, setLeadOpen] = useState(false);
  const [driverOpen, setDriverOpen] = useState(false);

  useEffect(() => {
    const openLead = () => setLeadOpen(true);
    const openDriver = () => setDriverOpen(true);
    document.addEventListener("open-lead-modal", openLead);
    document.addEventListener("open-driver-modal", openDriver);
    return () => {
      document.removeEventListener("open-lead-modal", openLead);
      document.removeEventListener("open-driver-modal", openDriver);
    };
  }, []);

  return (
    <>
      <LeadModal isOpen={leadOpen} onClose={() => setLeadOpen(false)} />
      <DriverModal isOpen={driverOpen} onClose={() => setDriverOpen(false)} />
    </>
  );
}
