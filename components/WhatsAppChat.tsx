"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "business";
  timestamp: Date;
  status?: "sent" | "delivered" | "read";
}

interface WhatsAppChatProps {
  phoneNumber: string;
  businessName: string;
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  onCreateStandingOrder?: () => void;
  isLoading?: boolean;
}

export default function WhatsAppChat({
  phoneNumber,
  businessName,
  messages,
  onSendMessage,
  onCreateStandingOrder,
  isLoading = false,
}: WhatsAppChatProps) {
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsSending(true);
    try {
      await onSendMessage(inputValue);
      setInputValue("");
    } finally {
      setIsSending(false);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "delivered":
        return "✓✓";
      case "read":
        return "✓✓";
      case "sent":
        return "✓";
      default:
        return "⏱";
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-[#E8E8E8] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#0D0D0D]">{businessName}</h3>
            <p className="text-xs text-[#888888] mt-0.5">{phoneNumber}</p>
          </div>
          {onCreateStandingOrder && (
            <button
              onClick={onCreateStandingOrder}
              className="text-xs font-semibold text-[#0D0D0D] border border-[#E8E8E8] px-3 py-1.5 rounded hover:border-[#0D0D0D] transition-colors"
            >
              + Order
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <p className="text-xs text-[#888888]">No messages yet</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-[#0D0D0D] text-white"
                    : "bg-[#F9F9F9] text-[#0D0D0D] border border-[#E8E8E8]"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <div
                  className={`text-xs mt-1 ${
                    msg.sender === "user" ? "text-[#CCCCCC]" : "text-[#888888]"
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {msg.sender === "user" && msg.status && (
                    <span className="ml-1">{getStatusIcon(msg.status)}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#E8E8E8] px-6 py-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type message..."
            disabled={isSending || isLoading}
            className="flex-1 px-4 py-2.5 border border-[#E8E8E8] rounded-lg text-sm text-[#0D0D0D] placeholder-[#CCCCCC] focus:border-[#0D0D0D] focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isSending || isLoading || !inputValue.trim()}
            className="px-4 py-2.5 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#1A1A1A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
