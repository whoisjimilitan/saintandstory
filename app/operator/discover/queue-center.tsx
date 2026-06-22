"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CampaignReviewModal } from "./campaign-review-modal";
import { SmartSuggestionsModal } from "./smart-suggestions-modal";
import { findSimilarProspects, formatSimilarityReason } from "./utils/smart-suggestions";

interface Prospect {
  id: string;
  businessName: string;
  contactName?: string;
  city?: string;
  postcode?: string;
  confidenceScore?: number;
  industry?: string;
  status?: string;
  pressureSignal?: string;
  trustSource?: string;
}

interface QueueCenterProps {
  prospects: Prospect[];
  onBack: () => void;
  totalCount: number;
  onProspectsUpdate?: (updatedProspects: Prospect[]) => void;
}

// Premium single-color icons
const Icons = {
  CheckCircle: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 8l1.5 1.5 2.5-2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Email: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4h12v8H2V4z" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 4l6 4 6-4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 3l6 5-6 5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 3l-6 5 6 5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Flame: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2c0 0-2 3-2 5 0 1.66 1.34 3 3 3s3-1.34 3-3c0-2-2-5-2-5z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

type TemperatureLevel = "ULTRA_HOT" | "HOT" | "WARM" | "COLD";

const getTemperature = (score?: number): TemperatureLevel => {
  if (!score) return "COLD";
  if (score >= 85) return "ULTRA_HOT";
  if (score >= 75) return "HOT";
  if (score >= 60) return "WARM";
  return "COLD";
};

const getTemperatureColor = (temp: TemperatureLevel): string => {
  switch (temp) {
    case "ULTRA_HOT": return "text-[#0D0D0D] font-black";
    case "HOT": return "text-[#0D0D0D] font-bold";
    case "WARM": return "text-[#666666] font-semibold";
    default: return "text-[#888888]";
  }
};

const sortProspects = (prospects: Prospect[]): Prospect[] => {
  return [...prospects].sort((a, b) => {
    const tempA = getTemperature(a.confidenceScore);
    const tempB = getTemperature(b.confidenceScore);
    const tempOrder = { ULTRA_HOT: 0, HOT: 1, WARM: 2, COLD: 3 };

    if (tempOrder[tempA] !== tempOrder[tempB]) {
      return tempOrder[tempA] - tempOrder[tempB];
    }

    return (b.confidenceScore || 0) - (a.confidenceScore || 0);
  });
};

export function QueueCenter({ prospects, onBack, totalCount, onProspectsUpdate }: QueueCenterProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sendingBatch, setSendingBatch] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);
  const [batchSuccess, setBatchSuccess] = useState<string | null>(null);
  const [generatedEmails, setGeneratedEmails] = useState<Array<any> | null>(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(false);
  const [suggestedProspects, setSuggestedProspects] = useState<Prospect[]>([]);
  const [suggestReason, setSuggestReason] = useState<string>("");

  const sortedProspects = useMemo(() => sortProspects(prospects), [prospects]);
  const currentProspect = sortedProspects[currentIndex];
  const selectedCount = selectedIds.size;

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === sortedProspects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedProspects.map(p => p.id)));
    }
  };

  const handleNext = () => {
    if (currentIndex < sortedProspects.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleBatchQualify = async () => {
    const selectedArray = Array.from(selectedIds);
    if (selectedArray.length === 0) return;

    setBatchLoading(true);
    setBatchError(null);
    setBatchSuccess(null);

    try {
      const res = await fetch("/api/b2b/batch-qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectIds: selectedArray }),
      });

      if (!res.ok) throw new Error("Failed to qualify prospects");

      setBatchSuccess(`✓ Qualified ${selectedArray.length} prospect${selectedArray.length !== 1 ? "s" : ""}`);

      // Remove qualified prospects from view
      const remaining = prospects.filter((p) => !selectedArray.includes(p.id));
      if (onProspectsUpdate) onProspectsUpdate(remaining);

      // Show smart suggestions if only 1 was qualified
      if (selectedArray.length === 1) {
        const qualifiedProspect = prospects.find((p) => p.id === selectedArray[0]);
        if (qualifiedProspect) {
          const similar = findSimilarProspects(qualifiedProspect, remaining, 60);
          if (similar.length > 0) {
            setSuggestedProspects(similar);
            setSuggestReason(formatSimilarityReason(qualifiedProspect, similar));
            setShowSmartSuggestions(true);
          }
        }
      }

      setSelectedIds(new Set());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Batch qualify failed";
      setBatchError(message);
    } finally {
      setBatchLoading(false);
    }
  };

  const handleSmartSuggestApprove = async (prospectIds: string[]) => {
    try {
      const res = await fetch("/api/b2b/batch-qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectIds }),
      });

      if (!res.ok) throw new Error("Failed to approve suggested prospects");

      const remaining = prospects.filter((p) => !prospectIds.includes(p.id));
      if (onProspectsUpdate) onProspectsUpdate(remaining);

      setBatchSuccess(`✓ Batch approved ${prospectIds.length} similar prospect${prospectIds.length !== 1 ? "s" : ""}`);
      setShowSmartSuggestions(false);
      setSuggestedProspects([]);
    } catch (error) {
      throw error;
    }
  };

  const handleBatchEmail = async () => {
    const selectedArray = Array.from(selectedIds);
    if (selectedArray.length === 0) return;

    // Navigate to ENRICH page with batch of prospectIds
    // ENRICH page will generate emails for the batch
    const prospectIdsParam = selectedArray.join(",");
    router.push(`/operator/enrich?prospectIds=${prospectIdsParam}`);
  };

  const handleCampaignApprove = async (emails: any[]) => {
    try {
      const res = await fetch("/api/b2b/batch-emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });

      if (!res.ok) throw new Error("Failed to send emails");

      const data = await res.json();
      setShowCampaignModal(false);
      setGeneratedEmails(null);
      setBatchSuccess(`✓ Sent ${data.sent} email${data.sent !== 1 ? "s" : ""}`);
      setSelectedIds(new Set());

      // Remove emailed prospects from queue
      const emailedIds = new Set(emails.map((e) => e.prospectId));
      const remaining = prospects.filter((p) => !emailedIds.has(p.id));
      if (onProspectsUpdate) onProspectsUpdate(remaining);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send emails";
      throw error;
    }
  };

  if (!currentProspect) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[#666666] mb-4">No prospects to display</p>
        <button
          onClick={onBack}
          className="text-xs font-semibold text-[#0D0D0D] hover:text-[#666666]"
        >
          ← Back to Search
        </button>
      </div>
    );
  }

  const temp = getTemperature(currentProspect.confidenceScore);

  return (
    <div className="min-h-[600px] bg-white">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-[#E8E8E8]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-[0.15em]">
            Prospect Queue
          </h2>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-[#888888] hover:text-[#0D0D0D] transition-colors"
          >
            ← Back to Search
          </button>
        </div>
        <p className="text-xs text-[#888888]">
          {currentIndex + 1} of {totalCount} prospects
        </p>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-2 gap-8">
        {/* LEFT: Queue List */}
        <div className="bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg p-6 max-h-[500px] overflow-y-auto">
          <div className="mb-4">
            <button
              onClick={selectAll}
              className="text-xs font-semibold text-[#0D0D0D] hover:text-[#666666] transition-colors"
            >
              {selectedIds.size === sortedProspects.length ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="space-y-2">
            {sortedProspects.map((prospect, idx) => {
              const isSelected = selectedIds.has(prospect.id);
              const isCurrent = idx === currentIndex;
              const tempLevel = getTemperature(prospect.confidenceScore);

              return (
                <div
                  key={prospect.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`p-3 rounded cursor-pointer transition-all ${
                    isCurrent
                      ? "bg-[#0D0D0D] text-white"
                      : "bg-white border border-[#E8E8E8] hover:border-[#0D0D0D]"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelect(prospect.id);
                      }}
                      className="mt-1 cursor-pointer accent-[#0D0D0D]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${isCurrent ? "text-white" : "text-[#0D0D0D]"}`}>
                        {prospect.businessName}
                      </p>
                      <p className={`text-[10px] truncate ${isCurrent ? "text-gray-300" : "text-[#888888]"}`}>
                        {prospect.city}
                      </p>
                      <div className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${
                        isCurrent ? "text-white" : getTemperatureColor(tempLevel)
                      }`}>
                        <Icons.Flame />
                        {tempLevel}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Batch Actions */}
          {selectedCount > 0 && (
            <div className="mt-6 pt-6 border-t border-[#E8E8E8] space-y-2">
              <p className="text-xs font-semibold text-[#0D0D0D] mb-3">
                {selectedCount} selected
              </p>
              <button
                onClick={handleBatchQualify}
                disabled={batchLoading}
                className="w-full px-3 py-2 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {batchLoading ? "Processing..." : `Qualify (${selectedCount})`}
              </button>
              <button
                onClick={handleBatchEmail}
                disabled={batchLoading}
                className="w-full px-3 py-2 border border-[#E8E8E8] text-[#0D0D0D] text-xs font-semibold rounded hover:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {batchLoading ? "Processing..." : `Email (${selectedCount})`}
              </button>
              {batchSuccess && (
                <div className="p-2 bg-[#F5F5F5] border border-[#E8E8E8] rounded text-[10px] text-[#0D0D0D]">
                  {batchSuccess}
                </div>
              )}
              {batchError && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-[10px] text-red-700">
                  {batchError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CENTER: Prospect Detail */}
        <div className="border border-[#E8E8E8] rounded-lg p-8 bg-white">
          <div className="mb-6">
            <h3 className="text-lg font-black text-[#0D0D0D] mb-3">
              {currentProspect.businessName}
            </h3>

            <div className="space-y-3">
              {currentProspect.city && (
                <div>
                  <p className="text-xs text-[#888888] uppercase tracking-[0.1em] font-semibold mb-1">
                    Location
                  </p>
                  <p className="text-sm text-[#0D0D0D]">
                    {currentProspect.city}{currentProspect.postcode ? ` · ${currentProspect.postcode}` : ""}
                  </p>
                </div>
              )}

              {currentProspect.industry && (
                <div>
                  <p className="text-xs text-[#888888] uppercase tracking-[0.1em] font-semibold mb-1">
                    Industry
                  </p>
                  <p className="text-sm text-[#0D0D0D]">{currentProspect.industry}</p>
                </div>
              )}

              {currentProspect.confidenceScore && (
                <div>
                  <p className="text-xs text-[#888888] uppercase tracking-[0.1em] font-semibold mb-1">
                    Confidence
                  </p>
                  <p className={`text-sm font-bold ${getTemperatureColor(temp)}`}>
                    {currentProspect.confidenceScore}% · {temp}
                  </p>
                </div>
              )}

              {currentProspect.pressureSignal && (
                <div>
                  <p className="text-xs text-[#888888] uppercase tracking-[0.1em] font-semibold mb-1">
                    Pressure Signal
                  </p>
                  <p className="text-sm text-[#0D0D0D]">{currentProspect.pressureSignal}</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-2 pt-6 border-t border-[#E8E8E8]">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex-1 px-3 py-2 border border-[#E8E8E8] text-[#0D0D0D] text-xs font-semibold rounded hover:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
            >
              <Icons.ChevronLeft />
              Prev
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === sortedProspects.length - 1}
              className="flex-1 px-3 py-2 border border-[#E8E8E8] text-[#0D0D0D] text-xs font-semibold rounded hover:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
            >
              Next
              <Icons.ChevronRight />
            </button>
          </div>

          {/* Quick Actions - Single Prospect */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                setSelectedIds(new Set([currentProspect.id]));
                setTimeout(() => handleBatchQualify(), 0);
              }}
              disabled={!currentProspect || batchLoading}
              className="flex-1 px-3 py-2 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
            >
              <Icons.CheckCircle />
              Qualify
            </button>
            <button
              onClick={() => {
                setSelectedIds(new Set([currentProspect.id]));
                setTimeout(() => handleBatchEmail(), 0);
              }}
              disabled={!currentProspect || batchLoading}
              className="flex-1 px-3 py-2 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
            >
              <Icons.Email />
              Email
            </button>
          </div>
        </div>
      </div>

      {/* Campaign Review Modal */}
      {showCampaignModal && generatedEmails && (
        <CampaignReviewModal
          emails={generatedEmails}
          onApprove={handleCampaignApprove}
          onCancel={() => {
            setShowCampaignModal(false);
            setGeneratedEmails(null);
          }}
        />
      )}

      {/* Smart Suggestions Modal */}
      {showSmartSuggestions && suggestedProspects.length > 0 && (
        <SmartSuggestionsModal
          qualified={prospects.find((p) => selectedIds.size === 0) || currentProspect}
          similar={suggestedProspects}
          reason={suggestReason}
          onApprove={handleSmartSuggestApprove}
          onDismiss={() => {
            setShowSmartSuggestions(false);
            setSuggestedProspects([]);
          }}
        />
      )}
    </div>
  );
}
