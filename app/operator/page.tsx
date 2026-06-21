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

interface ActionDetail {
  id: string;
  business: string;
  location: string;
  category: string;
  confidence: string;
  stage: string;
  lastContact?: string;
  reason: string;
  requiredActions: string[];
  nextStep: string;
  dueTime: string;
}

const actionDetails: Record<string, ActionDetail> = {
  "1": {
    id: "1",
    business: "Westpoint Pharmacy",
    location: "Manchester",
    category: "High confidence",
    confidence: "95%",
    stage: "Enrich",
    lastContact: "2 days ago",
    reason: "High engagement on initial contact. Decision maker available today.",
    requiredActions: [
      "Discuss service scope and pricing",
      "Confirm transition timeline",
      "Send formal proposal",
      "Schedule follow-up meeting"
    ],
    nextStep: "Call Joe Green to confirm availability",
    dueTime: "10:00 AM"
  },
  "2": {
    id: "2",
    business: "Range Pharmacy",
    location: "Leeds",
    category: "Proposal draft ready",
    confidence: "88%",
    stage: "Qualify",
    lastContact: "1 week ago",
    reason: "Proposal reviewed internally. Ready for formal submission and discussion.",
    requiredActions: [
      "Review proposal feedback",
      "Address any concerns",
      "Send via formal channel",
      "Schedule review call"
    ],
    nextStep: "Send proposal and request review meeting",
    dueTime: "11:30 AM"
  },
  "3": {
    id: "3",
    business: "A & A Pharmacy",
    location: "Winslow Road",
    category: "Discovery call",
    confidence: "72%",
    stage: "Discover",
    lastContact: "3 days ago",
    reason: "Initial discovery call scheduled. Need to understand their current operations.",
    requiredActions: [
      "Review their current provider",
      "Prepare discovery questions",
      "Identify pain points",
      "Take detailed notes"
    ],
    nextStep: "Join discovery call and take comprehensive notes",
    dueTime: "2:00 PM"
  },
  "4": {
    id: "4",
    business: "Rusholme Pharmacy",
    location: "Manchester",
    category: "Approval required",
    confidence: "91%",
    stage: "Propose",
    lastContact: "4 days ago",
    reason: "Contract finalized and ready for internal review and approval.",
    requiredActions: [
      "Review contract terms",
      "Verify all terms aligned",
      "Check legal compliance",
      "Prepare for execution"
    ],
    nextStep: "Review contract and prepare for signature",
    dueTime: "4:15 PM"
  },
  "5": {
    id: "5",
    business: "2 New Opportunities",
    location: "Multiple",
    category: "AI suggested",
    confidence: "65%",
    stage: "Discover",
    reason: "AI identified potential matches based on location and service requirements.",
    requiredActions: [
      "Research business profiles",
      "Check market fit",
      "Identify decision makers",
      "Prepare outreach strategy"
    ],
    nextStep: "Research opportunities and create outreach plan",
    dueTime: "EOD"
  }
};

export default function OperatorBriefing() {
  const [data, setData] = useState<BriefingData>({
    discovered: 0,
    enriched: 0,
    qualified: 0,
    orders: 0,
    loading: true,
  });

  const [dateStr, setDateStr] = useState("");
  const [selectedAction, setSelectedAction] = useState<ActionDetail | null>(null);

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

  const handleActionClick = (actionId: string) => {
    setSelectedAction(actionDetails[actionId] || null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="mb-12 md:mb-16 px-4 md:px-0">
        <div className="inline-flex items-center gap-2 mb-4 md:mb-6 bg-[#F5F5F5] px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-[#E8E8E8]">
          <p className="text-[10px] md:text-xs font-semibold text-[#0D0D0D] tracking-[0.2em] uppercase">
            {dateStr}
          </p>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-[#0D0D0D] mb-2 md:mb-3 tracking-[-0.01em] leading-tight">
          Good morning, James.
        </h1>
        <p className="text-sm md:text-base text-[#666666] leading-relaxed max-w-xl font-light">
          Here's what matters today.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-12 md:mb-20 px-4 md:px-0">
        <div className="border border-[#E8E8E8] rounded-lg md:rounded-xl p-4 md:p-8 bg-white hover:border-[#D0D0D0] transition-colors duration-200">
          <p className="text-[9px] md:text-xs font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3 md:mb-4">
            New
          </p>
          <p className="text-2xl md:text-4xl font-black text-[#0D0D0D] mb-3 md:mb-4 tracking-[-0.02em]">
            {data.discovered}
          </p>
          <div className="space-y-0.5">
            <p className="text-[9px] md:text-xs text-[#666666]">vs yesterday</p>
            <p className="text-[9px] md:text-xs font-semibold text-[#22C55E]">↑ 100%</p>
          </div>
        </div>

        <div className="border border-[#E8E8E8] rounded-lg md:rounded-xl p-4 md:p-8 bg-white hover:border-[#D0D0D0] transition-colors duration-200">
          <p className="text-[9px] md:text-xs font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3 md:mb-4">
            High confidence
          </p>
          <p className="text-2xl md:text-4xl font-black text-[#0D0D0D] mb-3 md:mb-4 tracking-[-0.02em]">
            {data.qualified}
          </p>
          <div className="space-y-0.5">
            <p className="text-[9px] md:text-xs text-[#666666]">vs yesterday</p>
            <p className="text-[9px] md:text-xs font-semibold text-[#22C55E]">↑ 100%</p>
          </div>
        </div>

        <div className="border border-[#E8E8E8] rounded-lg md:rounded-xl p-4 md:p-8 bg-white hover:border-[#D0D0D0] transition-colors duration-200">
          <p className="text-[9px] md:text-xs font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3 md:mb-4">
            Finished
          </p>
          <p className="text-2xl md:text-4xl font-black text-[#0D0D0D] mb-3 md:mb-4 tracking-[-0.02em]">
            {data.orders}
          </p>
          <div className="space-y-0.5">
            <p className="text-[9px] md:text-xs text-[#666666]">vs yesterday</p>
            <p className="text-[9px] md:text-xs text-[#D0D0D0]">—</p>
          </div>
        </div>

        <div className="border border-[#E8E8E8] rounded-lg md:rounded-xl p-4 md:p-8 bg-white hover:border-[#D0D0D0] transition-colors duration-200">
          <p className="text-[9px] md:text-xs font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3 md:mb-4">
            Closed
          </p>
          <p className="text-2xl md:text-4xl font-black text-[#0D0D0D] mb-3 md:mb-4 tracking-[-0.02em]">
            0
          </p>
          <div className="space-y-0.5">
            <p className="text-[9px] md:text-xs text-[#666666]">vs yesterday</p>
            <p className="text-[9px] md:text-xs text-[#D0D0D0]">—</p>
          </div>
        </div>
      </div>

      {/* Pipeline at a Glance */}
      <div className="mb-12 md:mb-20 px-4 md:px-0">
        <div className="mb-6 md:mb-8">
          <h2 className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[1px] mb-2">
            Pipeline
          </h2>
          <p className="text-xs md:text-sm text-[#888888] leading-relaxed font-light">
            Where opportunities are in your pipeline.
          </p>
        </div>

        <div className="border border-[#E8E8E8] rounded-lg md:rounded-xl p-6 md:p-12 bg-white overflow-x-auto">
          <div className="flex justify-between items-end gap-2 md:gap-4 min-w-min md:min-w-0">
            {/* Discover */}
            <div className="text-center flex-shrink-0 md:flex-1 min-w-[60px] md:min-w-0">
              <div className="flex justify-center mb-3 md:mb-6">
                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-blue-500 shadow-sm"></div>
              </div>
              <p className="text-[9px] md:text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.5px] mb-1 md:mb-2">
                Discover
              </p>
              <p className="text-lg md:text-3xl font-black text-[#0D0D0D] mb-2 md:mb-3 tracking-[-0.02em]">
                {data.discovered}
              </p>
              <p className="text-[9px] md:text-xs text-[#666666] font-light">new</p>
            </div>

            {/* Connecting Line */}
            <div className="flex-shrink-0 md:flex-1 flex items-center justify-center px-1 md:px-4 h-6 md:h-auto">
              <svg
                className="w-6 md:w-full h-0.5 md:h-1"
                viewBox="0 0 100 4"
                preserveAspectRatio="none"
              >
                <line
                  x1="0"
                  y1="2"
                  x2="100"
                  y2="2"
                  stroke="#E8E8E8"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Enrich */}
            <div className="text-center flex-shrink-0 md:flex-1 min-w-[60px] md:min-w-0">
              <div className="flex justify-center mb-3 md:mb-6">
                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full border-2 border-green-500"></div>
              </div>
              <p className="text-[9px] md:text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.5px] mb-1 md:mb-2">
                Enrich
              </p>
              <p className="text-lg md:text-3xl font-black text-[#0D0D0D] mb-2 md:mb-3 tracking-[-0.02em]">
                {data.enriched}
              </p>
              <p className="text-[9px] md:text-xs text-[#666666] font-light">start</p>
            </div>

            {/* Connecting Line */}
            <div className="flex-shrink-0 md:flex-1 flex items-center justify-center px-1 md:px-4 h-6 md:h-auto">
              <svg
                className="w-6 md:w-full h-0.5 md:h-1"
                viewBox="0 0 100 4"
                preserveAspectRatio="none"
              >
                <line
                  x1="0"
                  y1="2"
                  x2="100"
                  y2="2"
                  stroke="#E8E8E8"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Qualify */}
            <div className="text-center flex-shrink-0 md:flex-1 min-w-[60px] md:min-w-0">
              <div className="flex justify-center mb-3 md:mb-6">
                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full border-2 border-orange-500"></div>
              </div>
              <p className="text-[9px] md:text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.5px] mb-1 md:mb-2">
                Qualify
              </p>
              <p className="text-lg md:text-3xl font-black text-[#0D0D0D] mb-2 md:mb-3 tracking-[-0.02em]">
                1
              </p>
              <p className="text-[9px] md:text-xs text-[#666666] font-light">qualified</p>
            </div>

            {/* Connecting Line */}
            <div className="flex-shrink-0 md:flex-1 flex items-center justify-center px-1 md:px-4 h-6 md:h-auto">
              <svg
                className="w-6 md:w-full h-0.5 md:h-1"
                viewBox="0 0 100 4"
                preserveAspectRatio="none"
              >
                <line
                  x1="0"
                  y1="2"
                  x2="100"
                  y2="2"
                  stroke="#E8E8E8"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Propose */}
            <div className="text-center flex-shrink-0 md:flex-1 min-w-[60px] md:min-w-0">
              <div className="flex justify-center mb-3 md:mb-6">
                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full border-2 border-purple-500"></div>
              </div>
              <p className="text-[9px] md:text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.5px] mb-1 md:mb-2">
                Propose
              </p>
              <p className="text-lg md:text-3xl font-black text-[#0D0D0D] mb-2 md:mb-3 tracking-[-0.02em]">
                0
              </p>
              <p className="text-[9px] md:text-xs text-[#666666] font-light">proposed</p>
            </div>

            {/* Connecting Line */}
            <div className="flex-shrink-0 md:flex-1 flex items-center justify-center px-1 md:px-4 h-6 md:h-auto">
              <svg
                className="w-6 md:w-full h-0.5 md:h-1"
                viewBox="0 0 100 4"
                preserveAspectRatio="none"
              >
                <line
                  x1="0"
                  y1="2"
                  x2="100"
                  y2="2"
                  stroke="#E8E8E8"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Orders */}
            <div className="text-center flex-shrink-0 md:flex-1 min-w-[60px] md:min-w-0">
              <div className="flex justify-center mb-3 md:mb-6">
                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full border-2 border-red-500"></div>
              </div>
              <p className="text-[9px] md:text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.5px] mb-1 md:mb-2">
                Orders
              </p>
              <p className="text-lg md:text-3xl font-black text-[#0D0D0D] mb-2 md:mb-3 tracking-[-0.02em]">
                {data.orders}
              </p>
              <p className="text-[9px] md:text-xs text-[#666666] font-light">finish</p>
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-6">
          <Link
            href="/operator/pipeline"
            className="text-xs font-medium text-[#0D0D0D] hover:text-[#666666] transition-colors"
          >
            View full pipeline →
          </Link>
        </div>
      </div>

      {/* Today's Priority Actions */}
      <div className="mb-12 md:mb-20 px-4 md:px-0">
        <div className="mb-4 md:mb-8">
          <h2 className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[1px] mb-2">
            Today's Actions
          </h2>
          <p className="text-xs md:text-sm text-[#888888] leading-relaxed font-light">
            Recommended actions based on opportunities and activity.
          </p>
        </div>

        <div className="space-y-2 md:space-y-3">
          <button onClick={() => handleActionClick("1")} className="w-full border border-[#E8E8E8] rounded-lg md:rounded-xl p-3 md:p-6 bg-white flex flex-col md:flex-row md:items-center md:justify-between hover:border-[#0D0D0D] hover:bg-[#F5F5F5] transition-all duration-150 cursor-pointer group text-left">
            <div className="flex-1 mb-2 md:mb-0">
              <p className="text-xs md:text-sm font-semibold text-[#0D0D0D] mb-1">
                Call Joe Green at Westpoint Pharmacy
              </p>
              <p className="text-xs text-[#666666] font-light">
                High confidence • Manchester
              </p>
            </div>
            <div className="text-right md:ml-8">
              <p className="text-xs font-semibold text-[#DC2626] mb-1">
                Due today
              </p>
              <p className="text-xs text-[#666666] mb-2 font-light">10:00 AM</p>
              <span className="text-xs font-semibold text-[#0D0D0D] group-hover:text-[#666666] transition-colors">
                Call
              </span>
            </div>
          </button>

          <button onClick={() => handleActionClick("2")} className="w-full border border-[#E8E8E8] rounded-lg md:rounded-xl p-3 md:p-6 bg-white flex flex-col md:flex-row md:items-center md:justify-between hover:border-[#0D0D0D] hover:bg-[#F5F5F5] transition-all duration-150 cursor-pointer group text-left">
            <div className="flex-1 mb-2 md:mb-0">
              <p className="text-xs md:text-sm font-semibold text-[#0D0D0D] mb-1">
                Send proposal to Range Pharmacy
              </p>
              <p className="text-xs text-[#666666] font-light">
                Proposal draft ready • High confidence
              </p>
            </div>
            <div className="text-right md:ml-8">
              <p className="text-xs font-semibold text-[#DC2626] mb-1">
                Due today
              </p>
              <p className="text-xs text-[#666666] mb-2 font-light">11:30 AM</p>
              <span className="text-xs font-semibold text-[#0D0D0D] group-hover:text-[#666666] transition-colors">
                Send
              </span>
            </div>
          </button>

          <button onClick={() => handleActionClick("3")} className="w-full border border-[#E8E8E8] rounded-lg md:rounded-xl p-3 md:p-6 bg-white flex flex-col md:flex-row md:items-center md:justify-between hover:border-[#0D0D0D] hover:bg-[#F5F5F5] transition-all duration-150 cursor-pointer group text-left">
            <div className="flex-1 mb-2 md:mb-0">
              <p className="text-xs md:text-sm font-semibold text-[#0D0D0D] mb-1">
                Meeting with A & A Pharmacy
              </p>
              <p className="text-xs text-[#666666] font-light">
                Discovery call • Winslow Road
              </p>
            </div>
            <div className="text-right md:ml-8">
              <p className="text-xs font-semibold text-[#DC2626] mb-1">
                Due today
              </p>
              <p className="text-xs text-[#666666] mb-2 font-light">2:00 PM</p>
              <span className="text-xs font-semibold text-[#0D0D0D] group-hover:text-[#666666] transition-colors">
                Join
              </span>
            </div>
          </button>

          <button onClick={() => handleActionClick("4")} className="w-full border border-[#E8E8E8] rounded-lg md:rounded-xl p-3 md:p-6 bg-white flex flex-col md:flex-row md:items-center md:justify-between hover:border-[#0D0D0D] hover:bg-[#F5F5F5] transition-all duration-150 cursor-pointer group text-left">
            <div className="flex-1 mb-2 md:mb-0">
              <p className="text-xs md:text-sm font-semibold text-[#0D0D0D] mb-1">
                Review contract for Rusholme Pharmacy
              </p>
              <p className="text-xs text-[#666666] font-light">
                Approval required
              </p>
            </div>
            <div className="text-right md:ml-8">
              <p className="text-xs font-semibold text-[#DC2626] mb-1">
                Due today
              </p>
              <p className="text-xs text-[#666666] mb-2 font-light">4:15 PM</p>
              <span className="text-xs font-semibold text-[#0D0D0D] group-hover:text-[#666666] transition-colors">
                Review
              </span>
            </div>
          </button>

          <button onClick={() => handleActionClick("5")} className="w-full border border-[#E8E8E8] rounded-lg md:rounded-xl p-3 md:p-6 bg-white flex flex-col md:flex-row md:items-center md:justify-between hover:border-[#0D0D0D] hover:bg-[#F5F5F5] transition-all duration-150 cursor-pointer group text-left">
            <div className="flex-1 mb-2 md:mb-0">
              <p className="text-xs md:text-sm font-semibold text-[#0D0D0D] mb-1">
                Research 2 new opportunities
              </p>
              <p className="text-xs text-[#666666] font-light">
                AI suggested • High potential
              </p>
            </div>
            <div className="text-right md:ml-8">
              <p className="text-xs font-semibold text-[#DC2626] mb-1">
                Due today
              </p>
              <p className="text-xs text-[#666666] mb-2 font-light">EOD</p>
              <span className="text-xs font-semibold text-[#0D0D0D] group-hover:text-[#666666] transition-colors">
                Start
              </span>
            </div>
          </button>
        </div>

        <div className="mt-4 md:mt-6">
          <Link
            href="/operator/pipeline"
            className="text-xs font-medium text-[#0D0D0D] hover:text-[#666666] transition-colors"
          >
            View all tasks →
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-4 md:px-0">
        <div className="mb-4 md:mb-8">
          <h2 className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[1px] mb-2">
            Activity
          </h2>
          <p className="text-xs md:text-sm text-[#888888] leading-relaxed font-light">
            What's happened today.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <div className="border border-[#E8E8E8] rounded-lg md:rounded-xl p-4 md:p-8 bg-white hover:border-[#D0D0D0] transition-colors duration-200">
            <p className="text-xs md:text-sm font-semibold text-[#0D0D0D] mb-2 md:mb-3">
              Discovered
            </p>
            <p className="text-2xl md:text-3xl font-black text-[#0D0D0D] mb-3 md:mb-4 tracking-[-0.02em]">
              2
            </p>
            <p className="text-[9px] md:text-xs text-[#666666] mb-2 md:mb-3 font-light">
              Manchester area
            </p>
            <p className="text-[9px] md:text-xs text-[#D0D0D0] font-light">1h ago</p>
          </div>

          <div className="border border-[#E8E8E8] rounded-lg md:rounded-xl p-4 md:p-8 bg-white hover:border-[#D0D0D0] transition-colors duration-200">
            <p className="text-xs md:text-sm font-semibold text-[#0D0D0D] mb-2 md:mb-3">
              Opened
            </p>
            <p className="text-2xl md:text-3xl font-black text-[#0D0D0D] mb-3 md:mb-4 tracking-[-0.02em]">
              1
            </p>
            <p className="text-[9px] md:text-xs text-[#666666] mb-2 md:mb-3 font-light">
              Westpoint Pharmacy
            </p>
            <p className="text-[9px] md:text-xs text-[#D0D0D0] font-light">2h ago</p>
          </div>

          <div className="border border-[#E8E8E8] rounded-lg md:rounded-xl p-4 md:p-8 bg-white hover:border-[#D0D0D0] transition-colors duration-200">
            <p className="text-xs md:text-sm font-semibold text-[#0D0D0D] mb-2 md:mb-3">
              Booked
            </p>
            <p className="text-2xl md:text-3xl font-black text-[#0D0D0D] mb-3 md:mb-4 tracking-[-0.02em]">
              1
            </p>
            <p className="text-[9px] md:text-xs text-[#666666] mb-2 md:mb-3 font-light">
              A & A Pharmacy
            </p>
            <p className="text-[9px] md:text-xs text-[#D0D0D0] font-light">3h ago</p>
          </div>

          <div className="border border-[#E8E8E8] rounded-lg md:rounded-xl p-4 md:p-8 bg-white hover:border-[#D0D0D0] transition-colors duration-200">
            <p className="text-xs md:text-sm font-semibold text-[#0D0D0D] mb-2 md:mb-3">
              Updated
            </p>
            <p className="text-2xl md:text-3xl font-black text-[#0D0D0D] mb-3 md:mb-4 tracking-[-0.02em]">
              1
            </p>
            <p className="text-[9px] md:text-xs text-[#666666] mb-2 md:mb-3 font-light">
              Range Pharmacy
            </p>
            <p className="text-[9px] md:text-xs text-[#D0D0D0] font-light">4h ago</p>
          </div>
        </div>

        <div className="mt-4 md:mt-6">
          <Link
            href="/operator/learn"
            className="text-xs font-medium text-[#0D0D0D] hover:text-[#666666] transition-colors"
          >
            View all activity →
          </Link>
        </div>
      </div>

      {/* Action Detail Modal */}
      {selectedAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 py-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E8E8E8]">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-[#E8E8E8] px-6 md:px-8 py-6 flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-black text-[#0D0D0D] mb-2 tracking-[-0.01em]">
                  {selectedAction.business}
                </h2>
                <p className="text-sm text-[#666666] font-light">
                  {selectedAction.location} • {selectedAction.category}
                </p>
              </div>
              <button
                onClick={() => setSelectedAction(null)}
                className="text-2xl text-[#888888] hover:text-[#0D0D0D] transition-colors ml-4 flex-shrink-0"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 md:px-8 py-6 space-y-8">
              {/* Business Overview */}
              <div>
                <h3 className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[1px] mb-4">
                  Business Overview
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-[#E8E8E8] rounded-lg p-4">
                    <p className="text-xs text-[#888888] mb-1 font-light">Stage</p>
                    <p className="text-sm font-semibold text-[#0D0D0D]">{selectedAction.stage}</p>
                  </div>
                  <div className="border border-[#E8E8E8] rounded-lg p-4">
                    <p className="text-xs text-[#888888] mb-1 font-light">Confidence</p>
                    <p className="text-sm font-semibold text-[#0D0D0D]">{selectedAction.confidence}</p>
                  </div>
                  <div className="border border-[#E8E8E8] rounded-lg p-4">
                    <p className="text-xs text-[#888888] mb-1 font-light">Location</p>
                    <p className="text-sm font-semibold text-[#0D0D0D]">{selectedAction.location}</p>
                  </div>
                  {selectedAction.lastContact && (
                    <div className="border border-[#E8E8E8] rounded-lg p-4">
                      <p className="text-xs text-[#888888] mb-1 font-light">Last Contact</p>
                      <p className="text-sm font-semibold text-[#0D0D0D]">{selectedAction.lastContact}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Why This Matters */}
              <div>
                <h3 className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[1px] mb-3">
                  Why This Matters
                </h3>
                <p className="text-sm text-[#666666] leading-relaxed font-light">
                  {selectedAction.reason}
                </p>
              </div>

              {/* Required Actions */}
              <div>
                <h3 className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[1px] mb-4">
                  Today's Required Actions
                </h3>
                <div className="space-y-2">
                  {selectedAction.requiredActions.map((action, idx) => (
                    <div key={idx} className="flex gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-[#0D0D0D] text-white flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                        {idx + 1}
                      </div>
                      <p className="text-[#666666] pt-0.5 font-light">{action}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Step */}
              <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg p-4 md:p-6">
                <p className="text-xs text-[#888888] mb-2 font-light uppercase tracking-[0.5px]">
                  Your Next Step
                </p>
                <p className="text-sm md:text-base font-semibold text-[#0D0D0D] mb-3">
                  {selectedAction.nextStep}
                </p>
                <p className="text-xs text-[#666666] font-light">
                  Due: {selectedAction.dueTime}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedAction(null)}
                className="w-full border border-[#E8E8E8] rounded-lg p-4 bg-white hover:bg-[#F5F5F5] hover:border-[#D0D0D0] transition-all font-semibold text-[#0D0D0D] text-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
