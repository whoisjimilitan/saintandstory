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
    setState({ loading: true, error: null, data: null });
    setTimeout(() => {
      window.location.reload();
    }, 200);
  };

  const handleMetricClick = (metricType: string) => {
    switch (metricType) {
      case "new":
        router.push("/operator/discover?status=new");
        break;
      case "highConfidence":
        router.push("/operator/discover?score=80+");
        break;
      case "finished":
        router.push("/operator/completed");
        break;
      case "closed":
        router.push("/operator/sales");
        break;
    }
  };

  const handlePipelineStageClick = (stage: string) => {
    router.push(`/operator/discover?stage=${stage.toLowerCase()}`);
  };

  const handleActionClick = (action: TodaysAction) => {
    if (action.deepLink) {
      router.push(action.deepLink);
    }
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-sm text-[#666666]">Loading Morning Brief...</p>
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
              {state.error ||
                "Could not load dashboard data. Please try again."}
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
        {/* New Opportunities */}
        <button
          onClick={() => handleMetricClick("new")}
          className="border border-[#E8E8E8] rounded-lg md:rounded-xl p-4 md:p-8 bg-white hover:border-[#0D0D0D] hover:shadow-md transition-all duration-200 cursor-pointer text-left"
        >
          <p className="text-[9px] md:text-xs font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3 md:mb-4">
            New Leads
          </p>
          <p className="text-2xl md:text-4xl font-black text-[#0D0D0D] mb-3 md:mb-4 tracking-[-0.02em]">
            {state.data.metrics.newOpportunitiesToday}
          </p>
          <div className="space-y-0.5">
            <p className="text-[9px] md:text-xs text-[#666666]">today</p>
          </div>
        </button>

        {/* High Confidence */}
        <button
          onClick={() => handleMetricClick("highConfidence")}
          className="border border-[#E8E8E8] rounded-lg md:rounded-xl p-4 md:p-8 bg-white hover:border-[#0D0D0D] hover:shadow-md transition-all duration-200 cursor-pointer text-left"
        >
          <p className="text-[9px] md:text-xs font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3 md:mb-4">
            High Confidence
          </p>
          <p className="text-2xl md:text-4xl font-black text-[#0D0D0D] mb-3 md:mb-4 tracking-[-0.02em]">
            {state.data.metrics.highConfidenceToday}
          </p>
          <div className="space-y-0.5">
            <p className="text-[9px] md:text-xs text-[#666666]">80+ score</p>
          </div>
        </button>

        {/* Finished */}
        <button
          onClick={() => handleMetricClick("finished")}
          className="border border-[#E8E8E8] rounded-lg md:rounded-xl p-4 md:p-8 bg-white hover:border-[#0D0D0D] hover:shadow-md transition-all duration-200 cursor-pointer text-left"
        >
          <p className="text-[9px] md:text-xs font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3 md:mb-4">
            Finished
          </p>
          <p className="text-2xl md:text-4xl font-black text-[#0D0D0D] mb-3 md:mb-4 tracking-[-0.02em]">
            {state.data.metrics.finishedToday}
          </p>
          <div className="space-y-0.5">
            <p className="text-[9px] md:text-xs text-[#666666]">completed</p>
          </div>
        </button>

        {/* Closed */}
        <button
          onClick={() => handleMetricClick("closed")}
          className="border border-[#E8E8E8] rounded-lg md:rounded-xl p-4 md:p-8 bg-white hover:border-[#0D0D0D] hover:shadow-md transition-all duration-200 cursor-pointer text-left"
        >
          <p className="text-[9px] md:text-xs font-semibold text-[#888888] uppercase tracking-[0.2em] mb-3 md:mb-4">
            Closed Won
          </p>
          <p className="text-2xl md:text-4xl font-black text-[#0D0D0D] mb-3 md:mb-4 tracking-[-0.02em]">
            {state.data.metrics.closedToday}
          </p>
          <div className="space-y-0.5">
            <p className="text-[9px] md:text-xs text-[#666666]">closed</p>
          </div>
        </button>
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
            <button
              onClick={() => handlePipelineStageClick("discover")}
              className="text-center flex-shrink-0 md:flex-1 min-w-[60px] md:min-w-0 hover:opacity-70 transition-opacity cursor-pointer"
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
                new
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
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Enrich */}
            <button
              onClick={() => handlePipelineStageClick("enrich")}
              className="text-center flex-shrink-0 md:flex-1 min-w-[60px] md:min-w-0 hover:opacity-70 transition-opacity cursor-pointer"
            >
              <div className="flex justify-center mb-3 md:mb-6">
                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full border-2 border-green-500"></div>
              </div>
              <p className="text-[9px] md:text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.5px] mb-1 md:mb-2">
                Enrich
              </p>
              <p className="text-lg md:text-3xl font-black text-[#0D0D0D] mb-2 md:mb-3 tracking-[-0.02em]">
                {state.data.pipeline.enrich}
              </p>
              <p className="text-[9px] md:text-xs text-[#666666] font-light">
                start
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
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Qualify */}
            <button
              onClick={() => handlePipelineStageClick("qualify")}
              className="text-center flex-shrink-0 md:flex-1 min-w-[60px] md:min-w-0 hover:opacity-70 transition-opacity cursor-pointer"
            >
              <div className="flex justify-center mb-3 md:mb-6">
                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full border-2 border-orange-500"></div>
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
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Propose */}
            <button
              onClick={() => handlePipelineStageClick("propose")}
              className="text-center flex-shrink-0 md:flex-1 min-w-[60px] md:min-w-0 hover:opacity-70 transition-opacity cursor-pointer"
            >
              <div className="flex justify-center mb-3 md:mb-6">
                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full border-2 border-purple-500"></div>
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
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Orders */}
            <button
              onClick={() => handlePipelineStageClick("orders")}
              className="text-center flex-shrink-0 md:flex-1 min-w-[60px] md:min-w-0 hover:opacity-70 transition-opacity cursor-pointer"
            >
              <div className="flex justify-center mb-3 md:mb-6">
                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full border-2 border-red-500"></div>
              </div>
              <p className="text-[9px] md:text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.5px] mb-1 md:mb-2">
                Orders
              </p>
              <p className="text-lg md:text-3xl font-black text-[#0D0D0D] mb-2 md:mb-3 tracking-[-0.02em]">
                {state.data.pipeline.orders}
              </p>
              <p className="text-[9px] md:text-xs text-[#666666] font-light">
                finish
              </p>
            </button>
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

      {/* Today's Actions */}
      <div className="mb-12 md:mb-20 px-4 md:px-0">
        <div className="mb-4 md:mb-8">
          <h2 className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[1px] mb-2">
            Today's Actions
          </h2>
          <p className="text-xs md:text-sm text-[#888888] leading-relaxed font-light">
            Tasks due today from your pipeline.
          </p>
        </div>

        {!hasActions ? (
          <div className="border border-[#E8E8E8] rounded-lg md:rounded-xl p-8 bg-white text-center">
            <p className="text-sm text-[#666666]">
              No actions due today. Great work! 🎉
            </p>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {state.data.todaysActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                className="w-full border border-[#E8E8E8] rounded-lg md:rounded-xl p-3 md:p-6 bg-white flex flex-col md:flex-row md:items-center md:justify-between hover:border-[#0D0D0D] hover:bg-[#F5F5F5] transition-all duration-150 cursor-pointer group text-left"
              >
                <div className="flex-1 mb-2 md:mb-0">
                  <p className="text-xs md:text-sm font-semibold text-[#0D0D0D] mb-1">
                    {action.actionType.charAt(0).toUpperCase() +
                      action.actionType.slice(1)}{" "}
                    {action.contactName ? `with ${action.contactName}` : ""} at{" "}
                    {action.company}
                  </p>
                  <p className="text-xs text-[#666666] font-light">
                    {action.confidenceScore}% confidence
                  </p>
                </div>
                <div className="text-right md:ml-8">
                  <p className="text-xs font-semibold text-[#DC2626] mb-1">
                    Due today
                  </p>
                  <p className="text-xs text-[#666666] mb-2 font-light">
                    {new Date(action.dueAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <span className="text-xs font-semibold text-[#0D0D0D] group-hover:text-[#666666] transition-colors">
                    {action.actionType === "call"
                      ? "Call"
                      : action.actionType === "email"
                        ? "Send"
                        : "View"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

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

        {!hasActivity ? (
          <div className="border border-[#E8E8E8] rounded-lg md:rounded-xl p-8 bg-white text-center">
            <p className="text-sm text-[#666666]">
              No activity yet today. Check back later.
            </p>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {state.data.recentActivity.map((item) => (
              <div
                key={item.id}
                className="border border-[#E8E8E8] rounded-lg md:rounded-xl p-4 md:p-6 bg-white hover:border-[#D0D0D0] transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1 mb-2 md:mb-0">
                    <p className="text-xs md:text-sm font-semibold text-[#0D0D0D] mb-1">
                      {item.description}
                    </p>
                    <p className="text-xs text-[#666666] font-light">
                      {item.company}
                    </p>
                  </div>
                  <p className="text-xs text-[#D0D0D0] font-light">
                    {new Date(item.timestamp).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 md:mt-6 pb-12 md:pb-16">
          <Link
            href="/operator/analytics"
            className="text-xs font-medium text-[#0D0D0D] hover:text-[#666666] transition-colors"
          >
            View full activity log →
          </Link>
        </div>
      </div>
    </div>
  );
}
