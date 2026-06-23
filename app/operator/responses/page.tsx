"use client";

import { useEffect, useState } from "react";

interface Response {
  id: string;
  leadId: string;
  prospectName: string;
  prospectEmail: string;
  city: string;
  subject: string;
  sentAt: string;
  replied: boolean;
  repliedAt?: string;
  engagementScore?: number;
  status: string;
}

export default function ResponsesPage() {
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "replied" | "awaiting">("all");

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
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-4xl mx-auto px-4 md:px-0 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-[#0D0D0D] mb-2">Responses</h1>
          <p className="text-sm text-[#888888]">Track replies and manage follow-ups</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="border border-[#E8E8E8] rounded-lg p-4 bg-[#F9F9F9]">
            <p className="text-xs text-[#888888] uppercase font-semibold mb-1">Total Sent</p>
            <p className="text-2xl font-black text-[#0D0D0D]">{responses.length}</p>
          </div>
          <div className="border border-[#E8E8E8] rounded-lg p-4 bg-[#F9F9F9]">
            <p className="text-xs text-[#888888] uppercase font-semibold mb-1">Replied</p>
            <p className="text-2xl font-black text-[#0D0D0D]">{repliedCount}</p>
            <p className="text-xs text-[#666666] mt-1">
              {responses.length > 0 ? Math.round((repliedCount / responses.length) * 100) : 0}% reply rate
            </p>
          </div>
          <div className="border border-[#E8E8E8] rounded-lg p-4 bg-[#F9F9F9]">
            <p className="text-xs text-[#888888] uppercase font-semibold mb-1">Awaiting Reply</p>
            <p className="text-2xl font-black text-[#0D0D0D]">{awaitingCount}</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-8 flex gap-3">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-2 text-xs font-semibold rounded transition-colors ${
              filter === "all"
                ? "bg-[#0D0D0D] text-white"
                : "bg-[#F5F5F5] text-[#0D0D0D] hover:bg-[#E8E8E8]"
            }`}
          >
            All ({responses.length})
          </button>
          <button
            onClick={() => setFilter("replied")}
            className={`px-3 py-2 text-xs font-semibold rounded transition-colors ${
              filter === "replied"
                ? "bg-[#0D0D0D] text-white"
                : "bg-[#F5F5F5] text-[#0D0D0D] hover:bg-[#E8E8E8]"
            }`}
          >
            Replied ({repliedCount})
          </button>
          <button
            onClick={() => setFilter("awaiting")}
            className={`px-3 py-2 text-xs font-semibold rounded transition-colors ${
              filter === "awaiting"
                ? "bg-[#0D0D0D] text-white"
                : "bg-[#F5F5F5] text-[#0D0D0D] hover:bg-[#E8E8E8]"
            }`}
          >
            Awaiting ({awaitingCount})
          </button>
        </div>

        {/* Responses List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-[#666666]">Loading responses...</p>
          </div>
        ) : filteredResponses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-[#666666]">
              {filter === "all" ? "No emails sent yet" : `No ${filter} responses`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredResponses.map((response) => (
              <div
                key={response.id}
                className={`border rounded-lg p-4 transition-colors ${
                  response.replied
                    ? "border-[#0D0D0D] bg-white"
                    : "border-[#E8E8E8] bg-[#F9F9F9] hover:bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-[#0D0D0D]">{response.prospectName}</p>
                      {response.replied && (
                        <span className="inline-block px-2 py-1 bg-[#0D0D0D] text-white text-xs font-semibold rounded">
                          Replied
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#888888]">{response.prospectEmail} • {response.city}</p>
                    <p className="text-xs text-[#666666] mt-2">{response.subject}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[#888888]">
                      Sent: {new Date(response.sentAt).toLocaleDateString()}
                    </p>
                    {response.repliedAt && (
                      <p className="text-xs text-[#0D0D0D] font-semibold mt-1">
                        Replied: {new Date(response.repliedAt).toLocaleDateString()}
                      </p>
                    )}
                    {response.engagementScore !== undefined && (
                      <p className="text-xs text-[#666666] mt-1">
                        Score: {response.engagementScore}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Refresh Button */}
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
