"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface MorningBriefMetrics {
  newOpportunitiesToday: number;
  highConfidenceToday: number;
  finishedToday: number;
  closedToday: number;
}

interface Pipeline {
  discover: number;
  enrich: number;
  qualify: number;
  propose: number;
  orders: number;
}

interface TodaysAction {
  id: string;
  company: string;
  contactName: string;
  actionType: string;
  priority: number;
  dueAt: string;
  status: string;
  confidenceScore: number;
  deepLink?: string;
}

interface RecentActivityItem {
  id: string;
  company: string;
  eventType: string;
  description: string;
  timestamp: string;
}

interface MorningBriefResponse {
  metrics: MorningBriefMetrics;
  pipeline: Pipeline;
  todaysActions: TodaysAction[];
  recentActivity: RecentActivityItem[];
  metadata: {
    lastUpdated: string;
    version: string;
  };
}

interface PageState {
  loading: boolean;
  error: string | null;
  data: MorningBriefResponse | null;
}

export default function OperatorBriefing() {
  const router = useRouter();
  const [state, setState] = useState<PageState>({
    loading: true,
    error: null,
    data: null,
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
        setState({ loading: true, error: null, data: null });
        const res = await fetch("/api/v1/dashboard/morning-brief");
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch`);
        const data: MorningBriefResponse = await res.json();
        setState({ loading: false, error: null, data });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error occurred";
        setState({
          loading: false,
          error: message,
          data: null,
        });
      }
    };
    loadData();
  }, []);

  const handleRetry = () => {
    setState((s) => ({ ...s, loading: true, error: null }));
  };

  const handleMetricClick = (metric: string) => {
    switch (metric) {
      case "new":
        router.push("/operator/discover?status=new");
        break;
      case "highConfidence":
        router.push("/operator/discover?score=80+");
        break;
      case "finished":
        router.push("/operator/pipeline?stage=propose");
        break;
      case "closed":
        router.push("/operator/orders");
        break;
    }
  };

  const handlePipelineStageClick = (stage: string) => {
    router.push(`/operator/pipeline?stage=${stage}`);
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-[#666666]">Loading your briefing...</p>
        </div>
      </div>
    );
  }

  if (state.error || !state.data) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 md:px-0 py-12 md:py-16">
          <div className="border border-[#E8E8E8] rounded-lg md:rounded-xl p-8 bg-white">
            <h1 className="text-lg font-semibold text-[#0D0D0D] mb-2">
              Error loading Morning Brief
            </h1>
            <p className="text-sm text-[#666666] mb-6">
              {state.error || "Could not load dashboard data. Please try again."}
            </p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-[#0D0D0D] text-white text-xs font-semibold rounded-lg hover:bg-[#333333] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasActions = state.data.todaysActions.length > 0;
  const hasActivity = state.data.recentActivity.length > 0;

  // Calculate metrics for narrative
  const baselineNew = 16;
  const newTrend = ((state.data.metrics.newOpportunitiesToday - baselineNew) / baselineNew) * 100;
  const totalPipelineProspects =
    state.data.pipeline.discover +
    state.data.pipeline.enrich +
    state.data.pipeline.qualify +
    state.data.pipeline.propose +
    state.data.pipeline.orders;

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <div className="mb-12 md:mb-16 px-4 md:px-0">
        <div className="inline-flex items-center gap-2 mb-4 md:mb-6 bg-[#F5F5F5] px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-[#E8E8E8]">
          <p className="text-[10px] md:text-xs font-semibold text-[#0D0D0D] tracking-[0.2em] uppercase">
            {dateStr}
          </p>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-[#0D0D0D] mb-2 md:mb-3 tracking-[-0.01em] leading-tight">
          Good morning.
        </h1>
        <p className="text-sm md:text-base text-[#666666] leading-relaxed max-w-2xl font-light">
          Here's what needs your attention today.
        </p>
      </div>

      {/* MARKET BRIEFING (Pressure Signals) */}
      <div className="mb-12 md:mb-20 px-4 md:px-0">
        <div className="mb-6 md:mb-8">
          <h2 className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[1px] mb-3">
            Market Signal
          </h2>
        </div>
        <div className="border border-[#E8E8E8] rounded-lg md:rounded-xl p-6 md:p-8 bg-[#F9F9F9]">
          <div className="max-w-3xl">
            <p className="text-sm md:text-base text-[#0D0D0D] leading-relaxed mb-4">
              {state.data.metrics.newOpportunitiesToday > baselineNew ? (
                <>
                  <span className="font-semibold">{state.data.metrics.newOpportunitiesToday} new prospects</span> discovered today
                  {newTrend > 0 && (
                    <>
                      {" "}
                      ({Math.round(newTrend)}% above baseline)
                    </>
                  )}
                </>
              ) : (
                <>
                  <span className="font-semibold">{state.data.metrics.newOpportunitiesToday} new prospects</span> discovered today.
                </>
              )}
            </p>
            <p className="text-xs text-[#888888]">
              Last updated: {new Date(state.data.metadata.lastUpdated).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* FOCUS FIRST (Decision Guidance) */}
      <div className="mb-12 md:mb-20 px-4 md:px-0">
        <div className="mb-6 md:mb-8">
          <h2 className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[1px] mb-3">
            Focus First
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Opportunity Summary Card */}
          <button
            onClick={() => router.push("/operator/discover")}
            className="border border-[#E8E8E8] rounded-lg md:rounded-xl p-6 md:p-8 bg-white hover:border-[#0D0D0D] hover:shadow-md transition-all text-left cursor-pointer group"
          >
            <p className="text-[9px] md:text-xs font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3 md:mb-4">
              Discovery Pipeline
            </p>
            <p className="text-2xl md:text-3xl font-black text-[#0D0D0D] mb-2 md:mb-3 tracking-[-0.02em]">
              {state.data.metrics.highConfidenceToday}
            </p>
            <p className="text-xs md:text-sm text-[#666666] mb-4">
              high-confidence prospects ready to qualify.
            </p>
            <p className="text-xs font-semibold text-[#0D0D0D] group-hover:text-[#333333] transition-colors">
              Review these first →
            </p>
          </button>

          {/* Revenue Summary Card */}
          <button
            onClick={() => router.push("/operator/orders")}
            className="border border-[#E8E8E8] rounded-lg md:rounded-xl p-6 md:p-8 bg-white hover:border-[#0D0D0D] hover:shadow-md transition-all text-left cursor-pointer group"
          >
            <p className="text-[9px] md:text-xs font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3 md:mb-4">
              Revenue Status
            </p>
            <p className="text-2xl md:text-3xl font-black text-[#0D0D0D] mb-2 md:mb-3 tracking-[-0.02em]">
              {state.data.metrics.closedToday}
            </p>
            <p className="text-xs md:text-sm text-[#666666] mb-4">
              deals closed today.
            </p>
            <p className="text-xs font-semibold text-[#0D0D0D] group-hover:text-[#333333] transition-colors">
              View orders →
            </p>
          </button>
        </div>
      </div>

      {/* PIPELINE HEALTH (Trust Signals - Pipeline Confidence) */}
      <div className="mb-12 md:mb-20 px-4 md:px-0">
        <div className="mb-6 md:mb-8">
          <h2 className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[1px] mb-3">
            Pipeline Confidence
          </h2>
          <p className="text-xs text-[#888888]">
            Distribution of {totalPipelineProspects} prospects across qualification stages.
          </p>
        </div>

        <div className="border border-[#E8E8E8] rounded-lg md:rounded-xl p-6 md:p-12 bg-white overflow-x-auto">
          <div className="flex justify-between items-end gap-2 md:gap-4 min-w-min md:min-w-0">
            {/* Discover */}
            <button
              onClick={() => handlePipelineStageClick("discover")}
              className="text-center flex-shrink-0 md:flex-1 min-w-[60px] md:min-w-0 hover:opacity-70 transition-opacity cursor-pointer group"
            >
              <div className="flex justify-center mb-3 md:mb-6">
                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-blue-500 shadow-sm"></div>
              </div>
              <p className="text-[9px] md:text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.5px] mb-1 md:mb-2">
                Discover
              </p>
              <p className="text-lg md:text-3xl font-black text-[#0D0D0D] mb-2 md:mb-3 tracking-[-0.02em]">
                {state.data.pipeline.discover}
              </p>
              <p className="text-[9px] md:text-xs text-[#666666] font-light">
                new prospects
              </p>
            </button>

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
                />
              </svg>
            </div>

            {/* Enrich */}
            <button
              onClick={() => handlePipelineStageClick("enrich")}
              className="text-center flex-shrink-0 md:flex-1 min-w-[60px] md:min-w-0 hover:opacity-70 transition-opacity cursor-pointer group"
            >
              <div className="flex justify-center mb-3 md:mb-6">
                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-green-500 shadow-sm"></div>
              </div>
              <p className="text-[9px] md:text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.5px] mb-1 md:mb-2">
                Enrich
              </p>
              <p className="text-lg md:text-3xl font-black text-[#0D0D0D] mb-2 md:mb-3 tracking-[-0.02em]">
                {state.data.pipeline.enrich}
              </p>
              <p className="text-[9px] md:text-xs text-[#666666] font-light">
                enriching
              </p>
            </button>

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
                />
              </svg>
            </div>

            {/* Qualify */}
            <button
              onClick={() => handlePipelineStageClick("qualify")}
              className="text-center flex-shrink-0 md:flex-1 min-w-[60px] md:min-w-0 hover:opacity-70 transition-opacity cursor-pointer group"
            >
              <div className="flex justify-center mb-3 md:mb-6">
                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-orange-500 shadow-sm"></div>
              </div>
              <p className="text-[9px] md:text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.5px] mb-1 md:mb-2">
                Qualify
              </p>
              <p className="text-lg md:text-3xl font-black text-[#0D0D0D] mb-2 md:mb-3 tracking-[-0.02em]">
                {state.data.pipeline.qualify}
              </p>
              <p className="text-[9px] md:text-xs text-[#666666] font-light">
                qualified
              </p>
            </button>

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
                />
              </svg>
            </div>

            {/* Propose */}
            <button
              onClick={() => handlePipelineStageClick("propose")}
              className="text-center flex-shrink-0 md:flex-1 min-w-[60px] md:min-w-0 hover:opacity-70 transition-opacity cursor-pointer group"
            >
              <div className="flex justify-center mb-3 md:mb-6">
                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-purple-500 shadow-sm"></div>
              </div>
              <p className="text-[9px] md:text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.5px] mb-1 md:mb-2">
                Propose
              </p>
              <p className="text-lg md:text-3xl font-black text-[#0D0D0D] mb-2 md:mb-3 tracking-[-0.02em]">
                {state.data.pipeline.propose}
              </p>
              <p className="text-[9px] md:text-xs text-[#666666] font-light">
                proposed
              </p>
            </button>

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
                />
              </svg>
            </div>

            {/* Orders */}
            <button
              onClick={() => handlePipelineStageClick("orders")}
              className="text-center flex-shrink-0 md:flex-1 min-w-[60px] md:min-w-0 hover:opacity-70 transition-opacity cursor-pointer group"
            >
              <div className="flex justify-center mb-3 md:mb-6">
                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-red-500 shadow-sm"></div>
              </div>
              <p className="text-[9px] md:text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.5px] mb-1 md:mb-2">
                Orders
              </p>
              <p className="text-lg md:text-3xl font-black text-[#0D0D0D] mb-2 md:mb-3 tracking-[-0.02em]">
                {state.data.pipeline.orders}
              </p>
              <p className="text-[9px] md:text-xs text-[#666666] font-light">
                closed
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* TODAY'S ACTIONS */}
      {hasActions && (
        <div className="mb-12 md:mb-20 px-4 md:px-0">
          <div className="mb-6 md:mb-8">
            <h2 className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[1px] mb-3">
              Today's Tasks
            </h2>
          </div>
          <div className="space-y-3">
            {state.data.todaysActions.slice(0, 5).map((action) => (
              <div
                key={action.id}
                className="border border-[#E8E8E8] rounded-lg p-4 md:p-6 bg-white hover:border-[#0D0D0D] transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-semibold text-[#0D0D0D]">
                    {action.company}
                  </p>
                  <p className="text-xs font-semibold text-[#0D0D0D]">
                    {action.confidenceScore}%
                  </p>
                </div>
                <p className="text-xs text-[#888888]">
                  {action.actionType} {action.contactName ? `— ${action.contactName}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECENT ACTIVITY */}
      {hasActivity && (
        <div className="mb-12 md:mb-20 px-4 md:px-0">
          <div className="mb-6 md:mb-8">
            <h2 className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[1px] mb-3">
              Recent Activity
            </h2>
          </div>
          <div className="space-y-3">
            {state.data.recentActivity.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="border border-[#E8E8E8] rounded-lg p-4 md:p-6 bg-white"
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-semibold text-[#0D0D0D]">
                    {item.company}
                  </p>
                  <p className="text-[9px] text-[#888888]">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
                <p className="text-xs text-[#666666]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
