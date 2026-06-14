"use client";

import { useState } from "react";
import { Copy, Mail } from "lucide-react";

interface EmailPreviewBlockProps {
  subject: string;
  body: string;
  onCopy?: () => void;
  onSend?: () => void;
}

export function EmailPreviewBlock({
  subject,
  body,
  onCopy,
  onSend,
}: EmailPreviewBlockProps) {
  const [expanded, setExpanded] = useState(false);

  const handleCopy = () => {
    const email = `${subject}\n\n${body}`;
    navigator.clipboard.writeText(email);
    onCopy?.();
  };

  return (
    <div className="border-l-4 border-blue-400 bg-blue-50 p-4 rounded-lg">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-600 mb-1">Subject</div>
          <div className="text-sm font-semibold text-gray-900 break-words">
            {subject || "(No subject)"}
          </div>
        </div>
      </div>

      {expanded ? (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="text-xs font-medium text-gray-600 mb-2">Email Body</div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
            {body || "(No body)"}
          </div>
        </div>
      ) : (
        <div className="text-xs text-gray-500 italic">
          {body?.substring(0, 80)}...
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-100 rounded transition"
        >
          {expanded ? "Hide" : "Show"} Full Email
        </button>

        <button
          onClick={handleCopy}
          className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition flex items-center gap-1"
        >
          <Copy size={14} />
          Copy
        </button>

        {onSend && (
          <button
            onClick={onSend}
            className="text-xs px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded transition flex items-center gap-1"
          >
            <Mail size={14} />
            Send
          </button>
        )}
      </div>
    </div>
  );
}
