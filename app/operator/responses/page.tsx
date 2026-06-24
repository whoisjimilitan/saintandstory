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
  responseType?: "YES" | "MAYBE" | "NO";
  responseSummary?: string;
  conversation?: ConversationMessage[];
}

export default function ResponsesPage() {
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "awaiting" | "YES" | "MAYBE" | "NO">("awaiting");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null);
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
    if (filter === "awaiting") return !r.replied;
    if (filter === "YES") return r.responseType === "YES";
    if (filter === "MAYBE") return r.responseType === "MAYBE";
    if (filter === "NO") return r.responseType === "NO";
    return true;
  });

  const awaitingCount = responses.filter((r) => !r.replied).length;
  const yesCount = responses.filter((r) => r.responseType === "YES").length;
  const maybeCount = responses.filter((r) => r.responseType === "MAYBE").length;
  const noCount = responses.filter((r) => r.responseType === "NO").length;

  return (
    <div className="min-h-screen bg-[#F9F9F9] pt-32">
      <div className="max-w-6xl mx-auto px-4 md:px-12 py-12">
        {/* Sub-Hero */}
        <p className="text-lg font-bold text-[#0D0D0D] mb-8 md:mb-12 pb-4 md:pb-8 border-b border-[#E8E8E8] leading-relaxed">
          Track replies and engage with prospects
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="border border-[#E8E8E8] rounded-lg p-4 bg-[#F9F9F9]">
            <p className="text-xs text-[#888888] uppercase font-semibold mb-1">Awaiting</p>
            <p className="text-3xl font-black text-[#0D0D0D]">{awaitingCount}</p>
          </div>
          <div className="border border-green-200 rounded-lg p-4 bg-green-50">
            <p className="text-xs text-green-700 uppercase font-semibold mb-1">Yes ✅</p>
            <p className="text-3xl font-black text-green-700">{yesCount}</p>
          </div>
          <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
            <p className="text-xs text-yellow-700 uppercase font-semibold mb-1">Maybe ⏳</p>
            <p className="text-3xl font-black text-yellow-700">{maybeCount}</p>
          </div>
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <p className="text-xs text-red-700 uppercase font-semibold mb-1">No ❌</p>
            <p className="text-3xl font-black text-red-700">{noCount}</p>
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
            onClick={() => setFilter("YES")}
            className={`px-4 py-2 text-xs font-semibold rounded transition-colors ${
              filter === "YES"
                ? "bg-green-600 text-white"
                : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
            }`}
          >
            ✅ Yes ({yesCount})
          </button>
          <button
            onClick={() => setFilter("MAYBE")}
            className={`px-4 py-2 text-xs font-semibold rounded transition-colors ${
              filter === "MAYBE"
                ? "bg-yellow-600 text-white"
                : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200"
            }`}
          >
            ⏳ Maybe ({maybeCount})
          </button>
          <button
            onClick={() => setFilter("NO")}
            className={`px-4 py-2 text-xs font-semibold rounded transition-colors ${
              filter === "NO"
                ? "bg-red-600 text-white"
                : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
            }`}
          >
            ❌ No ({noCount})
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
                    <div className="text-right flex-shrink-0 space-y-2">
                      {response.replied ? (
                        <div>
                          <div className="flex gap-2 justify-end items-center mb-1">
                            <span className="text-xs font-bold text-[#0D0D0D]">✓ Replied</span>
                            {response.responseType && (
                              <span className={`px-3 py-1 rounded text-xs font-bold ${
                                response.responseType === "YES" ? "bg-green-600 text-white" :
                                response.responseType === "MAYBE" ? "bg-yellow-600 text-white" :
                                "bg-red-600 text-white"
                              }`}>
                                {response.responseType === "YES" ? "✅ YES" :
                                 response.responseType === "MAYBE" ? "⏳ MAYBE" :
                                 "❌ NO"}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#888888]">
                            {response.repliedAt
                              ? new Date(response.repliedAt).toLocaleDateString()
                              : ""}
                          </p>
                          {response.responseSummary && (
                            <p className="text-xs text-[#666666] mt-2 italic max-w-xs text-left">
                              "{response.responseSummary}"
                            </p>
                          )}
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
                    {/* Original Email Context */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-wider">
                        Original Email
                      </p>

                      {/* Email Preview */}
                      <div
                        onClick={() =>
                          setExpandedEmailId(
                            expandedEmailId === response.id ? null : response.id
                          )
                        }
                        className="p-3 bg-white border border-[#0D0D0D] rounded-lg cursor-pointer hover:bg-white transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#0D0D0D] mb-1">
                              {response.subject}
                            </p>
                            <p className="text-xs text-[#666666] leading-relaxed line-clamp-2">
                              {response.conversation?.[0]?.body?.substring(0, 150)}
                              {(response.conversation?.[0]?.body?.length || 0) > 150 ? "..." : ""}
                            </p>
                          </div>
                          <svg
                            className="w-4 h-4 text-[#0D0D0D] flex-shrink-0 transition-transform"
                            style={{
                              transform: expandedEmailId === response.id ? "rotate(180deg)" : "rotate(0deg)",
                            }}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            viewBox="0 0 24 24"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>

                        {/* Full Email - Expanded */}
                        {expandedEmailId === response.id && (
                          <div className="mt-3 pt-3 border-t border-[#E8E8E8]">
                            <p className="text-xs text-[#0D0D0D] leading-relaxed whitespace-pre-wrap">
                              {response.conversation?.[0]?.body}
                            </p>
                            <p className="text-[10px] text-[#888888] mt-2">
                              Sent {new Date(response.conversation?.[0]?.timestamp || "").toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Their Reply (if any) */}
                    {response.replied && response.conversation?.[1] && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-wider">
                          Their Response
                        </p>
                        <div className="p-3 bg-white border border-[#E8E8E8] rounded-lg mr-8">
                          <p className="text-xs text-[#0D0D0D] leading-relaxed mb-2">
                            {response.conversation[1].body}
                          </p>
                          <p className="text-[10px] text-[#888888]">
                            Replied {new Date(response.conversation[1].timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

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
