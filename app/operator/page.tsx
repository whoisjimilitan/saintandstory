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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
      {/* Main Content */}
      <div className="lg:col-span-3">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs text-[#C9C9C9] mb-2">{dateStr}</p>
          <h1 className="text-4xl font-black text-[#0D0D0D] mb-2">
            Good morning, James.
          </h1>
          <p className="text-sm text-[#888888]">
            Here's what matters today.
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          <div className="border border-[#E8E8E8] rounded-lg p-6 bg-white">
            <div className="text-blue-500 text-2xl mb-4">📊</div>
            <p className="text-sm text-[#888888] mb-2">New opportunities</p>
            <p className="text-3xl font-black text-[#0D0D0D] mb-2">
              {data.discovered}
            </p>
            <p className="text-xs text-[#888888]">vs yesterday</p>
            <p className="text-xs text-green-600 font-semibold">↑ 100%</p>
          </div>

          <div className="border border-[#E8E8E8] rounded-lg p-6 bg-white">
            <div className="text-green-500 text-2xl mb-4">✓</div>
            <p className="text-sm text-[#888888] mb-2">High confidence</p>
            <p className="text-3xl font-black text-[#0D0D0D] mb-2">
              {data.qualified}
            </p>
            <p className="text-xs text-[#888888]">vs yesterday</p>
            <p className="text-xs text-green-600 font-semibold">↑ 100%</p>
          </div>

          <div className="border border-[#E8E8E8] rounded-lg p-6 bg-white">
            <div className="text-orange-500 text-2xl mb-4">📋</div>
            <p className="text-sm text-[#888888] mb-2">Standing orders</p>
            <p className="text-3xl font-black text-[#0D0D0D] mb-2">
              {data.orders}
            </p>
            <p className="text-xs text-[#888888]">vs yesterday</p>
            <p className="text-xs text-[#C9C9C9]">—</p>
          </div>

          <div className="border border-[#E8E8E8] rounded-lg p-6 bg-white">
            <div className="text-purple-500 text-2xl mb-4">✓</div>
            <p className="text-sm text-[#888888] mb-2">Closed today</p>
            <p className="text-3xl font-black text-[#0D0D0D] mb-2">0</p>
            <p className="text-xs text-[#888888]">vs yesterday</p>
            <p className="text-xs text-[#C9C9C9]">—</p>
          </div>
        </div>

        {/* Pipeline at a Glance */}
        <div className="mb-12">
          <h2 className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-wide mb-2">
            Pipeline at a Glance
          </h2>
          <p className="text-xs text-[#888888] mb-6">
            Where opportunities are in your pipeline.
          </p>

          <div className="border border-[#E8E8E8] rounded-lg p-8 bg-white mb-4">
            <div className="flex justify-between items-end mb-8">
              <div className="text-center flex-1">
                <div className="w-3 h-3 rounded-full bg-blue-500 mx-auto mb-3"></div>
                <p className="text-xs font-semibold text-[#0D0D0D] mb-1">
                  Discover
                </p>
                <p className="text-2xl font-black text-[#0D0D0D]">
                  {data.discovered}
                </p>
                <p className="text-xs text-[#888888]">new</p>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <div className="w-12 h-px bg-gradient-to-r from-blue-500 to-green-500"></div>
              </div>

              <div className="text-center flex-1">
                <div className="w-3 h-3 rounded-full border-2 border-green-500 mx-auto mb-3"></div>
                <p className="text-xs font-semibold text-[#0D0D0D] mb-1">
                  Enrich
                </p>
                <p className="text-2xl font-black text-[#0D0D0D]">
                  {data.enriched}
                </p>
                <p className="text-xs text-[#888888]">in progress</p>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <div className="w-12 h-px bg-gradient-to-r from-green-500 to-orange-500"></div>
              </div>

              <div className="text-center flex-1">
                <div className="w-3 h-3 rounded-full border-2 border-orange-500 mx-auto mb-3"></div>
                <p className="text-xs font-semibold text-[#0D0D0D] mb-1">
                  Qualify
                </p>
                <p className="text-2xl font-black text-[#0D0D0D]">1</p>
                <p className="text-xs text-[#888888]">qualified</p>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <div className="w-12 h-px bg-gradient-to-r from-orange-500 to-purple-500"></div>
              </div>

              <div className="text-center flex-1">
                <div className="w-3 h-3 rounded-full border-2 border-purple-500 mx-auto mb-3"></div>
                <p className="text-xs font-semibold text-[#0D0D0D] mb-1">
                  Propose
                </p>
                <p className="text-2xl font-black text-[#0D0D0D]">0</p>
                <p className="text-xs text-[#888888]">proposals</p>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <div className="w-12 h-px bg-gradient-to-r from-purple-500 to-red-500"></div>
              </div>

              <div className="text-center flex-1">
                <div className="w-3 h-3 rounded-full border-2 border-red-500 mx-auto mb-3"></div>
                <p className="text-xs font-semibold text-[#0D0D0D] mb-1">
                  Orders
                </p>
                <p className="text-2xl font-black text-[#0D0D0D]">
                  {data.orders}
                </p>
                <p className="text-xs text-[#888888]">standing orders</p>
              </div>
            </div>
          </div>

          <Link
            href="/operator/pipeline"
            className="text-xs font-semibold text-[#0D0D0D] hover:text-[#666666] transition-colors"
          >
            View full pipeline →
          </Link>
        </div>

        {/* Today's Priority Actions */}
        <div className="mb-12">
          <h2 className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-wide mb-2">
            Today's Priority Actions
          </h2>
          <p className="text-xs text-[#888888] mb-6">
            Recommended actions based on opportunities and activity.
          </p>

          <div className="space-y-3">
            <div className="border border-[#E8E8E8] rounded-lg p-4 bg-white flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="text-lg">📞</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#0D0D0D]">
                    Call Joe Green at Westpoint Pharmacy
                  </p>
                  <p className="text-xs text-[#888888]">
                    High confidence • Manchester
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-red-600 mb-2">
                  Due today
                </p>
                <p className="text-xs text-[#888888] mb-3">10:00 AM</p>
                <button className="text-xs font-semibold text-[#0D0D0D] hover:text-[#666666] transition-colors">
                  Call
                </button>
              </div>
            </div>

            <div className="border border-[#E8E8E8] rounded-lg p-4 bg-white flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="text-lg">✉️</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#0D0D0D]">
                    Send proposal to Range Pharmacy
                  </p>
                  <p className="text-xs text-[#888888]">
                    Proposal draft ready • High confidence
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-red-600 mb-2">
                  Due today
                </p>
                <p className="text-xs text-[#888888] mb-3">11:30 AM</p>
                <button className="text-xs font-semibold text-[#0D0D0D] hover:text-[#666666] transition-colors">
                  Send
                </button>
              </div>
            </div>

            <div className="border border-[#E8E8E8] rounded-lg p-4 bg-white flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="text-lg">📅</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#0D0D0D]">
                    Meeting with A & A Pharmacy
                  </p>
                  <p className="text-xs text-[#888888]">
                    Discovery call • Winslow Road
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-red-600 mb-2">
                  Due today
                </p>
                <p className="text-xs text-[#888888] mb-3">2:00 PM</p>
                <button className="text-xs font-semibold text-[#0D0D0D] hover:text-[#666666] transition-colors">
                  Join
                </button>
              </div>
            </div>

            <div className="border border-[#E8E8E8] rounded-lg p-4 bg-white flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="text-lg">📋</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#0D0D0D]">
                    Review standing order for Rusholme Pharmacy
                  </p>
                  <p className="text-xs text-[#888888]">Approval required</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-red-600 mb-2">
                  Due today
                </p>
                <p className="text-xs text-[#888888] mb-3">4:15 PM</p>
                <button className="text-xs font-semibold text-[#0D0D0D] hover:text-[#666666] transition-colors">
                  Review
                </button>
              </div>
            </div>

            <div className="border border-[#E8E8E8] rounded-lg p-4 bg-white flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="text-lg">🔍</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#0D0D0D]">
                    Research 2 new opportunities
                  </p>
                  <p className="text-xs text-[#888888]">
                    AI suggested • High potential
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-red-600 mb-2">
                  Due today
                </p>
                <p className="text-xs text-[#888888] mb-3">EOD</p>
                <button className="text-xs font-semibold text-[#0D0D0D] hover:text-[#666666] transition-colors">
                  Start
                </button>
              </div>
            </div>
          </div>

          <Link
            href="/operator/pipeline"
            className="inline-block text-xs font-semibold text-[#0D0D0D] hover:text-[#666666] transition-colors mt-6"
          >
            View all tasks →
          </Link>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-wide mb-6">
            Recent Activity
          </h2>

          <div className="flex gap-8 overflow-x-auto pb-4">
            <div className="flex-shrink-0 text-center">
              <div className="text-lg mb-2">📊</div>
              <p className="text-xs font-semibold text-[#0D0D0D] mb-1">
                2 new pharmacies discovered
              </p>
              <p className="text-xs text-[#888888]">Manchester area</p>
              <p className="text-xs text-[#C9C9C9] mt-2">1h ago</p>
            </div>

            <div className="flex-shrink-0 text-center">
              <div className="text-lg mb-2">✉️</div>
              <p className="text-xs font-semibold text-[#0D0D0D] mb-1">
                Email opened
              </p>
              <p className="text-xs text-[#888888]">Westpoint Pharmacy</p>
              <p className="text-xs text-[#C9C9C9] mt-2">2h ago</p>
            </div>

            <div className="flex-shrink-0 text-center">
              <div className="text-lg mb-2">📅</div>
              <p className="text-xs font-semibold text-[#0D0D0D] mb-1">
                Meeting booked
              </p>
              <p className="text-xs text-[#888888]">A & A Pharmacy</p>
              <p className="text-xs text-[#C9C9C9] mt-2">3h ago</p>
            </div>

            <div className="flex-shrink-0 text-center">
              <div className="text-lg mb-2">📋</div>
              <p className="text-xs font-semibold text-[#0D0D0D] mb-1">
                Proposal updated
              </p>
              <p className="text-xs text-[#888888]">Range Pharmacy</p>
              <p className="text-xs text-[#C9C9C9] mt-2">4h ago</p>
            </div>
          </div>

          <Link
            href="/operator/learn"
            className="text-xs font-semibold text-[#0D0D0D] hover:text-[#666666] transition-colors"
          >
            View all activity →
          </Link>
        </div>
      </div>

      {/* Right Sidebar - Objective */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-8">
          {/* Objective */}
          <div>
            <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-wide mb-3">
              Objective
            </p>
            <p className="text-xs text-[#888888] leading-relaxed">
              Provide a clear, scannable morning brief that answers:
              <br />
              <br />
              What happened, what matters, what should I do?
            </p>
          </div>

          {/* Key Principles */}
          <div>
            <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-wide mb-3">
              Key Principles
            </p>
            <ul className="text-xs text-[#888888] space-y-2">
              <li>• Scan in 5 seconds</li>
              <li>• Action-oriented</li>
              <li>• Specific, not generic</li>
              <li>• Visual hierarchy</li>
              <li>• Calm, premium, uncluttered</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
