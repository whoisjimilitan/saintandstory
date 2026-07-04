"use client";

import { useState, useEffect } from "react";

interface Opportunity {
  id: string;
  companyName: string;
  extractedNeed: string;
  extractedUrgency: string;
  extractedContext: string;
  extractedQuote: string;
  emailSubject: string;
  emailBody: string;
  status: string;
}

const urgencyColors: Record<string, string> = {
  High: "bg-[#FFEBEE] text-[#C62828]",
  Medium: "bg-[#FFF3E0] text-[#E65100]",
  Low: "bg-[#F1F5FE] text-[#1565C0]",
};

export default function OpportunityFeedPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [sending, setSending] = useState<string | null>(null);
  const [sendingAll, setSendingAll] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setUploading(true);

    try {
      // Import
      const formData = new FormData();
      formData.append("file", selectedFile);
      const importRes = await fetch("/api/operator/opportunity-feed/import", {
        method: "POST",
        body: formData,
      });
      const importData = await importRes.json();
      if (!importData.success) throw new Error(importData.error);

      // Get IDs
      const queueRes = await fetch("/api/operator/opportunity-feed/queue");
      const queueData = await queueRes.json();
      const latestOpps = queueData.opportunities
        .filter((o: any) => o.status === "imported")
        .slice(0, importData.imported)
        .map((o: any) => o.id);

      // Extract
      const extractRes = await fetch("/api/operator/opportunity-feed/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityIds: latestOpps }),
      });
      const extractData = await extractRes.json();
      if (!extractData.success) throw new Error(extractData.error);

      // Generate
      const generateRes = await fetch("/api/operator/opportunity-feed/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityIds: latestOpps }),
      });
      const generateData = await generateRes.json();
      if (!generateData.success) throw new Error(generateData.error);

      // Fetch and display queue
      const finalQueueRes = await fetch("/api/operator/opportunity-feed/queue");
      const finalQueueData = await finalQueueRes.json();
      setOpportunities(
        finalQueueData.opportunities.filter((o: any) => o.status === "queued")
      );
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown"}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async (id: string) => {
    setSending(id);
    try {
      const response = await fetch("/api/operator/opportunity-feed/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityIds: [id] }),
      });
      const data = await response.json();
      if (data.success) {
        setOpportunities(opportunities.filter((o) => o.id !== id));
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown"}`);
    } finally {
      setSending(null);
    }
  };

  const handleSendAll = async () => {
    const ids = opportunities.map((o) => o.id);
    if (ids.length === 0) return;

    setSendingAll(true);
    try {
      const response = await fetch("/api/operator/opportunity-feed/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityIds: ids }),
      });
      const data = await response.json();
      if (data.success) {
        setOpportunities([]);
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown"}`);
    } finally {
      setSendingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20 pb-20">
      <div className="px-4 md:px-12 max-w-5xl">
        {/* Upload Section - Prominent, Minimal */}
        <div className="mb-16">
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-[#E8E8E8] rounded-lg p-12 text-center hover:border-[#0D0D0D] transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
              <p className="text-sm font-semibold text-[#0D0D0D] mb-1">
                {file ? file.name : "Select CSV"}
              </p>
              <p className="text-xs text-[#888888]">
                {uploading ? "Processing..." : "Click to choose or drag and drop"}
              </p>
            </div>
          </label>
        </div>

        {/* Queue - All Actionable */}
        {opportunities.length > 0 && (
          <div>
            {/* Queue Header with Send All */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-lg font-bold text-[#0D0D0D]">
                  {opportunities.length} ready to send
                </p>
              </div>
              <button
                onClick={handleSendAll}
                disabled={sendingAll}
                className="px-6 py-2.5 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] transition-colors disabled:opacity-50"
              >
                {sendingAll ? "Sending all..." : "Send all"}
              </button>
            </div>

            {/* Opportunity Cards - Each is an Action */}
            <div className="space-y-2">
              {opportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="border border-[#E8E8E8] rounded-lg p-4 hover:border-[#0D0D0D] transition-colors flex items-center justify-between gap-4"
                >
                  {/* Left: Company Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-sm font-semibold text-[#0D0D0D] truncate">
                        {opp.companyName}
                      </p>
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-semibold whitespace-nowrap ${
                          urgencyColors[opp.extractedUrgency] || urgencyColors.Medium
                        }`}
                      >
                        {opp.extractedUrgency}
                      </span>
                    </div>
                    <p className="text-xs text-[#666666] mb-1 truncate">
                      {opp.extractedNeed}
                    </p>
                    <p className="text-[10px] text-[#888888]">
                      {opp.extractedContext}
                    </p>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={`/api/operator/opportunity-feed/brief/${opp.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 border border-[#E8E8E8] text-[#0D0D0D] text-xs font-semibold rounded hover:border-[#0D0D0D] transition-colors"
                    >
                      Brief
                    </a>
                    <button
                      onClick={() => handleSend(opp.id)}
                      disabled={sending === opp.id}
                      className="px-3 py-2 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] transition-colors disabled:opacity-50"
                    >
                      {sending === opp.id ? "Sending..." : "Send"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!uploading && opportunities.length === 0 && file && (
          <div className="text-center py-12 border border-[#E8E8E8] rounded-lg bg-[#F9F9F9]">
            <p className="text-sm text-[#888888]">No opportunities to send</p>
          </div>
        )}
      </div>
    </div>
  );
}
