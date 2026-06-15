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
        return daysAgo === 0 ? "Today" : `${daysAgo}d ago`;
      })()
    : "Not contacted";

  return (
    <div
      className="border border-gray-200 rounded-lg bg-white hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* COLLAPSED STATE */}
      <div className="px-8 py-8">
        {/* 1. COMPANY NAME - Scannable, Large */}
        <h3 className="text-3xl font-semibold text-gray-900 mb-8">
          {prospect.business_name}
        </h3>

        {/* 2. OPPORTUNITY - Most Important */}
        <div className="mb-8">
          <p className="text-xl leading-relaxed text-gray-900 font-normal">
            {opportunity}
          </p>
        </div>

        {/* 3. CONTEXT - Supporting the opportunity */}
        <div className="mb-8">
          <p className="text-base leading-relaxed text-gray-700">
            {context}
          </p>
        </div>

        {/* 4. RECOMMENDATION - Conclusion from the system */}
        <div className="mb-8">
          <p className="text-base text-gray-900">
            {recommendation}
          </p>
        </div>

        {/* 5. METADATA - Minimal, Muted */}
        <div className="flex gap-6 text-sm text-gray-500">
          <span>Last contacted: {lastContactLabel}</span>
          {prospect.business_category && (
            <span>Category: {prospect.business_category}</span>
          )}
        </div>
      </div>

      {/* EXPANDED STATE - Machine's Reasoning */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-white">
          <div className="px-8 py-8 space-y-8">
            {/* WHY THIS MATTERS - Mandatory */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                WHY THIS MATTERS
              </h4>
              <p className="text-base leading-relaxed text-gray-700">
                {whyItMatters || "This opportunity shows commercial signals that suggest readiness for engagement."}
              </p>
            </div>

            {/* EVIDENCE - Concrete signals */}
            {evidence.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4">
                  EVIDENCE
                </h4>
                <ul className="space-y-3">
                  {evidence.map((item, i) => (
                    <li key={i} className="text-base text-gray-700 flex gap-4">
                      <span className="text-gray-400 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* RECOMMENDED ACTION */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                RECOMMENDED ACTION
              </h4>
              <p className="text-base text-gray-900">
                {recommendation}
              </p>
            </div>

            {/* OPERATOR FEEDBACK */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">
                YOUR FEEDBACK
              </h4>
              <div className="flex gap-4">
                <button className="text-sm text-gray-600 hover:text-gray-900 underline">
                  Useful
                </button>
                <button className="text-sm text-gray-600 hover:text-gray-900 underline">
                  Not useful
                </button>
                <button className="text-sm text-gray-600 hover:text-gray-900 underline">
                  Wrong priority
                </button>
                <button className="text-sm text-gray-600 hover:text-gray-900 underline">
                  Already contacted
                </button>
              </div>
            </div>

            {/* CONTACT INFO */}
            <div className="text-sm">
              <p className="text-gray-500 mb-2">Contact</p>
              <p className="text-gray-900 font-mono">
                {prospect.email || "No email available"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="px-8 py-6 border-t border-gray-200 bg-white flex gap-4">
        <button
          className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Send Email
        </button>
        <button
          className="px-6 py-3 border border-gray-300 text-gray-900 text-sm font-medium rounded hover:bg-gray-50 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Inspect Reasoning
        </button>
      </div>
    </div>
  );
}
