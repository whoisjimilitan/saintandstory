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
  pressure: string;
  opportunity: string;
  recommendation?: string;
  reasoning?: string[];
}

export default function ProspectCard({
  prospect,
  pressure,
  opportunity,
  recommendation = "Send introduction email",
  reasoning = []
}: ProspectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format last contact date
  const lastContactDaysAgo = prospect.last_contacted_at
    ? Math.floor(
        (Date.now() - new Date(prospect.last_contacted_at).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div
      className="border border-gray-200 rounded-lg bg-white hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Card Header - Company Name Only */}
      <div className="px-6 py-5">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6">
          {prospect.business_name}
        </h3>

        {/* Pressure Section */}
        <div className="mb-6">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
            Pressure
          </p>
          <p className="text-base text-gray-700 leading-relaxed">
            {pressure}
          </p>
        </div>

        {/* Opportunity Section */}
        <div className="mb-6">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
            Opportunity
          </p>
          <p className="text-lg font-semibold text-gray-900 leading-relaxed">
            {opportunity}
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 my-6" />

        {/* System Recommendation */}
        <div className="mb-6">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
            System Recommends
          </p>
          <p className="text-base font-medium text-blue-600">
            {recommendation}
          </p>
        </div>

        {/* Last Contact Context (Subtle) */}
        <p className="text-xs text-gray-500">
          {lastContactDaysAgo !== null
            ? `Last contact: ${lastContactDaysAgo} days ago`
            : "Not yet contacted"}
        </p>
      </div>

      {/* Expanded Content - Why This Recommendation */}
      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3">
                Why This Is Recommended
              </p>
              <ul className="space-y-2">
                {reasoning.length > 0 ? (
                  reasoning.map((reason, i) => (
                    <li key={i} className="text-sm text-gray-700 flex gap-3">
                      <span className="text-gray-400">•</span>
                      <span>{reason}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="text-sm text-gray-700 flex gap-3">
                      <span className="text-gray-400">•</span>
                      <span>Strong fit for this business type</span>
                    </li>
                    <li className="text-sm text-gray-700 flex gap-3">
                      <span className="text-gray-400">•</span>
                      <span>No recent contact in optimal window</span>
                    </li>
                    <li className="text-sm text-gray-700 flex gap-3">
                      <span className="text-gray-400">•</span>
                      <span>Similar businesses showed strong engagement</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                Contact
              </p>
              <p className="text-sm text-gray-700 font-mono">
                {prospect.email || "No email available"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions Footer */}
      <div className="px-6 py-4 bg-white border-t border-gray-200 flex gap-3">
        <button
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          Send Email
        </button>
        <button
          className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          Inspect Ranking
        </button>
        <button
          className="px-2 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          ⋮
        </button>
      </div>
    </div>
  );
}
