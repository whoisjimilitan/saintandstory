"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Metric,
  SectionHeader,
  PriorityItem,
  InsightCard,
  PipelineStage,
  Divider,
} from "./components/BriefingComponents";

interface BriefingData {
  discovered: number;
  enriched: number;
  qualified: number;
  orders: number;
  loading: boolean;
  error: string | null;
}

export default function TodayBriefing() {
  const [data, setData] = useState<BriefingData>({
    discovered: 0,
    enriched: 0,
    qualified: 0,
    orders: 0,
    loading: true,
    error: null,
  });

  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
    const monthName = today.toLocaleDateString("en-US", { month: "long" });
    const dayNum = today.getDate();
    setCurrentDate(`${dayName}, ${monthName} ${dayNum}`);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const summaryRes = await fetch("/api/operator/morning-brief/summary");
        if (!summaryRes.ok) throw new Error("Failed to fetch summary");
        const summary = await summaryRes.json();

        setData({
          discovered: summary.discovered,
          enriched: summary.enriched,
          qualified: summary.qualified,
          orders: summary.orders,
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
        <div className="flex justify-between items-start mb-12">
          <h1 className="text-5xl font-black text-[#0D0D0D]">Good morning.</h1>
          <p className="text-sm text-[#C9C9C9]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Date */}
      <div className="flex justify-between items-start mb-12">
        <h1 className="text-5xl font-black text-[#0D0D0D]">Good morning.</h1>
        <p className="text-sm text-[#C9C9C9]">{currentDate}</p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-16">
        <Metric value={data.discovered} label="New discoveries" />
        <Metric value={data.enriched} label="High confidence" />
        <Metric value={data.orders} label="Standing orders" />
        <Metric value={data.qualified} label="Qualified" />
      </div>

      <Divider />

      {/* Priority Now */}
      <div>
        <SectionHeader
          title="Priority now"
          description="The items that need your attention."
        />

        <div className="space-y-0">
          <PriorityItem
            title="Westpoint Pharmacy"
            subtitle="Manchester • High confidence match"
            meta="No email on file"
            actionLabel="Review"
          />
          <PriorityItem
            title="Range Pharmacy"
            subtitle="Whalley Range • High confidence match"
            meta="No email on file"
            actionLabel="Review"
          />
          <PriorityItem
            title="A & A Pharmacy"
            subtitle="Winslow Road • High confidence match"
            meta="No email on file"
            actionLabel="Review"
          />
        </div>

        <Link
          href="/operator/pipeline"
          className="inline-block text-xs font-semibold text-[#0D0D0D] hover:text-[#666666] transition-colors mt-6"
        >
          View all pipeline →
        </Link>
      </div>

      <Divider />

      {/* Pipeline Overview */}
      <div>
        <SectionHeader
          title="Pipeline overview"
          description="Where opportunities are in your pipeline."
        />

        <div className="bg-white border border-[#E8E8E8] rounded-lg p-8 mb-8">
          <div className="flex justify-between items-end">
            <PipelineStage name="Discover" count={2} color="#3B82F6" />
            <div className="text-[#C9C9C9] mb-8">•</div>
            <PipelineStage name="Understand" count={0} color="#F59E0B" />
            <div className="text-[#C9C9C9] mb-8">•</div>
            <PipelineStage name="Outreach" count={0} color="#A855F7" />
            <div className="text-[#C9C9C9] mb-8">•</div>
            <PipelineStage name="Pipeline" count={0} color="#10B981" />
            <div className="text-[#C9C9C9] mb-8">•</div>
            <PipelineStage name="Orders" count={0} color="#EF4444" />
          </div>
        </div>

        <Link
          href="/operator/pipeline"
          className="inline-block text-xs font-semibold text-[#0D0D0D] hover:text-[#666666] transition-colors"
        >
          View full pipeline →
        </Link>
      </div>

      <Divider />

      {/* Insights & Recommendations */}
      <div>
        <SectionHeader
          title="Insights & recommendations"
          description="What the system is learning."
        />

        <div className="grid grid-cols-3 gap-6">
          <InsightCard
            title="Focus on pharmacies"
            description="Pharmacies in Manchester increased engagement this week."
          />
          <InsightCard
            title="Convert faster"
            description="Your fastest conversions come within 7 days of first contact."
          />
          <InsightCard
            title="Follow up sooner"
            description="Companies respond 48% more when followed up within 3 days."
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-[#E8E8E8]">
        <p className="text-xs text-[#C9C9C9]">Last updated just now</p>
      </div>
    </div>
  );
}
