"use client";

import { useState } from "react";
import { AlertCircle, Send, X } from "lucide-react";

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  businessName: string;
  recipientEmail: string;
  subject: string;
  body: string;
  lastSentAt?: string;
}

export function SendEmailModal({
  isOpen,
  onClose,
  onConfirm,
  businessName,
  recipientEmail,
  subject,
  body,
  lastSentAt,
}: SendEmailModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="border-b p-6 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Approve & Send Email
            </h2>
            <p className="text-sm text-gray-600 mt-1">{businessName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-4">
          {/* WARNING: Last sent */}
          {lastSentAt && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded flex gap-3">
              <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
              <div className="text-sm text-amber-700">
                <strong>Note:</strong> Email last sent {lastSentAt}. Make sure
                this is a new angle or follow-up before sending.
              </div>
            </div>
          )}

          {/* RECIPIENT */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              SENDING TO
            </label>
            <div className="bg-gray-100 p-3 rounded text-sm text-gray-900 font-mono break-all">
              {recipientEmail}
            </div>
          </div>

          {/* SUBJECT */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              SUBJECT
            </label>
            <div className="bg-gray-100 p-3 rounded text-sm text-gray-900">
              {subject}
            </div>
          </div>

          {/* BODY PREVIEW */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              EMAIL BODY
            </label>
            <div className="bg-gray-100 p-3 rounded text-sm text-gray-900 whitespace-pre-wrap max-h-48 overflow-y-auto font-mono">
              {body}
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="border-t p-6 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send size={16} />
            {isLoading ? "Sending..." : "Approve & Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
