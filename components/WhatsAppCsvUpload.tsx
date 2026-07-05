"use client";

import { useState, useRef } from "react";

interface ImportedLead {
  id: string;
  businessName: string;
  phone: string;
  contactName?: string;
  city?: string;
}

interface WhatsAppCsvUploadProps {
  onUploadComplete: (leads: ImportedLead[]) => void;
}

export default function WhatsAppCsvUpload({
  onUploadComplete,
}: WhatsAppCsvUploadProps) {
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
      setProgress("Importing leads...");

      // Import
      const formData = new FormData();
      formData.append("file", file);
      const importRes = await fetch("/api/operator/whatsapp/import-leads", {
        method: "POST",
        body: formData,
      });
      const importData = await importRes.json();

      if (!importData.success) {
        throw new Error(
          importData.error || `Import failed: ${importData.failed} rows failed`
        );
      }

      setProgress("");
      onUploadComplete(importData.leads);
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
          {isProcessing
            ? progress || "Processing..."
            : "CSV format: businessName, phone, contactName (optional), city (optional)"}
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
