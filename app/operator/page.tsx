"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface Reply {
  id: string;
  company: string;
  contactName: string;
  message: string;
  receivedAt: string;
}

interface CampaignStats {
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
}

interface TodayData {
  replies: Reply[];
  campaignStats: CampaignStats;
  opportunitiesWaiting: number;
}

export default function TodayPage() {
  const router = useRouter();
  const { user } = useUser();
  const [data, setData] = useState<TodayData>({
    replies: [],
    campaignStats: { sent: 0, opened: 0, clicked: 0, replied: 0 },
    opportunitiesWaiting: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTodayData = async () => {
      try {
        // Fetch live data for today
        const [repliesRes, campaignRes, opportunitiesRes] = await Promise.all([
          fetch("/api/operator/today-replies"),
          fetch("/api/operator/today-campaign-stats"),
          fetch("/api/operator/opportunities-waiting"),
        ]);

        const replies = repliesRes.ok ? await repliesRes.json() : { replies: [] };
        const campaign = campaignRes.ok ? await campaignRes.json() : { stats: { sent: 0, opened: 0, clicked: 0, replied: 0 } };
        const opportunities = opportunitiesRes.ok ? await opportunitiesRes.json() : { count: 0 };

        setData({
          replies: replies.replies || [],
          campaignStats: campaign.stats || { sent: 0, opened: 0, clicked: 0, replied: 0 },
          opportunitiesWaiting: opportunities.count || 0,
        });
      } catch (error) {
        console.error("[TODAY] Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTodayData();
    // Refresh every 60 seconds for live updates
    const interval = setInterval(loadTodayData, 60000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date();
  const dayName = today.toLocaleDateString("en-UK", { weekday: "long" });
  const dateStr = today.toLocaleDateString("en-UK", { month: "long", day: "numeric", year: "numeric" });

  // Determine primary action based on data
  const hasPendingReplies = data.replies.length > 0;
  const hasActiveCampaigns = data.campaignStats.sent > 0;
  const hasOpportunities = data.opportunitiesWaiting > 0;

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="max-w-3xl mx-auto px-4 md:px-8">

        {/* Header */}
        <div className="mb-12">
          <p className="text-sm text-[#888888] mb-2">{dayName}</p>
          <h1 className="text-4xl font-black text-[#0D0D0D] mb-1">{dateStr}</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-[#666666]">Loading your day...</p>
          </div>
        ) : (
          <>
            {/* PRIMARY ACTION - Adaptive based on data */}
            {hasPendingReplies ? (
              <div className="mb-12">
                <div className="border border-[#0D0D0D] rounded-lg p-8 bg-[#F9F9F9]">
                  <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">Primary Action</p>
                  <h2 className="text-2xl font-bold text-[#0D0D0D] mb-8">
                    {data.replies.length} {data.replies.length === 1 ? "reply" : "replies"} waiting for you
                  </h2>

                  <div className="space-y-4 mb-8">
                    {data.replies.slice(0, 3).map((reply) => (
                      <div key={reply.id} className="bg-white p-4 rounded border border-[#E8E8E8]">
                        <p className="text-sm font-semibold text-[#0D0D0D]">{reply.company}</p>
                        <p className="text-xs text-[#888888] mb-2">{reply.contactName}</p>
                        <p className="text-sm text-[#333333] italic">"{reply.message}"</p>
                        <p className="text-xs text-[#AAAAAA] mt-2">{reply.receivedAt}</p>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/operator/responses"
                    className="inline-block px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
                  >
                    Review All Replies →
                  </Link>
                </div>
              </div>
            ) : hasActiveCampaigns ? (
              <div className="mb-12">
                <div className="border border-[#0D0D0D] rounded-lg p-8 bg-[#F9F9F9]">
                  <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">Primary Action</p>
                  <h2 className="text-2xl font-bold text-[#0D0D0D] mb-8">Campaign Performance (Today)</h2>

                  <div className="grid grid-cols-4 gap-4 mb-8">
                    <div>
                      <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">Sent</p>
                      <p className="text-3xl font-black text-[#0D0D0D]">{data.campaignStats.sent}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">Opened</p>
                      <p className="text-3xl font-black text-[#0D0D0D]">
                        {data.campaignStats.sent > 0
                          ? Math.round((data.campaignStats.opened / data.campaignStats.sent) * 100)
                          : 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">Clicked</p>
                      <p className="text-3xl font-black text-[#0D0D0D]">
                        {data.campaignStats.sent > 0
                          ? Math.round((data.campaignStats.clicked / data.campaignStats.sent) * 100)
                          : 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">Replied</p>
                      <p className="text-3xl font-black text-[#0D0D0D]">{data.campaignStats.replied}</p>
                    </div>
                  </div>

                  <Link
                    href="/operator/reach"
                    className="inline-block px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
                  >
                    View Campaigns →
                  </Link>
                </div>
              </div>
            ) : hasOpportunities ? (
              <div className="mb-12">
                <div className="border border-[#0D0D0D] rounded-lg p-8 bg-[#F9F9F9]">
                  <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">Primary Action</p>
                  <h2 className="text-2xl font-bold text-[#0D0D0D] mb-4">
                    {data.opportunitiesWaiting} {data.opportunitiesWaiting === 1 ? "opportunity" : "opportunities"} waiting
                  </h2>
                  <p className="text-sm text-[#666666] mb-8">New prospects from your feed are ready to review and send.</p>

                  <Link
                    href="/operator/discover"
                    className="inline-block px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
                  >
                    Start Discovering →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mb-12">
                <div className="border border-[#0D0D0D] rounded-lg p-8 bg-[#F9F9F9]">
                  <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">What's Next</p>
                  <h2 className="text-2xl font-bold text-[#0D0D0D] mb-4">No pending actions</h2>
                  <p className="text-sm text-[#666666] mb-8">Time to discover new prospects and send emails.</p>

                  <Link
                    href="/operator/discover"
                    className="inline-block px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
                  >
                    Start Discovering →
                  </Link>
                </div>
              </div>
            )}

            {/* SECONDARY ACTIONS - Always visible but not aggressive */}
            <div className="mb-12">
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">Quick Actions</p>

              <div className="grid grid-cols-3 gap-4">
                <Link
                  href="/operator/discover"
                  className="border border-[#E8E8E8] rounded-lg p-6 hover:border-[#0D0D0D] transition-colors text-center"
                >
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-1">Discover</p>
                  <p className="text-xs text-[#888888]">Find prospects</p>
                </Link>

                <Link
                  href="/operator/enrich"
                  className="border border-[#E8E8E8] rounded-lg p-6 hover:border-[#0D0D0D] transition-colors text-center"
                >
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-1">Enrich</p>
                  <p className="text-xs text-[#888888]">Prepare emails</p>
                </Link>

                <Link
                  href="/operator/reach"
                  className="border border-[#E8E8E8] rounded-lg p-6 hover:border-[#0D0D0D] transition-colors text-center"
                >
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-1">Reach</p>
                  <p className="text-xs text-[#888888]">Send campaigns</p>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
