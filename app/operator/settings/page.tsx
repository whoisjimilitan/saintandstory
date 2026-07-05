"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/app/providers/ToastProvider";

interface Opportunity {
  id: string;
  companyName: string;
  website: string;
  contactName: string;
  contactEmail: string;
  originalWording: string;
  extractedNeed: string;
  extractedUrgency: string;
  extractedContext: string;
  extractedQuote: string;
  emailSubject: string;
  emailBody: string;
  briefHtml: string;
  status: string;
  createdAt: string;
}

export default function ApprovalQueuePage() {
  const { showToast } = useToast();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());
  const [sendingAll, setSendingAll] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/operator/opportunity-feed/queue?status=queued");
      const data = await res.json();
      setOpportunities(data.opportunities || []);
      console.log("[APPROVAL QUEUE] Loaded", data.count, "opportunities");
    } catch (error) {
      console.error("[APPROVAL QUEUE] Error fetching queue:", error);
      showToast("Failed to load queue", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (opportunityId: string) => {
    setSendingIds((prev) => new Set(prev).add(opportunityId));

    try {
      const res = await fetch("/api/operator/opportunity-feed/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityIds: [opportunityId] }),
      });

      const data = await res.json();

      if (res.ok && data.sent > 0) {
        showToast(`Sent to ${data.results[0]?.company}`, "success");
        setOpportunities((prev) => prev.filter((o) => o.id !== opportunityId));
        setExpandedId(null);
      } else {
        showToast(data.error || "Failed to send", "error");
      }
    } catch (error) {
      console.error("[APPROVAL QUEUE] Send error:", error);
      showToast("Error sending email", "error");
    } finally {
      setSendingIds((prev) => {
        const next = new Set(prev);
        next.delete(opportunityId);
        return next;
      });
    }
  };

  const handleSendAll = async () => {
    if (opportunities.length === 0) {
      showToast("No opportunities to send", "error");
      return;
    }

    setSendingAll(true);

    try {
      const res = await fetch("/api/operator/opportunity-feed/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityIds: opportunities.map((o) => o.id),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(
          `Sent ${data.sent} emails. ${data.failed > 0 ? data.failed + " failed" : ""}`,
          data.failed > 0 ? "warning" : "success"
        );
        setOpportunities([]);
        setExpandedId(null);
      } else {
        showToast(data.error || "Failed to send batch", "error");
      }
    } catch (error) {
      console.error("[APPROVAL QUEUE] Batch send error:", error);
      showToast("Error sending batch", "error");
    } finally {
      setSendingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-16 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-[#666666]">Loading queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-16 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-[#0D0D0D] mb-2 tracking-tight leading-tight">
            Approval Queue
          </h1>
          <p className="text-sm text-[#666666]">
            Review briefs and emails. Five seconds per opportunity. Click send.
          </p>
        </div>

        {opportunities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-[#666666]">No opportunities waiting to send.</p>
            <p className="text-xs text-[#AAAAAA] mt-2">Upload a CSV in the Discover stage to get started.</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-8 pb-8 border-b border-[#E8E8E8]">
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-4">
                Summary
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black text-[#0D0D0D]">{opportunities.length}</p>
                  <p className="text-xs text-[#888888] mt-1">waiting to send</p>
                </div>
                <button
                  onClick={handleSendAll}
                  disabled={sendingAll}
                  className="px-6 py-3 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] disabled:opacity-50 transition-colors"
                >
                  {sendingAll ? "Sending..." : "Send All"}
                </button>
              </div>
            </div>

            {/* Opportunities */}
            <div className="space-y-3">
              {opportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="border border-[#E8E8E8] rounded-lg overflow-hidden transition-all"
                >
                  {/* Summary Row */}
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === opp.id ? null : opp.id)
                    }
                    className="w-full p-4 bg-white hover:bg-[#F9F9F9] text-left transition-colors flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#0D0D0D]">
                        {opp.companyName}
                      </p>
                      <p className="text-xs text-[#888888] mt-1">
                        {opp.contactName && `${opp.contactName} • `}
                        {opp.extractedNeed}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold ${
                          opp.extractedUrgency === "High"
                            ? "bg-red-100 text-red-700"
                            : opp.extractedUrgency === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {opp.extractedUrgency}
                      </span>
                      <svg
                        className={`w-5 h-5 text-[#0D0D0D] transition-transform ${
                          expandedId === opp.id ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {expandedId === opp.id && (
                    <div className="border-t border-[#E8E8E8] bg-[#F9F9F9] p-6 space-y-6">
                      {/* Original Post */}
                      <div>
                        <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-2">
                          Original Post
                        </p>
                        <p className="text-sm text-[#0D0D0D] leading-relaxed">
                          "{opp.originalWording}"
                        </p>
                      </div>

                      {/* Extracted Data */}
                      <div>
                        <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-3">
                          Extracted Data
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-[#888888] mb-1">Need</p>
                            <p className="text-sm font-medium text-[#0D0D0D]">
                              {opp.extractedNeed}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#888888] mb-1">Urgency</p>
                            <p className="text-sm font-medium text-[#0D0D0D]">
                              {opp.extractedUrgency}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#888888] mb-1">Context</p>
                            <p className="text-sm font-medium text-[#0D0D0D]">
                              {opp.extractedContext}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[#888888] mb-1">Quote</p>
                            <p className="text-sm font-medium text-[#0D0D0D]">
                              "{opp.extractedQuote}"
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Brief Preview */}
                      <div>
                        <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-3">
                          Brief Preview
                        </p>
                        <div
                          className="bg-white border border-[#E8E8E8] rounded p-4 text-xs leading-relaxed text-[#0D0D0D] max-h-48 overflow-y-auto"
                          dangerouslySetInnerHTML={{
                            __html: opp.briefHtml || "(Brief not generated)",
                          }}
                        />
                      </div>

                      {/* Email Preview */}
                      <div>
                        <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-3">
                          Email Draft
                        </p>
                        <div className="bg-white border border-[#E8E8E8] rounded p-4">
                          <p className="text-xs text-[#888888] mb-2">
                            To: {opp.contactEmail || "(no email)"}
                          </p>
                          <p className="text-xs text-[#888888] mb-3">
                            Subject: {opp.emailSubject}
                          </p>
                          <p className="text-xs leading-relaxed text-[#0D0D0D] whitespace-pre-wrap font-mono">
                            {opp.emailBody}
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex gap-3 pt-4 border-t border-[#E8E8E8]">
                        <button
                          onClick={() => handleSend(opp.id)}
                          disabled={sendingIds.has(opp.id)}
                          className="flex-1 px-4 py-2.5 bg-[#0D0D0D] text-white text-sm font-semibold rounded-lg hover:bg-[#333333] disabled:opacity-50 transition-colors"
                        >
                          {sendingIds.has(opp.id) ? "Sending..." : "Send"}
                        </button>
                        <button
                          onClick={() => setExpandedId(null)}
                          className="px-4 py-2.5 bg-[#E8E8E8] text-[#0D0D0D] text-sm font-semibold rounded-lg hover:bg-[#CCCCCC] transition-colors"
                        >
                          Skip
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
