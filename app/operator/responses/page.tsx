"use client";

import { useEffect, useState } from "react";

interface UnifiedReply {
  id: string;
  channel: "email" | "whatsapp";
  prospectName: string;
  from: string;
  message: string;
  timestamp: string;
  category?: string;
  tier?: number;
  sentAt?: string;
}

export default function ResponsesPage() {
  const [replies, setReplies] = useState<UnifiedReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterChannel, setFilterChannel] = useState<"all" | "email" | "whatsapp">("all");
  const [selectedReply, setSelectedReply] = useState<UnifiedReply | null>(null);

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/operator/unified-replies");
        if (!res.ok) throw new Error("Failed to fetch replies");

        const data = await res.json();
        setReplies(data.replies || []);
        console.log("[RESPONSES] Loaded replies:", data.total);
      } catch (error) {
        console.error("[RESPONSES] Failed to fetch replies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReplies();
    // Refresh every 30 seconds for live updates
    const interval = setInterval(fetchReplies, 30000);
    return () => clearInterval(interval);
  }, []);

  // ESC key closes modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedReply(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const filteredReplies = replies.filter(r => {
    const channelMatch = filterChannel === "all" || r.channel === filterChannel;
    return channelMatch;
  });

  const stats = {
    total: replies.length,
    email: replies.filter(r => r.channel === "email").length,
    whatsapp: replies.filter(r => r.channel === "whatsapp").length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysAgo = (dateString: string) => {
    const days = Math.floor(
      (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-white pt-16 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-[#0D0D0D] mb-2 tracking-tight leading-tight">
            Responses
          </h1>
          <p className="text-sm text-[#666666] leading-relaxed max-w-2xl font-normal">
            Monitor replies from email and WhatsApp campaigns.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-16 pb-12 border-b border-[#E8E8E8]">
          <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">
            Summary
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">Total</p>
              <p className="text-3xl font-black text-[#0D0D0D]">{stats.total}</p>
            </div>
            <div>
              <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">Email</p>
              <p className="text-3xl font-black text-[#0D0D0D]">{stats.email}</p>
            </div>
            <div>
              <p className="text-xs text-[#888888] uppercase tracking-widest mb-2">WhatsApp</p>
              <p className="text-3xl font-black text-[#0D0D0D]">{stats.whatsapp}</p>
            </div>
          </div>
        </div>

        {/* Filter - Channel only */}
        <div className="mb-16 pb-6 border-b border-[#E8E8E8]">
          <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-4">Channel</p>
          <div className="flex gap-3">
            {(["all", "email", "whatsapp"] as const).map(ch => (
              <button
                key={ch}
                onClick={() => setFilterChannel(ch)}
                className={`px-4 py-2 rounded text-sm font-semibold transition-colors duration-200 ${
                  filterChannel === ch
                    ? "bg-[#0D0D0D] text-white"
                    : "bg-[#F9F9F9] text-[#0D0D0D] hover:bg-[#E8E8E8]"
                }`}
              >
                {ch === "all" ? "All Channels" : ch === "email" ? "Email" : "WhatsApp"}
              </button>
            ))}
          </div>
        </div>

        {/* Replies */}
        <div>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-[#666666]">Loading replies...</p>
            </div>
          ) : filteredReplies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-[#666666]">
                {replies.length === 0 ? "No replies yet" : "No replies match this filter"}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">
                Replies
              </p>
              <div className="space-y-3">
                {filteredReplies.map(reply => (
                  <div
                    key={reply.id}
                    onClick={() => setSelectedReply(reply)}
                    className="rounded-lg p-4 bg-white border border-[#E8E8E8] hover:bg-[#F9F9F9] transition-colors duration-200 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-sm font-semibold text-[#0D0D0D]">
                            {reply.prospectName}
                          </p>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                              reply.channel === "email"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {reply.channel === "email" ? "Email" : "WhatsApp"}
                          </span>
                          {reply.tier && (
                            <span className="px-2 py-1 bg-[#E8E8E8] rounded text-xs text-[#0D0D0D] font-semibold">
                              Tier {reply.tier}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#888888] mb-1">{reply.from}</p>
                        <p className="text-sm text-[#0D0D0D] line-clamp-2">{reply.message}</p>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        <p className="text-xs text-[#888888] mb-1">
                          {getDaysAgo(reply.timestamp)}
                        </p>
                        <p className="text-xs text-[#0D0D0D] font-medium">
                          {new Date(reply.timestamp).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reply Detail Modal */}
      {selectedReply && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedReply(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#E8E8E8]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-black text-[#0D0D0D] mb-1">
                    {selectedReply.prospectName}
                  </h2>
                  <p className="text-sm text-[#666666]">{selectedReply.from}</p>
                </div>
                <button
                  onClick={() => setSelectedReply(null)}
                  className="text-[#888888] hover:text-[#0D0D0D] text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="flex gap-2 mb-4">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    selectedReply.channel === "email"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {selectedReply.channel === "email" ? "Email" : "WhatsApp"}
                </span>
                {selectedReply.tier && (
                  <span className="px-2 py-1 bg-[#E8E8E8] rounded text-xs text-[#0D0D0D] font-semibold">
                    Tier {selectedReply.tier}
                  </span>
                )}
                {selectedReply.category && (
                  <span className="px-2 py-1 bg-[#E8E8E8] rounded text-xs text-[#0D0D0D] font-semibold">
                    {selectedReply.category}
                  </span>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <p className="text-xs text-[#888888] mb-2">Reply</p>
                <div className="bg-[#F9F9F9] border border-[#E8E8E8] rounded p-4 text-sm text-[#0D0D0D] leading-relaxed">
                  {selectedReply.message}
                </div>
              </div>

              <div>
                <p className="text-xs text-[#888888] mb-2">Received</p>
                <p className="text-sm text-[#0D0D0D]">
                  {formatDate(selectedReply.timestamp)}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-[#E8E8E8] bg-[#F9F9F9]">
              <button
                onClick={() => setSelectedReply(null)}
                className="w-full px-4 py-2 bg-[#0D0D0D] text-white rounded font-semibold hover:bg-[#333333]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
