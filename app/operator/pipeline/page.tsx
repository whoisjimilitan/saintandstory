"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Prospect {
  id: string;
  businessName: string;
  city: string;
  email: string;
  confidenceScore?: number;
  createdAt?: string;
  email_sent_at?: string;
  last_engagement_at?: string;
}

interface Queue {
  count: number;
  prospects: Prospect[];
  action: string;
}

interface PipelineQueues {
  readyToQualify: Queue;
  readyToEmail: Queue;
  awaitingReply: Queue;
  readyToClose: Queue;
}

const queueConfig = [
  {
    key: "readyToQualify",
    label: "Ready to Review",
    color: "border-l-[#999999]",
    description: "Discovered, need qualification",
    action: "Review & Qualify",
  },
  {
    key: "readyToEmail",
    label: "Ready to Email",
    color: "border-l-[#6B9FD1]",
    description: "Qualified, ready for first outreach",
    action: "Send Emails",
  },
  {
    key: "awaitingReply",
    label: "Awaiting Reply",
    color: "border-l-[#D4A574]",
    description: "Emailed, waiting for response",
    action: "Follow Up",
  },
  {
    key: "readyToClose",
    label: "Ready to Close",
    color: "border-l-[#6DB575]",
    description: "Replied, ready for offer",
    action: "Make Offer",
  },
];

export default function PipelinePage() {
  const router = useRouter();
  const [queues, setQueues] = useState<PipelineQueues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPipelineQueues();
  }, []);

  const fetchPipelineQueues = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/operator/pipeline-queues");

      if (!res.ok) throw new Error("Failed to fetch pipeline queues");

      const data = await res.json();
      setQueues(data.queues);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[Pipeline] Error:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchAction = (queueKey: string, prospects: Prospect[]) => {
    if (prospects.length === 0) {
      alert("No prospects in this queue");
      return;
    }

    const action = queueConfig.find(q => q.key === queueKey)?.action;

    // Store prospects in sessionStorage for action page
    sessionStorage.setItem(
      "enrich_prospects",
      JSON.stringify(
        prospects.map((p) => ({
          id: p.id,
          businessName: p.businessName,
          email: p.email,
          city: p.city,
          businessCategory: "unknown",
        }))
      )
    );

    // Navigate to enrich/email page
    router.push(`/operator/enrich?mode=draft&count=${prospects.length}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-[#666666]">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  if (error || !queues) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-32">
        <div className="text-center">
          <p className="text-sm text-[#E63946] mb-4">Failed to load pipeline</p>
          <button
            onClick={fetchPipelineQueues}
            className="px-4 py-2 text-xs font-semibold text-[#0D0D0D] border border-[#E8E8E8] rounded hover:border-[#0D0D0D] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalProspects = Object.values(queues).reduce((sum, q) => sum + q.count, 0);

  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <div className="px-4 md:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-12">
          <p className="text-lg font-bold text-[#0D0D0D] leading-relaxed">
            Complete prospect journey
          </p>
          <p className="text-xs text-[#888888] mt-2">
            {totalProspects} prospect{totalProspects !== 1 ? 's' : ''} across all queues
          </p>
        </div>

        {/* Action Queues - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {queueConfig.map((config) => {
            const queue = queues[config.key as keyof PipelineQueues];
            const topProspects = queue.prospects.slice(0, 3);
            const hasMore = queue.prospects.length > 3;

            return (
              <div
                key={config.key}
                className={`flex flex-col border-l-4 ${config.color} bg-white border-r border-b border-t rounded-r-lg p-4 transition-all hover:shadow-sm`}
              >
                {/* Queue Header */}
                <div className="mb-4 pb-3 border-b border-[#E8E8E8]">
                  <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.08em]">
                    {config.label}
                  </p>
                  <p className="text-2xl font-black text-[#0D0D0D] leading-none mt-1">
                    {queue.count}
                  </p>
                  <p className="text-[10px] text-[#888888] mt-1">
                    {config.description}
                  </p>
                </div>

                {/* Prospects List */}
                <div className="space-y-2 flex-1 mb-4">
                  {queue.prospects.length === 0 ? (
                    <p className="text-xs text-[#CCCCCC] py-4">—</p>
                  ) : (
                    <>
                      {topProspects.map((prospect) => (
                        <div key={prospect.id} className="flex gap-2">
                          <Link
                            href={`/operator/understand?prospectId=${prospect.id}`}
                            className="flex-1"
                          >
                            <div className="p-2 bg-[#F9F9F9] border border-[#E8E8E8] rounded hover:border-[#0D0D0D] hover:bg-white transition-all cursor-pointer h-full">
                              <p className="text-xs font-semibold text-[#0D0D0D] truncate">
                                {prospect.businessName}
                              </p>
                              <p className="text-[10px] text-[#999999] truncate mt-0.5">
                                {prospect.city}
                              </p>
                              {prospect.confidenceScore && (
                                <p className="text-[10px] text-[#666666] mt-1">
                                  Score: {prospect.confidenceScore}%
                                </p>
                              )}
                            </div>
                          </Link>
                          <Link
                            href={`/dashboard/crm?id=${prospect.id}`}
                            className="flex items-center justify-center w-8 h-full border border-[#E8E8E8] rounded hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-all"
                            title="View in CRM"
                          >
                            <span className="text-[10px] font-semibold text-[#0D0D0D]">📋</span>
                          </Link>
                        </div>
                      ))}

                      {/* View All Link */}
                      {hasMore && (
                        <button
                          onClick={() =>
                            router.push(
                              `/operator/understand?queue=${config.key}`
                            )
                          }
                          className="text-[10px] font-semibold text-[#0D0D0D] hover:underline mt-2 w-full text-left"
                        >
                          +{queue.prospects.length - 3} more
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Action Button */}
                {queue.prospects.length > 0 && (
                  <button
                    onClick={() => handleBatchAction(config.key, queue.prospects)}
                    className="w-full px-3 py-2.5 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] transition-colors"
                    title={`${config.action} for all ${queue.count} prospect${queue.count !== 1 ? 's' : ''}`}
                  >
                    {config.action} ({queue.count})
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
