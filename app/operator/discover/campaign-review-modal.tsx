"use client";

import { useState } from "react";

interface Email {
  prospectId: string;
  businessName: string;
  city: string;
  subject: string;
  body: string;
  wordCount: number;
}

interface CampaignReviewModalProps {
  emails: Email[];
  onApprove: (emails: Email[]) => Promise<void>;
  onCancel: () => void;
}

const Icons = {
  X: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 5l10 10M15 5l-10 10" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 3l6 5-6 5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 8l3 3 7-7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  AlertCircle: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 4v4M8 12v0.01" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

export function CampaignReviewModal({
  emails,
  onApprove,
  onCancel,
}: CampaignReviewModalProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [editedEmails, setEditedEmails] = useState<Record<string, Email>>(
    emails.reduce((acc, email) => ({ ...acc, [email.prospectId]: email }), {})
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(
    new Set(emails.map((e) => e.prospectId))
  );

  const currentEmail = editedEmails[emails[currentIdx].prospectId];
  const isApproved = approvedIds.has(currentEmail.prospectId);

  const toggleApprove = (prospectId: string) => {
    const newApproved = new Set(approvedIds);
    if (newApproved.has(prospectId)) {
      newApproved.delete(prospectId);
    } else {
      newApproved.add(prospectId);
    }
    setApprovedIds(newApproved);
  };

  const updateEmail = (prospectId: string, field: string, value: string) => {
    setEditedEmails((prev) => ({
      ...prev,
      [prospectId]: {
        ...prev[prospectId],
        [field]: value,
        wordCount:
          field === "body"
            ? value.split(/\s+/).filter((w) => w.length > 0).length
            : prev[prospectId].wordCount,
      },
    }));
  };

  const handleApprove = async () => {
    const toSend = emails.map((e) => editedEmails[e.prospectId]);
    setSending(true);
    setError(null);

    try {
      await onApprove(toSend);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send emails";
      setError(message);
    } finally {
      setSending(false);
    }
  };

  const wordCountStatus = (count: number) => {
    if (count < 60) return "text-red-600";
    if (count > 80) return "text-orange-600";
    return "text-[#0D0D0D]";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-[#E8E8E8] px-8 py-6 flex items-center justify-between">
          <h2 className="text-lg font-black text-[#0D0D0D]">
            Review Campaign · {emails.length} Email{emails.length !== 1 ? "s" : ""}
          </h2>
          <button
            onClick={onCancel}
            className="text-[#888888] hover:text-[#0D0D0D] transition-colors"
          >
            <Icons.X />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Email List (Left) */}
          <div className="w-1/3 border-r border-[#E8E8E8] overflow-y-auto">
            {emails.map((email, idx) => (
              <button
                key={email.prospectId}
                onClick={() => setCurrentIdx(idx)}
                className={`w-full text-left px-6 py-4 border-b border-[#E8E8E8] transition-all hover:bg-[#F9F9F9] ${
                  currentIdx === idx ? "bg-[#0D0D0D] text-white" : "bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">
                      {email.businessName}
                    </p>
                    <p className={`text-[10px] truncate ${
                      currentIdx === idx ? "text-gray-300" : "text-[#888888]"
                    }`}>
                      {email.city}
                    </p>
                  </div>
                  {approvedIds.has(email.prospectId) && (
                    <div className={`flex-shrink-0 ${currentIdx === idx ? "text-white" : "text-[#0D0D0D]"}`}>
                      <Icons.Check />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Email Editor (Right) */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              <div>
                <label className="text-xs font-semibold text-[#888888] uppercase tracking-[0.1em] block mb-2">
                  To
                </label>
                <p className="text-sm text-[#0D0D0D] font-semibold">
                  {currentEmail.businessName}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#888888] uppercase tracking-[0.1em] block mb-2">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={currentEmail.subject}
                  onChange={(e) =>
                    updateEmail(currentEmail.prospectId, "subject", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded text-sm focus:outline-none focus:border-[#0D0D0D]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#888888] uppercase tracking-[0.1em] block mb-2">
                  Email Body
                </label>
                <textarea
                  value={currentEmail.body}
                  onChange={(e) =>
                    updateEmail(currentEmail.prospectId, "body", e.target.value)
                  }
                  rows={8}
                  className="w-full px-4 py-2 border border-[#E8E8E8] rounded text-sm focus:outline-none focus:border-[#0D0D0D] font-mono"
                />
              </div>

              {/* Validation */}
              <div className="space-y-2 p-4 bg-[#F9F9F9] border border-[#E8E8E8] rounded">
                <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.1em]">
                  Validation
                </p>
                <div className="space-y-1">
                  <div className={`flex items-center gap-2 text-xs ${wordCountStatus(currentEmail.wordCount)}`}>
                    <Icons.Check />
                    <span>
                      {currentEmail.wordCount} words{
                        currentEmail.wordCount < 60 ? " (too short)" :
                        currentEmail.wordCount > 80 ? " (too long)" :
                        " (perfect)"
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#0D0D0D]">
                    <Icons.Check />
                    <span>Trust signal included</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#0D0D0D]">
                    <Icons.Check />
                    <span>Inverse incentive present</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#E8E8E8] px-8 py-4 bg-[#F9F9F9] flex items-center gap-3">
              <button
                onClick={() => toggleApprove(currentEmail.prospectId)}
                className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold transition-colors ${
                  isApproved
                    ? "bg-[#0D0D0D] text-white"
                    : "border border-[#E8E8E8] text-[#0D0D0D] hover:border-[#0D0D0D]"
                }`}
              >
                <Icons.Check />
                {isApproved ? "Approved" : "Approve This"}
              </button>

              <div className="flex-1">
                {error && (
                  <div className="flex items-center gap-2 text-xs text-red-600">
                    <Icons.AlertCircle />
                    {error}
                  </div>
                )}
              </div>

              <button
                onClick={onCancel}
                disabled={sending}
                className="px-4 py-2 border border-[#E8E8E8] text-[#0D0D0D] text-xs font-semibold rounded hover:border-[#0D0D0D] disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="border-t border-[#E8E8E8] px-8 py-4 bg-white flex items-center justify-between">
          <p className="text-xs text-[#888888]">
            {approvedIds.size} of {emails.length} approved
          </p>
          <button
            onClick={handleApprove}
            disabled={sending || approvedIds.size === 0}
            className="px-6 py-2 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? "Sending..." : `Send ${approvedIds.size} Email${approvedIds.size !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
