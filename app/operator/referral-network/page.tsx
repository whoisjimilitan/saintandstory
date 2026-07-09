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
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* HEADER */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black text-[#0D0D0D] tracking-tight">Referral Network</h1>
            <p className="text-sm text-[#999999] mt-2">Manage partners and track earnings</p>
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
