"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function TodayExecutiveBrief() {
  const [brief, setBrief] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await fetch("/api/operator/ceo-report");
        if (res.ok) {
          const data = await res.json();
          setBrief(data);
        }
      } catch (error) {
        console.error("Failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    const interval = setInterval(fetch, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !brief) return null;

  const { headline, categories, recommendations, actions } = brief;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* ONE NUMBER THAT MATTERS */}
      <div className="mb-12">
        <p className="text-xs text-[#888888] uppercase tracking-widest mb-3">Expected this week</p>
        <div className="flex items-baseline gap-3">
          <p className="text-5xl font-black text-[#0D0D0D]">£{headline.expectedThisWeek.toLocaleString()}</p>
          <p className={`text-sm font-semibold ${headline.trend.includes('+') ? 'text-[#0D0D0D]' : 'text-[#888888]'}`}>
            {headline.trend} vs yesterday
          </p>
        </div>
        <p className="text-xs text-[#888888] mt-2">Based on {headline.overnightReplies} overnight replies</p>
      </div>

      {/* WHAT HAPPENED OVERNIGHT */}
      <div className="mb-12 pb-12 border-b border-[#E8E8E8]">
        <p className="text-xs text-[#888888] uppercase tracking-widest mb-4">Overnight</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-black text-[#0D0D0D]">{headline.overnightReplies}</p>
            <p className="text-xs text-[#888888] mt-1">new replies waiting</p>
          </div>
          <div>
            <p className="text-2xl font-black text-[#0D0D0D]">{categories[0]?.category}</p>
            <p className="text-xs text-[#888888] mt-1">strongest category</p>
          </div>
        </div>
      </div>

      {/* DO THIS TODAY */}
      <div>
        <p className="text-xs text-[#888888] uppercase tracking-widest mb-4">Your move</p>
        <div className="space-y-3">
          {actions.slice(0, 2).map((action: any, i: number) => (
            <Link href={action.link} key={i}>
              <div className={`p-4 rounded-lg transition-colors ${
                action.priority === "high"
                  ? "bg-[#0D0D0D] text-white"
                  : "bg-[#F9F9F9] border border-[#E8E8E8] text-[#0D0D0D]"
              }`}>
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-sm">{action.title}</p>
                  <p className="font-black text-lg">£{action.expectedValue.toLocaleString()}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ONE INSIGHT */}
      {recommendations[0] && (
        <div className="mt-8 p-4 bg-[#F9F9F9] rounded-lg border border-[#E8E8E8]">
          <p className="text-sm text-[#0D0D0D]">{recommendations[0]}</p>
        </div>
      )}
    </div>
  );
}
