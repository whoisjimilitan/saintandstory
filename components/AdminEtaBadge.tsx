"use client";

import { useEffect, useState } from "react";

interface Props {
  jobId: string;
  initialEta: number | null;
  initialSharing: boolean;
}

export default function AdminEtaBadge({ jobId, initialEta, initialSharing }: Props) {
  const [eta, setEta] = useState<number | null>(initialEta);
  const [sharing, setSharing] = useState(initialSharing);

  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent<{ jobId: string; etaMinutes: number | null; arrived: boolean }>).detail;
      if (detail.jobId !== jobId) return;
      setEta(detail.etaMinutes);
      setSharing(detail.etaMinutes !== null);
    }
    document.addEventListener("admin-location-update", handler);
    return () => document.removeEventListener("admin-location-update", handler);
  }, [jobId]);

  if (!sharing || eta === null) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#0D0D0D] bg-[#F5F5F5] border border-[#E8E8E8] px-2 py-0.5 rounded-full ml-2">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      {eta}m away
    </span>
  );
}
