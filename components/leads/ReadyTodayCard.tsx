"use client";

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
  onSendEmail?: () => void;
  onMarkContacted?: () => void;
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
  onSendEmail,
  onMarkContacted,
}: ReadyTodayCardProps) {
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
          onCopy={() => console.log("Email copied")}
          onSend={onSendEmail}
        />
      )}

      {/* ACTION BUTTON */}
      {onMarkContacted && (
        <button
          onClick={onMarkContacted}
          className="w-full text-sm px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition font-bold flex items-center justify-center gap-1"
        >
          <CheckCircle size={16} />
          Mark as Contacted
        </button>
      )}
    </div>
  );
}
