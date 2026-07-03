"use client";

import { useEffect, useState } from "react";
import { getAllConversations, createConversation } from "@/lib/whatsapp-conversation";

interface Campaign {
  id: string;
  campaignName: string;
  channel: string;
  totalLeads: number;
  sentAt: string;
  status: string;
  emailStats?: {
    sent: number;
    opened: number;
    replied: number;
  };
  whatsappStats?: {
    sent: number;
    delivered: number;
    replied: number;
  };
}

export default function ReachPage() {
  const [activeTab, setActiveTab] = useState<"email" | "whatsapp">("email");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState(getAllConversations());
  const [showNewConversationForm, setShowNewConversationForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Fetch campaigns on mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/b2b/campaigns/list");
        if (!res.ok) throw new Error("Failed to fetch campaigns");

        const data = await res.json();
        setCampaigns(data.campaigns || []);
        console.log("[REACH] Loaded campaigns:", data.campaigns?.length);

        // Debug: log each campaign's stats
        data.campaigns?.forEach((c: Campaign) => {
          console.log(`[REACH] Campaign "${c.campaignName}":`, {
            totalLeads: c.totalLeads,
            emailStats: c.emailStats,
            whatsappStats: c.whatsappStats,
          });
        });
      } catch (error) {
        console.error("[REACH] Failed to fetch campaigns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
    // No auto-refresh - use manual "Refresh Now" button only
    // Auto-polling causes visible flashing and poor UX
    return () => {};
  }, []);

  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || !businessName.trim()) return;

    setIsCreating(true);
    try {
      const newConversation = createConversation(phoneNumber, businessName);
      setConversations([newConversation, ...conversations]);
      setPhoneNumber("");
      setBusinessName("");
      setShowNewConversationForm(false);
    } finally {
      setIsCreating(false);
    }
  };

  // Filter campaigns by active tab
  const activeCampaigns = campaigns.filter(c => c.channel === activeTab);

  console.log("[REACH RENDER] activeTab:", activeTab, "activeCampaigns:", activeCampaigns.length);
  activeCampaigns.forEach(c => {
    console.log(`[REACH RENDER]   - "${c.campaignName}": sent=${c.emailStats?.sent}, opened=${c.emailStats?.opened}`);
  });

  // Calculate aggregate stats
  let stats = { active: 0, hot: 0, total: 0 };

  if (activeTab === "email") {
    stats = {
      total: activeCampaigns.reduce((sum, c) => sum + c.totalLeads, 0),
      active: activeCampaigns.reduce((sum, c) => sum + (c.emailStats?.sent || 0), 0),
      hot: activeCampaigns.reduce((sum, c) => sum + (c.emailStats?.replied || 0), 0),
    };
    console.log("[REACH RENDER] Calculated stats:", stats);
  } else {
    const whatsappConversations = conversations.filter(c => c.status === "active");
    stats = {
      total: whatsappConversations.length,
      active: whatsappConversations.length,
      hot: whatsappConversations.filter(c => c.messages.length > 5).length,
    };
  }

  return (
    <div className="min-h-screen bg-white pt-16 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-12 flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#0D0D0D] mb-2 tracking-tight leading-tight">
              Reach
            </h1>
            <p className="text-sm text-[#666666] leading-relaxed max-w-2xl font-normal">
              Track campaign performance across email and WhatsApp.
            </p>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              fetch("/api/b2b/campaigns/list")
                .then(res => res.json())
                .then(data => {
                  console.log("[REACH REFRESH] Got campaigns:", data.campaigns?.length);
                  data.campaigns?.forEach((c: Campaign) => {
                    console.log(`[REACH REFRESH] "${c.campaignName}" - channel: ${c.channel}, sent: ${c.emailStats?.sent}`);
                  });
                  setCampaigns(data.campaigns || []);
                  setLoading(false);
                })
                .catch((err) => {
                  console.error("[REACH REFRESH] Error:", err);
                  setLoading(false);
                });
            }}
            className="px-4 py-2 border border-[#E8E8E8] rounded text-xs font-semibold text-[#0D0D0D] hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-colors flex-shrink-0"
          >
            Refresh Now
          </button>
        </div>

        {/* Channel Tabs */}
        <div className="mb-16 pb-6 border-b border-[#E8E8E8]">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("email")}
              className={`pb-3 border-b-2 font-semibold text-sm transition-colors duration-200 ${
                activeTab === "email"
                  ? "text-[#0D0D0D] border-[#0D0D0D]"
                  : "text-[#888888] border-transparent hover:text-[#0D0D0D]"
              }`}
            >
              Email Campaigns
            </button>
            <button
              onClick={() => setActiveTab("whatsapp")}
              className={`pb-3 border-b-2 font-semibold text-sm transition-colors duration-200 ${
                activeTab === "whatsapp"
                  ? "text-[#0D0D0D] border-[#0D0D0D]"
                  : "text-[#888888] border-transparent hover:text-[#0D0D0D]"
              }`}
            >
              WhatsApp Conversations
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-16 pb-12 border-b border-[#E8E8E8]">
          <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">
            Summary
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div>
              <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">{activeTab === "email" ? "Sent" : "Active"}</p>
              <p className="text-3xl font-black text-[#0D0D0D]">{stats.active}</p>
            </div>
            <div>
              <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">{activeTab === "email" ? "Replied" : "Hot"}</p>
              <p className="text-3xl font-black text-[#0D0D0D]">{stats.hot}</p>
            </div>
            <div>
              <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">Total</p>
              <p className="text-3xl font-black text-[#0D0D0D]">{stats.total}</p>
            </div>
          </div>
        </div>

        {/* Email Campaigns */}
        {activeTab === "email" && (
          <div>
            <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">
              Campaigns
            </p>
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-[#666666]">Loading campaigns...</p>
              </div>
            ) : activeCampaigns.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-[#666666]">No email campaigns yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeCampaigns.map(campaign => {
                  // Fallback: if emailStats missing, calculate from the API response data
                  // (this shouldn't happen if backend is working, but good defensive programming)
                  const emailStats = campaign.emailStats || {
                    sent: 0,
                    opened: 0,
                    replied: 0,
                  };

                  return (
                  <div key={campaign.id} className="rounded-lg p-4 bg-white border border-[#E8E8E8] hover:bg-[#F9F9F9] transition-colors duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#0D0D0D]">{campaign.campaignName}</p>
                        <p className="text-xs text-[#888888] mt-1">
                          {new Date(campaign.sentAt).toLocaleDateString()} • {campaign.totalLeads} leads
                        </p>
                      </div>
                      <div className="flex gap-4 text-right flex-shrink-0">
                        <div>
                          <p className="text-lg font-black text-[#0D0D0D]">{emailStats.sent}</p>
                          <p className="text-xs text-[#888888]">sent</p>
                        </div>
                        <div>
                          <p className="text-lg font-black text-[#0D0D0D]">{emailStats.opened}</p>
                          <p className="text-xs text-[#888888]">opened</p>
                        </div>
                        <div>
                          <p className="text-lg font-black text-[#0D0D0D]">{emailStats.replied}</p>
                          <p className="text-xs text-[#888888]">replied</p>
                        </div>
                        <button
                          onClick={async () => {
                            if (!confirm(`Delete "${campaign.campaignName}"? This cannot be undone.`)) return;
                            try {
                              const res = await fetch("/api/b2b/campaigns/delete", {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ campaignId: campaign.id }),
                              });
                              if (!res.ok) throw new Error("Failed to delete");
                              setCampaigns(campaigns.filter(c => c.id !== campaign.id));
                            } catch (error) {
                              alert(`Error deleting campaign: ${error instanceof Error ? error.message : "Unknown error"}`);
                            }
                          }}
                          className="text-[#888888] hover:text-[#D32F2F] transition-colors"
                          title="Delete campaign"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* WhatsApp Conversations */}
        {activeTab === "whatsapp" && (
          <div>
            <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">
              Conversations
            </p>
            {showNewConversationForm && (
              <form onSubmit={handleCreateConversation} className="mb-8 rounded-lg p-6 bg-[#F9F9F9]">
                <h3 className="font-bold text-[#0D0D0D] mb-4">Start Conversation</h3>
                <div className="space-y-3">
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8E8E8] rounded text-sm focus:outline-none focus:border-[#0D0D0D]"
                  />
                  <input
                    type="text"
                    placeholder="Business name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E8E8E8] rounded text-sm focus:outline-none focus:border-[#0D0D0D]"
                  />
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="w-full px-4 py-2 bg-[#0D0D0D] text-white rounded text-sm font-semibold hover:bg-[#333333] disabled:opacity-50"
                  >
                    {isCreating ? "Creating..." : "Start"}
                  </button>
                </div>
              </form>
            )}

            {conversations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-[#666666] mb-4">No conversations yet</p>
                <button
                  onClick={() => setShowNewConversationForm(!showNewConversationForm)}
                  className="px-4 py-2 bg-[#0D0D0D] text-white rounded text-sm font-semibold hover:bg-[#333333]"
                >
                  + Start Conversation
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {conversations.map(conversation => (
                  <div key={conversation.id} className="rounded-lg p-4 bg-white border border-[#E8E8E8] hover:bg-[#F9F9F9] transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#0D0D0D]">{conversation.businessName}</p>
                        <p className="text-xs text-[#888888] mt-1">{conversation.phoneNumber}</p>
                      </div>
                      <p className="text-xs text-[#0D0D0D] font-semibold">{conversation.messages.length} messages</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
