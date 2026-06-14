"use client";

import { useState } from "react";
import { EmailPreviewBlock } from "./EmailPreviewBlock";
import { ProspectInsightBlock } from "./ProspectInsightBlock";
import { OutreachStrategyBlock } from "./OutreachStrategyBlock";
import { ContactHistoryPanel } from "./ContactHistoryPanel";
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
  leadStatus?: string;
  lastContactedAt?: string;
  lastSentAt?: string;
  onSendEmail?: (success: boolean) => void;
  onMarkContacted?: () => void;
  onViewBrief?: () => void;
  onRefresh?: () => void;
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

const statusBadgeColors: Record<string, string> = {
  new: "bg-gray-100 text-gray-800",
  ready: "bg-blue-100 text-blue-800",
  contacted: "bg-green-100 text-green-800",
  engaged: "bg-purple-100 text-purple-800",
  qualified: "bg-indigo-100 text-indigo-800",
  active: "bg-emerald-100 text-emerald-800",
  archived: "bg-slate-100 text-slate-800",
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
  leadStatus,
  lastContactedAt,
  lastSentAt,
  onSendEmail,
  onMarkContacted,
  onViewBrief,
  onRefresh,
}: LeadActionCardProps) {
  const [marking, setMarking] = useState(false);
  const scorePercentage = Math.min(100, Math.max(0, score));

  const handleStatusChange = async (newStatus: string) => {
    setMarking(true);
    try {
      const response = await fetch("/api/b2b/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: id,
          status: newStatus,
          operator: "operator", // TODO: Get from auth context
        }),
      });

      if (response.ok) {
        onMarkContacted?.();
        onRefresh?.();
      } else {
        const error = await response.json();
        console.error(`Failed to change status to ${newStatus}:`, error);
      }
    } catch (error) {
      console.error("Error changing status:", error);
    } finally {
      setMarking(false);
    }
  };

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
          <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
            {leadStatus && (
              <span
                className={`px-2 py-1 text-xs font-semibold rounded capitalize ${
                  statusBadgeColors[leadStatus] || "bg-gray-100 text-gray-800"
                }`}
              >
                {leadStatus}
              </span>
            )}
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

      {/* LAST CONTACT + COOLDOWN INDICATOR */}
      {lastContactedAt && (
        <div className="pt-3 border-t">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex-1">
              <span className="text-gray-600">Last contacted:</span>{" "}
              <span className="font-semibold text-gray-900">
                {new Date(lastContactedAt).toLocaleDateString("en-GB")}
              </span>
            </div>
            {(() => {
              const daysAgo = Math.floor(
                (Date.now() - new Date(lastContactedAt).getTime()) /
                  (1000 * 60 * 60 * 24)
              );
              const cooldownColor =
                daysAgo < 2 ? "bg-red-100 text-red-800" : daysAgo < 7 ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800";
              return (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${cooldownColor}`}>
                  {daysAgo}d ago
                </span>
              );
            })()}
          </div>
        </div>
      )}

      {/* EMAIL PREVIEW */}
      {emailSubject && emailBody && (
        <div className="pt-3 border-t">
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
        </div>
      )}

      {/* CONTACT HISTORY */}
      {id && (
        <div className="pt-3 border-t">
          <ContactHistoryPanel leadId={id} />
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="pt-3 border-t space-y-2">
        <div className="flex gap-2">
          {leadStatus === "ready" && (
            <button
              onClick={() => handleStatusChange("contacted")}
              disabled={marking}
              className="flex-1 text-sm px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition font-medium flex items-center justify-center gap-1 disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              {marking ? "..." : "Mark Contacted"}
            </button>
          )}
          {leadStatus === "contacted" && (
            <button
              onClick={() => handleStatusChange("engaged")}
              disabled={marking}
              className="flex-1 text-sm px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition font-medium flex items-center justify-center gap-1 disabled:opacity-50"
            >
              {marking ? "..." : "Mark Engaged"}
            </button>
          )}
          {leadStatus === "engaged" && (
            <button
              onClick={() => handleStatusChange("qualified")}
              disabled={marking}
              className="flex-1 text-sm px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition font-medium flex items-center justify-center gap-1 disabled:opacity-50"
            >
              {marking ? "..." : "Mark Qualified"}
            </button>
          )}
          {leadStatus === "qualified" && (
            <button
              onClick={() => handleStatusChange("active")}
              disabled={marking}
              className="flex-1 text-sm px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition font-medium flex items-center justify-center gap-1 disabled:opacity-50"
            >
              {marking ? "..." : "Mark Active"}
            </button>
          )}
          {onViewBrief && (
            <button
              onClick={onViewBrief}
              className="flex-1 text-sm px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded transition font-medium"
            >
              Brief
            </button>
          )}
        </div>

        {leadStatus && leadStatus !== "archived" && (
          <button
            onClick={() => handleStatusChange("archived")}
            disabled={marking}
            className="w-full text-xs px-3 py-1 text-gray-600 hover:text-gray-900 border border-gray-300 rounded transition disabled:opacity-50"
          >
            {marking ? "..." : "Archive"}
          </button>
        )}
      </div>
    </div>
  );
}
