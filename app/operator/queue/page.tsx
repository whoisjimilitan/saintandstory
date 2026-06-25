"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Batch {
  runId: string;
  discoveredAt: string;
  discoveryCount: number;
  qualifiedCount: number;
  niche: string;
  location: string;
  status: "success" | "partial_failure" | "failed";
}

export default function QueuePage() {
  const router = useRouter();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyCount, setReplyCount] = useState(0);

  useEffect(() => {
    fetchBatches();
    fetchReplyCount();
    // Poll for new replies every 30 seconds
    const interval = setInterval(fetchReplyCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await fetch("/api/b2b/orchestration/batches");
      if (res.ok) {
        const data = await res.json();
        setBatches(data.batches || []);
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Fetch reply count for smart notification badge
  const fetchReplyCount = async () => {
    try {
      const res = await fetch("/api/operator/reply-count");
      if (res.ok) {
        const data = await res.json();
        setReplyCount(data.replyCount || 0);
      }
    } catch (error) {
      console.error("Error fetching reply count:", error);
    }
  };

  const handleDraftEmails = (batchId: string) => {
    router.push(`/operator/enrich?batch_id=${batchId}`);
  };

  // Navigate to RESPONSES page to handle replies
  const handleViewReplies = () => {
    router.push("/operator/responses");
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] pt-32">
      <div className="max-w-6xl mx-auto px-4 md:px-12 py-12">
        <div className="flex items-center justify-between mb-8 md:mb-12 pb-4 md:pb-8 border-b border-[#E8E8E8]">
          <p className="text-lg font-bold text-[#0D0D0D] leading-relaxed">
            Morning Queue: Autonomous discoveries ready for outreach
          </p>

          {/* FIXED: Smart notification badge showing new replies */}
          {replyCount > 0 && (
            <button
              onClick={handleViewReplies}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              title="Click to view new replies"
            >
              <span className="flex items-center justify-center w-6 h-6 bg-red-500 text-white rounded-full text-xs font-bold">
                {replyCount}
              </span>
              <span className="text-sm font-medium text-blue-700">
                New replies
              </span>
              <span className="text-xs text-blue-600">→ RESPONSES</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-[#666666]">Loading batches...</p>
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-12 border border-[#E8E8E8] rounded-lg bg-white">
            <p className="text-sm text-[#666666]">No batches discovered yet. Autonomous discovery runs daily at 02:00 UTC.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {batches.map((batch) => (
              <div
                key={batch.runId}
                className="border border-[#E8E8E8] rounded-lg p-6 bg-white hover:border-[#0D0D0D] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-sm font-semibold text-[#0D0D0D]">
                        {batch.niche.charAt(0).toUpperCase() + batch.niche.slice(1)} • {batch.location}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        batch.status === "success" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {batch.status === "success" ? "✓ Complete" : "⚠ Partial"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-[#888888] uppercase font-semibold mb-1">Discovered</p>
                        <p className="text-2xl font-black text-[#0D0D0D]">{batch.discoveryCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#888888] uppercase font-semibold mb-1">Qualified</p>
                        <p className="text-2xl font-black text-green-600">{batch.qualifiedCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#888888] uppercase font-semibold mb-1">Time</p>
                        <p className="text-xs text-[#666666]">{new Date(batch.discoveredAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDraftEmails(batch.runId)}
                    className="px-4 py-2 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] transition-colors whitespace-nowrap"
                  >
                    Draft Emails
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
