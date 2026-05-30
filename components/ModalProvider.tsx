"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const LeadModal = dynamic(() => import("./LeadModal"), { ssr: false });
const DriverModal = dynamic(() => import("./DriverModal"), { ssr: false });

export default function ModalProvider() {
  const [leadOpen, setLeadOpen] = useState(false);
  const [driverOpen, setDriverOpen] = useState(false);
  const [leadEverOpened, setLeadEverOpened] = useState(false);
  const [driverEverOpened, setDriverEverOpened] = useState(false);

  useEffect(() => {
    const openLead = () => { setLeadEverOpened(true); setLeadOpen(true); };
    const openDriver = () => { setDriverEverOpened(true); setDriverOpen(true); };
    document.addEventListener("open-lead-modal", openLead);
    document.addEventListener("open-driver-modal", openDriver);
    return () => {
      document.removeEventListener("open-lead-modal", openLead);
      document.removeEventListener("open-driver-modal", openDriver);
    };
  }, []);

  return (
    <>
      {leadEverOpened && <LeadModal isOpen={leadOpen} onClose={() => setLeadOpen(false)} />}
      {driverEverOpened && <DriverModal isOpen={driverOpen} onClose={() => setDriverOpen(false)} />}
    </>
  );
}
