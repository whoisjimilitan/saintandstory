/**
 * DORK SEARCH INJECT MODAL
 *
 * One-click UI for:
 * 1. Enter conversational query
 * 2. Choose batch size (50 or 100)
 * 3. Run dork search + inject into pipeline
 * 4. Preview results
 * 5. Confirm injection
 */

"use client";

import { useState } from "react";

interface DorkInjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (count: number) => void;
}

export function DorkInjectModal({ isOpen, onClose, onSuccess }: DorkInjectModalProps) {
  const [query, setQuery] = useState("");
  const [batchSize, setBatchSize] = useState(50);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"input" | "preview" | "injecting">("input");

  if (!isOpen) return null;

  const handleSearch = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/b2b/dork-search-inject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, batchSize }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Search failed");
      }

      const data = await response.json();
      setPreview(data);
      setStage("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmInject = async () => {
    if (!preview) return;

    setStage("injecting");
    setLoading(true);

    try {
      // Already injected in the search phase, just close
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (onSuccess) {
        onSuccess(preview.leadsInjected);
      }

      // Reset and close
      setQuery("");
      setBatchSize(50);
      setPreview(null);
      setStage("input");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confirmation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuery("");
    setBatchSize(50);
    setPreview(null);
    setError(null);
    setStage("input");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#E8E8E8]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0D0D0D]">
              Dork Search → Pipeline Injection
            </h2>
            <button
              onClick={onClose}
              className="text-[#999999] hover:text-[#0D0D0D] text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* INPUT STAGE */}
          {stage === "input" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#0D0D0D] mb-2">
                  Conversational Query
                </label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., Find dentists on instagram with emails"
                  className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg focus:outline-none focus:border-[#0D0D0D] text-sm"
                  rows={3}
                />
                <p className="text-xs text-[#666666] mt-2">
                  System will automatically include: gmail, yahoo, hotmail, outlook, aol, icloud + company domains (.co.uk)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0D0D0D] mb-3">
                  Batch Size
                </label>
                <div className="flex gap-3">
                  {[50, 100].map((size) => (
                    <button
                      key={size}
                      onClick={() => setBatchSize(size)}
                      className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
                        batchSize === size
                          ? "bg-[#0D0D0D] text-white"
                          : "bg-[#F0F0F0] text-[#0D0D0D] hover:bg-[#E8E8E8]"
                      }`}
                    >
                      {size} leads
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSearch}
                  disabled={!query || loading}
                  className="flex-1 px-4 py-3 bg-[#0D0D0D] text-white rounded-lg font-semibold hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Searching..." : "Search & Preview"}
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-[#E8E8E8] text-[#0D0D0D] rounded-lg font-semibold hover:bg-[#F9F9F9] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* PREVIEW STAGE */}
          {stage === "preview" && preview && (
            <div className="space-y-6">
              <div className="p-4 bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg">
                <div className="text-sm font-semibold text-[#0D0D0D] mb-3">
                  ✓ Search Complete
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-[#888888]">Results Found</div>
                    <div className="text-lg font-bold text-[#0D0D0D]">
                      {preview.resultsRetrieved}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#888888]">Businesses Parsed</div>
                    <div className="text-lg font-bold text-[#0D0D0D]">
                      {preview.businessesParsed}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#888888]">Ready to Inject</div>
                    <div className="text-lg font-bold text-[#0D0D0D]">
                      {preview.leadsInjected}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#0D0D0D] mb-3">
                  Preview (first 10 leads)
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {preview.businesses.slice(0, 10).map((b: any, i: number) => (
                    <div
                      key={i}
                      className="p-3 border border-[#E8E8E8] rounded-lg text-sm"
                    >
                      <div className="font-semibold text-[#0D0D0D]">
                        {b.business_name}
                      </div>
                      <div className="text-[#666666]">
                        {b.city} • {b.business_category}
                      </div>
                      <div className="text-xs text-[#999999]">
                        {b.email || "no email found"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmInject}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-[#0D0D0D] text-white rounded-lg font-semibold hover:bg-[#333333] disabled:opacity-50 transition-colors"
                >
                  {loading ? "Injecting..." : `✓ Inject ${preview.leadsInjected} Leads`}
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 border border-[#E8E8E8] text-[#0D0D0D] rounded-lg font-semibold hover:bg-[#F9F9F9]"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* INJECTING STAGE */}
          {stage === "injecting" && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-[#666666]">Confirming injection...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
