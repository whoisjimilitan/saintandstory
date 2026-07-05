"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface OperationStatus {
  whatsapp: {
    active: number;
    replied: number;
  };
  email: {
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
  };
  phone: {
    readyToCall: number;
  };
  drivers: {
    available: number;
    revenue: string;
  };
}

interface TodayData {
  operation: OperationStatus;
  opportunitiesQueued: number;
  pendingReplies: number;
}

export default function TodayPage() {
  const router = useRouter();
  const { user } = useUser();
  const [data, setData] = useState<TodayData>({
    operation: {
      whatsapp: { active: 0, replied: 0 },
      email: { sent: 0, opened: 0, clicked: 0, replied: 0 },
      phone: { readyToCall: 0 },
      drivers: { available: 0, revenue: "£0" },
    },
    opportunitiesQueued: 0,
    pendingReplies: 3,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTodayData = async () => {
      try {
        // Fetch all operation status and pipeline data
        const [campaignRes, opportunitiesRes] = await Promise.all([
          fetch("/api/operator/today-campaign-stats"),
          fetch("/api/operator/opportunities-waiting"),
        ]);

        const campaign = campaignRes.ok ? await campaignRes.json() : { stats: { sent: 0, opened: 0, clicked: 0, replied: 0 } };
        const opportunities = opportunitiesRes.ok ? await opportunitiesRes.json() : { count: 0 };

        setData({
          operation: {
            whatsapp: { active: 12, replied: 3 }, // Placeholder - would fetch from WhatsApp API
            email: campaign.stats || { sent: 0, opened: 0, clicked: 0, replied: 0 },
            phone: { readyToCall: 15 }, // Placeholder - would fetch from phone system
            drivers: { available: 8, revenue: "£420" }, // Placeholder - would fetch from driver API
          },
          opportunitiesQueued: opportunities.count || 0,
          pendingReplies: 3,
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
  const dateNum = today.getDate();
  const monthShort = today.toLocaleDateString("en-UK", { month: "short" });
  const year = today.getFullYear();
  const dateStr = `${String(dateNum).padStart(2, "0")}.${monthShort.toUpperCase()}.${year}`;
  const greeting = user?.firstName ? `Good morning, ${user.firstName}` : "Good morning";

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="max-w-5xl mx-auto px-4 md:px-8">

        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-[#0D0D0D] mb-3 tracking-tight">{greeting}</h1>
          <p className="text-sm font-semibold text-[#666666] uppercase tracking-widest">{dayName} • {dateStr}</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-[#666666]">Loading your day...</p>
          </div>
        ) : (
          <>
            {/* SECTION 1: OPERATION STATUS - What's happening right now */}
            <div className="mb-16">
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">Operation Status</p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* WhatsApp */}
                <div className="border border-[#E8E8E8] rounded-lg p-6 bg-white hover:border-[#0D0D0D] transition-colors">
                  <p className="text-xs text-[#888888] uppercase tracking-widest mb-3">WhatsApp</p>
                  <p className="text-3xl font-black text-[#0D0D0D] mb-1">{data.operation.whatsapp.active}</p>
                  <p className="text-xs text-[#666666]">active conversations</p>
                  <p className="text-xs text-[#666666] mt-2">{data.operation.whatsapp.replied} replied today</p>
                </div>

                {/* Email */}
                <div className="border border-[#E8E8E8] rounded-lg p-6 bg-white hover:border-[#0D0D0D] transition-colors">
                  <p className="text-xs text-[#888888] uppercase tracking-widest mb-3">Email</p>
                  <p className="text-3xl font-black text-[#0D0D0D] mb-1">{data.operation.email.sent}</p>
                  <p className="text-xs text-[#666666]">sent today</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs text-[#666666]">{data.operation.email.opened} opened</span>
                    <span className="text-xs text-[#CCCCCC]">•</span>
                    <span className="text-xs text-[#666666]">{data.operation.email.clicked} clicked</span>
                  </div>
                </div>

                {/* Phone */}
                <div className="border border-[#E8E8E8] rounded-lg p-6 bg-white hover:border-[#0D0D0D] transition-colors">
                  <p className="text-xs text-[#888888] uppercase tracking-widest mb-3">Phone</p>
                  <p className="text-3xl font-black text-[#0D0D0D] mb-1">{data.operation.phone.readyToCall}</p>
                  <p className="text-xs text-[#666666]">prospects with no email</p>
                  <p className="text-xs text-[#666666] mt-2">Call to qualify</p>
                </div>

                {/* Drivers */}
                <div className="border border-[#E8E8E8] rounded-lg p-6 bg-white hover:border-[#0D0D0D] transition-colors">
                  <p className="text-xs text-[#888888] uppercase tracking-widest mb-3">Drivers</p>
                  <p className="text-3xl font-black text-[#0D0D0D] mb-1">{data.operation.drivers.available}</p>
                  <p className="text-xs text-[#666666]">available now</p>
                  <p className="text-xs text-[#666666] mt-2">{data.operation.drivers.revenue} earned today</p>
                </div>
              </div>
            </div>

            {/* SECTION 2: PRIMARY ACTION - What you should do RIGHT NOW */}
            <div className="mb-16">
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">Primary Action</p>

              {data.pendingReplies > 0 ? (
                <div className="border-2 border-[#0D0D0D] rounded-lg p-8 bg-[#F9F9F9]">
                  <h2 className="text-3xl font-black text-[#0D0D0D] mb-2">{data.pendingReplies} replies waiting</h2>
                  <p className="text-sm text-[#666666] mb-6">Prospects have replied to your emails. Respond now.</p>
                  <Link
                    href="/operator/responses"
                    className="inline-block px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
                  >
                    Review Replies →
                  </Link>
                </div>
              ) : data.opportunitiesQueued > 0 ? (
                <div className="border-2 border-[#0D0D0D] rounded-lg p-8 bg-[#F9F9F9]">
                  <h2 className="text-3xl font-black text-[#0D0D0D] mb-2">{data.opportunitiesQueued} opportunities ready</h2>
                  <p className="text-sm text-[#666666] mb-6">Your CSV upload is processed. Send these emails now.</p>
                  <Link
                    href="/operator/discover"
                    className="inline-block px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
                  >
                    Send Opportunities →
                  </Link>
                </div>
              ) : data.operation.email.sent > 0 ? (
                <div className="border-2 border-[#0D0D0D] rounded-lg p-8 bg-[#F9F9F9]">
                  <h2 className="text-3xl font-black text-[#0D0D0D] mb-2">Campaign running</h2>
                  <p className="text-sm text-[#666666] mb-6">{data.operation.email.sent} emails sent. {Math.round((data.operation.email.opened / data.operation.email.sent) * 100)}% opened. Keep monitoring.</p>
                  <Link
                    href="/operator/reach"
                    className="inline-block px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
                  >
                    View Campaign →
                  </Link>
                </div>
              ) : (
                <div className="border-2 border-[#0D0D0D] rounded-lg p-8 bg-[#F9F9F9]">
                  <h2 className="text-3xl font-black text-[#0D0D0D] mb-2">Upload CSV to start</h2>
                  <p className="text-sm text-[#666666] mb-6">No opportunities queued. Go to Discover and upload your first CSV file.</p>
                  <Link
                    href="/operator/discover"
                    className="inline-block px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
                  >
                    Go to Discover →
                  </Link>
                </div>
              )}
            </div>

            {/* QUICK NAVIGATION - Reordered: Feed first, Email campaigns third */}
            <div>
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">Next Step</p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link
                  href="/operator/discover"
                  className="border border-[#E8E8E8] rounded-lg p-6 hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-colors text-center"
                >
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-1">Opportunity Feed</p>
                  <p className="text-xs text-[#888888]">Upload CSV</p>
                </Link>

                <Link
                  href="/operator/enrich"
                  className="border border-[#E8E8E8] rounded-lg p-6 hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-colors text-center"
                >
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-1">Enrich</p>
                  <p className="text-xs text-[#888888]">Personalize</p>
                </Link>

                <Link
                  href="/operator/reach"
                  className="border border-[#E8E8E8] rounded-lg p-6 hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-colors text-center"
                >
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-1">Email Campaign</p>
                  <p className="text-xs text-[#888888]">Campaign metrics</p>
                </Link>

                <Link
                  href="/operator/responses"
                  className="border border-[#E8E8E8] rounded-lg p-6 hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-colors text-center"
                >
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-1">Responses</p>
                  <p className="text-xs text-[#888888]">Incoming replies</p>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
