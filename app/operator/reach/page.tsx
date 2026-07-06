"use client";

import { useEffect, useState } from "react";

interface WhatsAppCampaign {
  id: string;
  campaignName: string;
  sentAt: string;
  totalLeads: number;
  sent: number;
  delivered: number;
  replied: number;
}

interface Message {
  id: string;
  body: string;
  direction: "inbound" | "outbound";
  status: "sent" | "delivered" | "read";
  createdAt: string;
}

interface Conversation {
  id: string;
  prospectName: string;
  phoneNumber: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

interface EmailCampaign {
  id: string;
  campaignName: string;
  totalLeads: number;
  sent: number;
  opened: number;
  replied: number;
  sentAt: string;
}

export default function ReachPage() {
  const [activeTab, setActiveTab] = useState<"email" | "whatsapp">("email");
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);
  const [whatsappCampaigns, setWhatsappCampaigns] = useState<WhatsAppCampaign[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showStartChat, setShowStartChat] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [newChatPhone, setNewChatPhone] = useState("");
  const [newChatName, setNewChatName] = useState("");
  const [showEmailHistory, setShowEmailHistory] = useState(false);
  const [showWhatsappHistory, setShowWhatsappHistory] = useState(false);

  // Filter campaigns by 24-hour window
  const filterCampaignsByWindow = (campaigns: any[], now = new Date()) => {
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const today = campaigns.filter((c) => new Date(c.sentAt) >= oneDayAgo);
    const history = campaigns.filter((c) => new Date(c.sentAt) < oneDayAgo);
    return { today, history };
  };

  const emailByWindow = filterCampaignsByWindow(emailCampaigns);
  const whatsappByWindow = filterCampaignsByWindow(whatsappCampaigns);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds for live updates (reduced from 5s to prevent flashing)
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [emailRes, whatsappRes, convoRes] = await Promise.all([
        fetch("/api/b2b/campaigns/list"),
        fetch("/api/operator/whatsapp-campaigns"),
        fetch("/api/operator/whatsapp/conversations"),
      ]);

      if (emailRes.ok) {
        const data = await emailRes.json();
        setEmailCampaigns(
          data.campaigns?.filter((c: any) => c.channel === "email") || []
        );
      }

      if (whatsappRes.ok) {
        const data = await whatsappRes.json();
        setWhatsappCampaigns(data.campaigns || []);
      }

      if (convoRes.ok) {
        const data = await convoRes.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("[REACH] Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedConversation || !replyText.trim()) return;

    setSendingReply(true);
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          phoneNumber: selectedConversation.phoneNumber,
          message: replyText,
          businessName: selectedConversation.prospectName,
        }),
      });

      if (res.ok) {
        // Add message to conversation locally
        const newMessage: Message = {
          id: Date.now().toString(),
          body: replyText,
          direction: "outbound",
          status: "delivered",
          createdAt: new Date().toISOString(),
        };

        setSelectedConversation({
          ...selectedConversation,
          messages: [...selectedConversation.messages, newMessage],
        });

        setReplyText("");
      }
    } catch (error) {
      console.error("[REACH] Error sending reply:", error);
    } finally {
      setSendingReply(false);
    }
  };

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatPhone.trim() || !newChatName.trim()) return;

    try {
      const res = await fetch("/api/operator/whatsapp/start-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: newChatPhone,
          prospectName: newChatName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setConversations([data.conversation, ...conversations]);
        setNewChatPhone("");
        setNewChatName("");
        setShowStartChat(false);
      }
    } catch (error) {
      console.error("[REACH] Error starting chat:", error);
    }
  };

  const emailStats = emailByWindow.today.reduce(
    (acc, c) => ({
      total: acc.total + (c.sent || 0),
      opened: acc.opened + (c.opened || 0),
      replied: acc.replied + (c.replied || 0),
    }),
    { total: 0, opened: 0, replied: 0 }
  );

  const whatsappStats = whatsappByWindow.today.reduce(
    (acc, c) => ({
      total: acc.total + (c.sent || 0),
      delivered: acc.delivered + (c.delivered || 0),
      replied: acc.replied + (c.replied || 0),
    }),
    { total: 0, delivered: 0, replied: 0 }
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-[#666666]">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-16 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-[#0D0D0D] mb-2 tracking-tight leading-tight">
            Reach
          </h1>
          <p className="text-sm text-[#666666]">
            Manage email and WhatsApp campaigns
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-12 flex gap-8 border-b border-[#E8E8E8] pb-4">
          <button
            onClick={() => setActiveTab("email")}
            className={`text-sm font-semibold pb-3 transition-colors ${
              activeTab === "email"
                ? "text-[#0D0D0D] border-b-2 border-[#0D0D0D]"
                : "text-[#888888]"
            }`}
          >
            Email Campaigns
          </button>
          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`text-sm font-semibold pb-3 transition-colors ${
              activeTab === "whatsapp"
                ? "text-[#0D0D0D] border-b-2 border-[#0D0D0D]"
                : "text-[#888888]"
            }`}
          >
            WhatsApp Campaigns
          </button>
        </div>

        {/* EMAIL TAB */}
        {activeTab === "email" && (
          <div>
            {/* Stats */}
            <div className="mb-12 pb-8 border-b border-[#E8E8E8]">
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">
                Summary
              </p>
              <div className="grid grid-cols-3 gap-12">
                <div>
                  <p className="text-xs text-[#888888] mb-2">Sent</p>
                  <p className="text-3xl font-black text-[#0D0D0D]">{emailStats.total}</p>
                </div>
                <div>
                  <p className="text-xs text-[#888888] mb-2">Opened</p>
                  <p className="text-3xl font-black text-[#0D0D0D]">{emailStats.opened}</p>
                </div>
                <div>
                  <p className="text-xs text-[#888888] mb-2">Replied</p>
                  <p className="text-3xl font-black text-[#0D0D0D]">{emailStats.replied}</p>
                </div>
              </div>
            </div>

            {/* Today's Campaigns */}
            <div className="mb-8">
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">
                Today
              </p>
              {emailByWindow.today.length === 0 ? (
                <p className="text-sm text-[#666666]">No campaigns sent today</p>
              ) : (
                <div className="space-y-3">
                  {emailByWindow.today.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="border border-[#E8E8E8] rounded-lg p-4 hover:bg-[#F9F9F9] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#0D0D0D]">
                            {campaign.campaignName}
                          </p>
                          <p className="text-xs text-[#888888] mt-1">
                            {campaign.totalLeads} leads •{" "}
                            {new Date(campaign.sentAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-6 text-right">
                          <div>
                            <p className="text-xs text-[#888888]">Sent</p>
                            <p className="text-sm font-semibold text-[#0D0D0D]">
                              {campaign.sent}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#888888]">Opened</p>
                            <p className="text-sm font-semibold text-[#0D0D0D]">
                              {campaign.opened}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#888888]">Replied</p>
                            <p className="text-sm font-semibold text-[#0D0D0D]">
                              {campaign.replied}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* History Section */}
            {emailByWindow.history.length > 0 && (
              <div>
                <button
                  onClick={() => setShowEmailHistory(!showEmailHistory)}
                  className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6 hover:text-[#666666] transition-colors flex items-center gap-2"
                >
                  {showEmailHistory ? "▼" : "▶"} History ({emailByWindow.history.length})
                </button>

                {showEmailHistory && (
                  <div className="space-y-3">
                    {emailByWindow.history.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="border border-[#E8E8E8] rounded-lg p-4 hover:bg-[#F9F9F9] transition-colors opacity-75"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-[#0D0D0D]">
                              {campaign.campaignName}
                            </p>
                            <p className="text-xs text-[#888888] mt-1">
                              {campaign.totalLeads} leads •{" "}
                              {new Date(campaign.sentAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-6 text-right">
                            <div>
                              <p className="text-xs text-[#888888]">Sent</p>
                              <p className="text-sm font-semibold text-[#0D0D0D]">
                                {campaign.sent}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#888888]">Opened</p>
                              <p className="text-sm font-semibold text-[#0D0D0D]">
                                {campaign.opened}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#888888]">Replied</p>
                              <p className="text-sm font-semibold text-[#0D0D0D]">
                                {campaign.replied}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* WHATSAPP TAB */}
        {activeTab === "whatsapp" && (
          <div className="grid grid-cols-3 gap-8">
            {/* Left: Campaigns & Conversations */}
            <div className="col-span-2 space-y-8">
              {/* Stats */}
              <div className="pb-8 border-b border-[#E8E8E8]">
                <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">
                  Summary
                </p>
                <div className="grid grid-cols-3 gap-12">
                  <div>
                    <p className="text-xs text-[#888888] mb-2">Sent</p>
                    <p className="text-3xl font-black text-[#0D0D0D]">
                      {whatsappStats.total}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#888888] mb-2">Delivered</p>
                    <p className="text-3xl font-black text-[#0D0D0D]">
                      {whatsappStats.delivered}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#888888] mb-2">Replied</p>
                    <p className="text-3xl font-black text-[#0D0D0D]">
                      {whatsappStats.replied}
                    </p>
                  </div>
                </div>
              </div>

              {/* Today's Bulk Campaigns */}
              {whatsappByWindow.today.length > 0 && (
                <div className="mb-8">
                  <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">
                    Today
                  </p>
                  <div className="space-y-3">
                    {whatsappByWindow.today.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="border border-[#E8E8E8] rounded-lg p-4 hover:bg-[#F9F9F9] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-[#0D0D0D]">
                              {campaign.campaignName}
                            </p>
                            <p className="text-xs text-[#888888] mt-1">
                              {campaign.totalLeads} leads •{" "}
                              {new Date(campaign.sentAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-6 text-right">
                            <div>
                              <p className="text-xs text-[#888888]">Sent</p>
                              <p className="text-sm font-semibold text-[#0D0D0D]">
                                {campaign.sent}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#888888]">Delivered</p>
                              <p className="text-sm font-semibold text-[#0D0D0D]">
                                {campaign.delivered}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#888888]">Replied</p>
                              <p className="text-sm font-semibold text-[#0D0D0D]">
                                {campaign.replied}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* WhatsApp History Section */}
              {whatsappByWindow.history.length > 0 && (
                <div className="mb-8">
                  <button
                    onClick={() => setShowWhatsappHistory(!showWhatsappHistory)}
                    className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6 hover:text-[#666666] transition-colors flex items-center gap-2"
                  >
                    {showWhatsappHistory ? "▼" : "▶"} History ({whatsappByWindow.history.length})
                  </button>

                  {showWhatsappHistory && (
                    <div className="space-y-3">
                      {whatsappByWindow.history.map((campaign) => (
                        <div
                          key={campaign.id}
                          className="border border-[#E8E8E8] rounded-lg p-4 hover:bg-[#F9F9F9] transition-colors opacity-75"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-[#0D0D0D]">
                                {campaign.campaignName}
                              </p>
                              <p className="text-xs text-[#888888] mt-1">
                                {campaign.totalLeads} leads •{" "}
                                {new Date(campaign.sentAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-6 text-right">
                              <div>
                                <p className="text-xs text-[#888888]">Sent</p>
                                <p className="text-sm font-semibold text-[#0D0D0D]">
                                  {campaign.sent}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-[#888888]">Delivered</p>
                                <p className="text-sm font-semibold text-[#0D0D0D]">
                                  {campaign.delivered}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-[#888888]">Replied</p>
                                <p className="text-sm font-semibold text-[#0D0D0D]">
                                  {campaign.replied}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Conversations */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest">
                    Active Conversations ({conversations.length})
                  </p>
                  <button
                    onClick={() => setShowStartChat(true)}
                    className="text-xs font-semibold text-[#0D0D0D] hover:text-[#666666] transition-colors"
                  >
                    + Start Chat
                  </button>
                </div>

                {conversations.length === 0 ? (
                  <p className="text-sm text-[#666666]">No active conversations</p>
                ) : (
                  <div className="space-y-3">
                    {conversations.map((convo) => (
                      <button
                        key={convo.id}
                        onClick={() => setSelectedConversation(convo)}
                        className={`w-full text-left border border-[#E8E8E8] rounded-lg p-4 transition-colors ${
                          selectedConversation?.id === convo.id
                            ? "bg-[#0D0D0D] text-white border-[#0D0D0D]"
                            : "hover:bg-[#F9F9F9]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p
                              className={`text-sm font-semibold ${
                                selectedConversation?.id === convo.id
                                  ? "text-white"
                                  : "text-[#0D0D0D]"
                              }`}
                            >
                              {convo.prospectName}
                            </p>
                            <p
                              className={`text-xs mt-1 line-clamp-1 ${
                                selectedConversation?.id === convo.id
                                  ? "text-white/70"
                                  : "text-[#888888]"
                              }`}
                            >
                              {convo.lastMessage}
                            </p>
                          </div>
                          {convo.unreadCount > 0 && (
                            <span
                              className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                                selectedConversation?.id === convo.id
                                  ? "bg-white/20 text-white"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {convo.unreadCount}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Message Thread */}
            {selectedConversation && (
              <div className="col-span-1 border border-[#E8E8E8] rounded-lg flex flex-col h-[600px] bg-[#F9F9F9]">
                {/* Header */}
                <div className="border-b border-[#E8E8E8] p-4 bg-white rounded-t-lg">
                  <p className="text-sm font-semibold text-[#0D0D0D]">
                    {selectedConversation.prospectName}
                  </p>
                  <p className="text-xs text-[#888888]">{selectedConversation.phoneNumber}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selectedConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.direction === "outbound"
                            ? "bg-[#0D0D0D] text-white"
                            : "bg-white border border-[#E8E8E8]"
                        }`}
                      >
                        <p className="text-sm">{msg.body}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.direction === "outbound" ? "text-white/60" : "text-[#888888]"
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          {msg.direction === "outbound" && msg.status === "delivered" && "✓"}
                          {msg.direction === "outbound" && msg.status === "read" && "✓✓"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Input */}
                <div className="border-t border-[#E8E8E8] p-4 bg-white rounded-b-lg">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                      placeholder="Type message..."
                      className="flex-1 text-sm px-3 py-2 border border-[#E8E8E8] rounded-lg focus:border-[#0D0D0D] focus:outline-none"
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || sendingReply}
                      className="px-4 py-2 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] disabled:opacity-50 transition-colors"
                    >
                      {sendingReply ? "..." : "Send"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Start Chat Modal */}
      {showStartChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-lg font-black text-[#0D0D0D] mb-6">Start New Chat</h2>

            <form onSubmit={handleStartChat} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#888888] uppercase tracking-widest mb-2 block">
                  Business Name
                </label>
                <input
                  type="text"
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  placeholder="e.g., Acme Corp"
                  className="w-full text-sm px-4 py-2 border border-[#E8E8E8] rounded-lg focus:border-[#0D0D0D] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#888888] uppercase tracking-widest mb-2 block">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newChatPhone}
                  onChange={(e) => setNewChatPhone(e.target.value)}
                  placeholder="e.g., +441234567890"
                  className="w-full text-sm px-4 py-2 border border-[#E8E8E8] rounded-lg focus:border-[#0D0D0D] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStartChat(false)}
                  className="flex-1 px-4 py-2 border border-[#E8E8E8] text-[#0D0D0D] text-sm font-semibold rounded-lg hover:bg-[#F9F9F9] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] transition-colors"
                >
                  Start Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
