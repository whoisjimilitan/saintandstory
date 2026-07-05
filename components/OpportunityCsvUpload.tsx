"use client";

import { useState, useRef } from "react";

interface OpportunityItem {
  id: string;
  companyName: string;
  extractedNeed: string;
  extractedUrgency: string;
  extractedContext: string;
  extractedQuote: string;
  briefHtml?: string;
  emailSubject?: string;
  emailBody?: string;
  status: string;
}

interface OpportunityCsvUploadProps {
  onUploadComplete: (opportunities: OpportunityItem[]) => void;
}

export default function OpportunityCsvUpload({ onUploadComplete }: OpportunityCsvUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError("");
    setProgress("Reading file...");
    setIsProcessing(true);

    try {
      const text = await file.text();
      setProgress("Importing CSV...");

      // Import
      const formData = new FormData();
      formData.append("file", file);
      const importRes = await fetch("/api/operator/opportunity-feed/import", {
        method: "POST",
        body: formData,
      });
      const importData = await importRes.json();
      if (!importData.success) throw new Error(importData.error || "Import failed");

      setProgress(`Extracting needs from ${importData.imported} opportunities...`);

      // Get IDs of newly imported opportunities
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
      if (!extractData.success) throw new Error(extractData.error || "Extraction failed");

      setProgress("Generating briefs and emails...");

      // Generate
      const generateRes = await fetch("/api/operator/opportunity-feed/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityIds: latestOpps }),
      });
      const generateData = await generateRes.json();
      if (!generateData.success) throw new Error(generateData.error || "Generation failed");

      // Fetch the generated opportunities
      const finalRes = await fetch("/api/operator/opportunity-feed/queue");
      const finalData = await finalRes.json();
      const generated = finalData.opportunities.filter((o: any) =>
        latestOpps.includes(o.id) && o.status === "queued"
      );

      setProgress("");
      onUploadComplete(generated);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      setProgress("");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="hidden"
        disabled={isProcessing}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
        className="w-full p-4 border-2 border-dashed border-[#E8E8E8] rounded-lg hover:border-[#0D0D0D] transition-colors disabled:opacity-50 text-left"
      >
        <p className="font-semibold text-sm text-[#0D0D0D] mb-1">
          {fileName || "Choose CSV file"}
        </p>
        <p className="text-xs text-[#888888]">
          {isProcessing ? progress || "Processing..." : "Click to upload and process"}
        </p>
      </button>

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-[#FFEBEE] border border-[#FFCDD2]">
          <p className="text-xs text-[#C62828]">{error}</p>
        </div>
      )}
    </div>
  );
}
