"use client";

import { useState } from "react";

interface ProspectCardProps {
  prospect: {
    id: string;
    business_name: string;
    business_category?: string;
    email?: string;
    engagement_score?: number;
    last_contacted_at?: string;
  };
  opportunity: string;
  context: string;
  recommendation: string;
  evidence?: string[];
  whyItMatters?: string;
}

export default function ProspectCard({
  prospect,
  opportunity,
  context,
  recommendation,
  evidence = [],
  whyItMatters = ""
}: ProspectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format last contact date
  const lastContactLabel = prospect.last_contacted_at
    ? (() => {
        const daysAgo = Math.floor(
          (Date.now() - new Date(prospect.last_contacted_at).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return daysAgo === 0 ? "today" : `${daysAgo}d ago`;
      })()
    : "not contacted";

  return (
    <div
      className="border border-[#E8E8E8] bg-white hover:border-[#D0D0D0] hover:bg-[#FAFAFA] transition-all cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* COLLAPSED STATE */}
      <div className="px-6 py-6">
        {/* Company Name */}
        <h3 className="text-lg font-semibold text-[#0D0D0D] mb-4">
          {prospect.business_name}
        </h3>

        {/* Opportunity - Key insight */}
        <p className="text-sm leading-relaxed text-[#0D0D0D] mb-3">
          {opportunity}
        </p>

        {/* Context */}
        <p className="text-sm leading-relaxed text-[#666666] mb-4">
          {context}
        </p>

        {/* Recommendation */}
        <p className="text-sm text-[#0D0D0D] mb-4">
          {recommendation}
        </p>

        {/* Metadata - Minimal */}
        <div className="flex gap-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888]">
          <span>{lastContactLabel}</span>
          {prospect.business_category && (
            <span>{prospect.business_category}</span>
          )}
        </div>
      </div>

      {/* EXPANDED STATE */}
      {isExpanded && (
        <div className="border-t border-[#E8E8E8] bg-[#FAFAFA]">
          <div className="px-6 py-6 space-y-6">
            {/* Why This Matters */}
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0D0D0D] mb-3">
                Why this matters
              </h4>
              <p className="text-sm text-[#666666]">
                {whyItMatters || "Shows commercial signals suggesting readiness for engagement."}
              </p>
            </div>

            {/* Evidence */}
            {evidence.length > 0 && (
              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0D0D0D] mb-3">
                  Evidence
                </h4>
                <ul className="space-y-2">
                  {evidence.map((item, i) => (
                    <li key={i} className="text-sm text-[#666666] flex gap-3">
                      <span className="text-[#D0D0D0] flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended action */}
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0D0D0D] mb-3">
                Recommended action
              </h4>
              <p className="text-sm text-[#0D0D0D]">
                {recommendation}
              </p>
            </div>

            {/* Feedback */}
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0D0D0D] mb-3">
                Your feedback
              </h4>
              <div className="flex gap-4 flex-wrap">
                <button className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#666666] hover:text-[#0D0D0D] transition-colors">
                  Useful
                </button>
                <button className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#666666] hover:text-[#0D0D0D] transition-colors">
                  Not useful
                </button>
                <button className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#666666] hover:text-[#0D0D0D] transition-colors">
                  Wrong priority
                </button>
                <button className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#666666] hover:text-[#0D0D0D] transition-colors">
                  Already contacted
                </button>
              </div>
            </div>

            {/* Contact */}
            <div className="text-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888] mb-2">Contact</p>
              <p className="text-sm text-[#0D0D0D] font-mono">
                {prospect.email || "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="px-6 py-4 border-t border-[#E8E8E8] bg-white flex gap-2">
        <button
          className="px-3 py-1.5 bg-[#0D0D0D] text-white text-[10px] font-semibold uppercase tracking-[0.1em] rounded hover:bg-[#333333] transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Send email
        </button>
        <button
          className="px-3 py-1.5 border border-[#E8E8E8] text-[#0D0D0D] text-[10px] font-semibold uppercase tracking-[0.1em] rounded hover:border-[#D0D0D0] hover:bg-white transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Inspect reasoning
        </button>
      </div>
    </div>
  );
}
