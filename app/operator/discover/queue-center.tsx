"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

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
  email?: string;
}

interface QueueCenterProps {
  prospects: Prospect[];
  onBack: () => void;
  totalCount: number;
  onProspectsUpdate?: (updatedProspects: Prospect[]) => void;
}

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
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);

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

  const handleBatchEmail = async () => {
    const selectedArray = Array.from(selectedIds);
    if (selectedArray.length === 0) return;

    setBatchLoading(true);
    setBatchError(null);

    try {
      // Get the selected prospect data
      const selectedProspects = sortedProspects.filter(p => selectedArray.includes(p.id));

      // Store prospects in sessionStorage for ENRICH to access
      const prospectData = selectedProspects.map(p => ({
        id: p.id,
        businessName: p.businessName,
        city: p.city || "Unknown City",
        email: p.email,
        businessCategory: p.industry || "unknown",
        contactName: p.contactName,
      }));

      sessionStorage.setItem("enrich_prospects", JSON.stringify(prospectData));

      // Navigate to ENRICH
      router.push(`/operator/enrich?mode=draft&count=${selectedProspects.length}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to prepare emails";
      console.error("Error:", message);
      setBatchError(message);
    } finally {
      setBatchLoading(false);
    }
  };

  if (!currentProspect) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-[#888888]">No prospects found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selection Summary */}
      {selectedCount > 0 && (
        <div className="border border-[#0D0D0D] rounded-lg p-4 bg-[#0D0D0D] text-white">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{selectedCount} selected</p>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-xs font-semibold px-3 py-1 border border-white rounded hover:bg-white hover:text-[#0D0D0D] transition-colors"
              >
                {selectedIds.size === sortedProspects.length ? "Deselect All" : "Select All"}
              </button>
              <button
                onClick={handleBatchEmail}
                disabled={batchLoading}
                className="text-xs font-semibold px-3 py-1 bg-white text-[#0D0D0D] rounded hover:bg-[#F5F5F5] disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                <Icons.Email />
                {batchLoading ? "Preparing..." : "Email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Current Prospect */}
      <div className="border border-[#E8E8E8] rounded-lg p-6 bg-white">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <p className="text-lg font-bold text-[#0D0D0D] mb-1">{currentProspect.businessName}</p>
            <p className="text-sm text-[#888888]">
              {currentProspect.city} {currentProspect.postcode && `• ${currentProspect.postcode}`}
            </p>
            {currentProspect.email && (
              <p className="text-xs text-[#666666] mt-2">📧 {currentProspect.email}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`text-sm font-bold ${getTemperatureColor(getTemperature(currentProspect.confidenceScore))}`}>
              {getTemperature(currentProspect.confidenceScore)}
            </div>
            {currentProspect.confidenceScore && (
              <p className="text-xs text-[#888888]">Score: {currentProspect.confidenceScore}</p>
            )}
          </div>
        </div>

        {/* Selection Checkbox */}
        <div className="mt-4 pt-4 border-t border-[#E8E8E8]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.has(currentProspect.id)}
              onChange={() => toggleSelect(currentProspect.id)}
              className="w-4 h-4"
            />
            <span className="text-xs font-semibold text-[#0D0D0D]">Select for email</span>
          </label>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-3 py-2 text-xs font-semibold text-[#0D0D0D] disabled:text-[#CCCCCC] hover:bg-[#F5F5F5] rounded transition-colors"
        >
          ← Previous
        </button>
        <p className="text-xs text-[#888888]">
          {currentIndex + 1} / {sortedProspects.length}
        </p>
        <button
          onClick={handleNext}
          disabled={currentIndex === sortedProspects.length - 1}
          className="px-3 py-2 text-xs font-semibold text-[#0D0D0D] disabled:text-[#CCCCCC] hover:bg-[#F5F5F5] rounded transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Error */}
      {batchError && (
        <div className="p-3 bg-red-100 text-red-700 text-xs rounded">
          {batchError}
        </div>
      )}
    </div>
  );
}
