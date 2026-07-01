"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function OperatorCommandCenter() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/operator/dashboard-stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("[COMMAND CENTER] Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 border-b border-[#E8E8E8]">
        <div className="animate-pulse text-sm text-[#888888]">Loading command center...</div>
      </div>
    );
  }

  const {
    campaigns,
    email,
    whatsapp,
    contracts,
    activity,
    command_center,
  } = stats;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 border-b border-[#E8E8E8]">
      {/* HEADER */}
      <h2 className="text-sm font-black text-[#0D0D0D] uppercase tracking-widest mb-6">
        Command Center
      </h2>

      {/* QUICK STATS GRID */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {/* Campaigns */}
        <Link href="/operator/reach">
          <div className="p-4 bg-[#F9F9F9] border border-[#E8E8E8] rounded hover:border-[#0D0D0D] transition-colors cursor-pointer">
            <p className="text-xs text-[#888888] mb-1">Active</p>
            <p className="text-2xl font-black text-[#0D0D0D]">{campaigns.active}</p>
            <p className="text-xs text-[#666666] mt-2">campaigns</p>
          </div>
        </Link>

        {/* Email Replies */}
        <Link href="/operator/responses">
          <div className="p-4 bg-[#F9F9F9] border border-[#E8E8E8] rounded hover:border-[#0D0D0D] transition-colors cursor-pointer">
            <p className="text-xs text-[#888888] mb-1">Replied</p>
            <p className="text-2xl font-black text-[#0D0D0D]">{email.totalReplied}</p>
            <p className="text-xs text-[#666666] mt-2">emails</p>
          </div>
        </Link>

        {/* WhatsApp */}
        <Link href="/operator/whatsapp">
          <div className="p-4 bg-[#F9F9F9] border border-[#E8E8E8] rounded hover:border-[#0D0D0D] transition-colors cursor-pointer">
            <p className="text-xs text-[#888888] mb-1">Replies</p>
            <p className="text-2xl font-black text-[#0D0D0D]">{whatsapp.totalReplied}</p>
            <p className="text-xs text-[#666666] mt-2">WhatsApp</p>
          </div>
        </Link>

        {/* Contracts */}
        <Link href="/operator/contracts">
          <div className="p-4 bg-[#F9F9F9] border border-[#E8E8E8] rounded hover:border-[#0D0D0D] transition-colors cursor-pointer">
            <p className="text-xs text-[#888888] mb-1">Active</p>
            <p className="text-2xl font-black text-[#0D0D0D]">{contracts.active}</p>
            <p className="text-xs text-[#666666] mt-2">contracts</p>
          </div>
        </Link>
      </div>

      {/* ACTION ITEMS */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-3">
          Next Actions
        </p>
        <div className="space-y-2">
          {command_center.actionItems.reviewReplies > 0 && (
            <Link href="/operator/responses">
              <div className="p-3 bg-[#F9F9F9] border border-[#E8E8E8] rounded hover:bg-white transition-colors cursor-pointer flex justify-between items-center">
                <span className="text-sm text-[#0D0D0D]">
                  Review {command_center.actionItems.reviewReplies} email reply{command_center.actionItems.reviewReplies > 1 ? 's' : ''}
                </span>
                <span className="text-xs text-[#888888]">→</span>
              </div>
            </Link>
          )}

          {command_center.actionItems.pendingContracts > 0 && (
            <Link href="/operator/contracts">
              <div className="p-3 bg-[#F9F9F9] border border-[#E8E8E8] rounded hover:bg-white transition-colors cursor-pointer flex justify-between items-center">
                <span className="text-sm text-[#0D0D0D]">
                  Manage {command_center.actionItems.pendingContracts} pending contract{command_center.actionItems.pendingContracts > 1 ? 's' : ''}
                </span>
                <span className="text-xs text-[#888888]">→</span>
              </div>
            </Link>
          )}

          <Link href="/operator/discover">
            <div className="p-3 bg-[#0D0D0D] border border-[#0D0D0D] rounded hover:bg-[#333333] transition-colors cursor-pointer flex justify-between items-center">
              <span className="text-sm text-white font-semibold">Send Campaign</span>
              <span className="text-xs text-white">→</span>
            </div>
          </Link>
        </div>
      </div>

      {/* RECENT REPLIES */}
      {activity.recentReplies.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-3">
            Latest Replies
          </p>
          <div className="space-y-2">
            {activity.recentReplies.slice(0, 3).map((reply: any) => (
              <div key={reply.id} className="p-3 bg-[#F9F9F9] border border-[#E8E8E8] rounded text-xs">
                <p className="text-[#0D0D0D] font-semibold">{reply.prospectName}</p>
                <p className="text-[#888888] mt-1">
                  {reply.campaign.campaignName} • {reply.category}
                </p>
                <p className="text-[#666666] mt-1">
                  {new Date(reply.repliedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
