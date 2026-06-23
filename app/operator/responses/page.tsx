"use client";

import { useEffect, useState } from "react";

interface Response {
  id: string;
  prospectName: string;
  prospectEmail: string;
  subject: string;
  sentAt: string;
  replied: boolean;
  repliedAt?: string;
}

export default function ResponsesPage() {
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "replied" | "awaiting">("awaiting");

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      const res = await fetch("/api/b2b/sent-emails?limit=200");
      if (res.ok) {
        const data = await res.json();
        setResponses(data.sentEmails);
      }
    } catch (error) {
      console.error("Error fetching responses:", error);
    } finally {
      setLoading(false);
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
      <div className="max-w-3xl mx-auto px-4 md:px-0 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-[#0D0D0D] mb-2">Responses</h1>
          <p className="text-sm text-[#888888]">Track who replied</p>
        </div>

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
        <div className="mb-8 flex gap-2">
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
              {filter === "awaiting" ? "No emails awaiting reply" : filter === "replied" ? "No replies yet" : "No emails sent yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredResponses.map((response) => (
              <div
                key={response.id}
                className={`p-4 rounded-lg border transition-colors ${
                  response.replied
                    ? "bg-white border-[#0D0D0D]"
                    : "bg-[#F9F9F9] border-[#E8E8E8]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0D0D0D] truncate">{response.prospectName}</p>
                    <p className="text-xs text-[#888888]">{response.prospectEmail}</p>
                    <p className="text-xs text-[#666666] mt-1 truncate">{response.subject}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {response.replied ? (
                      <div>
                        <p className="text-xs font-bold text-[#0D0D0D]">✓ Replied</p>
                        <p className="text-xs text-[#888888] mt-1">
                          {response.repliedAt ? new Date(response.repliedAt).toLocaleDateString() : ""}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-[#888888]">Sent {new Date(response.sentAt).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
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
