"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface BriefingData {
  discovered: number;
  enriched: number;
  qualified: number;
  orders: number;
  loading: boolean;
}

export default function OperatorBriefing() {
  const [data, setData] = useState<BriefingData>({
    discovered: 0,
    enriched: 0,
    qualified: 0,
    orders: 0,
    loading: true,
  });

  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
    };
    setDateStr(today.toLocaleDateString("en-US", options));
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/operator/morning-brief/summary");
        if (!res.ok) throw new Error("Failed to fetch");
        const summary = await res.json();
        setData({
          discovered: summary.discovered,
          enriched: summary.enriched,
          qualified: summary.qualified,
          orders: summary.orders,
          loading: false,
        });
      } catch (error) {
        console.error("Error:", error);
        setData((prev) => ({ ...prev, loading: false }));
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="mb-16">
        <div className="inline-flex items-center gap-2 mb-6 bg-[#F8F8F8] px-4 py-2 rounded-full border border-[#EFEFEF]">
          <p className="text-xs font-medium text-[#0D0D0D] tracking-[0.5px]">
            {dateStr}
          </p>
        </div>
        <h1 className="text-5xl font-black text-[#0D0D0D] mb-3 tracking-[-0.01em]">
          Good morning, James.
        </h1>
        <p className="text-base text-[#666666] leading-relaxed max-w-xl font-light">
          Here's what matters today.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-4 gap-6 mb-20">
        <div className="border border-[#EFEFEF] rounded-xl p-8 bg-white hover:border-[#D8D8D8] transition-colors duration-200">
          <p className="text-xs font-medium text-[#888888] uppercase tracking-[0.8px] mb-4">
            New opportunities
          </p>
          <p className="text-4xl font-black text-[#0D0D0D] mb-4 tracking-[-0.02em]">
            {data.discovered}
          </p>
          <div className="space-y-1">
            <p className="text-xs text-[#AAAAAA]">vs yesterday</p>
            <p className="text-xs font-semibold text-[#22C55E]">↑ 100%</p>
          </div>
        </div>

        <div className="border border-[#EFEFEF] rounded-xl p-8 bg-white hover:border-[#D8D8D8] transition-colors duration-200">
          <p className="text-xs font-medium text-[#888888] uppercase tracking-[0.8px] mb-4">
            High confidence
          </p>
          <p className="text-4xl font-black text-[#0D0D0D] mb-4 tracking-[-0.02em]">
            {data.qualified}
          </p>
          <div className="space-y-1">
            <p className="text-xs text-[#AAAAAA]">vs yesterday</p>
            <p className="text-xs font-semibold text-[#22C55E]">↑ 100%</p>
          </div>
        </div>

        <div className="border border-[#EFEFEF] rounded-xl p-8 bg-white hover:border-[#D8D8D8] transition-colors duration-200">
          <p className="text-xs font-medium text-[#888888] uppercase tracking-[0.8px] mb-4">
            Finished
          </p>
          <p className="text-4xl font-black text-[#0D0D0D] mb-4 tracking-[-0.02em]">
            {data.orders}
          </p>
          <div className="space-y-1">
            <p className="text-xs text-[#AAAAAA]">vs yesterday</p>
            <p className="text-xs text-[#D0D0D0]">—</p>
          </div>
        </div>

        <div className="border border-[#EFEFEF] rounded-xl p-8 bg-white hover:border-[#D8D8D8] transition-colors duration-200">
          <p className="text-xs font-medium text-[#888888] uppercase tracking-[0.8px] mb-4">
            Closed today
          </p>
          <p className="text-4xl font-black text-[#0D0D0D] mb-4 tracking-[-0.02em]">
            0
          </p>
          <div className="space-y-1">
            <p className="text-xs text-[#AAAAAA]">vs yesterday</p>
            <p className="text-xs text-[#D0D0D0]">—</p>
          </div>
        </div>
      </div>

      {/* Pipeline at a Glance */}
      <div className="mb-20">
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[1px] mb-2">
            Pipeline at a Glance
          </h2>
          <p className="text-sm text-[#888888] leading-relaxed font-light">
            Where opportunities are in your pipeline.
          </p>
        </div>

        <div className="border border-[#EFEFEF] rounded-xl p-12 bg-white">
          <div className="flex justify-between items-end">
            {/* Discover */}
            <div className="text-center flex-1">
              <div className="flex justify-center mb-6">
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
              </div>
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.5px] mb-2">
                Discover
              </p>
              <p className="text-3xl font-black text-[#0D0D0D] mb-3 tracking-[-0.02em]">
                {data.discovered}
              </p>
              <p className="text-xs text-[#AAAAAA] font-light">new</p>
            </div>

            {/* Connecting Line */}
            <div className="flex-1 flex items-center justify-center px-4">
              <svg
                className="w-full h-1"
                viewBox="0 0 100 4"
                preserveAspectRatio="none"
              >
                <line
                  x1="0"
                  y1="2"
                  x2="100"
                  y2="2"
                  stroke="#EFEFEF"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Enrich */}
            <div className="text-center flex-1">
              <div className="flex justify-center mb-6">
                <div className="w-3 h-3 rounded-full border-2 border-green-500"></div>
              </div>
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.5px] mb-2">
                Enrich
              </p>
              <p className="text-3xl font-black text-[#0D0D0D] mb-3 tracking-[-0.02em]">
                {data.enriched}
              </p>
              <p className="text-xs text-[#AAAAAA] font-light">start</p>
            </div>

            {/* Connecting Line */}
            <div className="flex-1 flex items-center justify-center px-4">
              <svg
                className="w-full h-1"
                viewBox="0 0 100 4"
                preserveAspectRatio="none"
              >
                <line
                  x1="0"
                  y1="2"
                  x2="100"
                  y2="2"
                  stroke="#EFEFEF"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Qualify */}
            <div className="text-center flex-1">
              <div className="flex justify-center mb-6">
                <div className="w-3 h-3 rounded-full border-2 border-orange-500"></div>
              </div>
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.5px] mb-2">
                Qualify
              </p>
              <p className="text-3xl font-black text-[#0D0D0D] mb-3 tracking-[-0.02em]">
                1
              </p>
              <p className="text-xs text-[#AAAAAA] font-light">qualified</p>
            </div>

            {/* Connecting Line */}
            <div className="flex-1 flex items-center justify-center px-4">
              <svg
                className="w-full h-1"
                viewBox="0 0 100 4"
                preserveAspectRatio="none"
              >
                <line
                  x1="0"
                  y1="2"
                  x2="100"
                  y2="2"
                  stroke="#EFEFEF"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Propose */}
            <div className="text-center flex-1">
              <div className="flex justify-center mb-6">
                <div className="w-3 h-3 rounded-full border-2 border-purple-500"></div>
              </div>
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.5px] mb-2">
                Propose
              </p>
              <p className="text-3xl font-black text-[#0D0D0D] mb-3 tracking-[-0.02em]">
                0
              </p>
              <p className="text-xs text-[#AAAAAA] font-light">proposed</p>
            </div>

            {/* Connecting Line */}
            <div className="flex-1 flex items-center justify-center px-4">
              <svg
                className="w-full h-1"
                viewBox="0 0 100 4"
                preserveAspectRatio="none"
              >
                <line
                  x1="0"
                  y1="2"
                  x2="100"
                  y2="2"
                  stroke="#EFEFEF"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Orders */}
            <div className="text-center flex-1">
              <div className="flex justify-center mb-6">
                <div className="w-3 h-3 rounded-full border-2 border-red-500"></div>
              </div>
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.5px] mb-2">
                Orders
              </p>
              <p className="text-3xl font-black text-[#0D0D0D] mb-3 tracking-[-0.02em]">
                {data.orders}
              </p>
              <p className="text-xs text-[#AAAAAA] font-light">finish</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/operator/pipeline"
            className="text-xs font-medium text-[#0D0D0D] hover:text-[#666666] transition-colors"
          >
            View full pipeline →
          </Link>
        </div>
      </div>

      {/* Today's Priority Actions */}
      <div className="mb-20">
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[1px] mb-2">
            Today's Priority Actions
          </h2>
          <p className="text-sm text-[#888888] leading-relaxed font-light">
            Recommended actions based on opportunities and activity.
          </p>
        </div>

        <div className="space-y-3">
          <button className="w-full border border-[#EFEFEF] rounded-xl p-6 bg-white flex items-center justify-between hover:border-[#0D0D0D] hover:bg-[#FAFAFA] transition-all duration-150 cursor-pointer group">
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-[#0D0D0D] mb-1">
                Call Joe Green at Westpoint Pharmacy
              </p>
              <p className="text-xs text-[#AAAAAA] font-light">
                High confidence • Manchester
              </p>
            </div>
            <div className="text-right ml-8">
              <p className="text-xs font-semibold text-[#DC2626] mb-2">
                Due today
              </p>
              <p className="text-xs text-[#AAAAAA] mb-3 font-light">10:00 AM</p>
              <span className="text-xs font-semibold text-[#0D0D0D] group-hover:text-[#666666] transition-colors">
                Call
              </span>
            </div>
          </button>

          <button className="w-full border border-[#EFEFEF] rounded-xl p-6 bg-white flex items-center justify-between hover:border-[#0D0D0D] hover:bg-[#FAFAFA] transition-all duration-150 cursor-pointer group">
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-[#0D0D0D] mb-1">
                Send proposal to Range Pharmacy
              </p>
              <p className="text-xs text-[#AAAAAA] font-light">
                Proposal draft ready • High confidence
              </p>
            </div>
            <div className="text-right ml-8">
              <p className="text-xs font-semibold text-[#DC2626] mb-2">
                Due today
              </p>
              <p className="text-xs text-[#AAAAAA] mb-3 font-light">11:30 AM</p>
              <span className="text-xs font-semibold text-[#0D0D0D] group-hover:text-[#666666] transition-colors">
                Send
              </span>
            </div>
          </button>

          <button className="w-full border border-[#EFEFEF] rounded-xl p-6 bg-white flex items-center justify-between hover:border-[#0D0D0D] hover:bg-[#FAFAFA] transition-all duration-150 cursor-pointer group">
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-[#0D0D0D] mb-1">
                Meeting with A & A Pharmacy
              </p>
              <p className="text-xs text-[#AAAAAA] font-light">
                Discovery call • Winslow Road
              </p>
            </div>
            <div className="text-right ml-8">
              <p className="text-xs font-semibold text-[#DC2626] mb-2">
                Due today
              </p>
              <p className="text-xs text-[#AAAAAA] mb-3 font-light">2:00 PM</p>
              <span className="text-xs font-semibold text-[#0D0D0D] group-hover:text-[#666666] transition-colors">
                Join
              </span>
            </div>
          </button>

          <button className="w-full border border-[#EFEFEF] rounded-xl p-6 bg-white flex items-center justify-between hover:border-[#0D0D0D] hover:bg-[#FAFAFA] transition-all duration-150 cursor-pointer group">
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-[#0D0D0D] mb-1">
                Review contract for Rusholme Pharmacy
              </p>
              <p className="text-xs text-[#AAAAAA] font-light">
                Approval required
              </p>
            </div>
            <div className="text-right ml-8">
              <p className="text-xs font-semibold text-[#DC2626] mb-2">
                Due today
              </p>
              <p className="text-xs text-[#AAAAAA] mb-3 font-light">4:15 PM</p>
              <span className="text-xs font-semibold text-[#0D0D0D] group-hover:text-[#666666] transition-colors">
                Review
              </span>
            </div>
          </button>

          <button className="w-full border border-[#EFEFEF] rounded-xl p-6 bg-white flex items-center justify-between hover:border-[#0D0D0D] hover:bg-[#FAFAFA] transition-all duration-150 cursor-pointer group">
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-[#0D0D0D] mb-1">
                Research 2 new opportunities
              </p>
              <p className="text-xs text-[#AAAAAA] font-light">
                AI suggested • High potential
              </p>
            </div>
            <div className="text-right ml-8">
              <p className="text-xs font-semibold text-[#DC2626] mb-2">
                Due today
              </p>
              <p className="text-xs text-[#AAAAAA] mb-3 font-light">EOD</p>
              <span className="text-xs font-semibold text-[#0D0D0D] group-hover:text-[#666666] transition-colors">
                Start
              </span>
            </div>
          </button>
        </div>

        <div className="mt-6">
          <Link
            href="/operator/pipeline"
            className="text-xs font-medium text-[#0D0D0D] hover:text-[#666666] transition-colors"
          >
            View all tasks →
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[1px] mb-2">
            Recent Activity
          </h2>
          <p className="text-sm text-[#888888] leading-relaxed font-light">
            What's happened today.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="border border-[#EFEFEF] rounded-xl p-8 bg-white hover:border-[#D8D8D8] transition-colors duration-200">
            <p className="text-sm font-semibold text-[#0D0D0D] mb-3">
              Discovered
            </p>
            <p className="text-3xl font-black text-[#0D0D0D] mb-4 tracking-[-0.02em]">
              2
            </p>
            <p className="text-xs text-[#AAAAAA] mb-3 font-light">
              Manchester area
            </p>
            <p className="text-xs text-[#D0D0D0] font-light">1h ago</p>
          </div>

          <div className="border border-[#EFEFEF] rounded-xl p-8 bg-white hover:border-[#D8D8D8] transition-colors duration-200">
            <p className="text-sm font-semibold text-[#0D0D0D] mb-3">Opened</p>
            <p className="text-3xl font-black text-[#0D0D0D] mb-4 tracking-[-0.02em]">
              1
            </p>
            <p className="text-xs text-[#AAAAAA] mb-3 font-light">
              Westpoint Pharmacy
            </p>
            <p className="text-xs text-[#D0D0D0] font-light">2h ago</p>
          </div>

          <div className="border border-[#EFEFEF] rounded-xl p-8 bg-white hover:border-[#D8D8D8] transition-colors duration-200">
            <p className="text-sm font-semibold text-[#0D0D0D] mb-3">Booked</p>
            <p className="text-3xl font-black text-[#0D0D0D] mb-4 tracking-[-0.02em]">
              1
            </p>
            <p className="text-xs text-[#AAAAAA] mb-3 font-light">
              A & A Pharmacy
            </p>
            <p className="text-xs text-[#D0D0D0] font-light">3h ago</p>
          </div>

          <div className="border border-[#EFEFEF] rounded-xl p-8 bg-white hover:border-[#D8D8D8] transition-colors duration-200">
            <p className="text-sm font-semibold text-[#0D0D0D] mb-3">Updated</p>
            <p className="text-3xl font-black text-[#0D0D0D] mb-4 tracking-[-0.02em]">
              1
            </p>
            <p className="text-xs text-[#AAAAAA] mb-3 font-light">
              Range Pharmacy
            </p>
            <p className="text-xs text-[#D0D0D0] font-light">4h ago</p>
          </div>
        </div>

        <Link
          href="/operator/learn"
          className="text-xs font-medium text-[#0D0D0D] hover:text-[#666666] transition-colors"
        >
          View all activity →
        </Link>
      </div>
    </div>
  );
}
