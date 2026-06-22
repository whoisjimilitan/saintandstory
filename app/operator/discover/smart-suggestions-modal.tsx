"use client";

import { useState } from "react";

interface Prospect {
  id: string;
  businessName: string;
  city?: string;
  confidenceScore?: number;
  industry?: string;
  pressureSignal?: string;
}

interface SmartSuggestionsModalProps {
  qualified: Prospect;
  similar: Prospect[];
  reason: string;
  onApprove: (prospectIds: string[]) => Promise<void>;
  onDismiss: () => void;
}

const Icons = {
  Lightbulb: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2c-3.3 0-6 2.7-6 6 0 2.1 1.1 3.9 2.7 4.9-.5.5-.9 1.1-.9 1.9v1.2h8V14c0-.8-.4-1.4-.9-1.9 1.6-1 2.7-2.8 2.7-4.9 0-3.3-2.7-6-6-6z" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 18h6v2H9z" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 21h4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Check: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 10l4 4 8-8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  X: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 5l10 10M15 5l-10 10" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

export function SmartSuggestionsModal({
  qualified,
  similar,
  reason,
  onApprove,
  onDismiss,
}: SmartSuggestionsModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(similar.map((p) => p.id))
  );
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleApprove = async () => {
    const toApprove = Array.from(selectedIds);
    if (toApprove.length === 0) return;

    setApproving(true);
    setError(null);

    try {
      await onApprove(toApprove);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to approve prospects";
      setError(message);
    } finally {
      setApproving(false);
    }
  };

  const selectAll = () => {
    if (selectedIds.size === similar.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(similar.map((p) => p.id)));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="border-b border-[#E8E8E8] px-8 py-6 bg-gradient-to-r from-[#FFF9E6] to-white">
          <div className="flex items-start gap-4">
            <div className="text-[#D4A574]">
              <Icons.Lightbulb />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-black text-[#0D0D0D] mb-1">
                💡 Smart Match Found
              </h2>
              <p className="text-sm text-[#666666]">
                Based on {qualified.businessName}, we found {similar.length} similar prospect
                {similar.length !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-[#888888] mt-2">
                {reason}
              </p>
            </div>
            <button
              onClick={onDismiss}
              className="text-[#888888] hover:text-[#0D0D0D] transition-colors flex-shrink-0"
            >
              <Icons.X />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 max-h-96 overflow-y-auto">
          <div className="mb-4">
            <button
              onClick={selectAll}
              className="text-xs font-semibold text-[#0D0D0D] hover:text-[#666666] transition-colors"
            >
              {selectedIds.size === similar.length ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="space-y-2">
            {similar.map((prospect) => (
              <button
                key={prospect.id}
                onClick={() => toggleSelect(prospect.id)}
                className="w-full text-left p-4 border border-[#E8E8E8] rounded-lg hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-all"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(prospect.id)}
                    onChange={() => {}} // Controlled by parent button click
                    className="mt-1 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0D0D0D] mb-1">
                      {prospect.businessName}
                    </p>
                    <div className="flex gap-3 text-xs text-[#888888]">
                      {prospect.city && <span>{prospect.city}</span>}
                      {prospect.industry && <span>{prospect.industry}</span>}
                      {prospect.confidenceScore && (
                        <span className="font-semibold">{prospect.confidenceScore}% match</span>
                      )}
                    </div>
                  </div>
                  {selectedIds.has(prospect.id) && (
                    <div className="text-[#0D0D0D] flex-shrink-0">
                      <Icons.Check />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#E8E8E8] px-8 py-4 bg-[#F9F9F9] flex items-center justify-between">
          <p className="text-xs text-[#888888]">
            {selectedIds.size} of {similar.length} selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={onDismiss}
              disabled={approving}
              className="px-4 py-2 border border-[#E8E8E8] text-[#0D0D0D] text-xs font-semibold rounded hover:border-[#0D0D0D] disabled:opacity-50 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleApprove}
              disabled={approving || selectedIds.size === 0}
              className="px-4 py-2 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Icons.Check />
              {approving ? "Approving..." : `Approve ${selectedIds.size}`}
            </button>
          </div>
        </div>

        {error && (
          <div className="px-8 py-3 bg-red-50 border-t border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
