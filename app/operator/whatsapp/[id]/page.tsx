"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import WhatsAppChat from "@/components/WhatsAppChat";
import { getConversation, markConversationRead } from "@/lib/whatsapp-conversation";
import type { WhatsAppConversation } from "@/lib/whatsapp-conversation";

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.id as string;

  const [conversation, setConversation] = useState<WhatsAppConversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showStandingOrderForm, setShowStandingOrderForm] = useState(false);
  const [standingOrderData, setStandingOrderData] = useState({
    frequency: "weekly",
    price: "",
    postcode: "",
  });

  useEffect(() => {
    const conv = getConversation(conversationId);
    if (conv) {
      markConversationRead(conversationId);
      setConversation(conv);
    }
    setIsLoading(false);
  }, [conversationId]);

  const handleSendMessage = async (message: string) => {
    if (!conversation) return;

    setIsSending(true);
    try {
      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          phoneNumber: conversation.phoneNumber,
          message,
          businessName: conversation.businessName,
        }),
      });

      if (response.ok) {
        const updated = getConversation(conversationId);
        if (updated) {
          setConversation(updated);
        }
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateStandingOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversation || !standingOrderData.price || !standingOrderData.postcode) return;

    try {
      const response = await fetch("/api/whatsapp/standing-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          phoneNumber: conversation.phoneNumber,
          businessName: conversation.businessName,
          frequency: standingOrderData.frequency,
          price: parseFloat(standingOrderData.price),
          postcode: standingOrderData.postcode,
        }),
      });

      if (response.ok) {
        setShowStandingOrderForm(false);
        setStandingOrderData({ frequency: "weekly", price: "", postcode: "" });
        const updated = getConversation(conversationId);
        if (updated) {
          setConversation(updated);
        }
      }
    } catch (error) {
      console.error("Failed to create standing order:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-[#888888]">Loading...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-[#888888]">Conversation not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      <div className="flex-1 flex flex-col">
        <WhatsAppChat
          phoneNumber={conversation.phoneNumber}
          businessName={conversation.businessName}
          messages={conversation.messages}
          onSendMessage={handleSendMessage}
          onCreateStandingOrder={() => setShowStandingOrderForm(true)}
          isLoading={isSending}
        />
      </div>

      <div className="w-80 border-l border-[#E8E8E8] p-6">
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold text-[#888888] tracking-[0.05em] uppercase mb-3">
              Business
            </p>
            <div>
              <p className="text-sm font-semibold text-[#0D0D0D]">
                {conversation.businessName}
              </p>
              <p className="text-xs text-[#666666] mt-1">
                {conversation.phoneNumber}
              </p>
            </div>
          </div>

          {showStandingOrderForm ? (
            <form onSubmit={handleCreateStandingOrder} className="space-y-4">
              <p className="text-xs font-semibold text-[#888888] tracking-[0.05em] uppercase">
                Create Standing Order
              </p>

              <div>
                <label className="block text-xs text-[#888888] mb-1">Frequency</label>
                <select
                  value={standingOrderData.frequency}
                  onChange={(e) =>
                    setStandingOrderData({
                      ...standingOrderData,
                      frequency: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-[#E8E8E8] rounded text-sm text-[#0D0D0D] focus:border-[#0D0D0D] focus:outline-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#888888] mb-1">Price (£)</label>
                <input
                  type="number"
                  step="0.01"
                  value={standingOrderData.price}
                  onChange={(e) =>
                    setStandingOrderData({
                      ...standingOrderData,
                      price: e.target.value,
                    })
                  }
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-[#E8E8E8] rounded text-sm text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#888888] mb-1">Postcode</label>
                <input
                  type="text"
                  value={standingOrderData.postcode}
                  onChange={(e) =>
                    setStandingOrderData({
                      ...standingOrderData,
                      postcode: e.target.value,
                    })
                  }
                  placeholder="e.g. M1 1AA"
                  className="w-full px-3 py-2 border border-[#E8E8E8] rounded text-sm text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowStandingOrderForm(false)}
                  className="flex-1 text-xs font-semibold text-[#888888] border border-[#E8E8E8] px-3 py-2 rounded hover:border-[#0D0D0D] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 text-xs font-semibold text-white bg-[#0D0D0D] px-3 py-2 rounded hover:bg-[#1A1A1A] transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowStandingOrderForm(true)}
              className="w-full text-xs font-semibold text-white bg-[#0D0D0D] px-3 py-2 rounded hover:bg-[#1A1A1A] transition-colors"
            >
              + Standing Order
            </button>
          )}

          <div className="pt-4 border-t border-[#E8E8E8]">
            <p className="text-xs font-semibold text-[#888888] tracking-[0.05em] uppercase mb-2">
              Status
            </p>
            <p className="text-xs text-[#0D0D0D] capitalize">{conversation.status}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
