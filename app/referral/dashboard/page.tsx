"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { generateReferralMessage, getReferralLink } from "@/lib/referral-message";

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
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-[#0D0D0D] mb-3 tracking-tight">
                {referrer.name}
              </h1>
              <p className="text-sm text-[#666666]">{referrer.office} • {referrer.city}</p>
            </div>
            <div className="bg-gradient-to-br from-[#F9F9F9] to-[#FAFAFA] border border-[#E8E8E8] rounded-full px-6 py-4 shadow-sm">
              <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">Your code</p>
              <p className="font-mono font-black text-lg text-[#0D0D0D] tracking-wide">{referrer.code}</p>
            </div>
          </div>
        </div>

        {/* Earnings - Premium Card */}
        <div className="mb-12">
          <p className="text-xs text-[#888888] uppercase tracking-widest mb-6 font-semibold">Balance</p>
          <div className="border border-[#E8E8E8] rounded-2xl p-6 md:p-8 bg-gradient-to-br from-white to-[#FAFAFA] shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-white rounded-xl border border-[#E8E8E8]">
                <p className="text-xs text-[#888888] uppercase tracking-widest mb-4 font-semibold">This Month</p>
                <p className="text-4xl md:text-5xl font-black text-[#0D0D0D] mb-3">£{earnings.thisMonth.toFixed(2)}</p>
                <div className="inline-block bg-[#F9F9F9] px-3 py-1 rounded-full">
                  <p className="text-xs text-[#666666]">{referrals.thisMonth} referrals</p>
                </div>
              </div>
              <div className="p-6 bg-white rounded-xl border border-[#E8E8E8]">
                <p className="text-xs text-[#888888] uppercase tracking-widest mb-4 font-semibold">Pending</p>
                <p className="text-4xl md:text-5xl font-black text-[#0D0D0D] mb-3">{referrals.pending}</p>
                <div className="inline-block bg-[#F9F9F9] px-3 py-1 rounded-full">
                  <p className="text-xs text-[#666666]">awaiting confirmation</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Info - Polished Pills */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-[#E8E8E8] rounded-full px-6 py-5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <p className="text-xs text-[#888888] uppercase tracking-widest mb-2 font-semibold">Referrals</p>
              <p className="text-3xl font-black text-[#0D0D0D]">{referrals.total}</p>
            </div>
            <div className="bg-white border border-[#E8E8E8] rounded-full px-6 py-5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <p className="text-xs text-[#888888] uppercase tracking-widest mb-2 font-semibold">Earn</p>
              <p className="text-2xl font-black text-[#0D0D0D]">£{data.commission} <span className="text-xs font-normal text-[#999999]">per</span></p>
            </div>
            <div className="bg-white border border-[#E8E8E8] rounded-full px-6 py-5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <p className="text-xs text-[#888888] uppercase tracking-widest mb-2 font-semibold">Next Payout</p>
              <p className="text-base font-bold text-[#0D0D0D]">{new Date(data.nextPayoutDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Share Message - Premium CTA */}
        <div className="mb-12">
          <p className="text-xs text-[#888888] uppercase tracking-widest mb-5 font-semibold">Share & Earn</p>
          <p className="text-sm md:text-base text-[#0D0D0D] mb-6">
            Share with clients and earn £20 when they book.
          </p>

          <div className="bg-gradient-to-br from-[#F9F9F9] to-[#FAFAFA] p-6 md:p-7 rounded-2xl mb-6 border border-[#E8E8E8] border-l-4 border-l-[#0D0D0D] shadow-sm hover:shadow-md transition-shadow duration-200">
            <p className="text-sm md:text-base text-[#0D0D0D] leading-relaxed font-medium">
              "{generateReferralMessage(referrer.code, getReferralLink(referrer.city))}"
            </p>
          </div>

          <button
            onClick={() => {
              const text = generateReferralMessage(referrer.code, getReferralLink(referrer.city));
              navigator.clipboard.writeText(text);
              alert("Copied to clipboard");
            }}
            className="w-full px-6 py-3 bg-[#0D0D0D] text-white font-semibold text-sm rounded-full hover:bg-[#1A1A1A] transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
          >
            Copy Message
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pt-12 border-t border-[#E8E8E8]">
          <p className="text-sm text-[#666666] mb-2">Need help?</p>
          <p className="text-xs text-[#999999]">Call <span className="font-mono font-semibold text-[#0D0D0D]">0203 051 9243</span> or reply to your WhatsApp message</p>
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
