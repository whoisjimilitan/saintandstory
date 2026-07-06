"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

export default function WhatsAppPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatPhone, setNewChatPhone] = useState("");
  const [newChatName, setNewChatName] = useState("");

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/operator/whatsapp/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("[WHATSAPP] Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !messageText.trim()) return;

    setSending(true);
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: selectedConversation.phoneNumber,
          message: messageText.trim(),
          businessName: selectedConversation.prospectName,
          leadId: selectedConversation.id,
        }),
      });

      if (res.ok) {
        const data = await res.json();

        // Add message to conversation optimistically
        const newMessage: Message = {
          id: data.messageId || Date.now().toString(),
          body: messageText,
          direction: "outbound",
          status: "sent",
          createdAt: new Date().toISOString(),
        };

        setSelectedConversation({
          ...selectedConversation,
          messages: [...selectedConversation.messages, newMessage],
          lastMessage: messageText,
          lastMessageTime: new Date().toISOString(),
        });

        setMessageText("");

        // Refresh conversations
        setTimeout(fetchConversations, 1000);
      }
    } catch (error) {
      console.error("[WHATSAPP] Error sending message:", error);
    } finally {
      setSending(false);
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
        setNewChatPhone("");
        setNewChatName("");
        setShowNewChat(false);
        fetchConversations();
      }
    } catch (error) {
      console.error("[WHATSAPP] Error starting chat:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* HEADER */}
      <div className="bg-[#128C7E] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/operator" className="text-white hover:opacity-80">
            ←
          </Link>
          <h1 className="text-xl font-bold">WhatsApp Business</h1>
        </div>
        <button
          onClick={() => setShowNewChat(!showNewChat)}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded transition-colors text-sm font-semibold"
        >
          + New Chat
        </button>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        {/* CONVERSATIONS LIST */}
        <div className="w-80 border-r border-[#E8E8E8] flex flex-col bg-white">
          {/* NEW CHAT FORM */}
          {showNewChat && (
            <form onSubmit={handleStartChat} className="p-4 border-b border-[#E8E8E8] bg-[#F5F5F5]">
              <input
                type="text"
                placeholder="Phone number"
                value={newChatPhone}
                onChange={(e) => setNewChatPhone(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-[#E8E8E8] rounded-lg mb-2 focus:border-[#128C7E] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Name or company"
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-[#E8E8E8] rounded-lg mb-2 focus:border-[#128C7E] focus:outline-none"
              />
              <button
                type="submit"
                className="w-full bg-[#128C7E] text-white text-sm font-semibold py-2 rounded-lg hover:bg-[#0F6E5E] transition-colors"
              >
                Start Chat
              </button>
            </form>
          )}

          {/* SEARCH */}
          <div className="p-3 border-b border-[#E8E8E8]">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full text-sm px-3 py-2 border border-[#E8E8E8] rounded-full focus:border-[#128C7E] focus:outline-none bg-[#F0F0F0]"
            />
          </div>

          {/* CONVERSATIONS */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-[#666666]">
                <div className="w-6 h-6 border-2 border-[#E8E8E8] border-t-[#128C7E] rounded-full animate-spin mx-auto mb-2"></div>
                Loading...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-[#999999] text-sm">
                No conversations yet
              </div>
            ) : (
              conversations.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => setSelectedConversation(convo)}
                  className={`w-full text-left px-4 py-3 border-b border-[#E8E8E8] hover:bg-[#F5F5F5] transition-colors ${
                    selectedConversation?.id === convo.id ? "bg-[#E8F5F3]" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold text-[#0D0D0D]">{convo.prospectName}</p>
                    <span className="text-xs text-[#999999]">
                      {new Date(convo.lastMessageTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-[#666666] line-clamp-1">{convo.lastMessage}</p>
                  {convo.unreadCount > 0 && (
                    <div className="mt-1 flex items-center gap-1">
                      <span className="bg-[#128C7E] text-white text-xs font-semibold px-2 py-1 rounded-full">
                        {convo.unreadCount}
                      </span>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* MESSAGE AREA */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col bg-[#ECE5DD]">
            {/* CONVERSATION HEADER */}
            <div className="bg-white border-b border-[#E8E8E8] p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#0D0D0D]">{selectedConversation.prospectName}</p>
                <p className="text-xs text-[#999999]">{selectedConversation.phoneNumber}</p>
              </div>
              <div className="flex gap-2">
                <button className="text-[#128C7E] hover:bg-[#F0F0F0] p-2 rounded transition-colors">
                  ☎️
                </button>
                <button className="text-[#128C7E] hover:bg-[#F0F0F0] p-2 rounded transition-colors">
                  ⓘ
                </button>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center text-[#999999]">
                  <div>
                    <p className="text-2xl mb-2">💬</p>
                    <p className="text-sm">No messages yet</p>
                  </div>
                </div>
              ) : (
                selectedConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.direction === "outbound"
                          ? "bg-[#DCF8C6] text-[#0D0D0D] rounded-bl-none"
                          : "bg-white text-[#0D0D0D] rounded-br-none shadow-sm"
                      }`}
                    >
                      <p className="text-sm break-words">{msg.body}</p>
                      <p className="text-xs text-[#999999] mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {msg.direction === "outbound" && msg.status === "delivered" && " ✓✓"}
                        {msg.direction === "outbound" && msg.status === "read" && " ✓✓"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* MESSAGE INPUT */}
            <div className="bg-white border-t border-[#E8E8E8] p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={sending}
                  className="flex-1 text-sm px-4 py-3 border border-[#E8E8E8] rounded-lg focus:border-[#128C7E] focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || sending}
                  className="bg-[#128C7E] text-white px-6 py-3 rounded-lg hover:bg-[#0F6E5E] disabled:opacity-50 transition-colors font-semibold text-sm"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#ECE5DD] text-center">
            <div>
              <p className="text-4xl mb-4">💬</p>
              <p className="text-[#0D0D0D] font-semibold mb-2">Select a conversation</p>
              <p className="text-sm text-[#666666]">or start a new chat to begin messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
