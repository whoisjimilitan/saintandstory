"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Pusher from "pusher-js";
import { useToast } from "@/app/providers/ToastProvider";
import { OperatorCommandCenter } from "@/components/OperatorCommandCenter";

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
  const { showToast } = useToast();
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
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [driversOffline, setDriversOffline] = useState(0);
  const [driversAvailable, setDriversAvailable] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState("£0");
  const [driversList, setDriversList] = useState<any[]>([]);
  const [showAssignJob, setShowAssignJob] = useState(false);
  const [assignForm, setAssignForm] = useState({
    driver_id: "",
    prospect_name: "",
    postcode_from: "",
    postcode_to: "",
    price: "100",
  });
  const [actionItemsExpanded, setActionItemsExpanded] = useState(true);
  const [outreachActivityExpanded, setOutreachActivityExpanded] = useState(true);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [dailyRecommendation, setDailyRecommendation] = useState<any>(null);
  const [callSprint, setCallSprint] = useState<any>(null);
  const firstName = user?.firstName || "";

  // Real-time stats from new APIs
  const [whatsappStats, setWhatsappStats] = useState({ activeConversations: 0, readyToMessage: 0, replied: 0, standsToday: 0 });
  const [emailStats, setEmailStats] = useState({ inCampaign: 0, openedToday: 0, clickedToday: 0, repliedToday: 0 });
  const [driverStats, setDriverStats] = useState({ totalDrivers: 0, driversOnline: 0, driversAvailableToday: 0 });
  const [revenueStats, setRevenueStats] = useState({ totalRevenue: "£0", standingOrderRevenue: "£0", jobRevenue: "£0" });

  // NEW: Command center stats from new campaign system
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // NEW: Load live campaign dashboard stats (command center)
  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setDashboardLoading(true);
        const res = await fetch("/api/operator/dashboard-stats");
        if (res.ok) {
          const data = await res.json();
          setDashboardStats(data);
          console.log("[TODAY] Loaded dashboard stats:", data);
        }
      } catch (error) {
        console.error("[TODAY] Failed to load dashboard stats:", error);
      } finally {
        setDashboardLoading(false);
      }
    };

    loadDashboardStats();
    // Refresh every 30 seconds for live updates
    const interval = setInterval(loadDashboardStats, 30000);
    return () => clearInterval(interval);
  }, []);

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
        // FIX #1: Use email-status endpoint to get actual delivery status from webhooks
        const res = await fetch("/api/operator/email-status-today");
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

  useEffect(() => {
    const loadDriverStats = async () => {
      try {
        const res = await fetch("/api/admin/active-drivers", {
          headers: { "x-admin-email": "whoisjimi.today@gmail.com" },
        });
        if (res.ok) {
          const data = await res.json();
          const drivers = data.live_drivers?.drivers || [];

          // Count only drivers who are actually online (seen in last 5 minutes)
          const onlineDrivers = drivers.filter((d: any) => {
            const lastSeen = d.last_seen as string | null;
            return lastSeen && Date.now() - new Date(lastSeen).getTime() < 5 * 60 * 1000;
          });

          // Count available drivers (online and have no current jobs)
          const availableDrivers = onlineDrivers.filter((d: any) => Number(d.current_jobs) === 0);

          // Count offline drivers
          const offlineCount = drivers.length - onlineDrivers.length;

          setTotalDrivers(drivers.length);
          setDriversOffline(offlineCount);
          setDriversAvailable(availableDrivers.length);
          setTodayRevenue(data.revenue_today?.total_earned || "£0");
          setDriversList(drivers);
        }
      } catch (error) {
        console.error("Failed to load driver stats:", error);
      }
    };

    const loadRecommendation = async () => {
      try {
        const res = await fetch("/api/admin/daily-recommendation", {
          headers: { "x-admin-email": "whoisjimi.today@gmail.com" },
        });
        if (res.ok) {
          const data = await res.json();
          setDailyRecommendation(data);
        }
      } catch (error) {
        console.error("Failed to load recommendation:", error);
      }
    };

    const loadCallSprint = async () => {
      try {
        const res = await fetch("/api/admin/recommended-call-sprint", {
          headers: { "x-admin-email": "whoisjimi.today@gmail.com" },
        });
        if (res.ok) {
          const data = await res.json();
          setCallSprint(data);
        }
      } catch (error) {
        console.error("Failed to load call sprint:", error);
      }
    };

    loadDriverStats();
    loadRecommendation();
    loadCallSprint();
    const interval = setInterval(() => {
      loadDriverStats();
      loadRecommendation();
      loadCallSprint();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Real-time sync: Listen for job cancellations and updates from admin panel
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
    });

    const channel = pusher.subscribe("admin-jobs");

    channel.bind("job-cancelled", (data: any) => {
      console.log("[Pusher] Job cancelled:", data.jobId);
      // Refresh dashboard to show updated counts
      setTimeout(() => window.location.reload(), 500);
    });

    channel.bind("job-accepted", (data: any) => {
      console.log("[Pusher] Job accepted:", data.jobId);
      setTimeout(() => window.location.reload(), 500);
    });

    channel.bind("job-completed", (data: any) => {
      console.log("[Pusher] Job completed:", data.jobId);
      setTimeout(() => window.location.reload(), 500);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe("admin-jobs");
    };
  }, []);

  // Fetch real WhatsApp stats
  useEffect(() => {
    const fetchWhatsAppStats = async () => {
      try {
        const res = await fetch("/api/admin/stats/whatsapp");
        if (res.ok) {
          const data = await res.json();
          setWhatsappStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch WhatsApp stats:", error);
      }
    };
    fetchWhatsAppStats();
    const interval = setInterval(fetchWhatsAppStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Fetch real Email stats
  useEffect(() => {
    const fetchEmailStats = async () => {
      try {
        const res = await fetch("/api/admin/stats/email");
        if (res.ok) {
          const data = await res.json();
          setEmailStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch Email stats:", error);
      }
    };
    fetchEmailStats();
    const interval = setInterval(fetchEmailStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real Driver stats
  useEffect(() => {
    const fetchDriverStats = async () => {
      try {
        const res = await fetch("/api/admin/stats/drivers");
        if (res.ok) {
          const data = await res.json();
          setDriverStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch Driver stats:", error);
      }
    };
    fetchDriverStats();
    const interval = setInterval(fetchDriverStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real Revenue stats
  useEffect(() => {
    const fetchRevenueStats = async () => {
      try {
        const res = await fetch("/api/admin/stats/revenue");
        if (res.ok) {
          const data = await res.json();
          setRevenueStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch Revenue stats:", error);
      }
    };
    fetchRevenueStats();
    const interval = setInterval(fetchRevenueStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAssignJob = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assignForm.driver_id || !assignForm.prospect_name || !assignForm.postcode_from || !assignForm.postcode_to) {
      showToast("Please fill in: Driver, Prospect Name, From, and To postcodes", "error");
      return;
    }

    // Optimistic UI update - show success immediately
    const formData = { ...assignForm };
    setAssignForm({ driver_id: "", prospect_name: "", postcode_from: "", postcode_to: "", price: "100" });
    setShowAssignJob(false);
    showToast("Job assigned successfully.", "success");

    try {
      const response = await fetch("/api/admin/active-drivers", {
        method: "POST",
        headers: {
          "x-admin-email": "whoisjimi.today@gmail.com",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "assign_job_to_driver",
          driver_id: formData.driver_id,
          prospect_name: formData.prospect_name,
          postcode_from: formData.postcode_from,
          postcode_to: formData.postcode_to,
          price: parseFloat(formData.price) || 0,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh driver stats in background
        const statsRes = await fetch("/api/admin/active-drivers", {
          headers: { "x-admin-email": "whoisjimi.today@gmail.com" },
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setActiveDrivers(statsData.live_drivers?.total_active || 0);
          setDriversAvailable(statsData.live_drivers?.available_now || 0);
          setTodayRevenue(statsData.revenue_today?.total_earned || "£0");
          setDriversList(statsData.live_drivers?.drivers || []);
        }
      } else {
        // Show error if request fails
        const errorMsg = data.error || `Server error: ${response.status}`;
        showToast(`Error: ${errorMsg}`, "error");
      }
    } catch (error) {
      // Show error if network fails
      showToast(`Failed: ${error instanceof Error ? error.message : "Unknown error"}`, "error");
    }
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
        router.push("/operator/contracts");
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

      {/* COMMAND CENTER - Real-time dashboard for new campaign system */}
      <OperatorCommandCenter />

      {/* START CAMPAIGN HERO */}
      <div className="mb-12 px-4 md:px-0">
        <button
          onClick={() => router.push("/operator/discover")}
          className="w-full bg-[#0D0D0D] text-white rounded-lg p-8 hover:bg-[#1A1A1A] transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-xs font-semibold text-[#CCCCCC] tracking-[0.15em] uppercase mb-2">
                Ready to reach new prospects?
              </p>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-1">
                Start Campaign
              </h3>
              <p className="text-sm text-[#AAAAAA]">
                Upload leads or search by location
              </p>
            </div>
            <div className="text-4xl">→</div>
          </div>
        </button>
      </div>

      {/* Quick CRM Search */}
      <div className="mb-8 px-4 md:px-0">
        <button
          onClick={() => router.push("/dashboard/crm")}
          className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg bg-white hover:bg-[#F9F9F9] hover:border-[#0D0D0D] transition-colors text-xs font-semibold text-[#0D0D0D]"
        >
          Prospect & customer database
        </button>
      </div>

      {/* WHATSAPP QUEUE - Real-Time Conversations */}
      <div className="mb-12 px-4 md:px-0">
        <h2 className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-widest mb-4">WhatsApp Queue</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <button
            onClick={() => router.push("/operator/whatsapp")}
            className="p-4 bg-white border border-[#E8E8E8] rounded-lg hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-all"
          >
            <div className="text-left">
              <p className="text-xs font-semibold text-[#888888] tracking-[0.05em] uppercase mb-2">
                Active Conversations
              </p>
              <p className="text-2xl font-black text-[#0D0D0D]">{whatsappStats.activeConversations}</p>
            </div>
          </button>
          <button
            onClick={() => router.push("/operator/whatsapp")}
            className="p-4 bg-white border border-[#E8E8E8] rounded-lg hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-all"
          >
            <div className="text-left">
              <p className="text-xs font-semibold text-[#888888] tracking-[0.05em] uppercase mb-2">
                Ready to Message
              </p>
              <p className="text-2xl font-black text-[#0D0D0D]">{whatsappStats.readyToMessage}</p>
            </div>
          </button>
          <button
            onClick={() => router.push("/operator/whatsapp")}
            className="p-4 bg-[#0D0D0D] text-white rounded-lg hover:bg-[#1A1A1A] transition-colors"
          >
            <div className="text-left">
              <p className="text-xs font-semibold text-[#CCCCCC] tracking-[0.05em] uppercase mb-2">
                + New Conversation
              </p>
              <p className="text-sm font-semibold">Start chatting</p>
            </div>
          </button>
        </div>
        <button
          onClick={() => router.push("/operator/whatsapp")}
          className="w-full text-left px-4 py-3 border border-[#E8E8E8] rounded-lg bg-white hover:bg-[#F9F9F9] transition-colors"
        >
          <p className="text-xs font-semibold text-[#0D0D0D]">
            Go to WhatsApp Queue →
          </p>
        </button>
      </div>

      {/* EMAIL CAMPAIGN - Batch Automation */}
      <div className="mb-12 px-4 md:px-0">
        <h2 className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-widest mb-4">Email Campaign</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <button
            onClick={() => router.push("/operator/outreach")}
            className="p-4 bg-white border border-[#E8E8E8] rounded-lg hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-all"
          >
            <div className="text-left">
              <p className="text-xs font-semibold text-[#888888] tracking-[0.05em] uppercase mb-2">
                In Campaign
              </p>
              <p className="text-2xl font-black text-[#0D0D0D]">{emailStats.inCampaign}</p>
            </div>
          </button>
          <button
            onClick={() => router.push("/operator/outreach")}
            className="p-4 bg-white border border-[#E8E8E8] rounded-lg hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-all"
          >
            <div className="text-left">
              <p className="text-xs font-semibold text-[#888888] tracking-[0.05em] uppercase mb-2">
                Opened Today
              </p>
              <p className="text-2xl font-black text-[#0D0D0D]">{emailStats.openedToday}</p>
            </div>
          </button>
          <button
            onClick={() => router.push("/operator/outreach")}
            className="p-4 bg-[#0D0D0D] text-white rounded-lg hover:bg-[#1A1A1A] transition-colors"
          >
            <div className="text-left">
              <p className="text-xs font-semibold text-[#CCCCCC] tracking-[0.05em] uppercase mb-2">
                Upload Leads
              </p>
              <p className="text-sm font-semibold">Create campaign</p>
            </div>
          </button>
        </div>
        <button
          onClick={() => router.push("/operator/outreach")}
          className="w-full text-left px-4 py-3 border border-[#E8E8E8] rounded-lg bg-white hover:bg-[#F9F9F9] transition-colors"
        >
          <p className="text-xs font-semibold text-[#0D0D0D]">
            Go to Email Campaign →
          </p>
        </button>
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
                <button
                  onClick={() => setActionItemsExpanded(!actionItemsExpanded)}
                  className="flex items-center gap-2 text-xs font-semibold text-[#0D0D0D] tracking-[0.05em] uppercase mb-2 hover:text-[#666666]"
                >
                  <span>Action Items</span>
                  <span className="text-[#888888]">{actionItemsExpanded ? "−" : "+"}</span>
                </button>
                {actionItemsExpanded && (
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
                  {emailsSentCount > 0 && (
                    <li>
                      <button
                        onClick={() => router.push("/operator/whatsapp")}
                        className="text-[#0D0D0D] font-semibold hover:underline"
                      >
                        • Check WhatsApp conversations
                      </button>
                    </li>
                  )}
                </ul>
                )}
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

      {/* AVAILABLE DRIVERS WIDGET */}
      {totalDrivers > 0 && (
        <div className="mb-16 px-4 md:px-0">
          <div className="border border-[#E8E8E8] rounded-lg p-6 bg-[#F9F9F9]">
            <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">
              Driver Pool
            </p>

            {showAssignJob ? (
              <form onSubmit={handleAssignJob} className="space-y-3 mb-4 p-4 border border-[#E8E8E8] rounded bg-white">
                <div>
                  <label className="text-xs font-semibold text-[#0D0D0D] block mb-1">Select Driver</label>
                  <select
                    value={assignForm.driver_id}
                    onChange={(e) => setAssignForm({ ...assignForm, driver_id: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-[#E8E8E8] rounded hover:border-[#0D0D0D]"
                    required
                  >
                    <option value="">-- Choose Driver --</option>
                    {driversList
                      .filter((d: any) => {
                        // Only show drivers who are online (seen in last 5 min)
                        const lastSeen = d.last_seen as string | null;
                        const isOnline = lastSeen && Date.now() - new Date(lastSeen).getTime() < 5 * 60 * 1000;
                        return isOnline && d.status === "available";
                      })
                      .map((d: any) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.area})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#0D0D0D] block mb-1">Prospect Name</label>
                  <input
                    type="text"
                    placeholder="Event organizer or company name"
                    value={assignForm.prospect_name}
                    onChange={(e) => setAssignForm({ ...assignForm, prospect_name: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-[#E8E8E8] rounded hover:border-[#0D0D0D]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#0D0D0D] block mb-1">From</label>
                    <input
                      type="text"
                      placeholder="Postcode or area"
                      value={assignForm.postcode_from}
                      onChange={(e) => setAssignForm({ ...assignForm, postcode_from: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-[#E8E8E8] rounded hover:border-[#0D0D0D]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#0D0D0D] block mb-1">To</label>
                    <input
                      type="text"
                      placeholder="Postcode or area"
                      value={assignForm.postcode_to}
                      onChange={(e) => setAssignForm({ ...assignForm, postcode_to: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-[#E8E8E8] rounded hover:border-[#0D0D0D]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#0D0D0D] block mb-1">Job Value (£)</label>
                  <input
                    type="number"
                    value={assignForm.price}
                    onChange={(e) => setAssignForm({ ...assignForm, price: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-[#E8E8E8] rounded hover:border-[#0D0D0D]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#0D0D0D] text-white text-xs font-semibold px-3 py-2 rounded hover:bg-[#333333] transition-colors"
                  >
                    Assign Job
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAssignJob(false)}
                    className="flex-1 text-xs font-semibold text-[#0D0D0D] border border-[#E8E8E8] px-3 py-2 rounded hover:bg-[#F5F5F5]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="grid grid-cols-4 gap-6 mb-6">
                  <div>
                    <p className="text-xs text-[#888888] font-semibold mb-2">Total Drivers</p>
                    <p className="text-2xl font-black text-[#0D0D0D]">{totalDrivers}</p>
                    <p className="text-xs text-[#666666]">in system</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#888888] font-semibold mb-2">Offline</p>
                    <p className="text-2xl font-black text-[#0D0D0D]">{driversOffline}</p>
                    <p className="text-xs text-[#666666]">not ready to work</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#888888] font-semibold mb-2">Online</p>
                    <p className="text-2xl font-black text-[#0D0D0D]">{driversAvailable}</p>
                    <p className="text-xs text-[#666666]">ready to work</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#888888] font-semibold mb-2">Revenue Today</p>
                    <p className="text-2xl font-black text-[#0D0D0D]">{todayRevenue}</p>
                    <p className="text-xs text-[#666666]">from drivers</p>
                  </div>
                </div>
                <div className="flex justify-center pt-4 border-t border-[#E8E8E8]">
                  <button
                    onClick={() => setShowAssignJob(!showAssignJob)}
                    className="text-xs font-semibold text-[#0D0D0D] border border-[#E8E8E8] px-4 py-2 rounded hover:border-[#0D0D0D] hover:bg-white transition-colors"
                  >
                    {showAssignJob ? "Close" : "Assign Job"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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

      {/* OUTREACH ACTIVITY CARD - Email Transparency */}
      {sentEmails.length > 0 && (
        <div className="mb-16 px-4 md:px-0">
          <div className="border border-[#E8E8E8] rounded-lg p-8 bg-white hover:border-[#0D0D0D] hover:shadow-sm transition-all">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex-1">
                <button
                  onClick={() => setOutreachActivityExpanded(!outreachActivityExpanded)}
                  className="flex items-center gap-2 mb-3 hover:opacity-70 transition-opacity"
                >
                  <p className="text-xs font-semibold text-[#888888] tracking-[0.15em] uppercase">
                    Outreach Activity
                  </p>
                  <span className="text-[#888888]">{outreachActivityExpanded ? "−" : "+"}</span>
                </button>
                <p className="text-3xl md:text-4xl font-black text-[#0D0D0D] tracking-tight mb-2">
                  {sentEmails.length}
                </p>
                <p className="text-sm text-[#666666]">
                  email{sentEmails.length !== 1 ? 's' : ''} sent today
                </p>
              </div>
            </div>

            {/* Email List */}
            {outreachActivityExpanded && (
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
                            {email.status === "opened" ? "👁️ Opened" : email.status === "clicked" ? "🔗 Clicked" : email.status === "delivered" ? "✅ Delivered" : email.status === "sent" ? "📤 Sent" : "Pending"}
                          </div>
                          <div className="text-[10px] text-[#888888] mt-0.5">
                            {email.opens > 0 || email.clicks > 0 ? `${email.opens}📂 ${email.clicks}🔗` : new Date(email.sentAt).toLocaleTimeString("en-GB", {
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
            )}

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
            Money Made Today
          </p>
          <p className="text-3xl md:text-4xl font-black text-[#0D0D0D] tracking-tight mb-4">
            {revenueStats.totalRevenue}
          </p>
          <p className="text-sm text-[#666666] mb-6">
            Standing orders + driver jobs (resets at 00:00)
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/operator/contracts")}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#E8E8E8] text-[#0D0D0D] text-xs font-semibold rounded-lg hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-colors"
            >
              <Icons.Eye />
              View Orders
            </button>
          </div>
        </div>
      </div>

      {/* CHANNEL STATUS */}
      <div className="mb-16 px-4 md:px-0">
        <h2 className="text-xs font-semibold text-[#0D0D0D] tracking-[0.15em] uppercase mb-6">
          Channel Status
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WhatsApp Status */}
          <div className="border border-[#E8E8E8] rounded-lg p-6 bg-white">
            <p className="text-xs font-semibold text-[#888888] tracking-[0.05em] uppercase mb-4">
              WhatsApp
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#666666]">Ready to message</p>
                <p className="text-2xl font-black text-[#0D0D0D]">{whatsappStats.readyToMessage}</p>
              </div>
              <div className="border-t border-[#E8E8E8] pt-3">
                <p className="text-xs text-[#666666]">Replied</p>
                <p className="text-2xl font-black text-[#0D0D0D]">{whatsappStats.replied}</p>
              </div>
              <div className="border-t border-[#E8E8E8] pt-3">
                <p className="text-xs text-[#666666]">Standing orders</p>
                <p className="text-2xl font-black text-[#0D0D0D]">{whatsappStats.standsToday}</p>
              </div>
            </div>
          </div>

          {/* Email Status */}
          <div className="border border-[#E8E8E8] rounded-lg p-6 bg-white">
            <p className="text-xs font-semibold text-[#888888] tracking-[0.05em] uppercase mb-4">
              Email
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#666666]">Sent</p>
                <p className="text-2xl font-black text-[#0D0D0D]">{emailStats.inCampaign}</p>
              </div>
              <div className="border-t border-[#E8E8E8] pt-3">
                <p className="text-xs text-[#666666]">Opened today</p>
                <p className="text-2xl font-black text-[#0D0D0D]">{emailStats.openedToday}</p>
              </div>
              <div className="border-t border-[#E8E8E8] pt-3">
                <p className="text-xs text-[#666666]">Clicked</p>
                <p className="text-2xl font-black text-[#0D0D0D]">{emailStats.clickedToday}</p>
              </div>
              <div className="border-t border-[#E8E8E8] pt-3">
                <p className="text-xs text-[#666666]">Replied</p>
                <p className="text-2xl font-black text-[#0D0D0D]">{emailStats.repliedToday}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
