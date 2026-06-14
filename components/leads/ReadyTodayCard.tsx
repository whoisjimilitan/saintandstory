"use client";

import { useState } from "react";
import { EmailPreviewBlock } from "./EmailPreviewBlock";
import { Mail, Phone, CheckCircle } from "lucide-react";

interface ReadyTodayCardProps {
  id: string;
  businessName: string;
  category?: string;
  score?: number;
  email?: string;
  phone?: string;
  primaryHook?: string;
  emailSubject?: string;
  emailBody?: string;
  lastSentAt?: string;
  onSendEmail?: (success: boolean) => void;
  onMarkContacted?: () => void;
  onRefresh?: () => void;
}

export function ReadyTodayCard({
  id,
  businessName,
  category,
  score = 0,
  email,
  phone,
  primaryHook,
  emailSubject,
  emailBody,
  lastSentAt,
  onSendEmail,
  onMarkContacted,
  onRefresh,
}: ReadyTodayCardProps) {
  const [marking, setMarking] = useState(false);

  const handleMarkContacted = async () => {
    setMarking(true);
    try {
      const response = await fetch("/api/b2b/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: id,
          status: "contacted",
          operator: "operator", // TODO: Get from auth context
        }),
      });

      if (response.ok) {
        onMarkContacted?.();
        onRefresh?.();
      } else {
        const error = await response.json();
        console.error("Failed to mark contacted:", error);
      }
    } catch (error) {
      console.error("Error marking contacted:", error);
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="border-2 border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 space-y-3 shadow-md">
      {/* PRIORITY BADGE */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 bg-green-600 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-green-700 uppercase tracking-wide">
              READY TODAY
            </span>
          </div>
          <h3 className="text-base font-bold text-gray-900 break-words">
            {businessName}
          </h3>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold text-green-700">{score}</div>
          <div className="text-xs text-gray-500">score</div>
        </div>
      </div>

      {/* QUICK INFO */}
      <div className="flex flex-wrap gap-2 text-xs">
        {category && (
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded capitalize">
            {category}
          </span>
        )}
        {email && (
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
          >
            <Mail size={12} />
            Email
          </a>
        )}
        {phone && (
          <a
            href={`tel:${phone}`}
            className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
          >
            <Phone size={12} />
            Call
          </a>
        )}
      </div>

      {/* PRIMARY HOOK */}
      {primaryHook && (
        <div className="bg-white border-l-4 border-amber-400 px-3 py-2 rounded">
          <div className="text-xs font-medium text-gray-600 mb-1">Hook</div>
          <div className="text-sm text-gray-900 italic">"{primaryHook}"</div>
        </div>
      )}

      {/* EMAIL PREVIEW */}
      {emailSubject && emailBody && (
        <EmailPreviewBlock
          subject={emailSubject}
          body={emailBody}
          leadId={id}
          businessName={businessName}
          recipientEmail={email}
          lastSentAt={lastSentAt}
          onCopy={() => console.log("Email copied")}
          onSend={(success) => {
            if (success) {
              onRefresh?.();
            }
            onSendEmail?.(success);
          }}
        />
      )}

      {/* ACTION BUTTON */}
      <button
        onClick={handleMarkContacted}
        disabled={marking}
        className="w-full text-sm px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition font-bold flex items-center justify-center gap-1 disabled:opacity-50"
      >
        <CheckCircle size={16} />
        {marking ? "Marking..." : "Mark as Contacted"}
      </button>
    </div>
  );
}
