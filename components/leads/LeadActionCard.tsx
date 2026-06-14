"use client";

import { EmailPreviewBlock } from "./EmailPreviewBlock";
import { ProspectInsightBlock } from "./ProspectInsightBlock";
import { OutreachStrategyBlock } from "./OutreachStrategyBlock";
import { CheckCircle2, Phone, Globe, Mail } from "lucide-react";

interface LeadActionCardProps {
  id: string;
  businessName: string;
  category?: string;
  tier: "A" | "B" | "C";
  score?: number;
  email?: string;
  phone?: string;
  website?: string;
  challenges?: string[];
  opportunities?: string[];
  painPoint?: string;
  reviewRating?: number;
  primaryAngle?: string;
  primaryHook?: string;
  secondaryAngle?: string;
  secondaryHook?: string;
  angleReasoning?: string;
  emailSubject?: string;
  emailBody?: string;
  onSendEmail?: () => void;
  onMarkContacted?: () => void;
  onViewBrief?: () => void;
}

const tierColors = {
  A: "bg-red-50 border-red-200",
  B: "bg-yellow-50 border-yellow-200",
  C: "bg-gray-50 border-gray-200",
};

const tierBadgeColors = {
  A: "bg-red-100 text-red-800",
  B: "bg-yellow-100 text-yellow-800",
  C: "bg-gray-100 text-gray-800",
};

export function LeadActionCard({
  id,
  businessName,
  category,
  tier,
  score = 0,
  email,
  phone,
  website,
  challenges,
  opportunities,
  painPoint,
  reviewRating,
  primaryAngle,
  primaryHook,
  secondaryAngle,
  secondaryHook,
  angleReasoning,
  emailSubject,
  emailBody,
  onSendEmail,
  onMarkContacted,
  onViewBrief,
}: LeadActionCardProps) {
  const scorePercentage = Math.min(100, Math.max(0, score));

  return (
    <div
      className={`border rounded-lg p-5 space-y-4 transition-shadow hover:shadow-lg ${tierColors[tier]}`}
    >
      {/* HEADER */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 break-words">
              {businessName}
            </h3>
            {category && (
              <p className="text-xs text-gray-500 mt-1 capitalize">{category}</p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <span
              className={`px-3 py-1 text-sm font-bold rounded ${tierBadgeColors[tier]}`}
            >
              Tier {tier}
            </span>
          </div>
        </div>

        {/* Score Bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-green-500 h-full transition-all"
              style={{ width: `${scorePercentage}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-600 w-12 text-right">
            {score}/100
          </span>
        </div>

        {/* Contact Info Pills */}
        <div className="flex flex-wrap gap-2">
          {email && (
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition"
            >
              <Mail size={12} />
              {email}
            </a>
          )}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition"
            >
              <Phone size={12} />
              {phone}
            </a>
          )}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition"
            >
              <Globe size={12} />
              Website
            </a>
          )}
        </div>
      </div>

      {/* INSIGHTS */}
      {(challenges?.length || opportunities?.length || painPoint) && (
        <div className="pt-3 border-t">
          <ProspectInsightBlock
            challenges={challenges}
            opportunities={opportunities}
            painPoint={painPoint}
            reviewRating={reviewRating}
          />
        </div>
      )}

      {/* STRATEGY */}
      {(primaryAngle || secondaryAngle) && (
        <div className="pt-3 border-t">
          <OutreachStrategyBlock
            primaryAngle={primaryAngle}
            primaryHook={primaryHook}
            secondaryAngle={secondaryAngle}
            secondaryHook={secondaryHook}
            reasoning={angleReasoning}
          />
        </div>
      )}

      {/* EMAIL PREVIEW */}
      {emailSubject && emailBody && (
        <div className="pt-3 border-t">
          <EmailPreviewBlock
            subject={emailSubject}
            body={emailBody}
            onCopy={() => console.log("Email copied")}
            onSend={onSendEmail}
          />
        </div>
      )}

      {/* ACTIONS */}
      <div className="pt-3 border-t flex gap-2">
        {onMarkContacted && (
          <button
            onClick={onMarkContacted}
            className="flex-1 text-sm px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition font-medium flex items-center justify-center gap-1"
          >
            <CheckCircle2 size={16} />
            Mark Contacted
          </button>
        )}
        {onViewBrief && (
          <button
            onClick={onViewBrief}
            className="flex-1 text-sm px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded transition font-medium"
          >
            View Full Brief
          </button>
        )}
      </div>
    </div>
  );
}
