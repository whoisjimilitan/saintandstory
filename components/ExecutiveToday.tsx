"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function ExecutiveToday() {
  const router = useRouter();
  const [brief, setBrief] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrief = async () => {
      try {
        const res = await fetch("/api/operator/executive-brief");
        if (res.ok) {
          const data = await res.json();
          setBrief(data.report);
        }
      } catch (error) {
        console.error("[EXECUTIVE TODAY] Failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrief();
    // Refresh every 60 seconds
    const interval = setInterval(fetchBrief, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !brief) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-[#888888]">
        Loading your executive brief...
      </div>
    );
  }

  const { summary, performance, revenue, recommendations, actions } = brief;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* OVERNIGHT SNAPSHOT */}
      <div className="mb-12">
        <h2 className="text-xs font-black text-[#0D0D0D] uppercase tracking-widest mb-4">
          Overnight Summary
        </h2>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Emails Sent */}
          <div className="p-6 bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg">
            <p className="text-xs text-[#888888] mb-2">Emails Sent</p>
            <p className="text-3xl font-black text-[#0D0D0D]">{summary.overnightEmailsSent}</p>
            <p className="text-xs text-[#666666] mt-2">across {performance.byCategory.length} categories</p>
          </div>

          {/* Replies */}
          <div className="p-6 bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg">
            <p className="text-xs text-[#888888] mb-2">Replies</p>
            <p className="text-3xl font-black text-[#0D0D0D]">{summary.overnightReplies}</p>
            <p className="text-xs text-[#666666] mt-2">{summary.replyRate}% reply rate</p>
          </div>

          {/* Revenue Impact */}
          <div className="p-6 bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg">
            <p className="text-xs text-[#888888] mb-2">Contracts Signed</p>
            <p className="text-3xl font-black text-[#0D0D0D]">£{revenue.newContractValue.toLocaleString()}</p>
            <p className="text-xs text-[#666666] mt-2">{revenue.newContractCount} new contracts</p>
          </div>
        </div>
      </div>

      {/* WHAT'S WORKING / WHAT'S NOT */}
      <div className="mb-12">
        <h2 className="text-xs font-black text-[#0D0D0D] uppercase tracking-widest mb-4">
          Performance Breakdown
        </h2>

        <div className="grid grid-cols-2 gap-6">
          {/* HOT CATEGORIES */}
          <div className="p-6 bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg">
            <p className="text-xs font-semibold text-[#0D0D0D] mb-3">WORKING WELL</p>
            {performance.hotCategories.length > 0 ? (
              <ul className="space-y-2">
                {performance.hotCategories.map((cat: string) => {
                  const stat = performance.byCategory.find((c: any) => c.category === cat);
                  return (
                    <li key={cat} className="text-sm">
                      <p className="font-semibold text-[#0D0D0D]">{cat}</p>
                      <p className="text-xs text-[#0D0D0D]">
                        {stat?.replyRate}% reply rate • {stat?.replied}/{stat?.sent} emails
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-xs text-[#888888]">All categories underperforming today</p>
            )}
          </div>

          {/* COLD CATEGORIES */}
          <div className="p-6 bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg">
            <p className="text-xs font-semibold text-[#0D0D0D] mb-3">NEEDS ATTENTION</p>
            {performance.coldCategories.length > 0 ? (
              <ul className="space-y-2">
                {performance.coldCategories.map((cat: string) => {
                  const stat = performance.byCategory.find((c: any) => c.category === cat);
                  return (
                    <li key={cat} className="text-sm">
                      <p className="font-semibold text-[#0D0D0D]">{cat}</p>
                      <p className="text-xs text-[#0D0D0D]">
                        {stat?.replyRate}% reply rate • {stat?.replied}/{stat?.sent} emails
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-xs text-[#888888]">All categories performing well</p>
            )}
          </div>
        </div>
      </div>

      {/* RECOMMENDATIONS - INTELLIGENT ADVICE */}
      <div className="mb-12">
        <h2 className="text-xs font-black text-[#0D0D0D] uppercase tracking-widest mb-4">
          What You Should Do Today
        </h2>

        <div className="space-y-3">
          {recommendations.map((rec: string, idx: number) => (
            <div key={idx} className="p-4 bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg">
              <p className="text-sm text-[#0D0D0D] leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PRIORITY ACTIONS */}
      <div className="mb-12">
        <h2 className="text-xs font-black text-[#0D0D0D] uppercase tracking-widest mb-4">
          Quick Actions
        </h2>

        <div className="space-y-3">
          {actions.map((action: any, idx: number) => (
            <Link href={action.link} key={idx}>
              <div
                className={`p-4 rounded-lg transition-colors cursor-pointer ${
                  action.priority === "high"
                    ? "bg-[#0D0D0D] text-white border border-[#0D0D0D]"
                    : "bg-[#F9F9F9] border border-[#E8E8E8] text-[#0D0D0D]"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm">{action.action}</p>
                    <p className={`text-xs mt-1 ${action.priority === "high" ? "text-[#CCCCCC]" : "text-[#888888]"}`}>
                      {action.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg">{action.count}</p>
                    <p className={`text-xs ${action.priority === "high" ? "text-[#CCCCCC]" : "text-[#888888]"}`}>
                      → Open
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* REVENUE FORECAST */}
      <div className="p-6 bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg">
        <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-3">
          This Week's Forecast
        </p>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-[#888888] mb-1">Projected Contracts</p>
            <p className="text-2xl font-black text-[#0D0D0D]">{revenue.projectedContracts}</p>
          </div>
          <div>
            <p className="text-xs text-[#888888] mb-1">Projected Revenue</p>
            <p className="text-2xl font-black text-[#0D0D0D]">£{revenue.projectedRevenue.toLocaleString()}</p>
          </div>
        </div>
        <p className="text-xs text-[#666666] mt-4">
          Based on {revenue.newContractCount} new contracts at £{revenue.averageContractValue} average value
        </p>
      </div>
    </div>
  );
}
