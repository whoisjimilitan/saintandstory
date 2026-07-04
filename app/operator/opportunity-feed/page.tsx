"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProcessStep {
  step: number;
  name: string;
  status: "loading" | "complete" | "failed";
  count?: number;
  error?: string;
}

export default function OpportunityFeedPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [complete, setComplete] = useState(false);
  const [resultCount, setResultCount] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setSteps([]);
      setComplete(false);
    }
  };

  const updateStep = (name: string, status: "loading" | "complete" | "failed", count?: number, error?: string) => {
    setSteps((prev) => {
      const existing = prev.find((s) => s.name === name);
      if (existing) {
        return prev.map((s) =>
          s.name === name ? { ...s, status, count, error } : s
        );
      }
      return [...prev, { step: prev.length + 1, name, status, count, error }];
    });
  };

  const handleProcess = async () => {
    if (!file) return;

    setProcessing(true);
    setSteps([]);

    try {
      // Step 1: Import
      updateStep("Import CSV", "loading");
      const formData = new FormData();
      formData.append("file", file);

      const importRes = await fetch("/api/operator/opportunity-feed/import", {
        method: "POST",
        body: formData,
      });

      const importData = await importRes.json();
      if (!importData.success) throw new Error(importData.error || "Import failed");
      updateStep("Import CSV", "complete", importData.imported);

      // Get IDs
      const queueRes = await fetch("/api/operator/opportunity-feed/queue");
      const queueData = await queueRes.json();
      const latestOpps = queueData.opportunities
        .filter((o: any) => o.status === "imported")
        .slice(0, importData.imported)
        .map((o: any) => o.id);

      // Step 2: Extract
      updateStep("Extract Data", "loading");
      const extractRes = await fetch("/api/operator/opportunity-feed/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityIds: latestOpps }),
      });

      const extractData = await extractRes.json();
      if (!extractData.success) throw new Error(extractData.error);
      updateStep("Extract Data", "complete", extractData.extracted);

      // Step 3 & 4: Generate
      updateStep("Generate Brief & Email", "loading");
      const generateRes = await fetch("/api/operator/opportunity-feed/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityIds: latestOpps }),
      });

      const generateData = await generateRes.json();
      if (!generateData.success) throw new Error(generateData.error);
      updateStep("Generate Brief & Email", "complete", generateData.generated);

      setResultCount(generateData.generated);
      setComplete(true);

      // Auto-redirect after 2 seconds
      setTimeout(() => {
        router.push("/operator/settings");
      }, 2000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      const failingStep = steps[steps.length - 1]?.name || "Process";
      updateStep(failingStep, "failed", undefined, errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  if (complete) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-12">
        <div className="px-4 md:px-12 max-w-2xl">
          <div className="text-center py-12">
            <div className="mb-6">
              <p className="text-4xl font-bold text-[#0D0D0D] mb-3">✓</p>
              <p className="text-lg font-bold text-[#0D0D0D] mb-2">
                {resultCount} opportunities processed
              </p>
              <p className="text-xs text-[#888888]">
                Redirecting to approval queue...
              </p>
            </div>
            <button
              onClick={() => router.push("/operator/settings")}
              className="text-xs font-semibold text-[#0D0D0D] hover:text-[#666666]"
            >
              Go to Approval Queue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <div className="px-4 md:px-12 max-w-2xl">
        {/* Header */}
        <div className="mb-12">
          <p className="text-lg font-bold text-[#0D0D0D]">Opportunity Feed</p>
          <p className="text-xs text-[#888888] mt-2">Upload CSV to begin processing</p>
        </div>

        {/* File Upload */}
        <div className="mb-8 p-8 border-2 border-dashed border-[#E8E8E8] rounded-lg hover:border-[#0D0D0D] transition-colors cursor-pointer">
          <label className="block cursor-pointer text-center">
            <div>
              <p className="text-sm font-semibold text-[#0D0D0D] mb-1">
                {file ? file.name : "Select CSV file"}
              </p>
              <p className="text-xs text-[#888888]">
                {file ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setFile(null);
                    }}
                    className="font-semibold text-[#0D0D0D] hover:text-[#333333]"
                  >
                    Choose different file
                  </button>
                ) : (
                  "Click to upload or drag and drop"
                )}
              </p>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              disabled={processing}
            />
          </label>
        </div>

        {/* Action Button */}
        <button
          onClick={handleProcess}
          disabled={!file || processing}
          className="w-full px-4 py-3 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] transition-colors disabled:opacity-50 mb-8"
        >
          {processing ? "Processing..." : "Process"}
        </button>

        {/* Steps */}
        {steps.length > 0 && (
          <div className="space-y-2">
            {steps.map((step) => (
              <div
                key={step.step}
                className="flex items-center justify-between p-3 border border-[#E8E8E8] rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-xs font-semibold text-[#0D0D0D]">
                    {step.name}
                  </div>
                </div>
                <div className="text-right">
                  {step.status === "loading" && (
                    <p className="text-[10px] text-[#0D0D0D] font-semibold">Processing...</p>
                  )}
                  {step.status === "complete" && (
                    <p className="text-[10px] text-[#2E7D32] font-semibold">{step.count || "✓"}</p>
                  )}
                  {step.status === "failed" && (
                    <p className="text-[10px] text-[#D32F2F] font-semibold">Failed</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
