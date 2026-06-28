"use client";

import { useState } from "react";
import ConversationsList from "@/components/ConversationsList";
import { getAllConversations, createConversation } from "@/lib/whatsapp-conversation";

export default function WhatsAppDashboard() {
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

  const stats = {
    active: conversations.filter((c) => c.status === "active").length,
    hot: conversations.filter((c) => c.messages.length > 5).length,
    total: conversations.length,
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Header */}
      <div className="mb-8 px-4 md:px-0 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-black text-[#0D0D0D] mb-2">WhatsApp</h1>
          <p className="text-base text-[#666666]">Send messages and manage conversations in real-time</p>
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
          <div className="flex h-[calc(100vh-300px)]">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0">
          <ConversationsList
            conversations={conversations}
            onStartNew={() => setShowNewConversationForm(true)}
          />
        </div>

        {/* Main Area */}
        <div className="flex-1 flex items-center justify-center p-6">
          {showNewConversationForm ? (
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
                    placeholder="+44123456789"
                    className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewConversationForm(false)}
                    className="flex-1 px-6 py-3 border border-[#E8E8E8] text-[#0D0D0D] font-semibold rounded-lg hover:border-[#0D0D0D] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !phoneNumber.trim() || !businessName.trim()}
                    className="flex-1 px-6 py-3 bg-[#0D0D0D] text-white font-semibold rounded-lg hover:bg-[#1A1A1A] disabled:opacity-50 transition-colors"
                  >
                    {isCreating ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-[#888888]">Select a conversation or start a new one</p>
            </div>
          )}
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
