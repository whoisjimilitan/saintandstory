"use client";

import { useEffect, useState } from "react";

interface QueueStats {
  total_count: number;
  grouped_by_problem: Array<{
    problem_type: string;
    count: number;
    by_tier: Array<{
      tier: number;
      count: number;
    }>;
  }>;
}

export default function ApprovalQueueStats() {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/operator/opportunity-feed/queue?approvalStatus=pending");
        if (!res.ok) {
          console.error("[QUEUE STATS] Error response:", res.status);
          setLoading(false);
          return;
        }
        const data = await res.json();

        if (data.success && data.grouped_by_problem) {
          setStats(data);
        } else {
          console.error("[QUEUE STATS] Invalid response format:", data);
          setLoading(false);
        }
      } catch (error) {
        console.error("[QUEUE STATS] Fetch error:", error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-16 bg-[#F0F0F0] rounded"></div>
      </div>
    );
  }

  if (!stats || stats.total_count === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-[#888888]">No pending opportunities.</p>
        <p className="text-xs text-[#AAAAAA] mt-1">Use Discover → Search by postcode/keyword or Add Manually to find prospects</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Count */}
      <div className="flex items-end justify-between pb-6 border-b border-[#E8E8E8]">
        <div>
          <p className="text-xs font-semibold text-[#888888] uppercase tracking-widest mb-1">
            Pending Review
          </p>
          <p className="text-3xl font-black text-[#0D0D0D]">{stats.total_count}</p>
          <p className="text-xs text-[#AAAAAA] mt-2">Ready for approval</p>
        </div>
      </div>

      {/* By Problem Type */}
      <div>
        <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-4">
          Breakdown by Problem Type
        </p>
        <div className="space-y-3">
          {stats.grouped_by_problem.map((group) => (
            <div key={group.problem_type} className="border border-[#E8E8E8] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-[#0D0D0D]">
                    {group.problem_type.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                  </p>
                  <p className="text-xs text-[#888888] mt-1">
                    {group.by_tier.map(t => `T${t.tier}: ${t.count}`).join(" • ")}
                  </p>
                </div>
                <p className="text-lg font-bold text-[#0D0D0D]">{group.count}</p>
              </div>
              {/* Visual progress */}
              <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0D0D0D]"
                  style={{ width: `${(group.count / stats.total_count) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
