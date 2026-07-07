"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Message {
  id: string;
  body: string;
  direction: "inbound" | "outbound";
  createdAt: string;
}

interface Conversation {
  id: string;
  prospectName: string;
  email?: string;
  phoneNumber?: string;
  channel: "email" | "whatsapp";
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export default function ResponsesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [filterChannel, setFilterChannel] = useState<"all" | "email" | "whatsapp">("all");
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Fetch conversations on mount and refresh periodically
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);

      // Fetch email and WhatsApp conversations in parallel
      const [emailRes, whatsappRes] = await Promise.all([
        fetch("/api/operator/unified-replies"),
        fetch("/api/operator/whatsapp/conversations"),
      ]);

      const emailData = emailRes.ok ? await emailRes.json() : { replies: [] };
      const whatsappData = whatsappRes.ok ? await whatsappRes.json() : { conversations: [] };

      // Format email replies as conversations
      const emailConversations: Conversation[] = (emailData.replies || []).map(
        (reply: any) => ({
          id: reply.id,
          prospectName: reply.prospectName,
          email: reply.from,
          channel: "email" as const,
          lastMessage: reply.message,
          lastMessageTime: reply.timestamp,
          unreadCount: 1,
          messages: [
            {
              id: reply.id,
              body: reply.message,
              direction: "inbound" as const,
              createdAt: reply.timestamp,
            },
          ],
        })
      );

      // WhatsApp conversations already in correct format
      const combined = [...emailConversations, ...(whatsappData.conversations || [])];

      // Sort by most recent
      combined.sort(
        (a, b) =>
          new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

      setConversations(combined);
    } catch (error) {
      console.error("[RESPONSES] Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !replyText.trim()) return;

    setSending(true);
    try {
      if (selectedConversation.channel === "whatsapp" && selectedConversation.phoneNumber) {
        // Send WhatsApp reply
        const res = await fetch("/api/whatsapp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phoneNumber: selectedConversation.phoneNumber,
            message: replyText.trim(),
            businessName: selectedConversation.prospectName,
            leadId: selectedConversation.id,
          }),
        });

        if (res.ok) {
          // Add to conversation optimistically
          const newMessage: Message = {
            id: Date.now().toString(),
            body: replyText,
            direction: "outbound",
            createdAt: new Date().toISOString(),
          };

          setSelectedConversation({
            ...selectedConversation,
            messages: [...selectedConversation.messages, newMessage],
            lastMessage: replyText,
            lastMessageTime: new Date().toISOString(),
          });

          setReplyText("");
          setTimeout(fetchConversations, 1000);
        }
      } else if (selectedConversation.channel === "email") {
        // TODO: Wire up email reply endpoint when available
        console.log("[RESPONSES] Email reply not yet implemented");
      }
    } catch (error) {
      console.error("[RESPONSES] Error sending reply:", error);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(
    (c) => filterChannel === "all" || c.channel === filterChannel
  );

  const stats = {
    total: conversations.length,
    email: conversations.filter((c) => c.channel === "email").length,
    whatsapp: conversations.filter((c) => c.channel === "whatsapp").length,
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* HEADER */}
      <div className="pt-32 pb-6 px-8 border-b border-[#E8E8E8]">
        <div className="max-w-7xl">
          <h1 className="text-5xl font-black text-[#0D0D0D] mb-2 tracking-tight">Responses</h1>
          <p className="text-sm text-[#666666]">Manage all prospect conversations and replies</p>
        </div>
      </div>

      {/* STATS + FILTER */}
      <div className="px-8 py-8 border-b border-[#E8E8E8]">
        <div className="max-w-7xl">
          <div className="grid grid-cols-3 gap-12 mb-12">
            <div>
              <p className="text-xs text-[#999999] uppercase tracking-widest mb-2">Total</p>
              <p className="text-3xl font-black text-[#0D0D0D]">{stats.total}</p>
            </div>
            <div>
              <p className="text-xs text-[#999999] uppercase tracking-widest mb-2">Email</p>
              <p className="text-3xl font-black text-[#0D0D0D]">{stats.email}</p>
            </div>
            <div>
              <p className="text-xs text-[#999999] uppercase tracking-widest mb-2">WhatsApp</p>
              <p className="text-3xl font-black text-[#0D0D0D]">{stats.whatsapp}</p>
            </div>
          </div>

          <div className="flex gap-3">
            {(["all", "email", "whatsapp"] as const).map((ch) => (
              <button
                key={ch}
                onClick={() => setFilterChannel(ch)}
                className={`px-4 py-2 rounded text-sm font-semibold transition-colors ${
                  filterChannel === ch
                    ? "bg-[#0D0D0D] text-white"
                    : "bg-[#F9F9F9] text-[#0D0D0D] hover:bg-[#E8E8E8]"
                }`}
              >
                {ch === "all" ? "All" : ch === "email" ? "Email" : "WhatsApp"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT - Two Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: CONVERSATION LIST */}
        <div className="w-80 border-r border-[#E8E8E8] flex flex-col bg-white overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-[#666666]">
                <div className="w-6 h-6 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm">Loading...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-[#999999] text-sm">
                No conversations yet
              </div>
            ) : (
              filteredConversations.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => setSelectedConversation(convo)}
                  className={`w-full text-left px-4 py-3 border-b border-[#E8E8E8] hover:bg-[#F9F9F9] transition-colors ${
                    selectedConversation?.id === convo.id ? "bg-[#F0F0F0]" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold text-[#0D0D0D] text-sm">{convo.prospectName}</p>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded flex-shrink-0 ml-2 ${
                        convo.channel === "email"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {convo.channel === "email" ? "Email" : "WhatsApp"}
                    </span>
                  </div>
                  <p className="text-xs text-[#888888] mb-1">
                    {convo.channel === "email" ? convo.email : convo.phoneNumber}
                  </p>
                  <p className="text-xs text-[#666666] line-clamp-2">{convo.lastMessage}</p>
                  <p className="text-xs text-[#999999] mt-2">
                    {new Date(convo.lastMessageTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: CONVERSATION VIEW */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col bg-[#F9F9F9]">
            {/* Header */}
            <div className="bg-white border-b border-[#E8E8E8] p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-[#0D0D0D] mb-1">{selectedConversation.prospectName}</p>
                  <p className="text-sm text-[#888888]">
                    {selectedConversation.channel === "email"
                      ? selectedConversation.email
                      : selectedConversation.phoneNumber}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded ${
                    selectedConversation.channel === "email"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {selectedConversation.channel === "email" ? "Email" : "WhatsApp"}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedConversation.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center text-[#999999]">
                  <p className="text-sm">No messages</p>
                </div>
              ) : (
                selectedConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-lg px-4 py-3 rounded-lg ${
                        msg.direction === "outbound"
                          ? "bg-[#0D0D0D] text-white rounded-br-none"
                          : "bg-white text-[#0D0D0D] border border-[#E8E8E8] rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm break-words">{msg.body}</p>
                      <p
                        className={`text-xs mt-2 ${
                          msg.direction === "outbound" ? "text-white/60" : "text-[#999999]"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reply Input */}
            <div className="bg-white border-t border-[#E8E8E8] p-6">
              <form onSubmit={handleSendReply} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={sending}
                  className="flex-1 text-sm px-4 py-3 border border-[#E8E8E8] rounded-lg focus:border-[#0D0D0D] focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || sending}
                  className="bg-[#0D0D0D] text-white px-6 py-3 rounded-lg hover:bg-[#333333] disabled:opacity-50 transition-colors font-semibold text-sm"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#F9F9F9]">
            <div className="text-center text-[#999999]">
              <p className="text-sm">Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
