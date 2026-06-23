"use client";

import { useEffect, useState } from "react";

interface ConversationMessage {
  id: string;
  type: "sent" | "received";
  subject?: string;
  body: string;
  timestamp: string;
  from?: string;
  to?: string;
}

interface Response {
  id: string;
  prospectName: string;
  prospectEmail: string;
  subject: string;
  sentAt: string;
  replied: boolean;
  repliedAt?: string;
  conversation?: ConversationMessage[];
}

export default function ResponsesPage() {
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "replied" | "awaiting">("awaiting");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      const res = await fetch("/api/b2b/sent-emails?limit=200");
      if (res.ok) {
        const data = await res.json();
        // Build conversation thread for each response
        const responsesWithConversation = data.sentEmails.map((email: any) => ({
          ...email,
          conversation: [
            {
              id: "sent-" + email.id,
              type: "sent" as const,
              subject: email.subject,
              body: email.body || "Email sent",
              timestamp: email.sentAt,
            },
            ...(email.replied
              ? [
                  {
                    id: "received-" + email.id,
                    type: "received" as const,
                    body: "Reply received - Click to view full response",
                    timestamp: email.repliedAt || email.sentAt,
                  },
                ]
              : []),
          ],
        }));
        setResponses(responsesWithConversation);
      }
    } catch (error) {
      console.error("Error fetching responses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (prospectId: string, prospectEmail: string) => {
    if (!replyText.trim()) return;

    setSending(true);
    try {
      // Send reply via email
      const res = await fetch("/api/b2b/send-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectId,
          prospectEmail,
          message: replyText,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send reply");
      }

      // Clear input
      setReplyText("");

      // Refresh responses
      fetchResponses();

      // Close expanded view
      setExpandedId(null);

      alert("✓ Reply sent successfully");
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const filteredResponses = responses.filter((r) => {
    if (filter === "replied") return r.replied;
    if (filter === "awaiting") return !r.replied;
    return true;
  });

  const repliedCount = responses.filter((r) => r.replied).length;
  const awaitingCount = responses.filter((r) => !r.replied).length;

  return (
    <div className="min-h-screen bg-white pt-32">
      <div className="max-w-4xl mx-auto px-4 md:px-0 py-12">
        {/* Sub-Hero */}
        <p className="text-sm text-[#888888] mb-8">Track replies and engage with prospects</p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="border border-[#E8E8E8] rounded-lg p-4 bg-[#F9F9F9]">
            <p className="text-xs text-[#888888] uppercase font-semibold mb-1">Replied</p>
            <p className="text-3xl font-black text-[#0D0D0D]">{repliedCount}</p>
          </div>
          <div className="border border-[#E8E8E8] rounded-lg p-4 bg-[#F9F9F9]">
            <p className="text-xs text-[#888888] uppercase font-semibold mb-1">Awaiting</p>
            <p className="text-3xl font-black text-[#0D0D0D]">{awaitingCount}</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-8 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("awaiting")}
            className={`px-4 py-2 text-xs font-semibold rounded transition-colors ${
              filter === "awaiting"
                ? "bg-[#0D0D0D] text-white"
                : "bg-[#F5F5F5] text-[#0D0D0D] hover:bg-[#E8E8E8]"
            }`}
          >
            Awaiting ({awaitingCount})
          </button>
          <button
            onClick={() => setFilter("replied")}
            className={`px-4 py-2 text-xs font-semibold rounded transition-colors ${
              filter === "replied"
                ? "bg-[#0D0D0D] text-white"
                : "bg-[#F5F5F5] text-[#0D0D0D] hover:bg-[#E8E8E8]"
            }`}
          >
            Replied ({repliedCount})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-xs font-semibold rounded transition-colors ${
              filter === "all"
                ? "bg-[#0D0D0D] text-white"
                : "bg-[#F5F5F5] text-[#0D0D0D] hover:bg-[#E8E8E8]"
            }`}
          >
            All ({responses.length})
          </button>
        </div>

        {/* Responses List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-[#666666]">Loading...</p>
          </div>
        ) : filteredResponses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-[#666666]">
              {filter === "awaiting"
                ? "No emails awaiting reply"
                : filter === "replied"
                  ? "No replies yet"
                  : "No emails sent yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredResponses.map((response) => (
              <div
                key={response.id}
                className={`border rounded-lg transition-all ${
                  expandedId === response.id
                    ? "border-[#0D0D0D] bg-white shadow-md"
                    : response.replied
                      ? "border-[#0D0D0D] bg-white"
                      : "border-[#E8E8E8] bg-[#F9F9F9] hover:bg-white"
                }`}
              >
                {/* Main Row */}
                <div
                  onClick={() =>
                    setExpandedId(expandedId === response.id ? null : response.id)
                  }
                  className="p-4 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0D0D0D] truncate">
                        {response.prospectName}
                      </p>
                      <p className="text-xs text-[#888888]">{response.prospectEmail}</p>
                      <p className="text-xs text-[#666666] mt-1 truncate">
                        {response.subject}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {response.replied ? (
                        <div>
                          <p className="text-xs font-bold text-[#0D0D0D]">✓ Replied</p>
                          <p className="text-xs text-[#888888] mt-1">
                            {response.repliedAt
                              ? new Date(response.repliedAt).toLocaleDateString()
                              : ""}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-[#888888]">
                          Sent {new Date(response.sentAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Conversation View */}
                {expandedId === response.id && (
                  <div className="border-t border-[#E8E8E8] p-4 bg-[#F9F9F9] space-y-4">
                    {/* Conversation Thread */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-wider">
                        Conversation
                      </p>

                      {response.conversation?.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-lg border ${
                            msg.type === "sent"
                              ? "bg-white border-[#0D0D0D] ml-8 text-right"
                              : "bg-white border-[#E8E8E8] mr-8"
                          }`}
                        >
                          {msg.subject && (
                            <p className="text-xs font-semibold text-[#0D0D0D] mb-1">
                              Subject: {msg.subject}
                            </p>
                          )}
                          <p className="text-xs text-[#0D0D0D] leading-relaxed mb-2">
                            {msg.body}
                          </p>
                          <p className="text-[10px] text-[#888888]">
                            {new Date(msg.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Reply Composition */}
                    {!response.replied && (
                      <div className="space-y-3 border-t border-[#E8E8E8] pt-4">
                        <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-wider">
                          Send Reply
                        </p>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply here..."
                          className="w-full px-3 py-3 border border-[#E8E8E8] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0D0D0D] focus:border-transparent resize-none"
                          rows={4}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleReply(response.id, response.prospectEmail)
                            }
                            disabled={!replyText.trim() || sending}
                            className="flex-1 px-4 py-3 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] disabled:opacity-50 transition-colors"
                          >
                            {sending ? "Sending..." : "Send Reply"}
                          </button>
                          <button
                            onClick={() => setReplyText("")}
                            className="px-4 py-3 border border-[#E8E8E8] text-[#0D0D0D] text-xs font-semibold rounded hover:bg-[#F5F5F5] transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}

                    {response.replied && (
                      <div className="border-t border-[#E8E8E8] pt-4">
                        <p className="text-xs text-[#0D0D0D] font-semibold">
                          ✓ You have replied to this prospect
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Refresh */}
        <button
          onClick={fetchResponses}
          className="mt-8 px-4 py-2 text-xs font-semibold text-[#0D0D0D] border border-[#E8E8E8] rounded hover:bg-[#F5F5F5] transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
