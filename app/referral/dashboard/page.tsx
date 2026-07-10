"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

interface ReferrerData {
  success: boolean;
  referrer: {
    id: string;
    name: string;
    office: string;
    city: string;
    code: string;
    status: string;
    whatsappStatus: string;
  };
  earnings: {
    total: number;
    thisMonth: number;
    pending: number;
    lastUpdated: string;
  };
  referrals: {
    total: number;
    active: number;
    thisMonth: number;
    pending: number;
  };
  recentJobs: Array<{
    id: string;
    customer: string;
    value: number;
    commission: number;
    status: string;
    createdAt: string;
  }>;
  commission: number;
  nextPayoutDate: string;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const [data, setData] = useState<ReferrerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setError("No referral code provided");
      setLoading(false);
      return;
    }

    fetchEarnings();
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchEarnings, 30000);
    return () => clearInterval(interval);
  }, [code]);

  const fetchEarnings = async () => {
    try {
      const response = await fetch(`/api/referral/earnings?code=${code}`);
      if (!response.ok) {
        throw new Error("Failed to fetch earnings");
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (!code) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-16 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-2xl font-black text-[#0D0D0D] mb-2">Referral Dashboard</h1>
          <p className="text-sm text-[#888888]">No referral code found. Please check your referral link.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-16 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#E8E8E8] border-t-[#0D0D0D] mx-auto mb-4"></div>
          <p className="text-sm text-[#888888]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-16 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full border border-[#FFE0E0] rounded-lg p-8 text-center">
          <h1 className="text-2xl font-black text-[#CC0000] mb-2">Error</h1>
          <p className="text-sm text-[#888888] mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-16 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <p className="text-sm text-[#888888]">No data available</p>
        </div>
      </div>
    );
  }

  const referrer = data.referrer;
  const earnings = data.earnings;
  const referrals = data.referrals;

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-16 pb-8 border-b border-[#E8E8E8]">
          <h1 className="text-5xl md:text-6xl font-black text-[#0D0D0D] mb-4 tracking-tight">
            {referrer.name}
          </h1>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-base text-[#666666]">{referrer.office} • {referrer.city}</p>
            <div className="bg-[#F9F9F9] px-5 py-3 rounded-lg">
              <p className="text-xs text-[#888888] uppercase tracking-widest mb-1">Your code</p>
              <p className="font-mono font-black text-xl text-[#0D0D0D]">{referrer.code}</p>
            </div>
          </div>
        </div>

        {/* Earnings - Minimal Layout */}
        <div className="mb-16">
          <p className="text-xs text-[#888888] uppercase tracking-widest mb-8 font-semibold">Earnings</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            <div>
              <p className="text-6xl font-black text-[#0D0D0D] mb-2">£{earnings.total.toFixed(2)}</p>
              <p className="text-sm text-[#999999]">Total earned</p>
            </div>
            <div>
              <p className="text-6xl font-black text-[#0D0D0D] mb-2">£{earnings.thisMonth.toFixed(2)}</p>
              <p className="text-sm text-[#999999]">This month • {referrals.thisMonth} referrals</p>
            </div>
            <div>
              <p className="text-6xl font-black text-[#0D0D0D] mb-2">£{earnings.pending.toFixed(2)}</p>
              <p className="text-sm text-[#999999]">Pending • {referrals.pending} referrals</p>
            </div>
          </div>
        </div>

        {/* Activity Summary - Minimal */}
        <div className="mb-16 pb-8 border-b border-[#E8E8E8]">
          <p className="text-xs text-[#888888] uppercase tracking-widest mb-8 font-semibold">Activity</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div>
              <p className="text-4xl font-black text-[#0D0D0D] mb-1">{referrals.total}</p>
              <p className="text-xs text-[#999999]">Total referrals</p>
            </div>
            <div>
              <p className="text-4xl font-black text-[#0D0D0D] mb-1">{referrals.active}</p>
              <p className="text-xs text-[#999999]">Active</p>
            </div>
            <div>
              <p className="text-4xl font-black text-[#0D0D0D] mb-1">£{data.commission}</p>
              <p className="text-xs text-[#999999]">Per referral</p>
            </div>
            <div>
              <p className="text-lg font-bold text-[#0D0D0D] mb-1">
                {new Date(data.nextPayoutDate).toLocaleDateString()}
              </p>
              <p className="text-xs text-[#999999]">Next payout</p>
            </div>
          </div>
        </div>

        {/* Share Message - Clean CTA */}
        <div className="mb-12">
          <p className="text-xs text-[#888888] uppercase tracking-widest mb-8 font-semibold">Share & Earn</p>
          <p className="text-lg text-[#0D0D0D] mb-6 leading-relaxed">
            When your clients ask about removals, share this message and earn £20 when they book.
          </p>

          <div className="bg-[#F9F9F9] p-6 rounded-lg mb-6">
            <p className="text-base text-[#0D0D0D] leading-relaxed">
              Hi, for removals I recommend Saint & Story. Tell them code <span className="font-mono font-black">{referrer.code}</span>
            </p>
          </div>

          <button
            onClick={() => {
              const text = `Hi, for removals I recommend Saint & Story. Tell them code ${referrer.code}`;
              navigator.clipboard.writeText(text);
              alert("Copied to clipboard");
            }}
            className="w-full px-6 py-3 bg-[#0D0D0D] text-white font-semibold text-sm rounded-lg hover:bg-[#333333] transition-colors"
          >
            Copy Message
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-[#E8E8E8] text-xs text-[#999999]">
          <p>Questions? Call <span className="font-mono font-semibold text-[#0D0D0D]">0203 051 9243</span></p>
        </div>
      </div>
    </div>
  );
}

export default function ReferrerDashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
