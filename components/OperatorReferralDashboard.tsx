"use client";

import { useEffect, useState } from "react";

interface ReferrerEarning {
  id: string;
  amount: number;
  status: string;
  date: string;
}

interface ReferralJob {
  id: string;
  jobId: string;
  commission: number;
  status: string;
  date: string;
}

interface Referrer {
  id: string;
  name: string;
  office: string;
  city: string;
  code: string;
  phone: string;
  status: string;
  whatsappStatus: string;
  earnings: {
    total: number;
    thisMonth: number;
    pending: number;
    recentEarnings: ReferrerEarning[];
  };
  referrals: {
    total: number;
    active: number;
    pending: number;
    recentJobs: ReferralJob[];
  };
  commission: number;
  lastActiveAt: string;
  createdAt: string;
}

interface Stats {
  referrers: { total: number; active: number; inactive: number };
  earnings: { totalPaid: number; thisMonth: number; avgPerReferral: number };
  referrals: { total: number; completed: number; pending: number };
  whatsapp: { active: number; pending: number };
}

interface ReferrerDetail extends Referrer {
  createdAt: string;
  updatedAt: string;
  whatsappJoinedAt?: string;
}

const StatCard = ({ label, value, trend, variant = "default" }: { label: string; value: string | number; trend?: string; variant?: "default" | "success" | "warning" }) => {
  const borderColors = {
    default: "border-slate-200",
    success: "border-slate-300",
    warning: "border-slate-300",
  };

  return (
    <div className={`bg-white rounded-lg p-5 border ${borderColors[variant]}`}>
      <p className="text-xs font-medium text-slate-500 mb-2">{label}</p>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      {trend && <p className="text-xs text-slate-500 mt-2">{trend}</p>}
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    active: "bg-slate-100 text-slate-900",
    inactive: "bg-slate-50 text-slate-700",
    paused: "bg-slate-50 text-slate-700",
  } as Record<string, string>;

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${styles[status] || styles.inactive}`}>
      {status}
    </span>
  );
};

export default function OperatorReferralDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("active");
  const [selectedReferrer, setSelectedReferrer] = useState<ReferrerDetail | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchData();
    // Only fetch once on load. User can navigate back to /operator/referral-network to refresh if needed.
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const statsResponse = await fetch("/api/operator/referral-network/stats");
      if (!statsResponse.ok) throw new Error("Failed to fetch stats");
      const statsData = await statsResponse.json();
      setStats(statsData);

      const referrersResponse = await fetch(
        `/api/operator/referral-network/referrers?status=${filter}`
      );
      if (!referrersResponse.ok) throw new Error("Failed to fetch referrers");
      const referrersData = await referrersResponse.json();
      setReferrers(referrersData.referrers || []);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const deleteReferrer = async (referrerId: string) => {
    if (!window.confirm("Delete this referrer? This cannot be undone.")) return;

    try {
      const response = await fetch("/api/operator/referral-network/referrers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referrerId }),
      });
      if (!response.ok) throw new Error("Failed to delete referrer");
      // Refresh data after delete
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      alert(err instanceof Error ? err.message : "Failed to delete referrer");
    }
  };

  const fetchReferrerDetail = async (referrerId: string) => {
    try {
      const response = await fetch(`/api/operator/referral-network/referrers/${referrerId}`);
      if (!response.ok) throw new Error("Failed to fetch details");
      const data = await response.json();
      setSelectedReferrer(data.referrer);
      setShowDetail(true);
    } catch (err) {
      console.error("Error fetching referrer details:", err);
    }
  };

  const updateReferrerStatus = async (referrerId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/operator/referral-network/referrers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referrerId, status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      fetchData();
      if (selectedReferrer?.id === referrerId) {
        fetchReferrerDetail(referrerId);
      }
    } catch (err) {
      console.error("Error updating referrer:", err);
    }
  };

  if (showDetail && selectedReferrer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowDetail(false)}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            ← Back
          </button>
          <div className="text-center flex-1">
            <h1 className="text-2xl font-semibold text-slate-900">
              {selectedReferrer.name}
            </h1>
            <p className="text-sm text-slate-600 mt-1">{selectedReferrer.office}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-600">Code</p>
            <p className="text-sm font-mono font-semibold text-slate-900">
              {selectedReferrer.code}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="City" value={selectedReferrer.city} />
          <StatCard label="Phone" value={selectedReferrer.phone} />
          <StatCard label="Commission" value={`£${selectedReferrer.commission}`} />
          <div className="bg-white rounded-lg p-5 border border-slate-200">
            <p className="text-xs font-medium text-slate-500 mb-2">Status</p>
            <select
              value={selectedReferrer.status}
              onChange={(e) => updateReferrerStatus(selectedReferrer.id, e.target.value)}
              className="text-sm font-medium text-slate-900 bg-transparent border-0 p-0"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <StatCard
            label="Total Earnings"
            value={`£${selectedReferrer.earnings.total.toFixed(2)}`}
          />
          <StatCard
            label="This Month"
            value={`£${selectedReferrer.earnings.thisMonth.toFixed(2)}`}
          />
          <StatCard
            label="Pending"
            value={`£${selectedReferrer.earnings.pending.toFixed(2)}`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <StatCard label="Total Referrals" value={selectedReferrer.referrals.total} />
          <StatCard label="Active" value={selectedReferrer.referrals.active} />
          <StatCard label="Pending" value={selectedReferrer.referrals.pending} />
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Recent Earnings</h2>
          {selectedReferrer.earnings.recentEarnings.length === 0 ? (
            <p className="text-sm text-slate-600">No earnings recorded</p>
          ) : (
            <div className="space-y-2">
              {selectedReferrer.earnings.recentEarnings.map((earning) => (
                <div key={earning.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">£{earning.amount.toFixed(2)}</p>
                    <p className="text-xs text-slate-600">
                      {new Date(earning.date).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={earning.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Recent Referrals</h2>
          {selectedReferrer.referrals.recentJobs.length === 0 ? (
            <p className="text-sm text-slate-600">No referrals recorded</p>
          ) : (
            <div className="space-y-2">
              {selectedReferrer.referrals.recentJobs.map((job) => (
                <div key={job.id} className="py-3 border-b border-slate-100 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {job.jobId}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        Commission: £{job.commission.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={job.status} />
                      <p className="text-xs text-slate-600 mt-2">
                        {new Date(job.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Referrers" value={stats.referrers.total} trend={`${stats.referrers.active} active`} />
          <StatCard label="Earnings Paid" value={`£${stats.earnings.totalPaid.toFixed(0)}`} />
          <StatCard label="This Month" value={`£${stats.earnings.thisMonth.toFixed(0)}`} />
          <StatCard label="Pending Referrals" value={stats.referrals.pending} trend={`${stats.referrals.completed} completed`} />
        </div>
      )}

      <div className="flex gap-2">
        {(["active", "all", "inactive"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === status
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {status === "active" ? "Active" : status === "all" ? "All" : "Inactive"}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-900">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">
                City
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900">
                Earnings
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900">
                Referrals
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-900">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-600">
                  Loading
                </td>
              </tr>
            ) : referrers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-600">
                  No referrers found
                </td>
              </tr>
            ) : (
              referrers.map((referrer) => (
                <tr key={referrer.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">{referrer.name}</p>
                    <p className="text-xs text-slate-600">{referrer.office}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-mono text-slate-900">{referrer.code}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-900">{referrer.city}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      £{referrer.earnings.total.toFixed(0)}
                    </p>
                    <p className="text-xs text-slate-600">
                      £{referrer.earnings.thisMonth.toFixed(0)} this month
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {referrer.referrals.total}
                    </p>
                    <p className="text-xs text-slate-600">
                      {referrer.referrals.pending} pending
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={referrer.status} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => fetchReferrerDetail(referrer.id)}
                        className="text-xs font-medium text-slate-600 hover:text-slate-900 transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => deleteReferrer(referrer.id)}
                        className="text-xs font-medium text-red-600 hover:text-red-900 transition"
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {stats && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-slate-600 mb-1">Avg Commission</p>
              <p className="text-lg font-semibold text-slate-900">
                £{stats.earnings.avgPerReferral.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">WhatsApp Sent</p>
              <p className="text-lg font-semibold text-slate-900">
                {stats.whatsapp.active}/{stats.referrers.total}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Completion Rate</p>
              <p className="text-lg font-semibold text-slate-900">
                {stats.referrals.total > 0
                  ? ((stats.referrals.completed / stats.referrals.total) * 100).toFixed(0)
                  : "0"}
                %
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-1">Last Updated</p>
              <p className="text-sm font-semibold text-slate-900">
                {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
