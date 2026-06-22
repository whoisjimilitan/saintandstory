"use client";

import { useState } from "react";

interface EmailPreviewModalProps {
  isOpen: boolean;
  lead: {
    id: string;
    businessName: string;
  };
  onClose: () => void;
  onApprove: (email: any) => void;
}

export function EmailPreviewModal({
  isOpen,
  lead,
  onClose,
  onApprove
}: EmailPreviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateEmail = async (pressureGroup: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/b2b/dork-search/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          businessName: lead.businessName,
          pressureGroup
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate email");
        return;
      }

      setEmail(data.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate email");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#E8E8E8] p-6 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.15em] mb-1">
                Generate Email
              </p>
              <p className="text-sm text-[#888888]">{lead.businessName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-[#888888] hover:text-[#0D0D0D] transition-colors text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Email Display */}
          {email && (
            <div className="space-y-4">
              <div className="bg-[#F9F9F9] border border-[#E8E8E8] rounded p-6 space-y-4">
                <div>
                  <p className="text-[9px] text-[#888888] uppercase font-semibold tracking-[0.1em] mb-2">
                    Subject
                  </p>
                  <p className="text-sm font-semibold text-[#0D0D0D]">
                    {email.subject}
                  </p>
                </div>

                <div className="border-t border-[#E8E8E8] pt-4">
                  <p className="text-[9px] text-[#888888] uppercase font-semibold tracking-[0.1em] mb-3">
                    Body
                  </p>
                  <div className="text-sm text-[#0D0D0D] whitespace-pre-wrap font-mono text-xs leading-relaxed bg-white p-3 border border-[#E8E8E8] rounded">
                    {email.body}
                  </div>
                </div>

                <div className="border-t border-[#E8E8E8] pt-4 flex gap-2 text-[9px] text-[#888888]">
                  <span>🔹 Pattern: {email.pattern}</span>
                  <span>🔹 Framework: {email.framework}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEmail(null);
                  }}
                  className="flex-1 px-4 py-2 border border-[#E8E8E8] rounded text-xs font-semibold text-[#0D0D0D] hover:bg-[#F9F9F9] transition-colors"
                >
                  Regenerate
                </button>
                <button
                  onClick={() => {
                    onApprove(email);
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 bg-[#0D0D0D] text-white rounded text-xs font-semibold hover:bg-[#333333] transition-colors"
                >
                  Approve & Send
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-8">
              <p className="text-sm text-[#888888]">Generating email...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-[#FFF5F5] border border-[#FFE0E0] rounded">
              <p className="text-xs font-semibold text-[#D32F2F]">Error</p>
              <p className="text-xs text-[#B71C1C] mt-1">{error}</p>
            </div>
          )}

          {/* Initial State - Pressure Group Selection */}
          {!email && !loading && (
            <div className="space-y-3">
              <p className="text-xs text-[#888888]">
                Select which pressure group applies to this business:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Time-Critical Movement",
                  "Capacity Overflow",
                  "Appointment Scheduling Friction",
                  "Customer Acquisition Friction"
                ].map((group) => (
                  <button
                    key={group}
                    onClick={() => generateEmail(group)}
                    className="p-3 border border-[#E8E8E8] rounded hover:border-[#0D0D0D] hover:bg-[#F9F9F9] transition-all text-left text-xs font-semibold text-[#0D0D0D]"
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
