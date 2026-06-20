"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "./components/PageHeader";

interface BriefingData {
  discovered: number;
  highConfidence: number;
  ordersNeedingAttention: number;
  loading: boolean;
  error: string | null;
}

export default function MorningBriefing() {
  const [data, setData] = useState<BriefingData>({
    discovered: 0,
    highConfidence: 0,
    ordersNeedingAttention: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch summary
        const summaryRes = await fetch("/api/operator/morning-brief/summary");
        if (!summaryRes.ok) throw new Error("Failed to fetch summary");
        const summary = await summaryRes.json();

        setData({
          discovered: summary.discovered,
          highConfidence: summary.qualified,
          ordersNeedingAttention: summary.orders,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error loading briefing:", error);
        setData((prev) => ({
          ...prev,
          loading: false,
          error: "Unable to load briefing",
        }));
      }
    };

    loadData();
  }, []);

  if (data.loading) {
    return (
      <div>
        <PageHeader
          title="Good morning."
          purpose="Loading your briefing..."
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Good morning." purpose="" />

      <div className="space-y-8 max-w-2xl">
        {/* Facts */}
        <div className="space-y-4">
          <p className="text-base text-[#0D0D0D]">
            {data.discovered} {data.discovered === 1 ? "company" : "companies"} discovered
            overnight.
          </p>
          <p className="text-base text-[#0D0D0D]">
            {data.highConfidence} high confidence{" "}
            {data.highConfidence === 1 ? "opportunity" : "opportunities"}.
          </p>
          <p className="text-base text-[#0D0D0D]">
            {data.ordersNeedingAttention} standing{" "}
            {data.ordersNeedingAttention === 1 ? "order" : "orders"} requiring
            attention.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#E8E8E8]"></div>

        {/* Next Action */}
        <div className="pt-4">
          <p className="text-sm text-[#888888] mb-6">Start with Discovery.</p>
          <Link
            href="/operator/discover"
            className="inline-block px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold hover:bg-[#222222] transition-colors"
          >
            Continue →
          </Link>
        </div>
      </div>
    </div>
  );
}
