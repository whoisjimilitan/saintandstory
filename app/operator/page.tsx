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
  phone: {
    readyToCall: number;
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

export default function TodayPage() {
  const router = useRouter();
  const [data, setData] = useState<TodayData>({
    operation: {
      whatsapp: { active: 0, replied: 0 },
      email: { sent: 0, opened: 0, clicked: 0, replied: 0 },
      phone: { readyToCall: 0 },
      drivers: { available: 0, revenue: "£0" },
    },
    opportunitiesQueued: 0,
    pendingReplies: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<"drivers" | null>(null);
  const [assignForm, setAssignForm] = useState({
    driver_id: "",
    prospect_name: "",
    postcode_from: "",
  });

  useEffect(() => {
    const loadTodayData = async () => {
      try {
        const [campaignRes, opportunitiesRes, driverRes, phoneRes, whatsappRes, repliesRes] = await Promise.all([
          fetch("/api/operator/today-campaign-stats"),
          fetch("/api/operator/opportunities-waiting"),
          fetch("/api/operator/today-driver-stats"),
          fetch("/api/operator/today-phone-stats"),
          fetch("/api/operator/today-whatsapp-stats"),
          fetch("/api/operator/today-pending-replies"),
        ]);

        const campaign = campaignRes.ok ? await campaignRes.json() : { stats: { sent: 0, opened: 0, clicked: 0, replied: 0 } };
        const opportunities = opportunitiesRes.ok ? await opportunitiesRes.json() : { count: 0 };
        const driverData = driverRes.ok ? await driverRes.json() : { available: 0, revenue: "£0" };
        const phoneData = phoneRes.ok ? await phoneRes.json() : { count: 0 };
        const whatsappData = whatsappRes.ok ? await whatsappRes.json() : { active: 0, replied: 0 };
        const repliesData = repliesRes.ok ? await repliesRes.json() : { count: 0 };

        setData({
          operation: {
            whatsapp: { active: whatsappData.active || 0, replied: whatsappData.replied || 0 },
            email: campaign.stats || { sent: 0, opened: 0, clicked: 0, replied: 0 },
            phone: { readyToCall: phoneData.count || 0 },
            drivers: { available: driverData.available || 0, revenue: driverData.revenue || "£0" },
          },
          opportunitiesQueued: opportunities.count || 0,
          pendingReplies: repliesData.count || 0,
        });
      } catch (error) {
        console.error("[TODAY] Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTodayData();
    const interval = setInterval(loadTodayData, 60000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date();
  const dayName = today.toLocaleDateString("en-UK", { weekday: "long" });
  const dateNum = today.getDate();
  const monthShort = today.toLocaleDateString("en-UK", { month: "short" });
  const year = today.getFullYear();
  const dateStr = `${String(dateNum).padStart(2, "0")}.${monthShort.toUpperCase()}.${year}`;

  const openRate = data.operation.email.sent > 0 ? Math.round((data.operation.email.opened / data.operation.email.sent) * 100) : 0;
  const clickRate = data.operation.email.sent > 0 ? Math.round((data.operation.email.clicked / data.operation.email.sent) * 100) : 0;

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4 md:px-8">

        {/* HEADER */}
        <div className="mb-16">
          <h1 className="text-5xl font-black text-[#0D0D0D] mb-2 tracking-tight">Today</h1>
          <p className="text-sm text-[#999999]">{dayName} • {dateStr}</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-[#666666]">Loading your day...</p>
          </div>
        ) : (
          <>
            {/* PRIMARY ACTION - Hero Section */}
            <div className="mb-20">
              <div>
                {data.pendingReplies > 0 ? (
                  <div className="border-2 border-[#0D0D0D] rounded-lg p-10 bg-[#F9F9F9] hover:bg-white transition-colors">
                    <h2 className="text-4xl font-black text-[#0D0D0D] mb-3">{data.pendingReplies} replies waiting</h2>
                    <p className="text-sm text-[#666666] mb-8 max-w-2xl">Prospects have replied to your emails. These are hot leads ready for qualification.</p>
                    <Link
                      href="/operator/responses"
                      className="inline-block px-8 py-4 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#2d2d2d] active:bg-[#0D0D0D] transition-all duration-150"
                    >
                      Review Replies →
                    </Link>
                  </div>
                ) : data.opportunitiesQueued > 0 ? (
                  <div className="border-2 border-[#0D0D0D] rounded-lg p-10 bg-[#F9F9F9] hover:bg-white transition-colors">
                    <h2 className="text-4xl font-black text-[#0D0D0D] mb-3">{data.opportunitiesQueued} prospects ready</h2>
                    <p className="text-sm text-[#666666] mb-8 max-w-2xl">Your CSV is processed. Send personalized emails now.</p>
                    <Link
                      href="/operator/enrich?source=queue"
                      className="inline-block px-8 py-4 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#2d2d2d] active:bg-[#0D0D0D] transition-all duration-150"
                    >
                      Send Opportunities →
                    </Link>
                  </div>
                ) : data.operation.email.sent > 0 ? (
                  <div className="border-2 border-[#0D0D0D] rounded-lg p-10 bg-[#F9F9F9] hover:bg-white transition-colors">
                    <h2 className="text-4xl font-black text-[#0D0D0D] mb-3">Campaign running</h2>
                    <p className="text-sm text-[#666666] mb-8 max-w-2xl">{data.operation.email.sent} emails sent • {openRate}% opened • {clickRate}% clicked</p>
                    <Link
                      href="/operator/reach"
                      className="inline-block px-8 py-4 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#2d2d2d] active:bg-[#0D0D0D] transition-all duration-150"
                    >
                      Monitor Progress →
                    </Link>
                  </div>
                ) : (
                  <div className="border-2 border-[#E8E8E8] rounded-lg p-10 bg-[#F9F9F9]">
                    <h2 className="text-4xl font-black text-[#0D0D0D] mb-3">Ready to send</h2>
                    <p className="text-sm text-[#666666] mb-8 max-w-2xl">Upload a CSV to begin discovering prospects and sending campaigns.</p>
                    <Link
                      href="/operator/discover"
                      className="inline-block px-8 py-4 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#2d2d2d] active:bg-[#0D0D0D] transition-all duration-150"
                    >
                      Go to Discover →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* CAMPAIGN HEALTH */}
            <div className="mb-20">
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-8">Campaign performance</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-[#E8E8E8] rounded-lg p-8 bg-white hover:border-[#0D0D0D] transition-colors">
                  <p className="text-xs text-[#999999] uppercase tracking-widest mb-4">Emails sent</p>
                  <p className="text-4xl font-black text-[#0D0D0D] mb-2">{data.operation.email.sent}</p>
                  <p className="text-sm text-[#666666]">today</p>
                </div>

                <div className="border border-[#E8E8E8] rounded-lg p-8 bg-white hover:border-[#0D0D0D] transition-colors">
                  <p className="text-xs text-[#999999] uppercase tracking-widest mb-4">Open rate</p>
                  <p className="text-4xl font-black text-[#0D0D0D] mb-2">{openRate}%</p>
                  <p className="text-sm text-[#666666]">{data.operation.email.opened} emails opened</p>
                </div>

                <div className="border border-[#E8E8E8] rounded-lg p-8 bg-white hover:border-[#0D0D0D] transition-colors">
                  <p className="text-xs text-[#999999] uppercase tracking-widest mb-4">Click rate</p>
                  <p className="text-4xl font-black text-[#0D0D0D] mb-2">{clickRate}%</p>
                  <p className="text-sm text-[#666666]">{data.operation.email.clicked} emails clicked</p>
                </div>

                <div className="border border-[#E8E8E8] rounded-lg p-8 bg-white hover:border-[#0D0D0D] transition-colors">
                  <p className="text-xs text-[#999999] uppercase tracking-widest mb-4">Replies</p>
                  <p className="text-4xl font-black text-[#0D0D0D] mb-2">{data.operation.email.replied}</p>
                  <p className="text-sm text-[#666666]">responses received</p>
                </div>
              </div>
            </div>

            {/* DRIVER MANAGEMENT */}
            <div className="mb-20">
              <div className="flex items-center justify-between mb-8">
                <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest">Drivers</p>
                <button
                  onClick={() => setActiveModal("drivers")}
                  className="text-xs font-semibold text-[#0D0D0D] hover:text-[#666666] transition-colors"
                >
                  + Assign job
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-[#E8E8E8] rounded-lg p-8 bg-white hover:border-[#0D0D0D] transition-colors">
                  <p className="text-xs text-[#999999] uppercase tracking-widest mb-4">Available</p>
                  <p className="text-4xl font-black text-[#0D0D0D] mb-2">{data.operation.drivers.available}</p>
                  <p className="text-sm text-[#666666]">drivers on duty</p>
                </div>

                <div className="border border-[#E8E8E8] rounded-lg p-8 bg-white hover:border-[#0D0D0D] transition-colors">
                  <p className="text-xs text-[#999999] uppercase tracking-widest mb-4">Revenue</p>
                  <p className="text-4xl font-black text-[#0D0D0D] mb-2">{data.operation.drivers.revenue}</p>
                  <p className="text-sm text-[#666666]">earned today</p>
                </div>
              </div>
            </div>

            {/* SECONDARY CHANNELS - Subtle */}
            {(data.operation.whatsapp.active > 0 || data.operation.phone.readyToCall > 0) && (
              <div className="pt-16 border-t border-[#E8E8E8]">
                <p className="text-xs font-semibold text-[#999999] uppercase tracking-widest mb-8">Other channels</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.operation.whatsapp.active > 0 && (
                    <div className="border border-[#E8E8E8] rounded-lg p-6 bg-[#F9F9F9]">
                      <p className="text-xs text-[#999999] uppercase tracking-widest mb-3">WhatsApp</p>
                      <p className="text-2xl font-black text-[#0D0D0D] mb-1">{data.operation.whatsapp.active}</p>
                      <p className="text-xs text-[#999999]">active conversations</p>
                      <p className="text-xs text-[#999999] mt-2">{data.operation.whatsapp.replied} replied</p>
                    </div>
                  )}

                  {data.operation.phone.readyToCall > 0 && (
                    <div className="border border-[#E8E8E8] rounded-lg p-6 bg-[#F9F9F9]">
                      <p className="text-xs text-[#999999] uppercase tracking-widest mb-3">Phone</p>
                      <p className="text-2xl font-black text-[#0D0D0D] mb-1">{data.operation.phone.readyToCall}</p>
                      <p className="text-xs text-[#999999]">prospects to call</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* NAVIGATION - Bottom */}
            <div className="mt-24 pt-16 border-t border-[#E8E8E8]">
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-8">Next step</p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Link
                  href="/operator/discover"
                  className="border border-[#E8E8E8] rounded-lg p-6 hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-colors text-center group"
                >
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-1 group-hover:text-[#0D0D0D]">Discover</p>
                  <p className="text-xs text-[#999999]">Find prospects</p>
                </Link>

                <Link
                  href="/operator/enrich"
                  className="border border-[#E8E8E8] rounded-lg p-6 hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-colors text-center group"
                >
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-1 group-hover:text-[#0D0D0D]">Enrich</p>
                  <p className="text-xs text-[#999999]">Generate & send</p>
                </Link>

                <Link
                  href="/operator/reach"
                  className="border border-[#E8E8E8] rounded-lg p-6 hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-colors text-center group"
                >
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-1 group-hover:text-[#0D0D0D]">Monitor</p>
                  <p className="text-xs text-[#999999]">Track campaigns</p>
                </Link>

                <Link
                  href="/operator/responses"
                  className="border border-[#E8E8E8] rounded-lg p-6 hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-colors text-center group"
                >
                  <p className="text-sm font-semibold text-[#0D0D0D] mb-1 group-hover:text-[#0D0D0D]">Responses</p>
                  <p className="text-xs text-[#999999]">Manage replies</p>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* DRIVER ASSIGNMENT MODAL - Streamlined */}
      {activeModal === "drivers" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-xl w-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-[#0D0D0D]">Assign job</h2>
              <button
                onClick={() => setActiveModal(null)}
                className="text-[#999999] hover:text-[#0D0D0D] text-2xl leading-none transition-colors"
              >
                ×
              </button>
            </div>

            <form className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-[#0D0D0D] block mb-3">Driver</label>
                <select
                  value={assignForm.driver_id}
                  onChange={(e) => setAssignForm({ ...assignForm, driver_id: e.target.value })}
                  className="w-full text-sm px-4 py-3 border border-[#E8E8E8] rounded-lg focus:border-[#0D0D0D] focus:outline-none bg-white"
                >
                  <option value="">Select a driver</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0D0D0D] block mb-3">Prospect or company name</label>
                <input
                  type="text"
                  placeholder="e.g. Smith & Co"
                  value={assignForm.prospect_name}
                  onChange={(e) => setAssignForm({ ...assignForm, prospect_name: e.target.value })}
                  className="w-full text-sm px-4 py-3 border border-[#E8E8E8] rounded-lg focus:border-[#0D0D0D] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0D0D0D] block mb-3">Collection postcode</label>
                <input
                  type="text"
                  placeholder="e.g. SW1A 1AA"
                  value={assignForm.postcode_from}
                  onChange={(e) => setAssignForm({ ...assignForm, postcode_from: e.target.value })}
                  className="w-full text-sm px-4 py-3 border border-[#E8E8E8] rounded-lg focus:border-[#0D0D0D] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0D0D0D] text-white text-sm font-semibold px-6 py-4 rounded-lg hover:bg-[#2d2d2d] active:bg-[#0D0D0D] transition-all duration-150 mt-8"
              >
                Assign job
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
