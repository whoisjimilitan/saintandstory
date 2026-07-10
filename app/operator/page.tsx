"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface OperationStatus {
  whatsapp: {
    active: number;
    replied: number;
  };
  email: {
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
  };
  drivers: {
    available: number;
    revenue: string;
  };
}

interface TodayData {
  operation: OperationStatus;
  opportunitiesQueued: number;
  pendingReplies: number;
}

interface ReferralSignup {
  id: string;
  name: string;
  office: string;
  phone: string;
  city: string;
  code: string;
  createdAt: string;
  sentAt?: string;
}

export default function TodayPage() {
  const router = useRouter();
  const [data, setData] = useState<TodayData>({
    operation: {
      whatsapp: { active: 0, replied: 0 },
      email: { sent: 0, opened: 0, clicked: 0, replied: 0 },
      drivers: { available: 0, revenue: "£0" },
    },
    opportunitiesQueued: 0,
    pendingReplies: 0,
  });
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<{ pending: ReferralSignup[]; sent: ReferralSignup[] }>({
    pending: [],
    sent: [],
  });
  const [sentHistoryExpanded, setSentHistoryExpanded] = useState(false);
  const [markingSent, setMarkingSent] = useState<string | null>(null);

  // Modal states for clickable cards
  const [activeModal, setActiveModal] = useState<"whatsapp" | "email" | "drivers" | null>(null);
  const [driverPoolExpanded, setDriverPoolExpanded] = useState(false);
  const [assignForm, setAssignForm] = useState({
    driver_id: "",
    prospect_name: "",
    postcode_from: "",
    postcode_to: "",
    price: "100",
  });
  const [searchProspect, setSearchProspect] = useState("");

  useEffect(() => {
    const loadTodayData = async () => {
      try {
        // Fetch all operation status and pipeline data
        const [campaignRes, opportunitiesRes, driverRes, whatsappRes, repliesRes, referralsRes] = await Promise.all([
          fetch("/api/operator/today-campaign-stats"),
          fetch("/api/operator/opportunities-waiting"),
          fetch("/api/operator/today-driver-stats"),
          fetch("/api/operator/today-whatsapp-stats"),
          fetch("/api/operator/today-pending-replies"),
          fetch("/api/referral/list"),
        ]);

        const campaign = campaignRes.ok ? await campaignRes.json() : { stats: { sent: 0, opened: 0, clicked: 0, replied: 0 } };
        const opportunities = opportunitiesRes.ok ? await opportunitiesRes.json() : { count: 0 };
        const driverData = driverRes.ok ? await driverRes.json() : { available: 0, revenue: "£0" };
        const whatsappData = whatsappRes.ok ? await whatsappRes.json() : { active: 0, replied: 0 };
        const repliesData = repliesRes.ok ? await repliesRes.json() : { count: 0 };
        const referralsData = referralsRes.ok ? await referralsRes.json() : { pending: [], sent: [] };

        setData({
          operation: {
            whatsapp: { active: whatsappData.active || 0, replied: whatsappData.replied || 0 },
            email: campaign.stats || { sent: 0, opened: 0, clicked: 0, replied: 0 },
            drivers: { available: driverData.available || 0, revenue: driverData.revenue || "£0" },
          },
          opportunitiesQueued: opportunities.count || 0,
          pendingReplies: repliesData.count || 0,
        });

        setReferrals({
          pending: referralsData.pending || [],
          sent: referralsData.sent || [],
        });
      } catch (error) {
        console.error("[TODAY] Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTodayData();
    // Refresh every 60 seconds for live updates
    const interval = setInterval(loadTodayData, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAsSent = async (referrerId: string) => {
    setMarkingSent(referrerId);
    try {
      const response = await fetch("/api/referral/mark-sent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referrerId }),
      });

      if (!response.ok) throw new Error("Failed to mark as sent");

      // Move from pending to sent
      const signup = referrals.pending.find((r) => r.id === referrerId);
      if (signup) {
        setReferrals({
          pending: referrals.pending.filter((r) => r.id !== referrerId),
          sent: [...referrals.sent, { ...signup, sentAt: new Date().toISOString() }],
        });
      }

      console.log("[OPERATOR] ✓ Marked as sent:", referrerId);
    } catch (error) {
      console.error("[OPERATOR] Error marking as sent:", error);
      alert("Failed to mark as sent. Try again.");
    } finally {
      setMarkingSent(null);
    }
  };

  const today = new Date();
  const dayName = today.toLocaleDateString("en-UK", { weekday: "long" });
  const dateNum = today.getDate();
  const monthShort = today.toLocaleDateString("en-UK", { month: "short" });
  const year = today.getFullYear();
  const dateStr = `${String(dateNum).padStart(2, "0")}.${monthShort.toUpperCase()}.${year}`;

  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">

        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-[#0D0D0D] mb-2 tracking-tight">Today</h1>
          <p className="text-xs text-[#999999]">{dayName} • {dateStr}</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-[#666666]">Loading your day...</p>
          </div>
        ) : (
          <>
            {/* SECTION 1: OPERATION STATUS - What's happening right now */}
            <div className="mb-16">
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">Operation Status</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* WhatsApp - Clickable */}
                <button
                  onClick={() => setActiveModal("whatsapp")}
                  className="border border-[#E8E8E8] rounded-lg p-6 bg-white hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-colors text-left cursor-pointer"
                >
                  <p className="text-xs text-[#888888] uppercase tracking-widest mb-3">WhatsApp</p>
                  <p className="text-3xl font-black text-[#0D0D0D] mb-1">{data.operation.whatsapp.active}</p>
                  <p className="text-xs text-[#666666]">active conversations</p>
                  <p className="text-xs text-[#666666] mt-2">{data.operation.whatsapp.replied} replied today</p>
                </button>

                {/* Email - Clickable */}
                <button
                  onClick={() => setActiveModal("email")}
                  className="border border-[#E8E8E8] rounded-lg p-6 bg-white hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-colors text-left cursor-pointer"
                >
                  <p className="text-xs text-[#888888] uppercase tracking-widest mb-3">Email</p>
                  <p className="text-3xl font-black text-[#0D0D0D] mb-1">{data.operation.email.sent}</p>
                  <p className="text-xs text-[#666666]">sent today</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs text-[#666666]">{data.operation.email.opened} opened</span>
                    <span className="text-xs text-[#CCCCCC]">•</span>
                    <span className="text-xs text-[#666666]">{data.operation.email.clicked} clicked</span>
                  </div>
                </button>

                {/* Drivers - Clickable */}
                <button
                  onClick={() => setActiveModal("drivers")}
                  className="border border-[#E8E8E8] rounded-lg p-6 bg-white hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-colors text-left cursor-pointer"
                >
                  <p className="text-xs text-[#888888] uppercase tracking-widest mb-3">Drivers</p>
                  <p className="text-3xl font-black text-[#0D0D0D] mb-1">{data.operation.drivers.available}</p>
                  <p className="text-xs text-[#666666]">available now</p>
                  <p className="text-xs text-[#666666] mt-2">{data.operation.drivers.revenue} earned today</p>
                </button>
              </div>
            </div>

            {/* SECTION 2: PRIMARY ACTION - What you should do RIGHT NOW */}
            <div className="mb-16">
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">Primary Action</p>

              {data.pendingReplies > 0 ? (
                <div className="border-2 border-[#0D0D0D] rounded-lg p-8 bg-[#F9F9F9]">
                  <h2 className="text-3xl font-black text-[#0D0D0D] mb-2">{data.pendingReplies} replies waiting</h2>
                  <p className="text-sm text-[#666666] mb-6">Prospects have replied to your emails. Respond now.</p>
                  <Link
                    href="/operator/responses"
                    className="inline-block px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
                  >
                    Review Replies →
                  </Link>
                </div>
              ) : data.opportunitiesQueued > 0 ? (
                <div className="border-2 border-[#0D0D0D] rounded-lg p-8 bg-[#F9F9F9]">
                  <h2 className="text-3xl font-black text-[#0D0D0D] mb-2">{data.opportunitiesQueued} opportunities ready</h2>
                  <p className="text-sm text-[#666666] mb-6">Your CSV upload is processed. Send these emails now.</p>
                  <Link
                    href="/operator/enrich?source=queue"
                    className="inline-block px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
                  >
                    Send Opportunities →
                  </Link>
                </div>
              ) : data.operation.email.sent > 0 ? (
                <div className="border-2 border-[#0D0D0D] rounded-lg p-8 bg-[#F9F9F9]">
                  <h2 className="text-3xl font-black text-[#0D0D0D] mb-2">Campaign running</h2>
                  <p className="text-sm text-[#666666] mb-6">{data.operation.email.sent} emails sent. {data.operation.email.sent > 0 ? Math.round((data.operation.email.opened / data.operation.email.sent) * 100) : 0}% opened. Keep monitoring.</p>
                  <Link
                    href="/operator/reach"
                    className="inline-block px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
                  >
                    View Campaign →
                  </Link>
                </div>
              ) : (
                <div className="border-2 border-[#0D0D0D] rounded-lg p-8 bg-[#F9F9F9]">
                  <h2 className="text-3xl font-black text-[#0D0D0D] mb-2">Upload CSV to start</h2>
                  <p className="text-sm text-[#666666] mb-6">No opportunities queued. Go to Discover and upload your first CSV file.</p>
                  <Link
                    href="/operator/discover"
                    className="inline-block px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
                  >
                    Go to Discover →
                  </Link>
                </div>
              )}
            </div>

            {/* FIND PROSPECT - Quick search to CRM */}
            <div className="mb-16">
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-4">Search</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchProspect.length >= 2) {
                    router.push(`/dashboard/crm?search=${encodeURIComponent(searchProspect)}`);
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or city..."
                  value={searchProspect}
                  onChange={(e) => setSearchProspect(e.target.value)}
                  className="flex-1 text-sm px-4 py-3 border border-[#E8E8E8] rounded-lg bg-white hover:border-[#0D0D0D] focus:border-[#0D0D0D] focus:outline-none transition-colors placeholder-[#CCCCCC]"
                />
                <button
                  type="submit"
                  disabled={searchProspect.length < 2}
                  className="px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] disabled:opacity-50 transition-colors"
                >
                  Search
                </button>
              </form>
            </div>

            {/* REFERRAL SIGNUPS - Pending & Sent */}
            <div className="mb-16">
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">Referral Signups</p>

              {/* Pending Signups - Expanded */}
              <div className="mb-4 border border-[#E8E8E8] rounded-lg overflow-hidden">
                <button
                  onClick={() => {}}
                  className="w-full text-left p-6 bg-white hover:bg-[#F9F9F9] transition-colors border-b border-[#E8E8E8] flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#0D0D0D]">Pending Signups</p>
                    <p className="text-xs text-[#888888] mt-1">{referrals.pending.length} awaiting WhatsApp</p>
                  </div>
                  <div className="text-2xl font-black text-[#0D0D0D]">{referrals.pending.length}</div>
                </button>

                {referrals.pending.length > 0 ? (
                  <div className="divide-y divide-[#E8E8E8]">
                    {referrals.pending.map((signup) => (
                      <div key={signup.id} className="p-6 bg-white hover:bg-[#F9F9F9] transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-sm font-semibold text-[#0D0D0D]">{signup.name}</p>
                            <p className="text-xs text-[#888888] mt-1">{signup.office} • {signup.city}</p>
                          </div>
                          <button
                            onClick={() => markAsSent(signup.id)}
                            disabled={markingSent === signup.id}
                            className="px-4 py-2 bg-[#0D0D0D] text-white text-xs font-semibold rounded-lg hover:bg-[#333333] disabled:opacity-50 transition-colors"
                          >
                            {markingSent === signup.id ? "Marking..." : "Mark Sent"}
                          </button>
                        </div>

                        <div className="mb-3">
                          <p className="text-xs text-[#888888] mb-2">Code</p>
                          <p className="font-mono font-black text-base text-[#0D0D0D] mb-3">{signup.code}</p>

                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(signup.phone);
                              alert("Phone copied!");
                            }}
                            className="text-xs text-[#888888] hover:text-[#0D0D0D] transition"
                          >
                            {signup.phone}
                          </button>
                        </div>

                        <div className="bg-[#F9F9F9] p-4 rounded-lg border-l-4 border-[#0D0D0D]">
                          <p className="text-xs text-[#888888] mb-2">Message Template</p>
                          <p className="text-sm text-[#0D0D0D] leading-relaxed mb-3">
                            Hi, for removals I recommend Saint & Story. Use code <span className="font-mono font-semibold">{signup.code}</span>
                          </p>
                          <button
                            onClick={() => {
                              const text = `Hi, for removals I recommend Saint & Story. Use code ${signup.code}`;
                              navigator.clipboard.writeText(text);
                              alert("Message copied! Send via WhatsApp, then mark as sent.");
                            }}
                            className="w-full px-3 py-2 bg-white border border-[#E8E8E8] text-[#0D0D0D] text-xs font-semibold rounded hover:border-[#0D0D0D] transition-colors"
                          >
                            Copy Message
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-[#FAFAFA] text-center">
                    <p className="text-sm text-[#888888]">No pending signups. All caught up!</p>
                  </div>
                )}
              </div>

              {/* Sent Signups - Collapsed */}
              <div className="border border-[#E8E8E8] rounded-lg overflow-hidden">
                <button
                  onClick={() => setSentHistoryExpanded(!sentHistoryExpanded)}
                  className="w-full text-left p-6 bg-white hover:bg-[#F9F9F9] transition-colors border-b border-[#E8E8E8] flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#0D0D0D]">Sent History</p>
                    <p className="text-xs text-[#888888] mt-1">{referrals.sent.length} completed</p>
                  </div>
                  <div className="text-xl text-[#0D0D0D]">{sentHistoryExpanded ? "−" : "+"}</div>
                </button>

                {sentHistoryExpanded && referrals.sent.length > 0 && (
                  <div className="divide-y divide-[#E8E8E8]">
                    {referrals.sent.map((signup) => (
                      <div key={signup.id} className="p-6 bg-white hover:bg-[#F9F9F9] transition-colors text-xs">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-[#0D0D0D]">{signup.name}</p>
                            <p className="text-[#888888] mt-1">{signup.office} • {signup.city}</p>
                            <p className="text-[#CCCCCC] mt-2">
                              {signup.sentAt ? new Date(signup.sentAt).toLocaleDateString() : "N/A"}
                            </p>
                          </div>
                          <p className="font-mono font-black text-[#0D0D0D]">{signup.code}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* QUICK NAVIGATION - All channels + Database */}
            <div>
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">Next Step</p>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Link
                  href="/operator/discover"
                  className="border border-[#E8E8E8] rounded-lg p-6 hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-colors text-center"
                >
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-1">Discover</p>
                  <p className="text-xs text-[#888888]">Find prospects</p>
                </Link>

                <Link
                  href="/operator/enrich"
                  className="border border-[#E8E8E8] rounded-lg p-6 hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-colors text-center"
                >
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-1">Enrich</p>
                  <p className="text-xs text-[#888888]">Generate & send</p>
                </Link>

                <Link
                  href="/operator/reach"
                  className="border border-[#E8E8E8] rounded-lg p-6 hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-colors text-center"
                >
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-1">Monitor</p>
                  <p className="text-xs text-[#888888]">Track campaigns</p>
                </Link>

                <Link
                  href="/operator/responses"
                  className="border border-[#E8E8E8] rounded-lg p-6 hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-colors text-center"
                >
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-1">Responses</p>
                  <p className="text-xs text-[#888888]">Email & WhatsApp</p>
                </Link>

                <Link
                  href="/operator/referral-network"
                  className="border border-[#E8E8E8] rounded-lg p-6 hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-colors text-center"
                >
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-1">Referrals</p>
                  <p className="text-xs text-[#888888]">Manage partners</p>
                </Link>
              </div>
            </div>

          </>
        )}
      </div>

      {/* MODAL OVERLAYS */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#0D0D0D]">
                {activeModal === "whatsapp" && "WhatsApp Activity"}
                {activeModal === "email" && "Email Campaign"}
                {activeModal === "phone" && "Phone Outreach Queue"}
                {activeModal === "drivers" && "Driver Management"}
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                className="text-[#888888] hover:text-[#0D0D0D] text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* WhatsApp Modal */}
            {activeModal === "whatsapp" && (
              <div className="space-y-4">
                <div className="border-b border-[#E8E8E8] pb-4">
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-2">Active Conversations</p>
                  <p className="text-3xl font-black text-[#0D0D0D]">{data.operation.whatsapp.active}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-2">Replied Today</p>
                  <p className="text-3xl font-black text-[#0D0D0D]">{data.operation.whatsapp.replied}</p>
                </div>
                <p className="text-xs text-[#666666] mt-6">Detailed conversation list and engagement metrics would appear here.</p>
              </div>
            )}

            {/* Email Modal */}
            {activeModal === "email" && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="border-b border-[#E8E8E8] pb-4">
                    <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">Sent</p>
                    <p className="text-3xl font-black text-[#0D0D0D]">{data.operation.email.sent}</p>
                  </div>
                  <div className="border-b border-[#E8E8E8] pb-4">
                    <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">Opened</p>
                    <p className="text-3xl font-black text-[#0D0D0D]">
                      {data.operation.email.sent > 0
                        ? Math.round((data.operation.email.opened / data.operation.email.sent) * 100)
                        : 0}%
                    </p>
                  </div>
                  <div className="border-b border-[#E8E8E8] pb-4">
                    <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">Clicked</p>
                    <p className="text-3xl font-black text-[#0D0D0D]">
                      {data.operation.email.sent > 0
                        ? Math.round((data.operation.email.clicked / data.operation.email.sent) * 100)
                        : 0}%
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[#666666]">Campaign details and recipient list would appear here.</p>
              </div>
            )}

            {/* Phone Modal */}
            {activeModal === "phone" && (
              <div className="space-y-4">
                <div className="border-b border-[#E8E8E8] pb-4">
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-2">No Email</p>
                  <p className="text-3xl font-black text-[#0D0D0D]">{data.operation.phone.readyToCall}</p>
                </div>
                <p className="text-xs text-[#666666]">These prospects need to be contacted via phone. List of prospects and their details would appear here.</p>
              </div>
            )}

            {/* Drivers Modal */}
            {activeModal === "drivers" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 border-b border-[#E8E8E8] pb-6">
                  <div>
                    <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">Available</p>
                    <p className="text-3xl font-black text-[#0D0D0D]">{data.operation.drivers.available}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">Revenue Today</p>
                    <p className="text-3xl font-black text-[#0D0D0D]">{data.operation.drivers.revenue}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#0D0D0D] mb-4">Quick Assign Job</h3>
                  <form className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-[#0D0D0D] block mb-1">Driver</label>
                      <select
                        value={assignForm.driver_id}
                        onChange={(e) => setAssignForm({ ...assignForm, driver_id: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-[#E8E8E8] rounded"
                      >
                        <option value="">Select driver</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#0D0D0D] block mb-1">Prospect</label>
                      <input
                        type="text"
                        placeholder="Name"
                        value={assignForm.prospect_name}
                        onChange={(e) => setAssignForm({ ...assignForm, prospect_name: e.target.value })}
                        className="w-full text-xs px-3 py-2 border border-[#E8E8E8] rounded"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="From"
                        value={assignForm.postcode_from}
                        onChange={(e) => setAssignForm({ ...assignForm, postcode_from: e.target.value })}
                        className="text-xs px-3 py-2 border border-[#E8E8E8] rounded"
                      />
                      <input
                        type="text"
                        placeholder="To"
                        value={assignForm.postcode_to}
                        onChange={(e) => setAssignForm({ ...assignForm, postcode_to: e.target.value })}
                        className="text-xs px-3 py-2 border border-[#E8E8E8] rounded"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#0D0D0D] text-white text-xs font-semibold px-3 py-2 rounded hover:bg-[#333333]"
                    >
                      Assign
                    </button>
                  </form>
                </div>

                <p className="text-xs text-[#666666]">Full driver list, current jobs, and performance metrics would appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
