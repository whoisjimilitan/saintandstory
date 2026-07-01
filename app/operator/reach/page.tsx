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
      } catch (error) {
        console.error("[REACH] Failed to fetch campaigns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
    // Refresh every 30 seconds for live updates
    const interval = setInterval(fetchCampaigns, 30000);
    return () => clearInterval(interval);
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

  // Calculate aggregate stats
  let stats = { active: 0, hot: 0, total: 0 };

  if (activeTab === "email") {
    stats = {
      total: activeCampaigns.reduce((sum, c) => sum + c.totalLeads, 0),
      active: activeCampaigns.reduce((sum, c) => sum + (c.emailStats?.sent || 0), 0),
      hot: activeCampaigns.reduce((sum, c) => sum + (c.emailStats?.replied || 0), 0),
    };
  } else {
    const whatsappConversations = conversations.filter(c => c.status === "active");
    stats = {
      total: whatsappConversations.length,
      active: whatsappConversations.length,
      hot: whatsappConversations.filter(c => c.messages.length > 5).length,
    };
  }

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-[#0D0D0D] mb-3 tracking-tight leading-tight">
            Reach
          </h1>
          <p className="text-base text-[#666666] leading-relaxed max-w-3xl font-normal">
            Monitor campaign performance live. Track sends, opens, and replies across all channels.
          </p>
        </div>

        {/* Channel Tabs */}
        <div className="mb-16 pb-6 border-b border-[#E8E8E8]">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("email")}
              className={`pb-3 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === "email"
                  ? "text-[#0D0D0D] border-[#0D0D0D]"
                  : "text-[#888888] border-transparent hover:text-[#0D0D0D]"
              }`}
            >
              Email Campaigns
            </button>
            <button
              onClick={() => setActiveTab("whatsapp")}
              className={`pb-3 border-b-2 font-semibold text-sm transition-colors ${
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
          <div className="grid grid-cols-3 gap-12">
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
                {activeCampaigns.map(campaign => (
                  <div key={campaign.id} className="rounded-lg p-4 bg-white border border-[#E8E8E8] hover:bg-[#F9F9F9] transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[#0D0D0D]">{campaign.campaignName}</p>
                        <p className="text-xs text-[#888888] mt-1">
                          {new Date(campaign.sentAt).toLocaleDateString()} • {campaign.totalLeads} leads
                        </p>
                      </div>
                      <div className="flex gap-4 text-right flex-shrink-0">
                        <div>
                          <p className="text-lg font-black text-[#0D0D0D]">{campaign.emailStats?.sent || 0}</p>
                          <p className="text-xs text-[#888888]">sent</p>
                        </div>
                        <div>
                          <p className="text-lg font-black text-[#0D0D0D]">{campaign.emailStats?.opened || 0}</p>
                          <p className="text-xs text-[#888888]">opened</p>
                        </div>
                        <div>
                          <p className="text-lg font-black text-[#0D0D0D]">{campaign.emailStats?.replied || 0}</p>
                          <p className="text-xs text-[#888888]">replied</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
