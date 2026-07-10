"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import OperatorReferralDashboard from "@/components/OperatorReferralDashboard";

export default function ReferralNetworkPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* HEADER */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#0D0D0D] mb-2 tracking-tight">Referral Network</h1>
            <p className="text-xs text-[#999999]">Receptionists and Office Managers earnings</p>
          </div>
          <Link
            href="/operator"
            className="text-sm font-medium text-[#888888] hover:text-[#0D0D0D] transition"
          >
            ← Back to Today
          </Link>
        </div>

        {/* DASHBOARD */}
        {mounted && <OperatorReferralDashboard />}
      </div>
    </div>
  );
}
