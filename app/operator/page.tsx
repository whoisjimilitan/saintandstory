"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

// Premium single-color icons
const Icons = {
  // Temperature/Urgency
  UltraHot: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2v6M5 8h6M3 10c0 2.21 1.79 4 4 4s4-1.79 4-4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Hot: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 3v5M5 8h6M3.5 11c0 1.66 1.34 3 3 3s3-1.34 3-3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Warm: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 5v3" strokeLinecap="round"/>
    </svg>
  ),

  // Actions
  Email: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4h12v8H2V4z" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 4l6 4 6-4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 8l1.5 1.5 2.5-2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 5v3l2 1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Eye: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 8s2-4 7-4 7 4 7 4-2 4-7 4-7-4-7-4z" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="8" cy="8" r="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 14l3-3 2 2 5-5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 6h4v4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  AlertCircle: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 5v3M8 11h.01" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

interface MorningBriefMetrics {
  newOpportunitiesToday: number;
  highConfidenceToday: number;
  finishedToday: number;
  closedToday: number;
  temperatureBreakdown?: {
    ultraHot: number;
    hot: number;
    warm: number;
  };
  industryBreakdown?: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  pressureBreakdown?: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
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
  const { user } = useUser();
  const [state, setState] = useState<PageState>({
    loading: true,
    error: null,
    data: null,
  });

  const [dateStr, setDateStr] = useState("");
  const [sentEmails, setSentEmails] = useState<any[]>([]);
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set());
  const [phoneOutreachCount, setPhoneOutreachCount] = useState(0);
  const [emailsSentCount, setEmailsSentCount] = useState(0);
  const [campaignPerformance, setCampaignPerformance] = useState<any>(null);
  const firstName = user?.firstName || "";

  useEffect(() => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = String(today.getFullYear()).slice(-2);
    const hours = String(today.getHours()).padStart(2, "0");
    const minutes = String(today.getMinutes()).padStart(2, "0");
    setDateStr(`${day}.${month}.${year} at ${hours}:${minutes}`);
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

  useEffect(() => {
    const loadSentEmails = async () => {
      try {
        const res = await fetch("/api/operator/sent-emails-today");
        if (res.ok) {
          const data = await res.json();
          setSentEmails(data.emails || []);
        }
      } catch (error) {
        console.error("Failed to load sent emails:", error);
      }
    };
    loadSentEmails();
  }, []);

  useEffect(() => {
    const loadCampaignData = async () => {
      try {
        const res = await fetch("/api/admin/phone-outreach", {
          headers: { "x-admin-email": "whoisjimi.today@gmail.com" },
        });
        if (res.ok) {
          const data = await res.json();
          setPhoneOutreachCount(data.phone_outreach_queue?.ready_to_call || 0);
        }
      } catch (error) {
        console.error("Failed to load phone outreach data:", error);
      }
    };

    const loadEmailStats = async () => {
      try {
        const res = await fetch("/api/admin/campaign-attribution", {
          headers: { "x-admin-email": "whoisjimi.today@gmail.com" },
        });
        if (res.ok) {
          const data = await res.json();
          setEmailsSentCount(data.email_channel?.emails_sent || 0);
          setCampaignPerformance(data.email_channel);
        }
      } catch (error) {
        console.error("Failed to load campaign data:", error);
      }
    };

    loadCampaignData();
    loadEmailStats();
  }, []);

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
      <div className="min-h-screen bg-white pt-24">
        <div className="max-w-2xl mx-auto px-4 md:px-0 py-12 md:py-16">
          <div className="border border-[#E8E8E8] rounded-lg md:rounded-xl p-8 bg-white">
            <h1 className="text-lg font-semibold text-[#0D0D0D] mb-2">
              Error loading Morning Brief
            </h1>
            <p className="text-sm text-[#666666] mb-6">
              {state.error || "Could not load dashboard data. Please try again."}
            </p>
            <button
              onClick={() => setState(s => ({ ...s, loading: true }))}
              className="px-4 py-2 bg-[#0D0D0D] text-white text-xs font-semibold rounded-lg hover:bg-[#333333] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const metrics = state.data.metrics;
  const tempBreakdown = metrics.temperatureBreakdown || { ultraHot: 0, hot: 0, warm: 0 };
  const industryData = metrics.industryBreakdown || [];
  const pressureData = metrics.pressureBreakdown || [];

  const baselineNew = 16;
  const newTrend = ((metrics.newOpportunitiesToday - baselineNew) / baselineNew) * 100;
  const totalPipelineProspects =
    state.data.pipeline.discover +
    state.data.pipeline.enrich +
    state.data.pipeline.qualify +
    state.data.pipeline.propose +
    state.data.pipeline.orders;

  const prospectCounts = {
    today: state.data?.metrics.newOpportunitiesToday || 0,
    discover: state.data?.pipeline.discover || 0,
    understand: state.data?.pipeline.enrich || 0,
    outreach: state.data?.pipeline.qualify || 0,
    pipeline: state.data?.pipeline.propose || 0,
    orders: state.data?.pipeline.orders || 0,
  };

  // Use real active prospects from API
  const activeProspects = state.data?.metrics.activeProspects || [];

  return (
    <div className="min-h-screen bg-white pt-24">
      {/* HEADER */}
      <div className="mb-8 px-4 md:px-0">
        <div className="inline-flex items-center gap-2 mb-6 bg-[#F5F5F5] px-3 py-1.5 rounded-full border border-[#E8E8E8]">
          <p className="text-xs font-semibold text-[#0D0D0D] font-mono">
            {dateStr}
          </p>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-[#0D0D0D] mb-3 tracking-tight leading-tight">
          {firstName || "Welcome"}.
        </h1>
        <p className="text-base text-[#666666] leading-relaxed max-w-3xl font-normal">
          Here's what needs your attention today.
        </p>
      </div>

      {/* NARRATIVE BRIEFING - Idea #4 */}
      <div className="mb-16 px-4 md:px-0">
        <div className="border border-[#E8E8E8] rounded-lg p-6 md:p-8 bg-[#F9F9F9]">
          <div className="max-w-3xl space-y-4">
            {/* Status Summary */}
            <div className="flex items-start gap-3">
              <div className="text-[#0D0D0D] mt-0.5 flex-shrink-0">
                <Icons.TrendingUp />
              </div>
              <div>
                <p className="text-sm text-[#0D0D0D] font-semibold">
                  {metrics.newOpportunitiesToday} new prospects discovered today
                </p>
                {newTrend > 0 && (
                  <p className="text-xs text-[#888888] mt-0.5">
                    {Math.round(newTrend)}% above typical baseline
                  </p>
                )}
              </div>
            </div>

            {/* Action Items */}
            <div className="flex items-start gap-3 pt-3 border-t border-[#E8E8E8]">
              <div className="text-[#0D0D0D] mt-0.5 flex-shrink-0">
                <Icons.AlertCircle />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#0D0D0D] tracking-[0.05em] uppercase mb-2">
                  Action Items
                </p>
                <ul className="space-y-2 text-xs text-[#666666]">
                  {(state.data?.metrics.actionItemsBreakdown?.readyToQualify ?? 0) > 0 && (
                    <li>
                      <button
                        onClick={() => router.push("/operator/pipeline")}
                        className="text-[#0D0D0D] font-semibold hover:underline"
                      >
                        • {state.data?.metrics.actionItemsBreakdown?.readyToQualify} prospect{(state.data?.metrics.actionItemsBreakdown?.readyToQualify ?? 0) !== 1 ? 's' : ''} ready to review
                      </button>
                    </li>
                  )}
                  {(state.data?.metrics.actionItemsBreakdown?.readyToEmail ?? 0) > 0 && (
                    <li>
                      <button
                        onClick={() => router.push("/operator/pipeline")}
                        className="text-[#0D0D0D] font-semibold hover:underline"
                      >
                        • {state.data?.metrics.actionItemsBreakdown?.readyToEmail} prospect{(state.data?.metrics.actionItemsBreakdown?.readyToEmail ?? 0) !== 1 ? 's' : ''} ready to email
                      </button>
                    </li>
                  )}
                  {(state.data?.metrics.actionItemsBreakdown?.awaitingReply ?? 0) > 0 && (
                    <li>
                      <button
                        onClick={() => router.push("/operator/pipeline")}
                        className="text-[#0D0D0D] font-semibold hover:underline"
                      >
                        • {state.data?.metrics.actionItemsBreakdown?.awaitingReply} prospect{(state.data?.metrics.actionItemsBreakdown?.awaitingReply ?? 0) !== 1 ? 's' : ''} awaiting reply
                      </button>
                    </li>
                  )}
                  {(state.data?.metrics.actionItemsBreakdown?.readyToClose ?? 0) > 0 && (
                    <li>
                      <button
                        onClick={() => router.push("/operator/pipeline")}
                        className="text-[#0D0D0D] font-semibold hover:underline"
                      >
                        • {state.data?.metrics.actionItemsBreakdown?.readyToClose} prospect{(state.data?.metrics.actionItemsBreakdown?.readyToClose ?? 0) !== 1 ? 's' : ''} ready to close
                      </button>
                    </li>
                  )}
                  {phoneOutreachCount > 0 && (
                    <li>
                      <button
                        onClick={() => router.push("/operator/phone-outreach")}
                        className="text-[#0D0D0D] font-semibold hover:underline"
                      >
                        • {phoneOutreachCount} prospect{phoneOutreachCount !== 1 ? 's' : ''} ready to call
                      </button>
                    </li>
                  )}
                  {emailsSentCount > 0 && (
                    <li>
                      <button
                        onClick={() => router.push("/operator/campaigns")}
                        className="text-[#0D0D0D] font-semibold hover:underline"
                      >
                        • Check campaign performance
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Campaign Performance Summary */}
            {campaignPerformance && emailsSentCount > 0 && (
              <div className="flex items-start gap-3 pt-3 border-t border-[#E8E8E8]">
                <div className="text-[#0D0D0D] mt-0.5 flex-shrink-0">
                  <Icons.TrendingUp />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0D0D0D] tracking-[0.05em] uppercase mb-2">
                    Campaign Performance
                  </p>
                  <p className="text-xs text-[#666666] font-mono">
                    {emailsSentCount} emails sent | {campaignPerformance.response_rate_percent}% responded | {campaignPerformance.yes_responses} said YES
                  </p>
                </div>
              </div>
            )}

            {/* Hidden Gems - High-Margin B2B Opportunities */}
            <div className="flex items-start gap-3 pt-3 border-t border-[#E8E8E8]">
              <div className="text-[#0D0D0D] mt-0.5 flex-shrink-0">
                <Icons.TrendingUp />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-[#0D0D0D] tracking-[0.05em] uppercase mb-3">
                  Hidden Gem Opportunities
                </p>
                <div className="space-y-2 text-xs text-[#666666] font-mono">
                  <div>
                    <span className="text-[#0D0D0D] font-semibold">Events</span> • £200-400/mo per client • 8k+ UK targets
                  </div>
                  <div>
                    <span className="text-[#0D0D0D] font-semibold">Film/TV</span> • £2-5k/hr idle cost • 2.5k+ targets
                  </div>
                  <div>
                    <span className="text-[#0D0D0D] font-semibold">Art/Auction</span> • £50k-500k moves • 3k+ targets
                  </div>
                  <div className="pt-2 border-t border-[#E8E8E8] text-[#0D0D0D] font-semibold">
                    15-25 accounts = £10.5-17.7k/month. Start: Events
                  </div>
                </div>
              </div>
            </div>

            {/* Market Insight */}
            {industryData.length > 0 && (
              <div className="flex items-start gap-3 pt-3 border-t border-[#E8E8E8]">
                <div className="text-[#0D0D0D] mt-0.5 flex-shrink-0">
                  <Icons.TrendingUp />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#0D0D0D] tracking-[0.05em] uppercase mb-2">
                    Market Signal
                  </p>
                  <p className="text-xs text-[#666666]">
                    {industryData[0]?.name} showing strongest opportunity ({industryData[0]?.count} prospects)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ACTIVE PROSPECTS SPOTLIGHT */}
      {activeProspects.length > 0 && (
        <div className="mb-16 px-4 md:px-0">
          <p className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-widest mb-4">
            Active Prospects ({activeProspects.length})
          </p>
          <div className="grid gap-3">
            {activeProspects.map((prospect) => (
              <div
                key={prospect.id}
                className="border border-[#E8E8E8] rounded-lg p-4 flex items-center justify-between hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-all cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0D0D0D]">
                    {prospect.businessName || prospect.name}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-[#888888]">{prospect.location}</span>
                    <span className="text-xs text-[#CCCCCC]">•</span>
                    <span className="text-xs text-[#888888]">{prospect.stage}</span>
                    <span className="text-xs text-[#CCCCCC]">•</span>
                    <span className="text-xs text-[#999999]">{prospect.stagedAt}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-[#0D0D0D] mb-2">
                    {prospect.action}
                  </p>
                  <button
                    onClick={() => router.push(`/operator/understand?id=${prospect.id}`)}
                    className="text-xs font-semibold text-[#0D0D0D] border border-[#E8E8E8] px-2.5 py-1 rounded hover:bg-[#F5F5F5] transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HIGH-CONFIDENCE CARD - Ideas #1, #2, #3, #5 */}
      <div className="mb-16 px-4 md:px-0">
        <div className="border border-[#E8E8E8] rounded-lg p-8 bg-white hover:border-[#0D0D0D] hover:shadow-sm transition-all">
          {/* Title and Counts */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-[#888888] tracking-[0.15em] uppercase mb-3">
              Prospects Needing Attention
            </p>
            <p className="text-3xl md:text-4xl font-black text-[#0D0D0D] tracking-tight mb-2">
              {metrics.prospectNeedingAttention}
            </p>
            <p className="text-sm text-[#666666] mb-4">
              prospect{metrics.prospectNeedingAttention !== 1 ? 's' : ''} requiring action today
            </p>

            {/* Show which prospects these are */}
            {(state.data?.metrics.activeProspects?.length ?? 0) > 0 && (
              <div className="mb-6 pb-4 border-b border-[#E8E8E8]">
                <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.05em] mb-2">
                  In Pipeline Now
                </p>
                <ul className="space-y-1">
                  {state.data?.metrics.activeProspects?.slice(0, 3).map((prospect: any) => (
                    <li key={prospect.id} className="text-xs text-[#666666]">
                      • {prospect.businessName} <span className="text-[#999999]">({prospect.location})</span>
                    </li>
                  ))}
                  {(state.data?.metrics.activeProspects?.length ?? 0) > 3 && (
                    <li className="text-xs font-semibold text-[#0D0D0D] mt-1.5 pt-1.5 border-t border-[#E8E8E8]">
                      +{(state.data?.metrics.activeProspects?.length ?? 0) - 3} more
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Temperature Breakdown - Clickable */}
            <div className="space-y-2.5 mb-6">
              <button
                onClick={() => router.push("/operator/responses?filter=YES")}
                className="w-full flex items-center justify-between p-3 hover:bg-[#F5F5F5] rounded transition-colors border border-transparent hover:border-[#E8E8E8]"
              >
                <div className="flex items-center gap-2">
                  <div className="text-[#0D0D0D]">
                    <Icons.UltraHot />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-semibold text-[#0D0D0D]">Ultra Hot</span>
                    <span className="text-xs text-[#888888] ml-2">— Act now, awaiting response follow-up</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-[#0D0D0D]">{tempBreakdown.ultraHot}</span>
              </button>

              <button
                onClick={() => router.push("/operator/responses?filter=awaiting")}
                className="w-full flex items-center justify-between p-3 hover:bg-[#F5F5F5] rounded transition-colors border border-transparent hover:border-[#E8E8E8]"
              >
                <div className="flex items-center gap-2">
                  <div className="text-[#0D0D0D]">
                    <Icons.Hot />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-semibold text-[#0D0D0D]">Hot</span>
                    <span className="text-xs text-[#888888] ml-2">— Today, emails sent, watch for responses</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-[#0D0D0D]">{tempBreakdown.hot}</span>
              </button>

              <button
                onClick={() => router.push("/operator/understand")}
                className="w-full flex items-center justify-between p-3 hover:bg-[#F5F5F5] rounded transition-colors border border-transparent hover:border-[#E8E8E8]"
              >
                <div className="flex items-center gap-2">
                  <div className="text-[#0D0D0D]">
                    <Icons.Warm />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-semibold text-[#0D0D0D]">Warm</span>
                    <span className="text-xs text-[#888888] ml-2">— This week, awaiting first email</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-[#0D0D0D]">{tempBreakdown.warm}</span>
              </button>
            </div>

            {/* Industry Breakdown - Idea #2 */}
            {industryData.length > 0 && (
              <div className="mb-6 pt-6 border-t border-[#E8E8E8]">
                <p className="text-xs font-semibold text-[#0D0D0D] tracking-[0.05em] uppercase mb-3">
                  By Industry
                </p>
                <div className="space-y-2">
                  {industryData.slice(0, 3).map((industry) => (
                    <div key={industry.name} className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-[#0D0D0D] font-medium">{industry.name}</span>
                          <span className="text-xs text-[#888888]">{industry.count}</span>
                        </div>
                        <div className="h-1.5 bg-[#E8E8E8] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0D0D0D]"
                            style={{ width: `${industry.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pressure Breakdown - Idea #2 */}
            {pressureData.length > 0 && (
              <div className="mb-6 pt-6 border-t border-[#E8E8E8]">
                <p className="text-xs font-semibold text-[#0D0D0D] tracking-[0.05em] uppercase mb-3">
                  By Pressure Signal
                </p>
                <div className="space-y-2">
                  {pressureData.slice(0, 3).map((pressure) => (
                    <div key={pressure.name} className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-[#0D0D0D] font-medium">{pressure.name}</span>
                          <span className="text-xs text-[#888888]">{pressure.count}</span>
                        </div>
                        <div className="h-1.5 bg-[#E8E8E8] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0D0D0D]"
                            style={{ width: `${pressure.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Micro-Actions - Idea #3 */}
          <div className="flex flex-wrap gap-3 pt-6 border-t border-[#E8E8E8]">
            <button
              onClick={() => router.push("/operator/discover")}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D0D0D] text-white text-xs font-semibold rounded-lg hover:bg-[#333333] transition-colors"
            >
              <Icons.Email />
              Send Batch Emails
            </button>
          </div>
        </div>
      </div>

      {/* OUTREACH ACTIVITY CARD - Email Transparency */}
      {sentEmails.length > 0 && (
        <div className="mb-16 px-4 md:px-0">
          <div className="border border-[#E8E8E8] rounded-lg p-8 bg-white hover:border-[#0D0D0D] hover:shadow-sm transition-all">
            <div className="mb-6">
              <p className="text-xs font-semibold text-[#888888] tracking-[0.15em] uppercase mb-3">
                Outreach Activity
              </p>
              <p className="text-3xl md:text-4xl font-black text-[#0D0D0D] tracking-tight mb-2">
                {sentEmails.length}
              </p>
              <p className="text-sm text-[#666666]">
                email{sentEmails.length !== 1 ? 's' : ''} sent today
              </p>
            </div>

            {/* Email List */}
            <div className="space-y-2">
              {sentEmails.map((email) => (
                <div
                  key={email.id}
                  className="border border-[#E8E8E8] rounded p-4 hover:bg-[#F5F5F5] transition-colors"
                >
                  <button
                    onClick={() => {
                      const newSet = new Set(expandedEmails);
                      if (newSet.has(email.id)) {
                        newSet.delete(email.id);
                      } else {
                        newSet.add(email.id);
                      }
                      setExpandedEmails(newSet);
                    }}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#0D0D0D] truncate">
                          {email.businessName}
                        </p>
                        <p className="text-xs text-[#888888] truncate">
                          {email.email}
                        </p>
                        <p className="text-xs text-[#666666] mt-1 truncate">
                          {email.subject || "(No subject)"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-xs font-semibold text-[#0D0D0D]">
                            {email.status === "sent" ? "✅ Sent" : "⏳ Pending"}
                          </div>
                          <div className="text-[10px] text-[#888888] mt-0.5">
                            {new Date(email.sentAt).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                        <div className="text-[#888888]">
                          {expandedEmails.has(email.id) ? "▼" : "▶"}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expandedEmails.has(email.id) && (
                    <div className="mt-4 pt-4 border-t border-[#E8E8E8] space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.05em] mb-1">
                          Message ID
                        </p>
                        <p className="text-xs font-mono text-[#666666]">
                          {email.resendMessageId || "(Pending Resend ID)"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.05em] mb-1">
                          Email Body
                        </p>
                        <div className="bg-[#F9F9F9] border border-[#E8E8E8] rounded p-3 max-h-48 overflow-y-auto">
                          <p className="text-xs text-[#666666] whitespace-pre-wrap break-words">
                            {email.body || "(No body content)"}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          router.push(`/operator/understand?id=${email.leadId}`)
                        }
                        className="text-xs font-semibold text-[#0D0D0D] hover:underline transition-colors"
                      >
                        View Prospect Detail →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 pt-6 border-t border-[#E8E8E8] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#888888]">Sent to Resend</span>
                <span className="text-sm font-semibold text-[#0D0D0D]">
                  {sentEmails.filter((e) => e.status === "sent").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#888888]">Pending</span>
                <span className="text-sm font-semibold text-[#0D0D0D]">
                  {sentEmails.filter((e) => e.status === "pending").length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REVENUE CARD */}
      <div className="mb-16 px-4 md:px-0">
        <div className="border border-[#E8E8E8] rounded-lg p-8 bg-white hover:border-[#0D0D0D] hover:shadow-sm transition-all">
          <p className="text-xs font-semibold text-[#888888] tracking-[0.15em] uppercase mb-3">
            Revenue Status
          </p>
          <p className="text-3xl md:text-4xl font-black text-[#0D0D0D] tracking-tight mb-4">
            {metrics.closedToday}
          </p>
          <p className="text-sm text-[#666666] mb-6">
            Deal{metrics.closedToday !== 1 ? 's' : ''} closed today.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/operator/orders")}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#E8E8E8] text-[#0D0D0D] text-xs font-semibold rounded-lg hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-colors"
            >
              <Icons.Eye />
              View Orders
            </button>
          </div>
        </div>
      </div>

      {/* PIPELINE CONFIDENCE */}
      <div className="mb-16 px-4 md:px-0">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-[#0D0D0D] tracking-[0.15em] uppercase mb-3">
            Pipeline Confidence
          </h2>
          <p className="text-xs text-[#888888]">
            {totalPipelineProspects} prospects across qualification stages.
          </p>
        </div>

        <div className="border border-[#E8E8E8] rounded-lg p-8 md:p-12 bg-white overflow-x-auto">
          <div className="flex justify-between items-end gap-4 min-w-min md:min-w-0">
            {/* Discover */}
            <button
              onClick={() => handlePipelineStageClick("discover")}
              className="text-center flex-1 min-w-[80px] hover:opacity-70 transition-opacity"
            >
              <div className="h-2 bg-[#E8E8E8] rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-[#0D0D0D]"
                  style={{ width: `${(state.data.pipeline.discover / totalPipelineProspects) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.05em] mb-1">
                Discover
              </p>
              <p className="text-2xl font-black text-[#0D0D0D] tracking-tight">
                {state.data.pipeline.discover}
              </p>
            </button>

            {/* Enrich */}
            <button
              onClick={() => handlePipelineStageClick("enrich")}
              className="text-center flex-1 min-w-[80px] hover:opacity-70 transition-opacity"
            >
              <div className="h-2 bg-[#E8E8E8] rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-[#0D0D0D]"
                  style={{ width: `${(state.data.pipeline.enrich / totalPipelineProspects) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.05em] mb-1">
                Enrich
              </p>
              <p className="text-2xl font-black text-[#0D0D0D] tracking-tight">
                {state.data.pipeline.enrich}
              </p>
            </button>

            {/* Qualify */}
            <button
              onClick={() => handlePipelineStageClick("qualify")}
              className="text-center flex-1 min-w-[80px] hover:opacity-70 transition-opacity"
            >
              <div className="h-2 bg-[#E8E8E8] rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-[#0D0D0D]"
                  style={{ width: `${(state.data.pipeline.qualify / totalPipelineProspects) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.05em] mb-1">
                Qualify
              </p>
              <p className="text-2xl font-black text-[#0D0D0D] tracking-tight">
                {state.data.pipeline.qualify}
              </p>
            </button>

            {/* Propose */}
            <button
              onClick={() => handlePipelineStageClick("propose")}
              className="text-center flex-1 min-w-[80px] hover:opacity-70 transition-opacity"
            >
              <div className="h-2 bg-[#E8E8E8] rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-[#0D0D0D]"
                  style={{ width: `${(state.data.pipeline.propose / totalPipelineProspects) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.05em] mb-1">
                Propose
              </p>
              <p className="text-2xl font-black text-[#0D0D0D] tracking-tight">
                {state.data.pipeline.propose}
              </p>
            </button>

            {/* Orders */}
            <button
              onClick={() => handlePipelineStageClick("orders")}
              className="text-center flex-1 min-w-[80px] hover:opacity-70 transition-opacity"
            >
              <div className="h-2 bg-[#E8E8E8] rounded-full mb-4 overflow-hidden">
                <div
                  className="h-full bg-[#0D0D0D]"
                  style={{ width: `${(state.data.pipeline.orders / totalPipelineProspects) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.05em] mb-1">
                Orders
              </p>
              <p className="text-2xl font-black text-[#0D0D0D] tracking-tight">
                {state.data.pipeline.orders}
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
