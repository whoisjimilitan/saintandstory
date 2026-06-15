'use client';

import type { ConversationIntelligence } from "@/lib/conversation-intelligence";

interface Props {
  conversation: ConversationIntelligence;
}

export function ConversationIntelligence({ conversation }: Props) {
  const stateColors = {
    cold: { bg: "#F5F5F5", text: "#666666", label: "Cold" },
    warm: { bg: "#E8F5E9", text: "#1B5E20", label: "Warm" },
    hot: { bg: "#FFF8E5", text: "#CC6600", label: "Hot" },
    replied: { bg: "#E3F2FD", text: "#0D47A1", label: "Replied" },
    meeting: { bg: "#F3E5F5", text: "#6A1B9A", label: "Meeting" },
    won: { bg: "#E8F5E9", text: "#1B5E20", label: "Won" },
    lost: { bg: "#FFE5E5", text: "#CC0000", label: "Lost" }
  };

  const stateColor = stateColors[conversation.relationship_state];

  return (
    <div className="bg-white border border-[#E8E8E8] rounded p-8 space-y-8">
      {/* RELATIONSHIP STATE */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#0D0D0D]">
            RELATIONSHIP STATE
          </h3>
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.05em] px-3 py-1 rounded"
            style={{ backgroundColor: stateColor.bg, color: stateColor.text }}
          >
            {stateColor.label}
          </span>
        </div>
        <p className="text-[10px] text-[#888888]">
          {conversation.days_since_sent} days since outreach
          {conversation.last_activity_at && ` • Last activity: ${conversation.days_since_last_activity} days ago`}
        </p>
      </div>

      <div className="border-t border-[#E8E8E8]"></div>

      {/* MESSAGE SENT */}
      <div>
        <h3 className="text-sm font-semibold text-[#0D0D0D] mb-3">
          MESSAGE SENT
        </h3>
        <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded p-4 space-y-3">
          <div>
            <p className="text-[10px] font-semibold text-[#888888] uppercase mb-1">
              Subject
            </p>
            <p className="text-sm text-[#0D0D0D]">
              {conversation.email_subject}
            </p>
          </div>
          <div className="border-t border-[#E8E8E8]"></div>
          <div>
            <p className="text-[10px] font-semibold text-[#888888] uppercase mb-2">
              Body
            </p>
            <p className="text-sm leading-relaxed text-[#333333] whitespace-pre-wrap max-h-[200px] overflow-y-auto">
              {conversation.email_body}
            </p>
          </div>
          <div className="border-t border-[#E8E8E8] pt-3">
            <p className="text-[10px] text-[#888888]">
              Sent {new Date(conversation.email_sent_at).toLocaleDateString()} at{" "}
              {new Date(conversation.email_sent_at).toLocaleTimeString()}
              {" "}to {conversation.recipient_email}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#E8E8E8]"></div>

      {/* PROSPECT BEHAVIOR */}
      <div>
        <h3 className="text-sm font-semibold text-[#0D0D0D] mb-4">
          PROSPECT BEHAVIOR
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-semibold text-[#888888] uppercase mb-2">
              Opened
            </p>
            <p className="text-3xl font-black text-[#0D0D0D]">
              {conversation.opened_count}
            </p>
            <p className="text-[10px] text-[#666666] mt-1">
              {conversation.opened_count === 0
                ? "Never opened"
                : conversation.opened_count === 1
                ? "Opened once"
                : `Opened ${conversation.opened_count} times`}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-[#888888] uppercase mb-2">
              Clicked
            </p>
            <p className="text-3xl font-black text-[#0D0D0D]">
              {conversation.clicked_count}
            </p>
            <p className="text-[10px] text-[#666666] mt-1">
              {conversation.clicked_count === 0
                ? "No clicks"
                : conversation.clicked_count === 1
                ? "Clicked once"
                : `Clicked ${conversation.clicked_count} times`}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-[#888888] uppercase mb-2">
              Replied
            </p>
            <p className="text-3xl font-black text-[#0D0D0D]">
              {conversation.replied ? "Yes" : "No"}
            </p>
            {conversation.replied && conversation.replied_at && (
              <p className="text-[10px] text-[#666666] mt-1">
                {new Date(conversation.replied_at).toLocaleDateString()}
              </p>
            )}
          </div>

          <div>
            <p className="text-[10px] font-semibold text-[#888888] uppercase mb-2">
              Last Activity
            </p>
            <p className="text-3xl font-black text-[#0D0D0D]">
              {conversation.days_since_last_activity}
            </p>
            <p className="text-[10px] text-[#666666] mt-1">
              {conversation.days_since_last_activity === 0
                ? "Today"
                : conversation.days_since_last_activity === 1
                ? "1 day ago"
                : `${conversation.days_since_last_activity} days ago`}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#E8E8E8]"></div>

      {/* SYSTEM INTERPRETATION */}
      <div>
        <h3 className="text-sm font-semibold text-[#0D0D0D] mb-3">
          SYSTEM INTERPRETATION
        </h3>
        <p className="text-sm leading-relaxed text-[#333333]">
          {conversation.assessment}
        </p>
      </div>

      {/* RECOMMENDED ACTION */}
      <div className="bg-[#0D0D0D] rounded p-6">
        <p className="text-[10px] font-semibold text-white uppercase tracking-[0.05em] mb-2">
          Recommended Action
        </p>
        <p className="text-base font-semibold text-white">
          {conversation.recommended_action}
        </p>
      </div>
    </div>
  );
}
