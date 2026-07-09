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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!code) {
      setError("No referral code provided");
      setLoading(false);
      return;
    }

    fetchEarnings();
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
        <div className="text-center max-w-md">
          <h1 className="text-3xl md:text-4xl font-black text-[#0D0D0D] mb-2 tracking-tight">
            Invalid Link
          </h1>
          <p className="text-xs text-[#999999]">No referral code found</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-16 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-[#666666]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-16 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl md:text-4xl font-black text-[#0D0D0D] mb-2 tracking-tight">
            Error
          </h1>
          <p className="text-sm text-[#666666] mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
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
        <p className="text-sm text-[#666666]">No data available</p>
      </div>
    );
  }

  const referrer = data.referrer;
  const earnings = data.earnings;
  const referrals = data.referrals;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-[#0D0D0D] mb-2 tracking-tight">
            {referrer.name}
          </h1>
          <p className="text-xs text-[#999999]">{referrer.office} • {referrer.city}</p>
        </div>

        {/* Code Card */}
        <div className="mb-12 p-6 border border-[#E8E8E8] rounded-lg hover:border-[#0D0D0D] transition-colors">
          <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-4">
            Your Referral Code
          </p>
          <div className="flex items-center justify-between">
            <p className="text-3xl font-black text-[#0D0D0D] font-mono">{referrer.code}</p>
            <button
              onClick={() => copyToClipboard(`I recommend Saint & Story. Use code ${referrer.code} for priority service.`)}
              className="px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
            >
              {copied ? "Copied" : "Copy Message"}
            </button>
          </div>
        </div>

        {/* Earnings Grid */}
        <div className="mb-12 pb-12 border-b border-[#E8E8E8]">
          <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">
            Earnings
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-[#E8E8E8] rounded-lg p-6">
              <p className="text-xs text-[#888888] mb-2">Total</p>
              <p className="text-3xl font-black text-[#0D0D0D]">£{earnings.total.toFixed(2)}</p>
            </div>
            <div className="border border-[#E8E8E8] rounded-lg p-6">
              <p className="text-xs text-[#888888] mb-2">This Month</p>
              <p className="text-3xl font-black text-[#0D0D0D]">£{earnings.thisMonth.toFixed(2)}</p>
            </div>
            <div className="border border-[#E8E8E8] rounded-lg p-6">
              <p className="text-xs text-[#888888] mb-2">Pending</p>
              <p className="text-3xl font-black text-[#0D0D0D]">£{earnings.pending.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Activity Grid */}
        <div className="mb-12 pb-12 border-b border-[#E8E8E8]">
          <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">
            Activity
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-[#888888] mb-2">Total Referrals</p>
              <p className="text-3xl font-black text-[#0D0D0D]">{referrals.total}</p>
            </div>
            <div>
              <p className="text-xs text-[#888888] mb-2">Active</p>
              <p className="text-3xl font-black text-[#0D0D0D]">{referrals.active}</p>
            </div>
            <div>
              <p className="text-xs text-[#888888] mb-2">Commission Per Job</p>
              <p className="text-3xl font-black text-[#0D0D0D]">£{data.commission}</p>
            </div>
            <div>
              <p className="text-xs text-[#888888] mb-2">Next Payout</p>
              <p className="text-lg font-black text-[#0D0D0D]">
                {new Date(data.nextPayoutDate).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Referrals */}
        <div>
          <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">
            Recent Referrals
          </p>
          {data.recentJobs.length === 0 ? (
            <p className="text-sm text-[#666666] py-8 text-center border border-[#E8E8E8] rounded-lg">
              No referrals yet. Start sharing your code.
            </p>
          ) : (
            <div className="space-y-3">
              {data.recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="border border-[#E8E8E8] rounded-lg p-6 hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#0D0D0D]">{job.customer}</p>
                      <p className="text-xs text-[#888888] mt-1">
                        Job: £{job.value.toFixed(2)} • {job.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-[#0D0D0D]">£{job.commission.toFixed(2)}</p>
                      <p className="text-xs text-[#999999] mt-1">
                        {new Date(job.createdAt).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
