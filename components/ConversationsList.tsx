"use client";

import { WhatsAppConversation } from "@/lib/whatsapp-conversation";
import Link from "next/link";

interface ConversationsListProps {
  conversations: WhatsAppConversation[];
  selectedId?: string;
  onStartNew?: () => void;
}

export default function ConversationsList({
  conversations,
  selectedId,
  onStartNew,
}: ConversationsListProps) {
  const getLastMessage = (conversation: WhatsAppConversation) => {
    if (conversation.messages.length === 0) return "No messages yet";
    const lastMsg = conversation.messages[conversation.messages.length - 1];
    return lastMsg.text.length > 50
      ? lastMsg.text.substring(0, 50) + "..."
      : lastMsg.text;
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-[#E8E8E8]">
      {/* Header */}
      <div className="border-b border-[#E8E8E8] px-4 py-4">
        <h2 className="text-sm font-semibold text-[#0D0D0D] mb-3">Conversations</h2>
        {onStartNew && (
          <button
            onClick={onStartNew}
            className="w-full px-4 py-2 bg-[#0D0D0D] text-white text-xs font-semibold rounded-lg hover:bg-[#1A1A1A] transition-colors"
          >
            + New Conversation
          </button>
        )}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-xs text-[#888888]">No conversations yet</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/operator/whatsapp/${conversation.id}`}
              className={`block px-4 py-3 border-b border-[#E8E8E8] hover:bg-[#F9F9F9] transition-colors cursor-pointer ${
                selectedId === conversation.id ? "bg-[#F5F5F5]" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[#0D0D0D] truncate">
                    {conversation.businessName}
                  </h3>
                  <p className="text-xs text-[#888888] mt-0.5 truncate">
                    {conversation.phoneNumber}
                  </p>
                  <p className="text-xs text-[#666666] mt-1 truncate">
                    {getLastMessage(conversation)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <p className="text-xs text-[#888888]">
                    {formatTime(conversation.lastMessageAt)}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-[#0D0D0D] rounded-full">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Stats Footer */}
      {conversations.length > 0 && (
        <div className="border-t border-[#E8E8E8] px-4 py-3">
          <p className="text-xs text-[#888888]">
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
