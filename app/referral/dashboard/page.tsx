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
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-[#0D0D0D] mb-2 tracking-tight">
            {referrer.name}
          </h1>
          <p className="text-xs text-[#999999]">{referrer.office} • {referrer.city} • Code: <span className="font-mono font-semibold">{referrer.code}</span></p>
        </div>

        {/* Earnings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="border border-[#E8E8E8] rounded-lg p-6 bg-white hover:bg-[#F9F9F9] transition-colors">
            <p className="text-xs text-[#888888] uppercase tracking-widest mb-3">Total Earnings</p>
            <p className="text-3xl font-black text-[#0D0D0D] mb-1">£{earnings.total.toFixed(2)}</p>
            <p className="text-xs text-[#666666]">All time</p>
          </div>

          <div className="border border-[#E8E8E8] rounded-lg p-6 bg-white hover:bg-[#F9F9F9] transition-colors">
            <p className="text-xs text-[#888888] uppercase tracking-widest mb-3">This Month</p>
            <p className="text-3xl font-black text-[#0D0D0D] mb-1">£{earnings.thisMonth.toFixed(2)}</p>
            <p className="text-xs text-[#666666]">{referrals.thisMonth} referrals</p>
          </div>

          <div className="border border-[#E8E8E8] rounded-lg p-6 bg-white hover:bg-[#F9F9F9] transition-colors">
            <p className="text-xs text-[#888888] uppercase tracking-widest mb-3">Pending</p>
            <p className="text-3xl font-black text-[#0D0D0D] mb-1">£{earnings.pending.toFixed(2)}</p>
            <p className="text-xs text-[#666666]">{referrals.pending} pending</p>
          </div>
        </div>

        {/* Referrals Summary */}
        <div className="border border-[#E8E8E8] rounded-lg p-6 mb-12 bg-white">
          <p className="text-xs text-[#888888] uppercase tracking-widest mb-6 font-semibold">Referral Activity</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-[#666666] mb-2">Total Referrals</p>
              <p className="text-2xl font-black text-[#0D0D0D]">{referrals.total}</p>
            </div>
            <div>
              <p className="text-xs text-[#666666] mb-2">Active</p>
              <p className="text-2xl font-black text-[#0D0D0D]">{referrals.active}</p>
            </div>
            <div>
              <p className="text-xs text-[#666666] mb-2">Commission Rate</p>
              <p className="text-2xl font-black text-[#0D0D0D]">£{data.commission}</p>
            </div>
            <div>
              <p className="text-xs text-[#666666] mb-2">Next Payout</p>
              <p className="text-lg font-bold text-[#0D0D0D]">
                {new Date(data.nextPayoutDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Referrals */}
        <div className="border border-[#E8E8E8] rounded-lg p-6 mb-12 bg-white">
          <p className="text-xs text-[#888888] uppercase tracking-widest mb-6 font-semibold">Recent Referrals</p>
          {data.recentJobs.length === 0 ? (
            <p className="text-sm text-[#888888] py-6">No recent referrals yet.</p>
          ) : (
            <div className="space-y-3">
              {data.recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex justify-between items-center p-4 bg-[#F9F9F9] rounded-lg border border-[#E8E8E8]"
                >
                  <div>
                    <p className="font-semibold text-[#0D0D0D]">{job.customer}</p>
                    <p className="text-xs text-[#666666] mt-1">
                      Job: £{job.value.toFixed(2)} • {job.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[#0D0D0D]">
                      £{job.commission.toFixed(2)}
                    </p>
                    <p className="text-xs text-[#999999] mt-1">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How to Share */}
        <div className="border border-[#E8E8E8] rounded-lg p-6 bg-white">
          <p className="text-xs text-[#888888] uppercase tracking-widest mb-4 font-semibold">How to Earn More</p>
          <p className="text-sm text-[#666666] mb-4">
            When your clients ask about removals, share this message:
          </p>
          <div className="bg-[#F9F9F9] p-4 rounded-lg border border-[#E8E8E8] font-mono text-sm mb-4">
            <p className="text-[#0D0D0D]">Hi, for removals I recommend Saint & Story.</p>
            <p className="text-[#0D0D0D] mt-1">
              Tell them code <span className="font-semibold">{referrer.code}</span>
            </p>
          </div>
          <button
            onClick={() => {
              const text = `Hi, for removals I recommend Saint & Story. Tell them code ${referrer.code}`;
              navigator.clipboard.writeText(text);
              alert("Copied to clipboard!");
            }}
            className="w-full px-6 py-3 bg-[#0D0D0D] text-white font-semibold text-sm rounded-lg hover:bg-[#333333] transition-colors"
          >
            Copy Message
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-[#999999]">
          <p>
            Questions? Call <span className="font-mono font-semibold text-[#0D0D0D]">0203 051 9243</span>
          </p>
          <p className="mt-2">Last updated: {new Date(earnings.lastUpdated).toLocaleTimeString()}</p>
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
