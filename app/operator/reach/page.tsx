"use client";

import { useState } from "react";
import ConversationsList from "@/components/ConversationsList";
import { getAllConversations, createConversation } from "@/lib/whatsapp-conversation";

export default function ReachPage() {
  const [activeTab, setActiveTab] = useState<"whatsapp" | "email">("whatsapp");
  const [conversations, setConversations] = useState(getAllConversations());
  const [showNewConversationForm, setShowNewConversationForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

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

  const whatsappStats = {
    active: conversations.filter((c) => c.status === "active").length,
    hot: conversations.filter((c) => c.messages.length > 5).length,
    total: conversations.length,
  };

  const emailStats = {
    active: 0,
    hot: 0,
    total: 0,
  };

  const stats = activeTab === "whatsapp" ? whatsappStats : emailStats;

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Header */}
      <div className="mb-8 px-4 md:px-0 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-black text-[#0D0D0D] mb-2">Reach</h1>
          <p className="text-base text-[#666666]">Manage conversations across WhatsApp and Email</p>
        </div>
      </div>

      {/* Channel Tabs */}
      <div className="mb-8 px-4 md:px-0 py-6 border-b border-[#E8E8E8]">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("whatsapp")}
              className={`pb-3 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === "whatsapp"
                  ? "text-[#0D0D0D] border-[#0D0D0D]"
                  : "text-[#888888] border-transparent hover:text-[#0D0D0D]"
              }`}
            >
              WhatsApp
            </button>
            <button
              onClick={() => setActiveTab("email")}
              className={`pb-3 border-b-2 font-semibold text-sm transition-colors ${
                activeTab === "email"
                  ? "text-[#0D0D0D] border-[#0D0D0D]"
                  : "text-[#888888] border-transparent hover:text-[#0D0D0D]"
              }`}
            >
              Email
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-12 px-4 md:px-0 py-6 border-b border-[#E8E8E8]">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg">
              <p className="text-xs text-[#888888] mb-1">Active</p>
              <p className="text-2xl font-black text-[#0D0D0D]">{stats.active}</p>
            </div>
            <div className="p-4 bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg">
              <p className="text-xs text-[#888888] mb-1">Hot</p>
              <p className="text-2xl font-black text-[#0D0D0D]">{stats.hot}</p>
            </div>
            <div className="p-4 bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg">
              <p className="text-xs text-[#888888] mb-1">Total</p>
              <p className="text-2xl font-black text-[#0D0D0D]">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-0">
        <div className="max-w-2xl mx-auto">
          <div className="flex h-[calc(100vh-400px)]">
            {/* Sidebar */}
            <div className="w-80 flex-shrink-0">
              {activeTab === "whatsapp" ? (
                <ConversationsList
                  conversations={conversations}
                  onStartNew={() => setShowNewConversationForm(true)}
                />
              ) : (
                <div className="border-r border-[#E8E8E8] pr-4 h-full flex flex-col">
                  <button className="w-full p-3 bg-[#0D0D0D] text-white rounded font-semibold text-sm hover:bg-[#333333] transition-colors mb-4">
                    + New Email Campaign
                  </button>
                  <div className="flex-1 flex items-center justify-center text-[#888888] text-sm">
                    No email conversations yet
                  </div>
                </div>
              )}
            </div>

            {/* Main Area */}
            <div className="flex-1 flex items-center justify-center p-6">
              {activeTab === "whatsapp" ? (
                showNewConversationForm ? (
                  <div className="w-full max-w-md">
                    <form onSubmit={handleCreateConversation} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#888888] tracking-[0.05em] uppercase mb-2">
                          Business Name
                        </label>
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="e.g. Acme Trading"
                          className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#888888] tracking-[0.05em] uppercase mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+44 20 1234 5678"
                          className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isCreating}
                        className="w-full py-3 bg-[#0D0D0D] text-white rounded-lg font-semibold text-sm hover:bg-[#333333] disabled:opacity-50 transition-colors"
                      >
                        {isCreating ? "Creating..." : "Start Conversation"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewConversationForm(false)}
                        className="w-full py-3 border border-[#E8E8E8] text-[#0D0D0D] rounded-lg font-semibold text-sm hover:bg-[#F9F9F9] transition-colors"
                      >
                        Cancel
                      </button>
                    </form>
                  </div>
                ) : (
                  <p className="text-[#888888]">Select a conversation or start a new one</p>
                )
              ) : (
                <p className="text-[#888888]">Select an email campaign or create a new one</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
