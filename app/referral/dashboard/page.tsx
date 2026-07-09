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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-semibold mb-4">Referral Dashboard</h1>
          <p className="text-slate-600 mb-6">
            No referral code found. Please check your referral link.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full border-2 border-red-200">
          <h1 className="text-2xl font-semibold mb-4 text-red-600">Error</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <p className="text-slate-600">No data available</p>
        </div>
      </div>
    );
  }

  const referrer = data.referrer;
  const earnings = data.earnings;
  const referrals = data.referrals;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6 border-l-4 border-slate-900">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {referrer.name}
              </h1>
              <p className="text-slate-600 mt-1">{referrer.office} • {referrer.city}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono text-slate-500 mb-2">Code</div>
              <div className="text-2xl font-bold font-mono text-slate-900 bg-slate-100 px-4 py-2 rounded">
                {referrer.code}
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {referrer.status === "active" ? "✓ Active" : "Inactive"}
            </div>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              WhatsApp: {referrer.whatsappStatus}
            </div>
          </div>
        </div>

        {/* Earnings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-slate-900">
            <div className="text-sm text-slate-600 font-medium mb-2">Total Earnings</div>
            <div className="text-3xl font-bold text-slate-900">
              £{earnings.total.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 mt-2">All time</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-green-600">
            <div className="text-sm text-slate-600 font-medium mb-2">This Month</div>
            <div className="text-3xl font-bold text-green-600">
              £{earnings.thisMonth.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 mt-2">{referrals.thisMonth} referrals</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-amber-600">
            <div className="text-sm text-slate-600 font-medium mb-2">Pending</div>
            <div className="text-3xl font-bold text-amber-600">
              £{earnings.pending.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 mt-2">{referrals.pending} pending</div>
          </div>
        </div>

        {/* Referrals Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Referral Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-slate-600 mb-2">Total Referrals</div>
              <div className="text-2xl font-bold text-slate-900">{referrals.total}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-2">Active</div>
              <div className="text-2xl font-bold text-slate-900">{referrals.active}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-2">Commission Rate</div>
              <div className="text-2xl font-bold text-slate-900">£{data.commission}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-2">Next Payout</div>
              <div className="text-lg font-bold text-slate-900">
                {new Date(data.nextPayoutDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Referrals */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Referrals</h2>
          {data.recentJobs.length === 0 ? (
            <p className="text-slate-600 py-6">No recent referrals yet.</p>
          ) : (
            <div className="space-y-3">
              {data.recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div>
                    <div className="font-medium text-slate-900">{job.customer}</div>
                    <div className="text-sm text-slate-600">
                      Job: £{job.value.toFixed(2)} • {job.status}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">
                      £{job.commission.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How to Share */}
        <div className="bg-slate-900 text-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">How to Earn More</h2>
          <p className="mb-4 text-slate-300">
            When your clients ask about removals, give them this message:
          </p>
          <div className="bg-slate-800 p-4 rounded font-mono text-sm mb-4">
            <p className="text-slate-300">Hi, for removals I recommend Saint & Story.</p>
            <p className="text-slate-300">
              Tell them code <span className="text-green-400 font-bold">{referrer.code}</span> for
              priority service.
            </p>
          </div>
          <button
            onClick={() => {
              const text = `Hi, for removals I recommend Saint & Story. Tell them code ${referrer.code} for priority service.`;
              navigator.clipboard.writeText(text);
              alert("Copied to clipboard!");
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition"
          >
            Copy Message
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-600">
          <p>
            Questions? Call{" "}
            <span className="font-mono font-bold">0203 051 9243</span>
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
