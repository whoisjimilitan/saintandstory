"use client";

import { useState } from "react";

interface SimpleEmailModalProps {
  isOpen: boolean;
  business: {
    name: string;
    email: string;
    category: string;
    contactName?: string;
  };
  channel?: "email" | "whatsapp" | "messenger" | "instagram" | "linkedin";
  initialSubject: string;
  initialBody: string;
  onClose: () => void;
  onSend: (subject: string, body: string) => Promise<void>;
  sending: boolean;
}

export function SimpleEmailModal({
  isOpen,
  business,
  channel = "email",
  initialSubject,
  initialBody,
  onClose,
  onSend,
  sending,
}: SimpleEmailModalProps) {
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      setError("Subject and body required");
      return;
    }
    setError("");
    try {
      await onSend(subject, body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[#E8E8E8] p-6 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.15em] mb-1">
                {channel === "email" ? "Email Campaign" : `${channel} Message`}
              </p>
              <p className="text-sm text-[#888888]">{business.name}</p>
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
          {/* Business Info */}
          <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded p-4 space-y-2">
            <div>
              <p className="text-[9px] text-[#888888] uppercase font-semibold tracking-[0.1em]">
                To
              </p>
              <p className="text-sm font-semibold text-[#0D0D0D]">
                {business.email}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-[#888888] uppercase font-semibold tracking-[0.1em]">
                Category
              </p>
              <p className="text-sm text-[#0D0D0D]">{business.category}</p>
            </div>
          </div>

          {/* Subject - only for email */}
          {channel === "email" && (
            <div>
              <label className="text-[9px] text-[#888888] uppercase font-semibold tracking-[0.1em] block mb-2">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-[#E8E8E8] rounded p-3 text-sm focus:outline-none focus:border-[#0D0D0D]"
              />
            </div>
          )}

          {/* Body / Message */}
          <div>
            <label className="text-[9px] text-[#888888] uppercase font-semibold tracking-[0.1em] block mb-2">
              {channel === "email" ? "Body" : "Message"}
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="w-full border border-[#E8E8E8] rounded p-3 text-sm font-mono focus:outline-none focus:border-[#0D0D0D]"
            />
          </div>

          {/* Preview */}
          <div>
            <p className="text-[9px] text-[#888888] uppercase font-semibold tracking-[0.1em] mb-2">
              Preview
            </p>
            <div className="bg-white border border-[#E8E8E8] rounded p-4 space-y-3">
              {channel === "email" && (
                <div>
                  <p className="text-[9px] text-[#888888] uppercase font-semibold tracking-[0.1em] mb-1">
                    Subject
                  </p>
                  <p className="text-sm font-semibold text-[#0D0D0D]">
                    {subject || "(empty)"}
                  </p>
                </div>
              )}
              <div className={channel === "email" ? "border-t border-[#E8E8E8] pt-3" : ""}>
                <p className="text-[9px] text-[#888888] uppercase font-semibold tracking-[0.1em] mb-1">
                  {channel === "email" ? "Body" : "Message"}
                </p>
                <p className="text-sm text-[#0D0D0D] whitespace-pre-wrap font-mono text-xs">
                  {body || "(empty)"}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 border-t border-[#E8E8E8] pt-6">
            <button
              onClick={onClose}
              disabled={sending}
              className="flex-1 border border-[#E8E8E8] text-[#0D0D0D] font-semibold py-3 rounded transition-colors hover:border-[#0D0D0D] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex-1 bg-[#0D0D0D] hover:bg-[#333333] text-white font-semibold py-3 rounded transition-colors disabled:opacity-50"
            >
              {sending ? "Sending..." : channel === "email" ? "Send Email" : `Copy ${channel.charAt(0).toUpperCase() + channel.slice(1)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
