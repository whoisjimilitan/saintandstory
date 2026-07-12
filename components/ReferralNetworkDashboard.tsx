"use client";

import { useEffect, useState } from "react";

interface Referrer {
  id: string;
  phone: string;
  officeManagerName: string;
  officeName: string;
  city: string;
  referralCode: string;
  totalEarnings: number;
  monthlyEarnings: number;
  totalReferrals: number;
  activeReferrals: number;
  status: string;
  whatsappStatus: string;
  commission: number;
  createdAt: string;
}

interface ReferralStats {
  totalReferrers: number;
  activeReferrers: number;
  totalEarningsPaid: number;
  thisMonthEarnings: number;
  totalReferralsProcessed: number;
  avgCommissionPerReferral: number;
}

export default function ReferralNetworkDashboard() {
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "pending">("all");

  useEffect(() => {
    fetchReferrers();
    // Refresh every 60 seconds
    const interval = setInterval(fetchReferrers, 60000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchReferrers = async () => {
    try {
      setLoading(true);
      // This would be a real API call in production
      // For now, showing the structure
      console.log("[REFERRAL DASHBOARD] Fetching referrers with filter:", filter);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load referrers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Referral Network</h1>
          <p className="text-slate-600 mt-1">Manage partners and track referral performance</p>
        </div>
        <button className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition font-medium">
          + Add Partner
        </button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 border-t-4 border-slate-900">
            <div className="text-xs text-slate-600 font-medium mb-1">Total Partners</div>
            <div className="text-2xl font-bold text-slate-900">{stats.totalReferrers}</div>
            <div className="text-xs text-green-600 mt-1">
              {stats.activeReferrers} active
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-t-4 border-green-600">
            <div className="text-xs text-slate-600 font-medium mb-1">This Month</div>
            <div className="text-2xl font-bold text-green-600">
              £{stats.thisMonthEarnings.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {stats.totalReferralsProcessed} referrals
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-t-4 border-blue-600">
            <div className="text-xs text-slate-600 font-medium mb-1">Total Paid</div>
            <div className="text-2xl font-bold text-blue-600">
              £{stats.totalEarningsPaid.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 mt-1">All time</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-t-4 border-amber-600">
            <div className="text-xs text-slate-600 font-medium mb-1">Avg Per Referral</div>
            <div className="text-2xl font-bold text-amber-600">
              £{stats.avgCommissionPerReferral.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 mt-1">Commission</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "active", "pending"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as typeof filter)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === status
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-900 border border-slate-200 hover:border-slate-300"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Referrers Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">
                Name / Office
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">
                City
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900">
                Referrals
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900">
                Earnings
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-600">
                  Loading referrers...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-red-600">
                  {error}
                </td>
              </tr>
            ) : referrers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-600">
                  No referrers yet. Start recruiting partners!
                </td>
              </tr>
            ) : (
              referrers.map((referrer) => (
                <tr key={referrer.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">
                      {referrer.officeManagerName}
                    </div>
                    <div className="text-sm text-slate-600">{referrer.officeName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="bg-slate-100 px-2 py-1 rounded font-mono text-sm">
                      {referrer.referralCode}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-slate-900">{referrer.city}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-bold text-slate-900">
                      {referrer.activeReferrals}
                    </div>
                    <div className="text-xs text-slate-600">
                      {referrer.totalReferrals} total
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-bold text-slate-900">
                      £{referrer.monthlyEarnings.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-600">
                      £{referrer.totalEarnings.toFixed(2)} total
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          referrer.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {referrer.status}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          referrer.whatsappStatus === "active"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {referrer.whatsappStatus}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-slate-600 hover:text-slate-900 font-medium text-sm">
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* How It Works */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="font-bold text-blue-900 mb-3">How to Use This System</h2>
        <ol className="space-y-2 text-blue-900 text-sm">
          <li>
            <span className="font-bold">1.</span> Call offices (solicitors, accountants,
            estate agents)
          </li>
          <li>
            <span className="font-bold">2.</span> Pitch: "£15 per referral, we handle everything"
          </li>
          <li>
            <span className="font-bold">3.</span> Send signup link → they sign up → get code
          </li>
          <li>
            <span className="font-bold">4.</span> They give code to clients → we send WhatsApp
            updates
          </li>
          <li>
            <span className="font-bold">5.</span> Monthly: Automatic bank transfers
          </li>
        </ol>
      </div>
    </div>
  );
}
