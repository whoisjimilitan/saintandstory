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

const urgencyBg: Record<string, string> = {
  High: "bg-[#FFEBEE]",
  Medium: "bg-[#FFF3E0]",
  Low: "bg-[#F1F5FE]",
};

const urgencyText: Record<string, string> = {
  High: "text-[#C62828]",
  Medium: "text-[#E65100]",
  Low: "text-[#1565C0]",
};

export default function OpportunityFeedPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [sending, setSending] = useState<string | null>(null);
  const [sendingAll, setSendingAll] = useState(false);

  useEffect(() => {
    // Load opportunities on mount
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      const response = await fetch("/api/operator/opportunity-feed/queue");
      const data = await response.json();
      if (data.success) {
        setOpportunities(data.opportunities.filter((o: any) => o.status === "queued"));
      }
    } catch (error) {
      console.error("Failed to load queue:", error);
    }
  };

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

      // Reload queue
      await loadQueue();
      setFile(null);
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
        setFile(null);
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
    <div className="min-h-screen">
      {/* Upload Section - Always Visible */}
      <div className="mb-12">
        <p className="text-lg font-bold text-[#0D0D0D] mb-4">Upload CSV</p>
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-[#E8E8E8] rounded-lg p-8 text-center hover:border-[#0D0D0D] transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
            <p className="text-sm font-semibold text-[#0D0D0D]">
              {file ? file.name : "Choose CSV file"}
            </p>
            <p className="text-xs text-[#888888] mt-1">
              {uploading ? "Processing..." : "Click to select"}
            </p>
          </div>
        </label>
      </div>

      {/* Queue Section */}
      {opportunities.length > 0 && (
        <div>
          {/* Header with Send All */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E8E8E8]">
            <p className="text-lg font-bold text-[#0D0D0D]">
              {opportunities.length} ready
            </p>
            <button
              onClick={handleSendAll}
              disabled={sendingAll}
              className="px-4 py-2 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] transition-colors disabled:opacity-50"
            >
              {sendingAll ? "Sending..." : "Send all"}
            </button>
          </div>

          {/* Opportunities Grid */}
          <div className="space-y-3">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="border border-[#E8E8E8] rounded-lg p-4 hover:border-[#0D0D0D] transition-colors"
              >
                {/* Top Row: Company + Urgency */}
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-semibold text-[#0D0D0D]">
                    {opp.companyName}
                  </p>
                  <span
                    className={`px-2.5 py-1 rounded text-[10px] font-semibold whitespace-nowrap ${
                      urgencyBg[opp.extractedUrgency] || urgencyBg.Medium
                    } ${urgencyText[opp.extractedUrgency] || urgencyText.Medium}`}
                  >
                    {opp.extractedUrgency}
                  </span>
                </div>

                {/* Need */}
                <p className="text-xs text-[#666666] mb-2">
                  {opp.extractedNeed}
                </p>

                {/* Context */}
                <p className="text-[10px] text-[#888888] mb-3">
                  {opp.extractedContext}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2">
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
                    className="px-3 py-2 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] transition-colors disabled:opacity-50 ml-auto"
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
      {!uploading && opportunities.length === 0 && !file && (
        <div className="text-center py-12 text-[#888888]">
          <p className="text-sm">No opportunities waiting</p>
        </div>
      )}
    </div>
  );
}
